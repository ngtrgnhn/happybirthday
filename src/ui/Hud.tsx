import { useEffect, useState } from "react";
import type { PartyConfig } from "../config";
import { useParty, CEREMONY } from "../store";
import { SoftButton } from "./Soft";
import {
  HeartIcon, CalendarIcon, PinIcon, ClockIcon, FlameIcon,
  CakeIcon, MatchIcon, WindIcon, ChevronDownIcon, SparkIcon,
} from "./icons";

export function Hud({ config }: { config: PartyConfig }) {
  const phase = useParty((s) => s.phase);
  const charReady = useParty((s) => s.charReady);
  const startApproach = useParty((s) => s.startApproach);
  const requestBlow = useParty((s) => s.requestBlow);
  const requestRelight = useParty((s) => s.requestRelight);
  const douse = useParty((s) => s.douse);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!douse) return;
    setFlash((f) => f + 1);
  }, [douse]);

  if (phase === "loading" || phase === "intro") return null;

  const inCeremony = CEREMONY.includes(phase);
  const hint =
    phase === "approach" ? config.hints.approach :
    phase === "blowing" ? config.hints.blowing :
    phase === "blown" ? config.hints.blown :
    phase === "relight" ? config.hints.relight : "";

  return (
    <>
      {/* dark flash the moment every flame dies */}
      {flash > 0 && (
        <div
          key={flash}
          className="pointer-events-none absolute inset-0 z-50 bg-[#3a0d24]"
          style={{ animation: "douseFlash 900ms ease-out forwards" }}
        />
      )}

      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* top-left: recipient pill */}
        <div
          className={`absolute top-4 left-4 md:top-6 md:left-6 transition-all duration-500 ${
            inCeremony ? "opacity-0 -translate-x-5 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="soft-shadow-sm rounded-full bg-white/95 border border-blush px-4 py-2.5 md:px-5 md:py-3 flex items-center gap-2.5 -rotate-1">
            <span className="text-punch anim-heart"><HeartIcon className="w-4.5 h-4.5" /></span>
            <span className="font-display font-bold text-ink text-sm md:text-base leading-none pt-0.5">
              Chúc mừng sinh nhật {config.recipient.name}
            </span>
          </div>
          <div className="mt-2 ml-3 flex items-center gap-1.5 text-white/95">
            <SparkIcon className="w-3.5 h-3.5 text-butter" />
            <span className="font-display font-bold text-xs md:text-sm text-soft-shadow leading-none">
              tròn {config.recipient.age} tuổi
            </span>
          </div>
        </div>

        {/* top-right: event ticket */}
        <div
          className={`absolute top-4 right-4 md:top-6 md:right-6 transition-all duration-500 ${
            inCeremony ? "opacity-0 translate-x-5 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="rounded-[18px] bg-white/95 border-2 border-dashed border-candy soft-shadow-sm px-4 py-2.5 rotate-1 text-right">
            <p className="flex items-center justify-end gap-1.5 font-body font-semibold text-[11px] md:text-xs text-ink-soft">
              <CalendarIcon className="w-3.5 h-3.5 text-punch-deep" /> {config.event.date}
            </p>
            <p className="flex items-center justify-end gap-1.5 font-body font-semibold text-[11px] md:text-xs text-ink-soft mt-1">
              <PinIcon className="w-3.5 h-3.5 text-punch-deep" /> {config.event.place}
            </p>
          </div>
        </div>

        {/* hint bar */}
        {inCeremony && hint && (
          <div className="absolute top-16 md:top-20 inset-x-0 flex justify-center px-4">
            <div
              key={phase}
              className="anim-rise rounded-full bg-[#6b2447]/85 backdrop-blur-sm text-blush font-body font-medium text-xs md:text-sm px-5 py-2.5 text-center soft-shadow-sm"
            >
              {hint}
            </div>
          </div>
        )}

        {/* bottom-right: scroll-to-letter pill (only when freely browsing) */}
        {phase === "party" && (
          <div className="absolute bottom-[max(88px,calc(env(safe-area-inset-bottom)+84px))] right-4 md:right-6 anim-rise" style={{ animationDelay: "400ms" }}>
            <div className="flex flex-col items-center gap-1 text-white">
              <span className="font-display font-bold text-xs md:text-sm text-soft-shadow">
                Cuộn xuống đọc thư
              </span>
              <span className="anim-bob text-butter"><ChevronDownIcon className="w-6 h-6" /></span>
            </div>
          </div>
        )}

        {/* action dock */}
        <div
          className={`absolute bottom-0 inset-x-0 flex justify-center px-4 pb-[max(20px,env(safe-area-inset-bottom))] transition-all duration-500 ${
            inCeremony || phase === "party" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          {phase === "party" && (
            <SoftButton onClick={startApproach} variant="primary" ariaLabel="Lại gần bánh kem">
              <CakeIcon className="w-5 h-5" /> Lại gần bánh kem
            </SoftButton>
          )}
          {phase === "approach" && !charReady && (
            <SoftButton disabled variant="white" ariaLabel="Đang tới">
              <HeartIcon className="w-4.5 h-4.5 text-punch anim-heart" /> Cô bé đang tới...
            </SoftButton>
          )}
          {phase === "approach" && charReady && (
            <SoftButton onClick={requestBlow} variant="primary" pulse ariaLabel="Thổi nến">
              <WindIcon className="w-5 h-5" /> Thổi nến
            </SoftButton>
          )}
          {phase === "blowing" && (
            <SoftButton disabled variant="white" ariaLabel="Đang thổi nến">
              <WindIcon className="w-5 h-5 text-punch-deep" /> Hít sâu... thổi!
            </SoftButton>
          )}
          {phase === "blown" && (
            <SoftButton onClick={requestRelight} variant="butter" ariaLabel="Thắp lại nến">
              <MatchIcon className="w-5 h-5" /> Thắp lại nến
            </SoftButton>
          )}
          {phase === "relight" && (
            <SoftButton disabled variant="white" ariaLabel="Đang thắp nến">
              <FlameIcon className="w-4.5 h-4.5 text-butter anim-heart" /> Đang thắp nến...
            </SoftButton>
          )}
        </div>
      </div>
    </>
  );
}
