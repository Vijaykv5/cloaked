import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Papa from "papaparse";
import type {
  CopyState,
  EncryptedBatchRecord,
  GeneratedBatch,
  Payment,
  PayrollSettings,
  RawPayment,
  Step,
} from "@/types/payroll";
import { encryptJson } from "@/utils/crypto";
import {
  generateBatch,
  hasPendingTestTransactions,
  parseRawPayment,
  validatePayments,
} from "@/utils/payroll";

const DEFAULT_SETTINGS: PayrollSettings = {
  biweeklyAnchorDate: new Date().toISOString().slice(0, 10),
  testTxAmountZec: 0.0001,
};

const PAYOUT_STATUS_STORAGE_KEY = "zecpayroll:payout-status:v1";

type PaidStatusMap = Record<string, { txid: string; paidAt: string }>;

function readPaidStatusMap(): PaidStatusMap {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(PAYOUT_STATUS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed as PaidStatusMap;
  } catch {
    return {};
  }
}

function writePaidStatusMap(map: PaidStatusMap) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(PAYOUT_STATUS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors in demo mode.
  }
}

function applyPaidStatus(records: EncryptedBatchRecord[]): EncryptedBatchRecord[] {
  const paidMap = readPaidStatusMap();
  return records.map((record) => {
    const paidStatus = paidMap[record.id];
    if (!paidStatus) {
      return {
        ...record,
        payoutStatus: "pending",
      };
    }
    return {
      ...record,
      payoutStatus: "paid",
      txid: paidStatus.txid,
      paidAt: paidStatus.paidAt,
    };
  });
}

export function usePayroll() {
  const [step, setStep] = useState<Step>("landing");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [batch, setBatch] = useState<GeneratedBatch | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [copyZipState, setCopyZipState] = useState<CopyState>("idle");
  const [copyNearState, setCopyNearState] = useState<CopyState>("idle");
  const [settings, setSettings] = useState<PayrollSettings>(DEFAULT_SETTINGS);
  const [passphrase, setPassphrase] = useState("");
  const [savedRecords, setSavedRecords] = useState<EncryptedBatchRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState("");
  const [paidTxid, setPaidTxid] = useState("");
  const [markPaidError, setMarkPaidError] = useState("");
  const [markPaidSuccess, setMarkPaidSuccess] = useState("");

  const validationErrors = useMemo(() => validatePayments(payments), [payments]);
  const pendingTests = useMemo(() => hasPendingTestTransactions(payments), [payments]);

  useEffect(() => {
    void fetchSavedRecords();
  }, []);

  useEffect(() => {
    const current = savedRecords.find((record) => record.id === activeRecordId);
    if (!current) {
      return;
    }
    setPaidTxid(current.txid ?? "");
  }, [activeRecordId, savedRecords]);

  async function fetchSavedRecords() {
    try {
      const response = await fetch("/api/batches");
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as { records?: EncryptedBatchRecord[] };
      const records = applyPaidStatus(payload.records ?? []);
      setSavedRecords(records);
      if (records.length > 0) {
        setActiveRecordId((current) => current || records[0].id);
      }
    } catch {
      // Ignore fetch errors in demo mode.
    }
  }

  function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    resetUploadState(file.name);

    Papa.parse<RawPayment>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        applyParsedRows(result.data);
      },
      error: () => {
        setParseError("Failed to parse CSV file.");
        setPayments([]);
      },
    });
  }

  async function handleLoadSampleCsv() {
    resetUploadState("sample_payroll.csv");

    try {
      const response = await fetch("/sample_payroll.csv", { cache: "no-store" });
      if (!response.ok) {
        setParseError("Could not load sample CSV.");
        setPayments([]);
        return;
      }

      const csvText = await response.text();
      Papa.parse<RawPayment>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          applyParsedRows(result.data);
        },
        error: () => {
          setParseError("Failed to parse sample CSV.");
          setPayments([]);
        },
      });
    } catch {
      setParseError("Could not load sample CSV.");
      setPayments([]);
    }
  }

  function resetUploadState(nextFileName: string) {
    setFileName(nextFileName);
    setParseError("");
    setGenerationError("");
    setCopyZipState("idle");
    setCopyNearState("idle");
    setMarkPaidError("");
    setMarkPaidSuccess("");
  }

  function applyParsedRows(data: RawPayment[]) {
    const parsedPayments = data
      .map((row, index) => parseRawPayment(row, index))
      .filter((row) => row.name || row.wallet || row.amount > 0);

    if (parsedPayments.length === 0) {
      setParseError(
        "No valid rows found. Expected headers: name, wallet, amount, currency, payout_rail, test_tx_required.",
      );
      setPayments([]);
      return;
    }

    setPayments(parsedPayments);
  }

  function setTestTxDone(paymentId: string, done: boolean) {
    setPayments((current) =>
      current.map((payment) => {
        if (payment.id !== paymentId) {
          return payment;
        }
        return {
          ...payment,
          testTxDone: done,
        };
      }),
    );
  }

  async function handleGeneratePayroll() {
    setGenerationError("");

    if (validationErrors.length > 0) {
      setGenerationError("Fix validation errors before generating the payroll batch.");
      return;
    }

    if (pendingTests) {
      setGenerationError("Mark all required test transactions as completed before generating the full payout batch.");
      return;
    }

    if (!passphrase || passphrase.length < 8) {
      setGenerationError("Set an encryption passphrase with at least 8 characters.");
      return;
    }

    const generatedBatch = generateBatch(payments, settings);
    if (generatedBatch.zecRecipients === 0 && generatedBatch.usdcRecipients === 0) {
      setGenerationError("No valid payouts to generate.");
      return;
    }

    const createdAt = new Date().toISOString();
    const encrypted = await encryptJson(
      {
        createdAt,
        settings,
        payments,
        batch: generatedBatch,
      },
      passphrase,
    );

    setIsSaving(true);
    try {
      const response = await fetch("/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encrypted,
          createdAt,
          nextPayoutDate: generatedBatch.nextPayoutDate,
          notificationDue: generatedBatch.notificationDue,
        }),
      });

      if (!response.ok) {
        setGenerationError("Failed to store encrypted batch on server.");
        return;
      }

      const payload = (await response.json()) as { record?: EncryptedBatchRecord };
      if (payload.record) {
        const enrichedRecord = applyPaidStatus([payload.record as EncryptedBatchRecord])[0];
        setSavedRecords((current) => [enrichedRecord, ...current]);
        setActiveRecordId(enrichedRecord.id);
        setPaidTxid("");
        setMarkPaidError("");
        setMarkPaidSuccess("");
      }

      setBatch(generatedBatch);
      setStep("result");
    } catch {
      setGenerationError("Failed to store encrypted batch on server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopyZipUri() {
    if (!batch?.zcashUri) {
      return;
    }

    try {
      await navigator.clipboard.writeText(batch.zcashUri);
      setCopyZipState("copied");
    } catch {
      setCopyZipState("failed");
    }
  }

  async function handleCopyNearIntent() {
    if (!batch?.nearIntentJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(batch.nearIntentJson);
      setCopyNearState("copied");
    } catch {
      setCopyNearState("failed");
    }
  }

  function selectedRecord(): EncryptedBatchRecord | null {
    if (!activeRecordId) {
      return savedRecords[0] ?? null;
    }
    return savedRecords.find((record) => record.id === activeRecordId) ?? savedRecords[0] ?? null;
  }

  function isLikelyTxid(value: string): boolean {
    return /^[a-fA-F0-9]{64}$/.test(value.trim());
  }

  function markRecordPaid() {
    setMarkPaidError("");
    setMarkPaidSuccess("");

    const target = selectedRecord();
    if (!target) {
      setMarkPaidError("No batch record available to mark as paid.");
      return;
    }

    if (!isLikelyTxid(paidTxid)) {
      setMarkPaidError("Enter a valid Zcash txid (64 hex characters).");
      return;
    }

    const normalizedTxid = paidTxid.trim().toLowerCase();
    const paidAt = new Date().toISOString();
    const currentMap = readPaidStatusMap();
    const nextMap: PaidStatusMap = {
      ...currentMap,
      [target.id]: {
        txid: normalizedTxid,
        paidAt,
      },
    };
    writePaidStatusMap(nextMap);

    setSavedRecords((current) =>
      current.map((record) =>
        record.id === target.id
          ? {
              ...record,
              payoutStatus: "paid",
              txid: normalizedTxid,
              paidAt,
            }
          : record,
      ),
    );
    setMarkPaidSuccess("Batch marked paid.");
  }

  return {
    step,
    setStep,
    payments,
    batch,
    fileName,
    parseError,
    generationError,
    copyZipState,
    copyNearState,
    settings,
    setSettings,
    passphrase,
    setPassphrase,
    savedRecords,
    isSaving,
    activeRecordId,
    setActiveRecordId,
    paidTxid,
    setPaidTxid,
    markPaidError,
    markPaidSuccess,
    selectedRecord: selectedRecord(),
    validationErrors,
    pendingTests,
    handleCsvUpload,
    handleLoadSampleCsv,
    setTestTxDone,
    handleGeneratePayroll,
    handleCopyZipUri,
    handleCopyNearIntent,
    markRecordPaid,
    resetCopyState: () => {
      setCopyZipState("idle");
      setCopyNearState("idle");
    },
  };
}
