import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { PartyConfig } from "../config";
import { scrollState } from "../scene/CameraRig";
import { LetterPaper } from "./LetterPaper";
import { GiftPicker } from "./Gifts";
import {
  HeartIcon, CakeIcon, ChevronDownIcon, SparkIcon, EnvelopeIcon, GiftIcon, CameraIcon,
} from "./icons";

/* keep the 3D camera in sync with the page scroll, without re-renders */
export function useScrollSync() {
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        scrollState.y = window.scrollY / window.innerHeight;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
}

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

function SectionHead({
  icon,
  badge,
  title,
  sub,
}: {
  icon: ReactNode;
  badge: string;
  title: string;
  sub: string;
}) {
  return (
    <Reveal className="mb-8 md:mb-10 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 soft-shadow-sm px-4 py-1.5 font-display font-bold uppercase tracking-[0.16em] text-[11px] text-punch-deep">
        {icon} {badge}
      </span>
      <h2 className="text-soft-shadow mt-4 font-display font-extrabold text-ink text-3xl md:text-4xl">{title}</h2>
      <p className="mx-auto mt-2.5 max-w-md px-4 font-body text-sm text-ink-soft md:text-[15px]">{sub}</p>
    </Reveal>
  );
}

/* ---------------- memories: swipe strip ---------------- */
function Memories({ config }: { config: PartyConfig }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const items = useMemo(() => config.memories.slice(0, 5), [config]);

  const scrollTo = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let bd = Infinity;
        Array.from(el.children).forEach((c, i) => {
          const cc = (c as HTMLElement).offsetLeft + (c as HTMLElement).offsetWidth / 2;
          const d = Math.abs(cc - center);
          if (d < bd) {
            bd = d;
            best = i;
          }
        });
        setActive(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items.length]);

  return (
    <div>
      <div
        ref={track}
        className="scroll-none -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 py-5 md:gap-7"
      >
        {items.map((m, i) => (
          <figure
            key={i}
            className={`shrink-0 snap-center transition-transform duration-500 ${
              i === active ? "scale-100" : "scale-[0.93] opacity-80"
            }`}
            style={{ transform: `rotate(${i % 2 === 0 ? -1.4 : 1.2}deg)` }}
          >
            <div className="w-[74vw] max-w-[300px] rounded-[20px] bg-white p-3 pb-4 soft-shadow-sm sm:w-[300px]">
              <div className="relative overflow-hidden rounded-[12px]">
                <img
                  src={m.src}
                  alt={m.caption}
                  draggable={false}
                  loading={i > 1 ? "lazy" : "eager"}
                  decoding="async"
                  width={832}
                  height={1024}
                  className="aspect-[4/5] w-full select-none object-cover"
                />
                <span className="absolute right-2 top-2 rounded-full bg-white/85 px-2.5 py-0.5 font-display font-bold text-[11px] text-punch-deep">
                  {i + 1}/{items.length}
                </span>
              </div>
              <figcaption className="mt-3 flex items-center justify-center gap-1.5 text-center font-body text-sm font-medium text-ink-soft">
                <HeartIcon className="w-3.5 h-3.5 shrink-0 text-punch" /> {m.caption}
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollTo(Math.max(0, active - 1))}
          disabled={active === 0}
          aria-label="Ảnh trước"
          className="soft-btn hidden h-11 w-11 items-center justify-center rounded-full bg-white/85 text-punch-deep soft-shadow-sm disabled:opacity-40 sm:flex"
        >
          <ChevronDownIcon className="h-5 w-5 rotate-90" />
        </button>
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Xem ảnh ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === active ? "w-7 bg-punch" : "w-2.5 bg-candy/70 hover:bg-candy"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollTo(Math.min(items.length - 1, active + 1))}
          disabled={active === items.length - 1}
          aria-label="Ảnh sau"
          className="soft-btn hidden h-11 w-11 items-center justify-center rounded-full bg-white/85 text-punch-deep soft-shadow-sm disabled:opacity-40 sm:flex"
        >
          <ChevronDownIcon className="h-5 w-5 -rotate-90" />
        </button>
      </div>
      <p className="mt-3 text-center font-body text-xs text-ink-soft/80 md:hidden">
        vuốt sang ngang để xem từng tấm
      </p>
    </div>
  );
}

/* ---------------- the scroll page ---------------- */
export function ScrollSections({ config }: { config: PartyConfig }) {
  return (
    <div className="relative">
      {/* hero: transparent window onto the 3D scene */}
      <section className="relative h-full min-h-[540px]">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.92, behavior: "smooth" })}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-punch-deep"
        >
          <span className="rounded-full bg-white/80 soft-shadow-sm px-4 py-1.5 font-display font-bold text-[13px]">
            cuộn xuống đọc thư
          </span>
          <ChevronDownIcon className="anim-bob h-5 w-5" />
        </button>
      </section>

      {/* soft horizon into the page */}
      <div className="pointer-events-none relative -mt-14 h-14 bg-[linear-gradient(180deg,rgba(255,217,232,0)_0%,#ffd9e8_88%)]" />

      {/* ---------- the letter ---------- */}
      <section className="relative overflow-hidden bg-[#ffd9e8] px-4 pb-20 pt-8">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-40" />
        <SparkIcon className="anim-floaty pointer-events-none absolute left-[8%] top-10 w-8 h-8 text-white/70" />
        <span className="anim-floaty pointer-events-none absolute right-[7%] top-24" style={{ ["--r" as string]: "14deg" }}>
          <HeartIcon className="w-9 h-9 text-punch/40" />
        </span>

        <div className="relative mx-auto max-w-[660px]">
          <SectionHead
            icon={<EnvelopeIcon className="w-3.5 h-3.5" />}
            badge="phong thư đã mở"
            title="Lá thư dành cho cậu"
            sub="nắn nót từng chữ, chỉ chờ cậu đọc — một lời chúc duy nhất nằm ngay trong đó"
          />
          <Reveal delay={80}>
            <LetterPaper config={config} className="-rotate-[0.6deg]" />
          </Reveal>
          <Reveal delay={160}>
            <div className="mx-auto mt-8 flex max-w-[420px] items-center gap-3 rounded-[18px] bg-white/65 px-4 py-3 soft-shadow-sm">
              <CakeIcon className="w-7 h-7 shrink-0 text-punch-deep" />
              <p className="font-body text-[13px] leading-snug text-ink-soft">
                đọc xong thì cuộn lên lại, tới gần bánh kem và <b className="text-punch-deep">thổi nến</b> nhé —
                điều ước chỉ linh nghiệm khi nến tắt.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- memories ---------- */}
      <section className="relative bg-[#ffeaf3] px-4 pb-20 pt-12">
        <div className="relative mx-auto max-w-[980px]">
          <SectionHead
            icon={<CameraIcon className="w-3.5 h-3.5" />}
            badge="năm qua của tụi mình"
            title="Ảnh kỷ niệm"
            sub="mỗi tấm là một ngày vui — vuốt ngang để lật xem từng chút một"
          />
          <Reveal>
            <Memories config={config} />
          </Reveal>
        </div>
      </section>

      {/* ---------- gifts ---------- */}
      <section className="relative overflow-hidden bg-[#ffe1ee] px-4 pb-24 pt-12">
        <div className="bg-stripes pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-[760px]">
          <SectionHead
            icon={<GiftIcon className="w-3.5 h-3.5" />}
            badge="bí mật nhỏ"
            title="Ba hộp quà"
            sub="chọn một hộp bằng linh cảm — hai hộp còn lại sẽ biến mất, và đó là lựa chọn của định mệnh"
          />
          <Reveal>
            <GiftPicker config={config} />
          </Reveal>
        </div>
      </section>

      {/* footer */}
      <footer className="relative rounded-t-[40px] soft-shadow-up bg-[#ffc6dd] py-9 pb-32 text-center">
        <p className="flex items-center justify-center gap-2 font-display font-bold text-punch-deep text-sm md:text-base">
          làm với thật nhiều <HeartIcon className="anim-heart w-4 h-4 text-punch" /> bởi {config.sender.name}
        </p>
        <p className="mt-1.5 font-body text-xs text-ink-soft">
          cuộn lên đầu trang để thổi nến lại bất cứ lúc nào
        </p>
      </footer>
    </div>
  );
}
