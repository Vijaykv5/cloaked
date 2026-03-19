import { PrimaryButton } from "./ui";

export function LandingStep({ onStart }: { onStart: () => void }) {
  return (
    <section className="w-full space-y-6 text-center transition-all duration-200">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-500">ZEC Payroll</p>
      <h1 className="text-5xl font-semibold tracking-tight text-gray-900">ZEC Payroll</h1>
      <p className="text-base text-gray-600">Private payroll with Zcash</p>
      <PrimaryButton onClick={onStart}>Start Payroll</PrimaryButton>
    </section>
  );
}
