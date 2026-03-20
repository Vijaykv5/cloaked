import type { ReactNode } from "react";

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`select-none rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_8px_24px_rgba(17,53,38,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="select-none rounded-full border border-[var(--line)] bg-white px-6 py-3 text-base font-semibold text-[var(--ink-1)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ink-2)]"
    >
      {children}
    </button>
  );
}

export function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="soft-panel rounded-xl p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-2)]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[var(--ink-0)]">{value}</p>
    </div>
  );
}
