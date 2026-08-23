import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { PartyConfig } from "../config";
import {
  HeartIcon, LetterIcon, SparkIcon, ArrowRightIcon, ChevronDownIcon, GiftIcon,
} from "./icons";

/* ---------------- scroll reveal wrapper ---------------- */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("on");
          io.disconnect();
        }
      },
      { threshold: 0.14 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function SectionTitle({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="text-center px-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/85 soft-shadow-sm px-4 py-1.5">
        <SparkIcon className="w-3.5 h-3.5 text-butter" />
        <span className="font-display font-bold uppercase tracking-[0.16em] text-[10px] md:text-[11px] text-punch-deep">
          {kicker}
        </span>
      </div>
      <h2 className="mt-3 font-display font-extrabold text-ink text-3xl md:text-[42px] leading-tight text-soft-shadow">
        {title}
      </h2>
      {sub && <p className="mt-2 font-body text-ink-soft text-sm md:text-base">{sub}</p>}
    </Reveal>
  );
}

/* ---------------- 1. the letter (scroll to read) ---------------- */
function LetterSection({ config }: { config: PartyConfig }) {
  return (
    <section className="relative rounded-t-[52px] soft-shadow-up bg-[linear-gradient(180deg,#fff7fb_0%,#fff0f6_100%)] px-5 py-14 md:py-20">
      <div className="max-w-2xl mx-auto">
        <SectionTitle
          kicker="Lá thư trong tiệc"
          title={`Gửi ${config.recipient.name},`}
          sub={`cuộn tới đây là đọc được rồi — ${config.sender.name} viết riêng cho cậu đó`}
        />

        <Reveal delay={120}>
          <div className="mt-9 panel-soft soft-shadow rounded-[30px] p-6 md:p-10 -rotate-[0.6deg] relative overflow-hidden">
            <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-blush/70 blur-xl" />
            <div className="absolute -bottom-8 -left-6 w-28 h-28 rounded-full bg-butter/40 blur-xl" />

            <div className="relative flex items-start justify-between gap-4">
              <h3 className="font-display font-extrabold text-punch-deep text-2xl md:text-3xl">
                {config.letter.heading}
              </h3>
              <div className="shrink-0 w-11 h-11 rounded-[14px] border-2 border-dashed border-candy bg-blush/60 flex items-center justify-center text-punch-deep rotate-6">
                <LetterIcon className="w-5 h-5" />
              </div>
            </div>

            <p className="relative mt-5 font-body text-[15px] md:text-base leading-8 text-ink bg-lined-paper pb-2">
              {config.letter.body}
            </p>

            <div className="relative mt-6 rounded-[20px] bg-[linear-gradient(135deg,#ffe4f0,#ffd9e8)] border border-white px-5 py-4 soft-shadow-sm">
              <p className="flex items-center gap-2 font-display font-bold text-punch-deep text-sm uppercase tracking-wide">
                <SparkIcon className="w-4 h-4 text-butter" /> Điều ước duy nhất
              </p>
              <p className="mt-1.5 font-body font-medium text-ink leading-7 text-sm md:text-[15px]">
                {config.letter.wish}
              </p>
            </div>

            <p className="relative mt-5 text-xs md:text-sm italic text-ink-soft">{config.letter.ps}</p>
            <p className="relative mt-4 text-right font-body font-semibold text-punch-deep text-sm md:text-base">
              {config.sender.signature}
            </p>
          </div>
        </Reveal>

        <Reveal delay={220} className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-ink-soft anim-bob">
            <span className="font-body text-sm font-medium">kỷ niệm ở ngay dưới nè</span>
            <ChevronDownIcon className="w-4 h-4 text-punch-deep" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- 2. memory photos (swipe) ---------------- */
function MemoriesSection({ config }: { config: PartyConfig }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const photos = config.memories.slice(0, 5);

  /* exact metrics so cards always land perfectly centered */
  const metrics = () => {
    const el = trackRef.current;
    if (!el || !el.children.length) return { step: 324, base: 0 };
    const card = el.children[0] as HTMLElement;
    const step = card.offsetWidth + 24; // gap-6
    const base = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    return { step, base };
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const { step, base } = metrics();
    const idx = Math.max(0, Math.min(photos.length - 1, Math.round((el.scrollLeft - base) / step)));
    setActive(idx);
  };
  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const { step, base } = metrics();
    const idx = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: base + idx * step, behavior: "smooth" });
  };

  /* center the first photo on load & keep it sane on resize */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const center = () => {
      const { base } = metrics();
      el.scrollLeft = Math.max(base, 0);
    };
    center();
    window.addEventListener("resize", center);
    return () => window.removeEventListener("resize", center);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative rounded-t-[52px] soft-shadow-up bg-[linear-gradient(180deg,#ffe9f3_0%,#ffdfec_100%)] py-14 md:py-20 overflow-hidden">
      <SectionTitle
        kicker="Cuộn phim nhỏ"
        title="Kỷ niệm của tụi mình"
        sub="vuốt ngang để lật từng tấm nhé"
      />

      <Reveal delay={120} className="mt-9 relative">
        {/* desktop arrows */}
        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => go(active - 1)}
          className="soft-btn hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white soft-shadow-sm items-center justify-center text-punch-deep rotate-180"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Ảnh sau"
          onClick={() => go(active + 1)}
          className="soft-btn hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white soft-shadow-sm items-center justify-center text-punch-deep"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-none pb-6 px-[16vw] sm:px-[12vw] md:px-[8vw]"
        >
          {photos.map((p, i) => (
            <div
              key={i}
              className={`snap-center shrink-0 w-[68vw] max-w-[300px] md:w-[300px] transition-transform duration-500 ${
                i === active ? "scale-100 -translate-y-1" : "scale-[0.94] opacity-90"
              } ${i % 2 ? "rotate-[1.4deg]" : "-rotate-[1.4deg]"}`}
            >
              <div className="bg-white rounded-[24px] p-3 pb-4 soft-shadow">
                <div className="relative overflow-hidden rounded-[16px]">
                  <img
                    src={p.src}
                    alt={p.caption}
                    loading="lazy"
                    className="w-full aspect-[4/5] object-cover"
                    draggable={false}
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 text-punch-deep font-display font-bold text-xs px-3 py-1">
                    {i + 1}/{photos.length}
                  </span>
                </div>
                <p className="mt-3 px-1 font-display font-bold text-ink text-sm md:text-base flex items-center gap-2">
                  <HeartIcon className="w-3.5 h-3.5 text-punch shrink-0" /> {p.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* dots */}
        <div className="mt-1 flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ảnh ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === active ? "w-7 bg-punch-deep" : "w-2.5 bg-candy/70 hover:bg-candy"
              }`}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- 3. three gift boxes (pick one) ---------------- */
function GiftBox({
  index,
  chosen,
  vanished,
  onPick,
}: {
  index: number;
  chosen: boolean;
  vanished: boolean;
  onPick: () => void;
}) {
  const shades = [
    { lid: "linear-gradient(180deg,#ff7db4,#e84a8f)", body: "linear-gradient(180deg,#ffb0cf,#ff97bf)", ribbon: "#ffd98a" },
    { lid: "linear-gradient(180deg,#ffa1c6,#f06ba4)", body: "linear-gradient(180deg,#ffc4dc,#ffb0cf)", ribbon: "#ffffff" },
    { lid: "linear-gradient(180deg,#f78fb9,#e75e9c)", body: "linear-gradient(180deg,#ffd0e2,#ffc0d8)", ribbon: "#8fe3c6" },
  ][index % 3];

  return (
    <div
      className={`flex-1 min-w-0 max-w-[220px] transition-all duration-500 ease-in ${
        vanished ? "gift-vanish pointer-events-none" : ""
      }`}
    >
      <button
        type="button"
        onClick={onPick}
        disabled={chosen === false && vanished}
        aria-label={`Chọn hộp quà ${index + 1}`}
        className="soft-btn group w-full text-center"
      >
        <div className="relative h-32 md:h-40">
          {/* glow when opened */}
          {chosen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-20 h-20 rounded-full bg-butter/70 blur-2xl" />
              <HeartIcon className="absolute w-8 h-8 text-punch-deep anim-heart" />
            </div>
          )}
          {/* body */}
          <div
            className="absolute bottom-0 inset-x-0 h-[70%] rounded-[20px] soft-shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
            style={{ background: shades.body }}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[16%]" style={{ background: shades.ribbon, opacity: 0.95 }} />
            <div className="absolute inset-0 bg-dots opacity-40" />
          </div>
          {/* lid */}
          <div
            className="absolute top-0 inset-x-[-4%] h-[34%] rounded-[16px] soft-shadow-sm overflow-hidden transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-2"
            style={{
              background: shades.lid,
              animation: chosen ? "lidPop .7s cubic-bezier(.34,1.3,.64,1) forwards" : undefined,
            }}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[15%]" style={{ background: shades.ribbon, opacity: 0.95 }} />
          </div>
          {/* bow */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center"
            style={{ animation: chosen ? "lidPop .7s cubic-bezier(.34,1.3,.64,1) forwards" : undefined }}
          >
            <span className="w-5 h-4 rounded-full border-[3px] -mr-1.5 -rotate-12" style={{ borderColor: shades.ribbon, background: "transparent" }} />
            <span className="w-3 h-3 rounded-full z-10" style={{ background: shades.ribbon }} />
            <span className="w-5 h-4 rounded-full border-[3px] -ml-1.5 rotate-12" style={{ borderColor: shades.ribbon, background: "transparent" }} />
          </div>
        </div>
        <span
          className={`mt-3 inline-block rounded-full px-4 py-1.5 font-display font-bold text-xs md:text-sm transition-colors duration-300 ${
            chosen ? "bg-punch-deep text-white" : "bg-white/85 text-punch-deep"
          }`}
        >
          Hộp {index + 1}
        </span>
      </button>
    </div>
  );
}

function GiftsSection({ config }: { config: PartyConfig }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [vanished, setVanished] = useState(false);
  const gifts = config.gifts.slice(0, 3);
  const sparks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const d = 55 + (i % 3) * 22;
        return {
          sx: `${Math.cos(a) * d}px`,
          sy: `${Math.sin(a) * d - 24}px`,
          delay: (i % 4) * 0.05,
          color: ["#ffd98a", "#ff9ec6", "#ffffff", "#8fe3c6"][i % 4],
        };
      }),
    []
  );

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setTimeout(() => setVanished(true), 750);
  };

  return (
    <section className="relative rounded-t-[52px] soft-shadow-up bg-[linear-gradient(180deg,#ffdfec_0%,#ffd3e6_60%,#ffcbdf_100%)] py-14 md:py-20 pb-32 md:pb-36 overflow-hidden">
      <SectionTitle
        kicker="Bí mật cuối thư"
        title="Ba hộp quà nhỏ"
        sub="chọn một hộp thôi — hai hộp kia sẽ biến mất mãi mãi đó"
      />

      <Reveal delay={120} className="mt-10 relative">
        {/* sparkles burst on reveal */}
        {picked !== null && (
          <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2">
            {sparks.map((s, i) => (
              <span
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{
                  background: s.color,
                  animation: `sparkBurst .8s ease-out ${s.delay}s forwards`,
                  ["--sx" as string]: s.sx,
                  ["--sy" as string]: s.sy,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-start justify-center gap-4 md:gap-10 px-5">
          {gifts.map((_, i) => (
            <GiftBox
              key={i}
              index={i}
              chosen={picked === i}
              vanished={picked !== null && picked !== i && vanished}
              onPick={() => pick(i)}
            />
          ))}
        </div>

        {/* revealed message */}
        {picked !== null && (
          <div className="mt-9 flex justify-center px-5">
            <div
              className="w-full max-w-md panel-soft soft-shadow rounded-[26px] p-6 md:p-7 text-center"
              style={{ animation: "giftRise .6s cubic-bezier(.34,1.4,.64,1) .25s both" }}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-[linear-gradient(180deg,#ff7db4,#e84a8f)] text-white flex items-center justify-center soft-shadow-sm">
                <GiftIcon className="w-6 h-6" />
              </div>
              <h3 className="mt-3 font-display font-extrabold text-punch-deep text-xl md:text-2xl">
                {gifts[picked].title}
              </h3>
              <p className="mt-2 font-body text-ink leading-7 text-sm md:text-[15px]">
                {gifts[picked].message}
              </p>
              <button
                type="button"
                onClick={() => {
                  setPicked(null);
                  setVanished(false);
                }}
                className="soft-btn mt-5 rounded-full bg-white border border-blush px-5 py-2 font-display font-bold text-xs text-punch-deep"
              >
                chọn lại từ đầu
              </button>
            </div>
          </div>
        )}

        {picked === null && (
          <p className="mt-8 text-center font-body text-ink-soft text-sm anim-bob">
            hộp nào cũng có quà — nhưng chỉ được chọn một thôi nha
          </p>
        )}
      </Reveal>
    </section>
  );
}

/* ---------------- assembled scroll page ---------------- */
export function ScrollSections({ config }: { config: PartyConfig }) {
  return (
    <>
      {/* hero: transparent window onto the 3D scene */}
      <section className="relative h-full min-h-[540px]" />

      <LetterSection config={config} />
      <MemoriesSection config={config} />
      <GiftsSection config={config} />

      <footer className="relative rounded-t-[40px] soft-shadow-up bg-[#ffc6dd] py-9 pb-32 text-center">
        <p className="font-display font-bold text-punch-deep text-sm md:text-base flex items-center justify-center gap-2">
          làm với thật nhiều <HeartIcon className="w-4 h-4 text-punch anim-heart" /> bởi {config.sender.name}
        </p>
        <p className="mt-1.5 font-body text-ink-soft text-xs">
          cuộn lên đầu trang để thổi nến lại bất cứ lúc nào
        </p>
      </footer>
    </>
  );
}
