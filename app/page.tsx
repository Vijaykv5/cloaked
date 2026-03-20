"use client";

import { LandingStep } from "@/components/payroll/LandingStep";
import { PreviewStep } from "@/components/payroll/PreviewStep";
import { ResultStep } from "@/components/payroll/ResultStep";
import { UploadStep } from "@/components/payroll/UploadStep";
import { usePayroll } from "@/hooks/usePayroll";

export default function Home() {
  const {
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
    selectedRecord,
    validationErrors,
    pendingTests,
    handleCsvUpload,
    handleLoadSampleCsv,
    setTestTxDone,
    handleGeneratePayroll,
    handleCopyZipUri,
    handleCopyNearIntent,
    markRecordPaid,
    resetCopyState,
  } = usePayroll();
  const shellClassName =
    step === "landing"
      ? "step-enter w-full max-w-3xl p-4 sm:p-6"
      : "step-enter glass-panel w-full max-w-3xl rounded-3xl p-4 sm:p-6";

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-white/45 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-[#d6e5d8]/60 blur-3xl"
      />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col items-center justify-center transition-all duration-200">
        <div className={shellClassName}>
          {/* <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-2)]">
            ZEC Payroll Runner
          </p> */}
          {step === "landing" && <LandingStep onStart={() => setStep("upload")} />}

          {step === "upload" && (
            <UploadStep
              fileName={fileName}
              parseError={parseError}
              canContinue={payments.length > 0}
              onUpload={handleCsvUpload}
              onLoadSample={() => {
                void handleLoadSampleCsv();
              }}
              onBack={() => setStep("landing")}
              onContinue={() => setStep("preview")}
            />
          )}

          {step === "preview" && (
            <PreviewStep
              payments={payments}
              settings={settings}
              passphrase={passphrase}
              errors={validationErrors}
              pendingTests={pendingTests}
              generationError={generationError}
              encryptedBatches={savedRecords.length}
              isSaving={isSaving}
              onBack={() => setStep("upload")}
              onGenerate={() => {
                void handleGeneratePayroll();
              }}
              onSetPassphrase={setPassphrase}
              onUpdateSettings={setSettings}
              onToggleTestTx={setTestTxDone}
            />
          )}

          {step === "result" && batch && (
            <ResultStep
              batch={batch}
              copyZipState={copyZipState}
              copyNearState={copyNearState}
              records={savedRecords}
              activeRecordId={activeRecordId}
              selectedRecord={selectedRecord}
              paidTxid={paidTxid}
              markPaidError={markPaidError}
              markPaidSuccess={markPaidSuccess}
              onBack={() => {
                resetCopyState();
                setStep("preview");
              }}
              onCopyZip={() => {
                void handleCopyZipUri();
              }}
              onCopyNear={() => {
                void handleCopyNearIntent();
              }}
              onSelectRecord={setActiveRecordId}
              onPaidTxidChange={setPaidTxid}
              onMarkPaid={markRecordPaid}
              onOpenZip={() => {
                if (batch.zcashUri) {
                  window.location.href = batch.zcashUri;
                }
              }}
              onOpenNear={() => {
                if (batch.usdcRecipients > 0) {
                  window.location.href = batch.nearIntentUri;
                }
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
