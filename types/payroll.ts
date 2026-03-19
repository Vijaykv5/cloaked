export type Step = "landing" | "upload" | "preview" | "result";

export type Payment = {
  name: string;
  wallet: string;
  amount: number;
  currency: string;
};

export type RawPayment = {
  name?: string;
  wallet?: string;
  amount?: string;
  currency?: string;
};

export type CopyState = "idle" | "copied" | "failed";
