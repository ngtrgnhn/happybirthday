import { useState } from "react";
import type { PartyConfig } from "../config";
import { useParty } from "../store";
import { GiftIcon, HeartIcon } from "./icons";

const PALETTES = [
  { c1: "#ffd9e8", c2: "#ff9ec6", c3: "#e57aa6", rb: "#fff4f8", sp: "#ffd166" },
  { c1: "#ffe6ae", c2: "#ffd166", c3: "#e2ac45", rb: "#ff8fc0", sp: "#ff8fc0" },
  { c1: "#cdf2e4", c2: "#8fe3c6", c3: "#5fc3a2", rb: "#fff7ec", sp: "#8fe3c6" },
];

function GiftBox3D({
  index,
  state,
  onPick,
}: {
  index: number;
  state: "idle" | "open" | "away";
  onPick: () => void;
}) {
  const p = PALETTES[index % PALETTES.length];
  return (
    <div
      onClick={state === "idle" ? onPick : undefined}
      className={`group outline-none ${state === "idle" ? "cursor-pointer" : ""}`}
    >
      <div className="gift-stage">
        <div
          className={`gift ${state === "open" ? "open" : ""} ${state === "away" ? "away" : ""}`}
          style={{
            ["--c1" as string]: p.c1,
            ["--c2" as string]: p.c2,
            ["--c3" as string]: p.c3,
            ["--rb" as string]: p.rb,
          }}
        >
          {/* box body */}
          <div className="g-base">
            <div className="g-rb" />
            <div className="g-tag">{index + 1}</div>
          </div>
          <div className="g-side">
            <div className="g-rb-side" />
          </div>
          {/* lid + bow (lift together) */}
          <div className="g-top">
            <div className="g-lid">
              <div className="g-rb" />
            </div>
            <div className="g-lid-side" />
            <div className="g-bow">
              <span className="g-loop l" />
              <span className="g-loop r" />
              <span className="g-knot" />
            </div>
          </div>
          {/* sparkle burst when opened */}
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2;
            return (
              <span
                key={i}
                className="g-spark"
                style={{
                  ["--dx" as string]: `${Math.cos(a) * 74}px`,
                  ["--dy" as string]: `${Math.sin(a) * 60 - 26}px`,
                  ["--sp" as string]: i % 2 ? p.sp : "#fff4f8",
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            );
          })}
        </div>
      </div>
      <span
        className={`mt-3 block font-display font-bold text-sm transition-colors ${
          state === "idle" ? "text-punch-deep group-hover:text-punch" : "text-ink-soft/60"
        }`}
      >
        hộp số {index + 1}
      </span>
    </div>
  );
}

export function GiftPicker({ config }: { config: PartyConfig }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [gift, setGift] = useState<{ title: string; message: string } | null>(null);
  const fireBurst = useParty((s) => s.fireBurst);

  const pick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    // the gift inside is drawn at random — fate decides, once and for all
    const pool = config.gifts;
    setGift(pool[Math.floor(Math.random() * pool.length)]);
    window.setTimeout(() => {
      setRevealed(true);
      fireBurst();
    }, 750);
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {config.gifts.slice(0, 3).map((_, i) => (
          <GiftBox3D
            key={i}
            index={i}
            state={chosen === null ? "idle" : chosen === i ? "open" : "away"}
            onPick={() => pick(i)}
          />
        ))}
      </div>

      {chosen !== null && !revealed && (
        <p className="mt-7 text-center font-body text-ink-soft text-sm animate-pulse">
          đang mở hộp...
        </p>
      )}

      {revealed && gift && (
        <div className="relative mx-auto mt-7 max-w-[440px] rounded-[24px] panel-soft soft-shadow-sm px-6 py-6 text-center anim-pop">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-punch px-4 py-1 font-display font-bold text-paper text-xs uppercase tracking-wide soft-shadow-sm">
            <span className="flex items-center gap-1.5">
              <GiftIcon className="w-3.5 h-3.5" /> định mệnh đã chọn
            </span>
          </span>
          <h4 className="font-display font-extrabold text-punch-deep text-2xl mt-2">{gift.title}</h4>
          <p className="mt-2 font-body text-[15px] text-ink-soft leading-relaxed">{gift.message}</p>
          <p className="mt-3 flex items-center justify-center gap-2 font-body text-xs text-ink-soft/80 italic">
            <HeartIcon className="w-3.5 h-3.5 text-punch anim-heart" />
            quà ngẫu nhiên, chỉ mở một lần — quà thật sẽ đến tay cậu sớm thôi
          </p>
        </div>
      )}
    </div>
  );
}
