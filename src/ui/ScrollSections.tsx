import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { PartyConfig } from "../config";
import { LetterPaper } from "./LetterPaper";
import { GiftPicker } from "./Gifts";
import {
  HeartIcon, CakeIcon, ChevronDownIcon, SparkIcon, EnvelopeIcon, GiftIcon, CameraIcon,
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
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display font-bold uppercase tracking-[0.16em] text-[11px] soft-shadow-sm ${
          dark ? "bg-white/25 text-white backdrop-blur-sm" : "bg-white/75 text-punch-deep"
        }`}
      >
        {icon} {badge}
      </span>
      <h2
        className={`mt-4 font-display font-extrabold text-3xl md:text-4xl ${
          dark ? "text-white text-soft-shadow" : "text-ink text-soft-shadow"
        }`}
      >
        {title}
      </h2>
      <p className={`mx-auto mt-2.5 max-w-md px-4 font-body text-sm md:text-[15px] ${dark ? "text-white/85" : "text-ink-soft"}`}>
        {sub}
      </p>
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
            className={`shrink-0 snap-center transition-all duration-500 ${
              i === active ? "scale-100" : "scale-[0.93] opacity-75"
            }`}
            style={{ transform: `rotate(${i % 2 === 0 ? -1.4 : 1.2}deg)` }}
          >
            <div className="w-[74vw] max-w-[300px] rounded-[20px] bg-[#fffaf2] p-3 pb-4 sm:w-[300px]" style={{ boxShadow: "0 22px 44px -16px rgba(120,20,70,0.5)" }}>
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
                <span className="tape !h-5 !w-14 -top-1 left-1/2 -translate-x-1/2 -rotate-3" />
              </div>
              <figcaption className="paper-hand mt-2.5 !text-[17px] !leading-snug text-center text-[#7c2a50]">
                {m.caption}
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      {/* dots indicator - visual only, swipe to navigate */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === active ? "w-7 bg-white" : "w-2.5 bg-white/50"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-center font-body text-xs text-white/75 md:hidden">
        vuốt sang ngang để xem từng tấm
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
  return (
    <div className="relative">
      {/* ---------- hero: transparent window onto the 3D scene ---------- */}
      <section id="sec-hero" className="relative min-h-screen snap-start" style={{ minHeight: "100dvh" }}>
        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-punch-deep pointer-events-none">
          <span className="rounded-full bg-white/85 soft-shadow-sm px-4 py-1.5 font-display font-bold text-[13px]">
            cuộn xuống đọc thư
          </span>
          <ChevronDownIcon className="anim-bob h-5 w-5" />
        </div>
      </section>

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
            badge="phong thư đã mở"
            title="Lá thư dành cho cậu"
            sub="nắn nót từng chữ, chỉ chờ cậu đọc — một lời chúc duy nhất nằm ngay trong đó"
          />
          <Reveal delay={80}>
            <LetterPaper config={config} className="-rotate-[0.6deg]" />
          </Reveal>
          <Reveal delay={160}>
            <div className="mx-auto mt-8 flex max-w-[420px] items-center gap-3 rounded-[18px] border border-white bg-white/70 px-4 py-3 soft-shadow-sm">
              <CakeIcon className="w-7 h-7 shrink-0 text-punch-deep" />
              <p className="font-body text-[13px] leading-snug text-ink-soft">
                đọc xong thì cuộn lên lại, tới gần bánh kem và <b className="text-punch-deep">thổi nến</b> nhé —
                điều ước chỉ linh nghiệm khi nến tắt.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Scallop fill="#e84a8f" />

      {/* ---------- memories : deep-rose bokeh world ---------- */}
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
            badge="năm qua của tụi mình"
            title="Ảnh kỷ niệm"
            sub="mỗi tấm là một ngày vui — vuốt ngang để lật xem từng chút một"
          />
          <Reveal>
            <Memories config={config} />
          </Reveal>
        </div>
      </section>

      <Scallop fill="#fff3d8" />

      {/* ---------- gifts : butter candy-shop world ---------- */}
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
            badge="bí mật nhỏ"
            title="Ba hộp quà"
            sub="chọn một hộp bằng linh cảm — món quà bên trong là ngẫu nhiên, và chỉ mở được một lần duy nhất"
          />
          <Reveal>
            <GiftPicker config={config} />
          </Reveal>
        </div>
      </section>

      <Scallop fill="#dd3f86" />

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
          <p className="mt-5 flex items-center justify-center gap-2 font-display font-bold text-white text-base md:text-lg text-soft-shadow">
            làm với thật nhiều <HeartIcon className="anim-heart w-5 h-5 text-blush" /> bởi {config.sender.name}
          </p>
          <p className="mt-4 font-body text-xs text-white/75">
            cuộn lên đầu trang để thổi nến lại bất cứ lúc nào
          </p>
        </div>
      </footer>
    </div>
  );
}
