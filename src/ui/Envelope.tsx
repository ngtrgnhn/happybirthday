import { useMemo, useRef, useState } from "react";
import type { PartyConfig } from "../config";
import { useParty } from "../store";
import { CutButton, CutPanel } from "./Cut";
import {
  HeartIcon, CalendarIcon, PinIcon, ClockIcon, ArrowRightIcon, SparkIcon,
} from "./icons";

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: `${(i * 83) % 100}%`,
        size: 14 + ((i * 37) % 26),
        dur: 9 + ((i * 53) % 8),
        delay: -((i * 97) % 12),
        o: 0.25 + ((i * 29) % 40) / 100,
        dx: ((i * 41) % 80) - 40,
        color: i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#ff8fc0" : "#ffd166",
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
          <span style={{ display: "block", width: h.size, height: h.size }}>
            <HeartIcon className="w-full h-full" />
          </span>
        </span>
      ))}
    </div>
  );
}

export function Envelope({ config }: { config: PartyConfig }) {
  const [open, setOpen] = useState(false);
  const [flapBack, setFlapBack] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const enterParty = useParty((s) => s.enterParty);

  const doOpen = () => {
    if (open) return;
    setOpen(true);
    setTimeout(() => setFlapBack(true), 430);
  };

  const onMove = (e: React.MouseEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: nx * 7, y: -ny * 7 });
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* layered ambient background */}
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#ff8fc0_0%,#ff5c9e_42%,#e63f85_100%)]" />
      <div className="absolute inset-0 bg-dots opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,244,248,0.5),transparent_58%)]" />
      <FloatingHearts />
      <div className="absolute top-8 left-6 text-paper/70 anim-floaty" style={{ ["--r" as string]: "-12deg" }}>
        <SparkIcon className="w-10 h-10" />
      </div>
      <div className="absolute bottom-14 right-8 text-butter/80 anim-floaty" style={{ ["--r" as string]: "14deg", animationDelay: "-2s" }}>
        <SparkIcon className="w-14 h-14" />
      </div>

      <div className="relative h-full w-full flex flex-col items-center justify-center gap-5 px-4 py-8 overflow-y-auto">
        {/* kicker */}
        <div className="anim-rise" style={{ animationDelay: "80ms" }}>
          <CutPanel cut="cut-sm" pad="p-[2.5px]" bg="bg-ink" border="bg-paper" shadow="shadow-soft" className="-rotate-2">
            <span className="block font-display font-bold uppercase tracking-[0.22em] text-[11px] md:text-xs text-blush px-4 py-2">
              {config.event.kicker}
            </span>
          </CutPanel>
        </div>

        {/* envelope with 3D tilt */}
        <div
          ref={wrap}
          onMouseMove={onMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className="anim-pop"
          style={{ perspective: "1100px" }}
        >
          <div
            className="relative w-[min(88vw,470px)] transition-transform duration-300 ease-out"
            style={{
              transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* back */}
            <div className="cut bg-punch-deep aspect-[3/2.05] shadow-sticker-lg relative">
              {/* letter card slides out */}
              <div
                className={`absolute left-[5.5%] right-[5.5%] bottom-[7%] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
                  open ? "translate-y-[-46%] opacity-100" : "translate-y-[4%] opacity-0"
                }`}
                style={{ zIndex: 35 }}
              >
                <CutPanel pad="p-[3px]" cut="cut-sm" shadow="" bg="bg-paper" border="bg-ink">
                  <div className="px-5 pt-5 pb-5 md:px-7 max-h-[46vh] overflow-y-auto scroll-pink">
                    <p className="font-body text-[11px] uppercase tracking-[0.2em] text-ink-soft font-semibold">
                      Dành riêng cho
                    </p>
                    <h1 className="font-display font-extrabold text-punch-deep text-4xl md:text-5xl leading-[1.05] mt-1 text-outline-sm text-paper">
                      {config.recipient.name}
                    </h1>
                    <div className="mt-4 space-y-2 text-[13px] md:text-sm font-medium text-ink">
                      <p className="flex items-center gap-2.5">
                        <span className="text-punch-deep"><CalendarIcon className="w-4.5 h-4.5" /></span>
                        {config.event.date}
                      </p>
                      <p className="flex items-center gap-2.5">
                        <span className="text-punch-deep"><PinIcon className="w-4.5 h-4.5" /></span>
                        {config.event.place}
                      </p>
                      <p className="flex items-center gap-2.5">
                        <span className="text-punch-deep"><ClockIcon className="w-4.5 h-4.5" /></span>
                        {config.event.time}
                      </p>
                    </div>
                    <div className="mt-5">
                      <CutButton onClick={enterParty} variant="primary" ariaLabel="Vào tiệc sinh nhật">
                        Vào tiệc <ArrowRightIcon className="w-4.5 h-4.5" />
                      </CutButton>
                    </div>
                    <p className="mt-3 text-[11px] text-ink-soft italic">
                      chuẩn bị sẵn một điều ước nhé — từ {config.sender.name}
                    </p>
                  </div>
                </CutPanel>
              </div>

              {/* front pocket */}
              <div
                className="absolute inset-0 bg-punch"
                style={{
                  clipPath: "polygon(0 24%, 50% 62%, 100% 24%, 100% 100%, 0 100%)",
                  zIndex: 40,
                }}
              >
                <div className="absolute inset-0 bg-stripes opacity-70" />
                <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 text-paper/90">
                  <HeartIcon className="w-9 h-9" />
                </div>
              </div>

              {/* flap */}
              <div
                className="absolute left-0 right-0 top-0 h-[56%] transition-transform duration-500 ease-in-out"
                style={{
                  transformOrigin: "top center",
                  transform: open ? "rotateX(-176deg)" : "rotateX(0deg)",
                  zIndex: flapBack ? 20 : 45,
                  backfaceVisibility: "visible",
                }}
              >
                <div
                  className="w-full h-full bg-punch-deep brightness-95"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                >
                  <div className="absolute inset-0 bg-stripes opacity-50" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
                </div>
              </div>

              {/* wax seal */}
              {!open && (
                <button
                  type="button"
                  onClick={doOpen}
                  aria-label="Mở thiệp"
                  className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 anim-seal"
                  style={{ zIndex: 50, animationName: "pulseGlow, sealWiggle" }}
                >
                  <span className="cut-sm block bg-ink p-[3px]">
                    <span className="cut-sm block bg-punch-deep w-16 h-16 md:w-[72px] md:h-[72px] flex items-center justify-center text-paper">
                      <HeartIcon className="w-8 h-8" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* bottom action / caption */}
        <div className="anim-rise flex flex-col items-center gap-3" style={{ animationDelay: "200ms" }}>
          {!open ? (
            <CutButton onClick={doOpen} variant="paper" ariaLabel="Mở thiệp mời">
              Mở thiệp <HeartIcon className="w-4.5 h-4.5 text-punch" />
            </CutButton>
          ) : (
            <p className="anim-hint font-body text-paper/95 text-sm md:text-base font-medium text-center px-6">
              Tấm thiệp đã mở — nhấn <span className="font-display font-bold">Vào tiệc</span> để gặp bất ngờ bên trong
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
