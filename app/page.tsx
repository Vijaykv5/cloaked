"use client";

import { LandingStep } from "@/components/payroll/LandingStep";
import { UploadStep } from "@/components/payroll/UploadStep";
import { PreviewStep } from "@/components/payroll/PreviewStep";
import { ResultStep } from "@/components/payroll/ResultStep";
import { usePayroll } from "@/hooks/usePayroll";

export default function Home() {
  const {
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
  } = usePayroll();

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col items-center justify-center transition-all duration-200">
        {step === "landing" && <LandingStep onStart={() => setStep("upload")} />}

        {step === "upload" && (
          <UploadStep
            fileName={fileName}
            parseError={parseError}
            canContinue={payments.length > 0}
            onUpload={handleCsvUpload}
            onBack={() => setStep("landing")}
            onContinue={() => setStep("preview")}
          />
        )}

        {step === "preview" && (
          <PreviewStep
            payments={payments}
            totalZec={totalZec}
            errors={validationErrors}
            onBack={() => setStep("upload")}
            onGenerate={handleGeneratePayroll}
          />
        )}

        {step === "result" && (
          <ResultStep
            uri={uri}
            totalZec={totalZec}
            recipients={payments.length}
            copyState={copyState}
            onBack={() => {
              setCopyState("idle");
              setStep("preview");
            }}
            onCopy={handleCopyUri}
            onOpen={() => {
              window.location.href = uri;
            }}
          />
        )}
      </div>
    </main>
  );
}
