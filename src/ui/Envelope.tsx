import { useMemo, useRef, useState } from "react";
import type { PartyConfig } from "../config";
import { useParty } from "../store";
import { SoftButton } from "./Soft";
import { HeartIcon, LetterIcon, SparkIcon, ArrowRightIcon } from "./icons";

type Stage = "closed" | "flap" | "fly" | "dissolve" | "reading";

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: `${(i * 83) % 100}%`,
        size: 13 + ((i * 37) % 24),
        dur: 9 + ((i * 53) % 8),
        delay: -((i * 97) % 12),
        o: 0.2 + ((i * 29) % 35) / 100,
        dx: ((i * 41) % 80) - 40,
        color: i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#ffc1da" : "#ffd98a",
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h, i) => (
        <span
          key={i}
          className="absolute bottom-0"
          style={{
            left: h.left,
            color: h.color,
            animation: `drift ${h.dur}s linear infinite`,
            animationDelay: `${h.delay}s`,
            ["--o" as string]: h.o,
            ["--dx" as string]: `${h.dx}px`,
            opacity: 0,
          }}
        >
          <HeartIcon className="w-4 h-4" />
          <span style={{ display: "inline-block", width: h.size }} />
        </span>
      ))}
    </div>
  );
}

/* paper bits that burst when the envelope dissolves */
function Shreds() {
  const bits = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + Math.random() * 0.6;
        const d = 130 + Math.random() * 220;
        return {
          tx: `${Math.cos(a) * d}px`,
          ty: `${Math.sin(a) * d - 70}px`,
          rot: `${Math.random() * 540 - 270}deg`,
          w: 10 + Math.random() * 18,
          h: 8 + Math.random() * 14,
          delay: Math.random() * 0.12,
          color: ["#ffffff", "#ffd9e8", "#ff9ec6", "#fff0f6"][i % 4],
          x: Math.random() * 100,
          y: Math.random() * 100,
          r: Math.random() * 50,
        };
      }),
    []
  );
  return (
    <>
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.w,
            height: b.h,
            background: b.color,
            borderRadius: `${b.r}% ${100 - b.r}% ${b.r}% ${100 - b.r}%`,
            animation: `shredFly .95s cubic-bezier(.3,.6,.6,1) ${b.delay}s forwards`,
            ["--tx" as string]: b.tx,
            ["--ty" as string]: b.ty,
            ["--rot" as string]: b.rot,
            boxShadow: "0 4px 10px rgba(214,51,132,.2)",
          }}
        />
      ))}
    </>
  );
}

export function Envelope({ config }: { config: PartyConfig }) {
  const [stage, setStage] = useState<Stage>("closed");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const enterParty = useParty((s) => s.enterParty);

  const doOpen = () => {
    if (stage !== "closed") return;
    setStage("flap");
    setTimeout(() => setStage("fly"), 520);       // letter slides out
    setTimeout(() => setStage("dissolve"), 1050); // envelope melts into shreds
    setTimeout(() => setStage("reading"), 1650);  // letter arrives up front
  };

  const onMove = (e: React.MouseEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: nx * 6, y: -ny * 6 });
  };

  const flapOpen = stage !== "closed";
  const envGone = stage === "dissolve";
  const letterOut = stage === "fly" || stage === "dissolve";
  const reading = stage === "reading";

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* layered soft background */}
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#ffc4dc_0%,#ff9ec6_40%,#f97fb4_100%)]" />
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_36%,rgba(255,250,252,0.55),transparent_56%)]" />
      <FloatingHearts />
      <div className="absolute top-10 left-7 text-white/70 anim-floaty" style={{ ["--r" as string]: "-12deg" }}>
        <SparkIcon className="w-9 h-9" />
      </div>
      <div className="absolute bottom-16 right-9 text-butter/90 anim-floaty" style={{ ["--r" as string]: "14deg", animationDelay: "-2s" }}>
        <SparkIcon className="w-12 h-12" />
      </div>

      <div className="relative h-full w-full flex flex-col items-center justify-center gap-6 px-4 py-8 overflow-y-auto scroll-none">
        {/* kicker */}
        <div className="anim-rise" style={{ animationDelay: "80ms" }}>
          <div className="rounded-full bg-white/85 soft-shadow-sm px-5 py-2 -rotate-1">
            <span className="font-display font-bold uppercase tracking-[0.18em] text-[11px] md:text-xs text-punch-deep">
              {config.event.kicker}
            </span>
          </div>
        </div>

        {/* ---------- envelope ---------- */}
        <div
          ref={wrap}
          onMouseMove={onMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className="anim-pop relative"
          style={{
            perspective: "1100px",
            opacity: reading ? 0 : 1,
            pointerEvents: stage === "closed" ? "auto" : "none",
          }}
        >
          {/* shreds live here so they burst from the envelope position */}
          {envGone && <Shreds />}

          {stage !== "reading" && (
            <div
              className="relative w-[min(88vw,460px)] transition-transform duration-300 ease-out"
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="relative aspect-[3/2.05] rounded-[26px] bg-[linear-gradient(180deg,#f97fb4,#ee5f9f)] soft-shadow overflow-hidden"
                style={envGone ? { animation: "envelopeMelt .55s ease-in forwards" } : undefined}
              >
                {/* peeking letter */}
                <div
                  className={`absolute left-[6%] right-[6%] bottom-[8%] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
                    letterOut ? "-translate-y-[52%]" : "translate-y-[3%]"
                  }`}
                  style={{ zIndex: 35 }}
                >
                  <div className="rounded-[20px] bg-[linear-gradient(180deg,#fffafc,#fff0f6)] border border-white soft-shadow-sm px-6 py-5">
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ink-soft font-semibold">
                      Lá thư dành cho
                    </p>
                    <p className="font-display font-extrabold text-punch-deep text-3xl md:text-4xl leading-tight">
                      {config.recipient.name}
                    </p>
                    <p className="mt-2 text-xs text-ink-soft font-medium">
                      từ {config.sender.name} — mở ra đọc nhé
                    </p>
                  </div>
                </div>

                {/* front pocket */}
                <div
                  className="absolute inset-0 rounded-[26px] bg-[linear-gradient(180deg,#ffb0cf,#ff97bf)]"
                  style={{
                    clipPath: "polygon(0 26%, 50% 64%, 100% 26%, 100% 100%, 0 100%)",
                    zIndex: 40,
                  }}
                >
                  <div className="absolute inset-0 bg-stripes opacity-60" />
                  <div className="absolute inset-x-0 bottom-[10%] flex flex-col items-center gap-1 text-white">
                    <HeartIcon className="w-7 h-7 anim-heart" />
                    <span className="font-display font-bold text-sm tracking-wide text-soft-shadow">
                      thư gửi {config.recipient.name}
                    </span>
                  </div>
                </div>

                {/* flap */}
                <div
                  className="absolute left-0 right-0 top-0 h-[58%] transition-transform duration-500 ease-in-out"
                  style={{
                    transformOrigin: "top center",
                    transform: flapOpen ? "rotateX(-176deg)" : "rotateX(0deg)",
                    zIndex: flapOpen ? 20 : 45,
                    backfaceVisibility: "visible",
                  }}
                >
                  <div
                    className="w-full h-full bg-[linear-gradient(180deg,#ee5f9f,#e84a8f)]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  >
                    <div className="absolute inset-0 bg-stripes opacity-40" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
                  </div>
                </div>

                {/* seal button */}
                {stage === "closed" && (
                  <button
                    type="button"
                    onClick={doOpen}
                    aria-label="Mở thư"
                    className="absolute left-1/2 top-[48%] anim-ring rounded-full"
                    style={{
                      zIndex: 50,
                      transform: "translate(-50%, -50%)",
                      animationName: "pulseRing, sealWiggle",
                    }}
                  >
                    <span className="block rounded-full bg-white p-[5px] soft-shadow-sm">
                      <span className="flex w-14 h-14 md:w-16 md:h-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff7db4,#e84a8f)] text-white">
                        <HeartIcon className="w-7 h-7" />
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---------- the letter flies up front ---------- */}
        {(stage === "dissolve" || reading) && (
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center px-4 ${
              reading ? "pointer-events-auto" : "pointer-events-none"
            }`}
            style={{ perspective: "1200px" }}
          >
            <div
              className="w-[min(92vw,560px)] transition-all duration-[850ms] ease-[cubic-bezier(.22,1,.36,1)]"
              style={{
                transform: reading ? "none" : "translateY(20vh) scale(.5) rotateX(26deg)",
                opacity: reading ? 1 : 0,
              }}
            >
              <div className="panel-soft soft-shadow rounded-[30px] p-6 md:p-9 -rotate-1 max-h-[62vh] overflow-y-auto scroll-pink">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.22em] text-ink-soft font-semibold">
                      {config.event.title}
                    </p>
                    <h1 className="font-display font-extrabold text-punch-deep text-3xl md:text-4xl mt-1">
                      {config.letter.heading}
                    </h1>
                  </div>
                  <div className="shrink-0 w-12 h-12 rounded-[14px] border-2 border-dashed border-candy bg-blush/60 flex items-center justify-center text-punch-deep rotate-6">
                    <HeartIcon className="w-5 h-5" />
                  </div>
                </div>

                <p className="mt-5 font-body text-[15px] md:text-base leading-8 text-ink bg-lined-paper pb-2">
                  {config.letter.body}
                </p>

                <div className="mt-5 rounded-[20px] bg-[linear-gradient(135deg,#ffe4f0,#ffd9e8)] border border-white px-5 py-4 soft-shadow-sm">
                  <p className="flex items-center gap-2 font-display font-bold text-punch-deep text-sm uppercase tracking-wide">
                    <SparkIcon className="w-4 h-4 text-butter" /> Điều ước trong thư
                  </p>
                  <p className="mt-1.5 font-body font-medium text-ink leading-7 text-sm md:text-[15px]">
                    {config.letter.wish}
                  </p>
                </div>

                <p className="mt-4 text-xs md:text-sm italic text-ink-soft">{config.letter.ps}</p>
                <p className="mt-4 text-right font-body font-semibold text-punch-deep text-sm md:text-base">
                  {config.sender.signature}
                </p>

                {reading && (
                  <div className="anim-rise mt-6 flex justify-center" style={{ animationDelay: "250ms" }}>
                    <SoftButton onClick={enterParty} variant="primary" pulse ariaLabel="Vào tiệc sinh nhật">
                      Vào tiệc <ArrowRightIcon className="w-4.5 h-4.5" />
                    </SoftButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* bottom caption */}
        {stage === "closed" && (
          <div className="anim-rise flex flex-col items-center gap-3" style={{ animationDelay: "200ms" }}>
            <SoftButton onClick={doOpen} variant="white" ariaLabel="Mở thư">
              <LetterIcon className="w-4.5 h-4.5 text-punch-deep" /> Mở thư
            </SoftButton>
            <p className="font-body text-white/90 text-sm font-medium text-center">
              có một lá thư đang chờ {config.recipient.nickname} mở ra...
            </p>
          </div>
        )}
        {(stage === "flap" || stage === "fly" || stage === "dissolve") && (
          <p className="font-body text-white/90 text-sm font-medium anim-hint text-center" style={{ animation: "riseIn .5s both" }}>
            lá thư đang bay ra...
          </p>
        )}
      </div>
    </div>
  );
}
