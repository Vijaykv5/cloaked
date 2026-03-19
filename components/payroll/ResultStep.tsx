import type { CopyState } from "@/types/payroll";
import { PrimaryButton, SecondaryButton, SummaryCard } from "./ui";

export function ResultStep({
  uri,
  totalZec,
  recipients,
  copyState,
  onBack,
  onCopy,
  onOpen,
}: {
  uri: string;
  totalZec: number;
  recipients: number;
  copyState: CopyState;
  onBack: () => void;
  onCopy: () => void;
  onOpen: () => void;
}) {
  return (
    <section className="w-full space-y-4 transition-all duration-200">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Payment URI</h2>
        <p className="mt-1 text-sm text-gray-600">Generated ZIP-321 URI for your payroll batch.</p>

        <textarea
          readOnly
          value={uri}
          className="mt-4 h-36 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 outline-none"
        />

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <SummaryCard label="Total Amount" value={totalZec.toFixed(8) + " ZEC"} />
          <SummaryCard label="Recipients" value={recipients} />
        </div>

        {copyState === "copied" && <p className="mt-3 text-xs text-green-600">URI copied to clipboard.</p>}
        {copyState === "failed" && <p className="mt-3 text-xs text-red-600">Could not copy URI.</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onCopy}>Copy</PrimaryButton>
        <PrimaryButton onClick={onOpen}>Open in Wallet</PrimaryButton>
      </div>
    </section>
  );
}
