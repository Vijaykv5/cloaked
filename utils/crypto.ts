import type { EncryptedPayload } from "@/types/payroll";

const PBKDF2_ITERATIONS = 250000;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJson(data: unknown, passphrase: string): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const serialized = JSON.stringify(data);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    key,
    enc.encode(serialized),
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    algorithm: "AES-GCM",
    kdf: "PBKDF2",
  };
}

export async function decryptJson<T>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);
  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(ciphertext),
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decryptedBuffer)) as T;
}
