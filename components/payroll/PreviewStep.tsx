import type { Payment } from "@/types/payroll";
import { convertToZec } from "@/utils/payroll";
import { PrimaryButton, SecondaryButton, SummaryCard } from "./ui";

export function PreviewStep({
  payments,
  totalZec,
  errors,
  onBack,
  onGenerate,
}: {
  payments: Payment[];
  totalZec: number;
  errors: string[];
  onBack: () => void;
  onGenerate: () => void;
}) {
  return (
    <section className="w-full space-y-4 transition-all duration-200">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Payroll Preview</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <SummaryCard label="Total ZEC" value={totalZec.toFixed(8) + " ZEC"} />
          <SummaryCard label="Recipients" value={payments.length} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Wallet</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Currency</th>
                <th className="px-4 py-3 font-medium">ZEC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment, index) => (
                <tr key={payment.wallet + "-" + index}>
                  <td className="px-4 py-3 text-gray-900">{payment.name || "-"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{payment.wallet || "-"}</td>
                  <td className="px-4 py-3 text-gray-800">{payment.amount}</td>
                  <td className="px-4 py-3 text-gray-800">{payment.currency}</td>
                  <td className="px-4 py-3 text-gray-900">{convertToZec(payment.amount, payment.currency).toFixed(8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3">
          {errors.map((error) => (
            <p key={error} className="text-xs text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onGenerate} disabled={payments.length === 0 || errors.length > 0}>
          Generate Payroll
        </PrimaryButton>
      </div>
    </section>
  );
}
