import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import type { EncryptedBatchRecord, EncryptedPayload } from "@/types/payroll";

const STORE_PATH = path.join(process.cwd(), "data", "encrypted-batches.json");

type CreateBatchBody = {
  encrypted: EncryptedPayload;
  createdAt: string;
  nextPayoutDate: string;
  notificationDue: boolean;
};

async function readStore(): Promise<EncryptedBatchRecord[]> {
  try {
    const content = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(content) as EncryptedBatchRecord[];
  } catch {
    return [];
  }
}

async function writeStore(records: EncryptedBatchRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(records, null, 2), "utf8");
}

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.ciphertext === "string" &&
    typeof candidate.iv === "string" &&
    typeof candidate.salt === "string" &&
    candidate.algorithm === "AES-GCM" &&
    candidate.kdf === "PBKDF2"
  );
}

export async function GET() {
  const records = await readStore();
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateBatchBody>;

  if (!body || !isEncryptedPayload(body.encrypted)) {
    return NextResponse.json({ error: "Invalid encrypted payload." }, { status: 400 });
  }

  if (typeof body.createdAt !== "string" || typeof body.nextPayoutDate !== "string") {
    return NextResponse.json({ error: "Invalid batch metadata." }, { status: 400 });
  }

  const record: EncryptedBatchRecord = {
    id: randomUUID(),
    encrypted: body.encrypted,
    createdAt: body.createdAt,
    nextPayoutDate: body.nextPayoutDate,
    notificationDue: Boolean(body.notificationDue),
  };

  const records = await readStore();
  records.unshift(record);
  await writeStore(records);

  return NextResponse.json({ ok: true, record });
}
