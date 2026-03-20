import type { ChangeEvent } from "react";
import { PrimaryButton, SecondaryButton } from "./ui";

export function UploadStep({
  fileName,
  parseError,
  canContinue,
  onUpload,
  onLoadSample,
  onBack,
  onContinue,
}: {
  fileName: string;
  parseError: string;
  canContinue: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onLoadSample: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="w-full space-y-3 transition-all duration-200">
      <div className="soft-panel rounded-2xl p-4">
        <h2 className="text-lg font-semibold text-[var(--ink-0)]">Upload Payroll CSV</h2>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          Required: <span className="font-mono">name,wallet,amount,currency</span>
        </p>
        <p className="mt-1 text-xs text-[var(--ink-2)]">
          Optional: <span className="font-mono">payout_rail,test_tx_required</span> where payout_rail can be ZEC or USDC_NEAR_INTENT.
        </p>

        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line)] bg-white px-3 py-7 text-center transition-all duration-200 hover:border-[var(--ink-2)]">
          <span className="text-xs text-[var(--ink-2)]">Choose a .csv file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onUpload}
            className="w-full max-w-[240px] text-xs text-[var(--ink-2)] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </label>
        <div className="mt-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-1)] transition-colors hover:bg-[#f7faf5]"
          >
            Load Sample CSV
          </button>
        </div>

        {fileName && <p className="mt-3 text-sm text-[var(--ink-1)]">File: {fileName}</p>}
        {parseError && <p className="mt-2 text-sm text-red-600">{parseError}</p>}
      </div>

      <div className="flex gap-3">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onContinue} disabled={!canContinue}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
