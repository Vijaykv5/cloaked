import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Papa from "papaparse";
import type { CopyState, Payment, RawPayment, Step } from "@/types/payroll";
import { calculateTotalZec, generateZip321, validatePayments } from "@/utils/payroll";

export function usePayroll() {
  const [step, setStep] = useState<Step>("landing");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [uri, setUri] = useState("");
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const validationErrors = useMemo(() => validatePayments(payments), [payments]);
  const totalZec = useMemo(() => calculateTotalZec(payments), [payments]);

  function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setParseError("");
    setCopyState("idle");

    Papa.parse<RawPayment>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedPayments = result.data
          .map((row) => {
            const amountValue = Number(row.amount ?? "");
            return {
              name: row.name?.trim() ?? "",
              wallet: row.wallet?.trim() ?? "",
              amount: Number.isNaN(amountValue) ? 0 : amountValue,
              currency: row.currency?.trim().toUpperCase() || "ZEC",
            };
          })
          .filter((row) => row.name || row.wallet || row.amount || row.currency);

        if (parsedPayments.length === 0) {
          setParseError("No valid rows found. Expected headers: name, wallet, amount, currency.");
          setPayments([]);
          return;
        }

        setPayments(parsedPayments);
      },
      error: () => {
        setParseError("Failed to parse CSV file.");
        setPayments([]);
      },
    });
  }

  function handleGeneratePayroll() {
    setUri(generateZip321(payments));
    setStep("result");
  }

  async function handleCopyUri() {
    try {
      await navigator.clipboard.writeText(uri);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return {
    step,
    setStep,
    payments,
    uri,
    fileName,
    parseError,
    copyState,
    setCopyState,
    validationErrors,
    totalZec,
    handleCsvUpload,
    handleGeneratePayroll,
    handleCopyUri,
  };
}
