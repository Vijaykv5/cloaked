import type { Payment } from "@/types/payroll";

export function convertToZec(amount: number, currency: string): number {
  return currency.toUpperCase() === "USD" ? amount * 0.02 : amount;
}

export function generateZip321(payments: Payment[]): string {
  const params = payments
    .map((payment) => {
      const zecAmount = convertToZec(payment.amount, payment.currency);
      const memo = `Salary ${payment.name}`;
      return `address=${encodeURIComponent(payment.wallet)}&amount=${zecAmount.toFixed(8)}&memo=${encodeURIComponent(memo)}`;
    })
    .join("&");

  return `zcash:?${params}`;
}

export function validatePayments(payments: Payment[]): string[] {
  return payments
    .map((payment, index) => {
      if (!payment.wallet.startsWith("zs")) {
        return `Row ${index + 1}: wallet must start with "zs".`;
      }
      if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
        return `Row ${index + 1}: amount must be greater than 0.`;
      }
      return null;
    })
    .filter((error): error is string => error !== null);
}

export function calculateTotalZec(payments: Payment[]): number {
  return payments.reduce((sum, payment) => sum + convertToZec(payment.amount, payment.currency), 0);
}
