import type { PartyConfig } from "../config";
import { useParty, Phase } from "../store";
import { CutButton, CutPanel } from "./Cut";
import {
  LetterIcon, SparkIcon, CakeIcon, WindIcon, MatchIcon, CloseIcon, HeartIcon,
} from "./icons";

const CEREMONY: Phase[] = ["approach", "closeup", "blowing", "blown", "relight"];

function hintFor(phase: Phase, c: PartyConfig): string | null {
  switch (phase) {
    case "approach": return c.hints.approach;
    case "closeup": return c.hints.closeup;
    case "blowing": return "Phù... phù...";
    case "blown": return c.hints.blown;
    case "relight": return c.hints.relight;
    default: return null;
  }
}

function DouseFlash() {
  const douse = useParty((s) => s.douse);
  if (!douse) return null;
  return (
    <div
      key={douse}
      className="fixed inset-0 z-30 pointer-events-none"
      style={{
        animation: "douseFlash 1.15s ease-out forwards",
        background: "radial-gradient(ellipse at 50% 55%, rgba(64,12,42,0.5), rgba(26,4,18,0.82))",
      }}
    />
  );
}

function LetterModal({ config }: { config: PartyConfig }) {
  const open = useParty((s) => s.letterOpen);
  const close = useParty((s) => s.closeLetter);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      <div className="absolute inset-0 bg-ink/60" onClick={close} aria-hidden />
      <CutPanel
        className="relative w-[min(94vw,620px)]"
        inner="flex flex-col overflow-hidden max-h-[84vh]"
      >
        {/* tape strips */}
        <span className="absolute -top-2 left-8 w-20 h-5 bg-candy/80 rotate-[-8deg] z-10" style={{ clipPath: "polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)" }} />
        <span className="absolute -top-2 right-10 w-16 h-5 bg-butter/80 rotate-[7deg] z-10" style={{ clipPath: "polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)" }} />

        <div className="flex items-center justify-between px-5 md:px-7 pt-5">
          <p className="font-display font-bold uppercase tracking-[0.18em] text-xs text-punch-deep flex items-center gap-2">
            <LetterIcon className="w-4 h-4" /> Lá thư nhỏ
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng lá thư"
            className="btn-cut bg-ink p-[2px]"
          >
            <span className="btn-cut block bg-blush text-ink px-2.5 py-2">
              <CloseIcon className="w-4 h-4" />
            </span>
          </button>
        </div>

        <div className="px-5 md:px-7 py-5 overflow-y-auto scroll-pink bg-lined-paper flex-1 min-h-0">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink">
            {config.letter.heading}
          </h2>
          <p className="mt-4 font-body text-[15px] md:text-base leading-7 md:leading-8 text-ink/90">
            {config.letter.body}
          </p>

          <div className="mt-6 cut-sm bg-blush p-[2.5px]">
            <div className="cut-sm bg-paper px-4 py-4 md:px-5">
              <p className="font-display font-bold uppercase tracking-[0.16em] text-[11px] text-punch-deep flex items-center gap-1.5">
                <HeartIcon className="w-3.5 h-3.5" /> Điều ước duy nhất
              </p>
              <p className="mt-2 font-body italic font-semibold text-[15px] md:text-[17px] leading-7 text-ink">
                “{config.letter.wish}”
              </p>
            </div>
          </div>

          <p className="mt-6 text-right font-body italic text-sm md:text-[15px] text-ink-soft">
            {config.sender.signature}
          </p>
        </div>

        <div className="px-5 md:px-7 pb-5 pt-1 flex justify-end">
          <CutButton variant="paper" onClick={close}>Đóng thư</CutButton>
        </div>
      </CutPanel>
    </div>
  );
}

export function Hud({ config }: { config: PartyConfig }) {
  const phase = useParty((s) => s.phase);
  const charReady = useParty((s) => s.charReady);
  const openLetter = useParty((s) => s.openLetter);
  const startApproach = useParty((s) => s.startApproach);
  const requestBlow = useParty((s) => s.requestBlow);
  const requestRelight = useParty((s) => s.requestRelight);
  const fireBurst = useParty((s) => s.fireBurst);

  const inParty = phase === "party";
  const inCeremony = CEREMONY.includes(phase);
  const hint = hintFor(phase, config);

  return (
    <>
      <div className="fixed inset-0 z-20 pointer-events-none">
        {/* ---- top-left: name sticker ---- */}
        <div
          className={`absolute top-4 left-4 md:top-6 md:left-6 max-w-[min(66vw,360px)] transition-all duration-500 ${
            inParty ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"
          }`}
        >
          <CutPanel className="-rotate-2" inner="px-4 py-3 md:px-5">
            <p className="font-display font-bold uppercase tracking-[0.2em] text-[10px] md:text-[11px] text-punch-deep">
              {config.event.kicker}
            </p>
            <h1 className="font-display font-extrabold leading-[1.08] text-lg md:text-2xl text-ink mt-0.5">
              {config.event.title}{" "}
              <span className="text-punch-deep whitespace-nowrap">{config.recipient.name}</span>
            </h1>
          </CutPanel>
        </div>

        {/* ---- top-right: date ticket ---- */}
        <div
          className={`absolute top-4 right-4 md:top-6 md:right-6 transition-all duration-500 delay-75 ${
            inParty ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"
          }`}
        >
          <CutPanel cut="cut-ticket" bg="bg-butter" className="rotate-2" inner="px-4 py-2 text-center">
            <p className="font-display font-extrabold text-base md:text-lg leading-none text-ink">
              {config.event.date}
            </p>
            <p className="font-body font-semibold text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-ink-soft mt-1">
              tuổi {config.recipient.age}
            </p>
          </CutPanel>
        </div>

        {/* ---- hint chip (ceremony only) ---- */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 bottom-[calc(104px+env(safe-area-inset-bottom))] md:bottom-[calc(112px+env(safe-area-inset-bottom))] px-4 w-full flex justify-center transition-all duration-500 ${
            inCeremony && hint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <p
            key={hint}
            className="anim-hint cut-sm bg-ink text-blush font-body font-medium text-[13px] md:text-sm px-4 py-2.5 text-center shadow-soft max-w-[92vw]"
          >
            {hint}
          </p>
        </div>

        {/* ---- party dock ---- */}
        <div
          className={`absolute bottom-0 inset-x-0 flex flex-wrap justify-center gap-2.5 md:gap-3 px-4 pb-[max(20px,env(safe-area-inset-bottom))] transition-all duration-500 ${
            inParty ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          <CutButton variant="paper" onClick={openLetter} ariaLabel="Đọc lá thư">
            <LetterIcon className="w-4.5 h-4.5" /> Lá thư
          </CutButton>
          <CutButton variant="butter" onClick={fireBurst} ariaLabel="Bắn pháo giấy">
            <SparkIcon className="w-4.5 h-4.5" /> Pháo giấy
          </CutButton>
          <CutButton variant="primary" onClick={startApproach} ariaLabel="Lại gần bánh kem">
            <CakeIcon className="w-4.5 h-4.5" /> Lại gần bánh kem
          </CutButton>
        </div>

        {/* ---- ceremony dock ---- */}
        <div
          className={`absolute bottom-0 inset-x-0 flex justify-center px-4 pb-[max(20px,env(safe-area-inset-bottom))] transition-all duration-500 ${
            inCeremony ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          {(phase === "approach" || phase === "closeup" || phase === "blowing") && (
            <CutButton
              variant="primary"
              onClick={requestBlow}
              disabled={!charReady || phase === "blowing"}
              className="min-w-[210px]"
              ariaLabel="Thổi nến"
            >
              <WindIcon className="w-5 h-5" /> Thổi nến
            </CutButton>
          )}
          {phase === "blown" && (
            <CutButton
              variant="primary"
              onClick={requestRelight}
              className="min-w-[210px]"
              ariaLabel="Thắp lại nến"
            >
              <MatchIcon className="w-5 h-5" /> Thắp lại nến
            </CutButton>
          )}
        </div>

        <DouseFlash />
      </div>

      <LetterModal config={config} />
    </>
  );
}
