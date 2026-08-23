import { ReactNode } from "react";

export function SoftButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  ariaLabel,
  pulse,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "white" | "butter" | "deep";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  pulse?: boolean;
}) {
  const fill = {
    primary:
      "bg-[linear-gradient(180deg,#ff7db4_0%,#ff5c9e_55%,#e84a8f_100%)] text-white",
    white: "bg-white text-punch-deep border border-blush",
    butter: "bg-[linear-gradient(180deg,#ffe3a6,#ffd98a)] text-ink",
    deep: "bg-[linear-gradient(180deg,#7d2f55,#6b2447)] text-blush",
  }[variant];
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`soft-btn select-none rounded-full soft-shadow-sm ${fill} ${
        pulse ? "anim-ring" : ""
      } ${className}`}
    >
      <span className="flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wide text-sm md:text-[15px] leading-none px-6 py-3.5">
        {children}
      </span>
    </button>
  );
}

export function SoftPanel({
  children,
  className = "",
  radius = "rounded-[28px]",
}: {
  children: ReactNode;
  className?: string;
  radius?: string;
}) {
  return (
    <div className={`panel-soft soft-shadow ${radius} ${className}`}>
      {children}
    </div>
  );
}
