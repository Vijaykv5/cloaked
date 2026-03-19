import { PrimaryButton } from "./ui";

export function LandingStep({ onStart }: { onStart: () => void }) {
  return (
    <section className="w-full space-y-4 text-center transition-all duration-200">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">ZEC Payroll</p>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Shielded Payroll Runner</h1>
      <p className="text-sm text-gray-600">CSV to ZIP-321 batch with biweekly scheduling and encrypted server storage.</p>
      <PrimaryButton onClick={onStart}>Create Payroll Batch</PrimaryButton>
    </section>
  );
}
