import type { ChangeEvent } from "react";
import { PrimaryButton, SecondaryButton } from "./ui";

export function UploadStep({
  fileName,
  parseError,
  canContinue,
  onUpload,
  onBack,
  onContinue,
}: {
  fileName: string;
  parseError: string;
  canContinue: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="w-full space-y-4 transition-all duration-200">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Upload Payroll CSV</h2>
        <p className="mt-1 text-sm text-gray-600">Headers: name, wallet, amount, currency</p>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center transition-all duration-200 hover:border-gray-400">
          <span className="text-sm text-gray-600">Choose a .csv file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onUpload}
            className="w-full max-w-[240px] text-xs text-gray-500 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-medium file:text-white"
          />
        </label>

        {fileName && <p className="mt-3 text-sm text-gray-700">File: {fileName}</p>}
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
