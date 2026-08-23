import { ReactNode } from "react";

/* Chamfered (cut-corner) panel: ink border layer + inner fill, both clipped.
   The hard offset shadow uses drop-shadow so it follows the clipped shape. */
export function CutPanel({
  children,
  className = "",
  inner = "",
  border = "bg-ink",
  bg = "bg-paper",
  pad = "p-[3px]",
  cut = "cut",
  shadow = "shadow-sticker",
}: {
  children: ReactNode;
  className?: string;
  inner?: string;
  border?: string;
  bg?: string;
  pad?: string;
  cut?: string;
  shadow?: string;
}) {
  return (
    <div className={`${cut} ${shadow} ${border} ${pad} ${className}`}>
      <div className={`${cut} ${bg} w-full h-full ${inner}`}>{children}</div>
    </div>
  );
}

export function CutButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "paper" | "butter" | "deep" | "mint";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const fill = {
    primary: "bg-punch text-paper",
    paper: "bg-paper text-ink",
    butter: "bg-butter text-ink",
    deep: "bg-ink text-blush",
    mint: "bg-mint text-ink",
  }[variant];
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`btn-cut bg-ink p-[3px] shadow-sticker select-none ${className}`}
    >
      <span
        className={`btn-cut block w-full h-full font-display font-bold uppercase tracking-wide text-sm md:text-[15px] leading-none px-5 py-3.5 flex items-center justify-center gap-2 ${fill}`}
      >
        {children}
      </span>
    </button>
  );
}
