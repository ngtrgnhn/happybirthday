import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { makeT, type PartyConfig } from "../config";
import { LetterPaper } from "./LetterPaper";
import { GiftPicker } from "./Gifts";
import { renderRich } from "./rich";
import {
  HeartIcon, CakeIcon, SparkIcon, EnvelopeIcon, GiftIcon, CameraIcon,
} from "./icons";

/* ---------------- scroll reveal ---------------- */
function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${on ? "on" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* scalloped (hand-cut paper) divider, painted with the section behind it */
const SCALLOP = (() => {
  const w = 1440;
  const h = 56;
  const n = 20;
  const seg = w / n;
  let d = `M0 ${h} L0 ${h * 0.5}`;
  for (let i = 0; i < n; i++) {
    d += ` Q ${i * seg + seg / 2} ${-h * 0.15} ${(i + 1) * seg} ${h * 0.5}`;
  }
  return d + ` L${w} ${h} Z`;
})();

function Scallop({ fill }: { fill: string }) {
  return (
    <svg
      viewBox="0 0 1440 56"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none relative -mt-7 block h-7 w-full md:-mt-9 md:h-9"
    >
      <path d={SCALLOP} fill={fill} />
    </svg>
  );
}

function SectionHead({
  icon,
  badge,
  title,
  sub,
  tone = "light",
}: {
  icon: ReactNode;
  badge: string;
  title: string;
  sub: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Reveal className="mb-8 md:mb-10 text-center">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display font-bold uppercase tracking-[0.12em] text-[13px] soft-shadow-sm ${
          dark ? "hud-chip" : "border border-white bg-white/85 text-[#a8195c]"
        }`}
      >
        {icon} {badge}
      </span>
      <h2
        className={`mt-4 font-display font-extrabold text-3xl md:text-4xl ${
          dark ? "text-white text-legible" : "text-ink text-soft-shadow"
        }`}
      >
        {title}
      </h2>
      {dark ? (
        <div className="mt-3 flex justify-center px-2">
          <p className="hud-chip hud-chip--soft max-w-md rounded-2xl px-4 py-2 text-[15px] md:text-base">{sub}</p>
        </div>
      ) : (
        <p className="mx-auto mt-3 max-w-md px-4 font-body text-[15px] md:text-base text-ink-soft">{sub}</p>
      )}
    </Reveal>
  );
}

/* ---------------- memories: swipe / mouse-drag / wheel strip ---------------- */
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const prefersReducedMotion = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-5 w-5" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Memories({ config }: { config: PartyConfig }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0); // the photo the dots / counter point at (first / last when the strip rests at an end)
  const [mid, setMid] = useState(0); // the photo nearest to the middle of the strip (gets the "in focus" look)
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });
  const items = useMemo(() => config.memories.slice(0, 12), [config]);
  const T = useMemo(() => makeT(config), [config]);

  const tween = useRef(0); // rAF id of the running glide
  const aim = useRef(-1); // scrollLeft the running glide is heading for (−1 = none), so quick repeated key presses add up
  const drag = useRef({ down: false, moved: false, id: -1, x0: 0, left0: 0, lastX: 0, lastT: 0, v: 0 });
  const wheel = useRef({ on: false, start: 0, target: 0, net: 0, timer: 0 });

  /** scrollLeft that puts card i in the middle of the strip */
  const leftFor = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return 0;
    return clamp(card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, 0, el.scrollWidth - el.clientWidth);
  };
  /** the card whose centre is nearest to the middle of the strip when it is scrolled to `left` */
  const nearestTo = (left: number) => {
    const el = track.current;
    if (!el) return 0;
    const centre = left + el.clientWidth / 2;
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i] as HTMLElement;
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centre);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  };
  const pitch = () => {
    const el = track.current;
    const a = el?.children[0] as HTMLElement | undefined;
    const b = el?.children[1] as HTMLElement | undefined;
    return a && b ? Math.max(1, b.offsetLeft - a.offsetLeft) : 320;
  };

  /** eased glide of the strip (CSS snap is switched off while it runs, so nothing fights the animation) */
  const glideTo = (target: number, ms = 560) => {
    const el = track.current;
    if (!el) return;
    cancelAnimationFrame(tween.current);
    const from = el.scrollLeft;
    const dist = target - from;
    if (prefersReducedMotion() || Math.abs(dist) < 1) {
      aim.current = -1;
      el.style.scrollSnapType = "";
      el.scrollLeft = target;
      return;
    }
    aim.current = target;
    el.style.scrollSnapType = "none";
    const dur = clamp(ms * (0.45 + Math.abs(dist) / 900), 240, 760);
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      el.scrollLeft = from + dist * (1 - Math.pow(1 - k, 4)); // easeOutQuart
      if (k < 1) tween.current = requestAnimationFrame(step);
      else {
        aim.current = -1;
        el.style.scrollSnapType = "";
      }
    };
    tween.current = requestAnimationFrame(step);
  };
  const goTo = (i: number) => glideTo(leftFor(clamp(i, 0, items.length - 1)));
  /** one photo on in direction `dir`: one card-pitch further, then onto the nearest card. Always really moves — on wide
      screens the first / last photos can never be centred, so "index ± 1" would sometimes stay put. */
  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const from = aim.current >= 0 ? aim.current : el.scrollLeft;
    glideTo(leftFor(nearestTo(clamp(from + dir * pitch(), 0, el.scrollWidth - el.clientWidth))));
  };

  /* which card is centred + whether either end is reached */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = el.scrollWidth - el.clientWidth;
        const next = { start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 };
        const n = el.children.length;
        setMid(nearestTo(el.scrollLeft));
        setActive(max <= 2 || next.start ? 0 : next.end ? n - 1 : nearestTo(el.scrollLeft));
        setEdge((e) => (e.start === next.start && e.end === next.end ? e : next));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  /* mouse wheel → the strip glides sideways. A native, NON-passive listener (React's onWheel is passive and
     could not stop the page from scrolling). At either end the wheel is left alone → the page scrolls on. */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const w = wheel.current;
    const settle = () => {
      // a single notch always moves one photo on; a long spin moves as many as it travelled
      const startIdx = nearestTo(w.start);
      const moved = Math.round(Math.abs(w.target - w.start) / pitch());
      const idx = clamp(startIdx + (w.net < 0 ? -1 : 1) * Math.max(1, moved), 0, items.length - 1);
      w.on = false;
      glideTo(leftFor(idx));
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return; // pinch-zoom
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal gestures
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? el.clientWidth : 1;
      const dy = e.deltaY * unit;
      if (!dy) return;
      const max = el.scrollWidth - el.clientWidth;
      const pos = w.on ? w.target : el.scrollLeft;
      if ((dy < 0 && pos <= 1) || (dy > 0 && pos >= max - 1)) return; // end reached: hand the wheel back to the page
      e.preventDefault();
      if (!w.on) {
        w.on = true;
        w.start = el.scrollLeft;
        w.net = 0;
      }
      w.target = clamp(pos + dy, 0, max);
      w.net += dy;
      glideTo(w.target, 300);
      window.clearTimeout(w.timer);
      w.timer = window.setTimeout(settle, 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(w.timer);
      cancelAnimationFrame(tween.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  /* mouse / pen drag (touch keeps the browser's own swipe) */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const el = track.current;
    if (!el) return;
    cancelAnimationFrame(tween.current);
    aim.current = -1;
    window.clearTimeout(wheel.current.timer);
    wheel.current.on = false;
    el.style.scrollSnapType = "";
    const d = drag.current;
    d.down = true;
    d.moved = false;
    d.id = e.pointerId;
    d.x0 = e.clientX;
    d.left0 = el.scrollLeft;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    d.v = 0;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = track.current;
    if (!d.down || !el || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    if (!d.moved) {
      if (Math.abs(dx) < 5) return; // below the threshold it is still a click
      d.moved = true;
      setDragging(true);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer is already gone */
      }
    }
    el.scrollLeft = d.left0 - dx;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.v = d.v * 0.6 + ((e.clientX - d.lastX) / dt) * 0.4; // px/ms, + = hand moving right
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = track.current;
    if (!d.down || e.pointerId !== d.id) return;
    d.down = false;
    if (!d.moved || !el) return;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    setDragging(false);
    // fling: where would the strip coast to? settle on the photo nearest to that point
    const resting = e.timeStamp - d.lastT > 90;
    const coast = resting ? 0 : -d.v * 260;
    glideTo(leftFor(nearestTo(clamp(el.scrollLeft + coast, 0, el.scrollWidth - el.clientWidth))));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const k = e.key;
    if (k === "ArrowRight") step(1);
    else if (k === "ArrowLeft") step(-1);
    else if (k === "Home") goTo(0);
    else if (k === "End") goTo(items.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="gal-nav gal-nav--prev"
        onClick={() => step(-1)}
        disabled={edge.start}
        aria-label={T("memoriesPrev")}
      >
        <ChevronIcon dir="left" />
      </button>
      <button
        type="button"
        className="gal-nav gal-nav--next"
        onClick={() => step(1)}
        disabled={edge.end}
        aria-label={T("memoriesNext")}
      >
        <ChevronIcon dir="right" />
      </button>

      <div
        ref={track}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={T("memoriesTitle")}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
        className={`gal-track scroll-none relative -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 py-5 md:gap-7 ${
          dragging ? "is-dragging" : ""
        }`}
      >
        {items.map((m, i) => (
          <figure
            key={i}
            className={`shrink-0 snap-center transition-all duration-500 ${
              i === mid ? "scale-100" : "scale-[0.93] opacity-80"
            }`}
            style={{ transform: `rotate(${i % 2 === 0 ? -1.4 : 1.2}deg)` }}
          >
            <div className="w-[74vw] max-w-[300px] rounded-[20px] bg-[#fffaf2] p-3 pb-4 sm:w-[300px]" style={{ boxShadow: "0 22px 44px -16px rgba(120,20,70,0.5)" }}>
              <div className="relative overflow-hidden rounded-[12px] bg-[#ffd9e8]">
                <img
                  src={m.src}
                  alt={m.caption}
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden"; // keep the pink frame instead of a broken-image icon
                  }}
                  loading={i > 1 ? "lazy" : "eager"}
                  decoding="async"
                  width={832}
                  height={1024}
                  className="aspect-[4/5] w-full select-none object-cover"
                />
                <span className="hud-chip absolute right-2 top-2 rounded-full px-2.5 py-0.5 font-display text-[13px] font-bold">
                  {i + 1}/{items.length}
                </span>
                <span className="tape !h-5 !w-14 -top-1 left-1/2 -translate-x-1/2 -rotate-3" />
              </div>
              <figcaption className="paper-hand mt-2.5 !text-[17px] !leading-snug text-center text-[#7c2a50]">
                {m.caption}
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      {/* dots: the current photo; each one jumps to its photo */}
      <div className="mt-3 flex flex-wrap items-center justify-center">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`gal-dot ${i === active ? "on" : ""}`}
            onClick={() => goTo(i)}
            aria-label={T("memoriesGoto", { n: i + 1 })}
            aria-current={i === active ? "true" : undefined}
          >
            <i />
          </button>
        ))}
      </div>
      <p className="hint-coarse mt-1 flex justify-center">
        <span className="hud-chip hud-chip--soft rounded-full px-4 py-1.5 text-[14px] font-semibold">{T("memoriesSwipe")}</span>
      </p>
      <p className="hint-fine mt-1 justify-center">
        <span className="hud-chip hud-chip--soft rounded-full px-4 py-1.5 text-[14px] font-semibold">{T("memoriesDrag")}</span>
      </p>
    </div>
  );
}

/* ---------------- the scroll page ---------------- */
const goSection = (id: string) => {
  const el = document.getElementById(id);
  const sc = document.getElementById("page-scroller");
  if (!el || !sc) return;
  sc.scrollTo({ top: el.offsetTop, behavior: "smooth" });
};

export function ScrollSections({ config }: { config: PartyConfig }) {
  const T = useMemo(() => makeT(config), [config]);
  const hasMemories = config.memories.length > 0;
  const hasGifts = config.gifts.length > 0;
  // a scallop is painted with the colour of the section that follows it
  const afterLetter = hasMemories ? "#e84a8f" : hasGifts ? "#fff3d8" : "#dd3f86";
  const afterMemories = hasGifts ? "#fff3d8" : "#dd3f86";

  return (
    <div className="relative">
      {/* ---------- hero: transparent window onto the 3D scene.
          (the "scroll down" cue lives in the HUD; the cake itself is the control) ---------- */}
      <section id="sec-hero" className="relative min-h-screen snap-start" style={{ minHeight: "100dvh" }} />

      {/* ---------- the letter : pale paper-pink world ---------- */}
      <section
        id="sec-letter"
        className="cv relative flex min-h-screen snap-start flex-col justify-center overflow-hidden bg-[#fff1f6] px-4 py-14"
        style={{ minHeight: "100dvh" }}
      >
        <div className="bg-dots-pink pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(255,158,198,0.28),transparent_70%)]" />
        <span className="anim-floaty pointer-events-none absolute left-[6%] top-16 text-punch/35" style={{ ["--r" as string]: "-10deg" }}>
          <SparkIcon className="w-8 h-8" />
        </span>
        <span className="anim-floaty pointer-events-none absolute right-[7%] top-28 text-punch/30" style={{ ["--r" as string]: "14deg", animationDelay: "-2.2s" }}>
          <HeartIcon className="w-9 h-9" />
        </span>
        <span className="anim-floaty pointer-events-none absolute left-[12%] bottom-16 text-candy/50" style={{ ["--r" as string]: "8deg", animationDelay: "-3.5s" }}>
          <HeartIcon className="w-6 h-6" />
        </span>

        <div className="relative mx-auto w-full max-w-[660px]">
          <SectionHead
            icon={<EnvelopeIcon className="w-3.5 h-3.5" />}
            badge={T("letterBadge")}
            title={T("letterTitle")}
            sub={T("letterSub")}
          />
          <Reveal delay={80}>
            <LetterPaper config={config} className="-rotate-[0.6deg]" />
          </Reveal>
          <Reveal delay={160}>
            <div className="mx-auto mt-8 flex max-w-[420px] items-center gap-3 rounded-[18px] border border-white bg-white/70 px-4 py-3 soft-shadow-sm">
              <CakeIcon className="w-7 h-7 shrink-0 text-punch-deep" />
              <p className="font-body text-[13px] leading-snug text-ink-soft">
                {renderRich(T("letterNote"), "text-punch-deep")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Scallop fill={afterLetter} />

      {/* ---------- memories : deep-rose bokeh world ---------- */}
      {hasMemories && (
      <>
      <section
        id="sec-memories"
        className="cv relative flex min-h-screen snap-start flex-col justify-center overflow-hidden bg-[linear-gradient(178deg,#f97fb4_0%,#e84a8f_72%,#dd3f86_100%)] px-4 py-14"
        style={{ minHeight: "100dvh" }}
      >
        <div className="bg-bokeh pointer-events-none absolute inset-0" />
        <div className="bg-stripes pointer-events-none absolute inset-0 opacity-25" />
        <span className="anim-floaty pointer-events-none absolute right-[8%] top-12 text-white/50" style={{ ["--r" as string]: "10deg" }}>
          <CameraIcon className="w-10 h-10" />
        </span>
        <span className="anim-floaty pointer-events-none absolute left-[7%] top-32 text-white/40" style={{ ["--r" as string]: "-12deg", animationDelay: "-1.8s" }}>
          <HeartIcon className="w-8 h-8" />
        </span>

        <div className="relative mx-auto w-full max-w-[980px]">
          <SectionHead
            tone="dark"
            icon={<CameraIcon className="w-3.5 h-3.5" />}
            badge={T("memoriesBadge")}
            title={T("memoriesTitle")}
            sub={T("memoriesSub")}
          />
          <Reveal>
            <Memories config={config} />
          </Reveal>
        </div>
      </section>

      <Scallop fill={afterMemories} />
      </>
      )}

      {/* ---------- gifts : butter candy-shop world ---------- */}
      {hasGifts && (
      <>
      <section
        id="sec-gifts"
        className="cv relative flex min-h-screen snap-start flex-col justify-center overflow-hidden bg-[linear-gradient(180deg,#fff3d8_0%,#ffe9b5_100%)] px-4 py-14"
        style={{ minHeight: "100dvh" }}
      >
        <div className="bg-candy-stripes pointer-events-none absolute inset-0" />
        <div className="bg-confetti-dots pointer-events-none absolute inset-0 opacity-60" />
        <span className="anim-floaty pointer-events-none absolute left-[8%] top-14 text-punch/40" style={{ ["--r" as string]: "-14deg" }}>
          <GiftIcon className="w-9 h-9" />
        </span>
        <span className="anim-floaty pointer-events-none absolute right-[9%] top-24 text-butter" style={{ ["--r" as string]: "12deg", animationDelay: "-2.6s" }}>
          <SparkIcon className="w-8 h-8" />
        </span>
        <span className="anim-floaty pointer-events-none absolute right-[16%] bottom-14 text-punch/30" style={{ ["--r" as string]: "6deg", animationDelay: "-4s" }}>
          <HeartIcon className="w-6 h-6" />
        </span>

        <div className="relative mx-auto w-full max-w-[760px]">
          <SectionHead
            icon={<GiftIcon className="w-3.5 h-3.5" />}
            badge={T("giftsBadge")}
            title={T("giftsTitle")}
            sub={T("giftsSub")}
          />
          <Reveal>
            <GiftPicker config={config} />
          </Reveal>
        </div>
      </section>

      <Scallop fill="#dd3f86" />
      </>
      )}

      {/* ---------- footer : deep-punch closing card ---------- */}
      <footer className="cv relative flex min-h-[60vh] snap-start flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#dd3f86_0%,#c22f70_100%)] px-4 py-16 text-center">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-25" />
        <span className="anim-floaty pointer-events-none absolute left-[12%] top-1/4 text-blush/40" style={{ ["--r" as string]: "-10deg" }}>
          <HeartIcon className="w-10 h-10" />
        </span>
        <span className="anim-floaty pointer-events-none absolute right-[10%] bottom-1/4 text-blush/30" style={{ ["--r" as string]: "12deg", animationDelay: "-2.4s" }}>
          <HeartIcon className="w-8 h-8" />
        </span>
        <div className="relative">
          <p className="paper-script text-3xl md:text-4xl text-blush/95">{config.banner.sub}</p>
          <p className="mt-5 flex items-center justify-center gap-2 font-display font-extrabold text-white text-[19px] md:text-xl text-legible">
            {T("footerMade")} <HeartIcon className="anim-heart w-5 h-5 text-blush" /> {T("footerBy")}
          </p>
          <div className="mt-4 flex justify-center">
            <p className="hud-chip hud-chip--soft rounded-2xl px-4 py-2 text-[14px] md:text-[15px]">{T("footerNote")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
