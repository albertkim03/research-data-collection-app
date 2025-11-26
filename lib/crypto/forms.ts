// lib/crypto/forms.ts
const webcrypto = globalThis.crypto ?? require("node:crypto").webcrypto;

// Key must be 32 bytes (AES-256). Put it in env as base64.
const keyB64 = process.env.FORM_ENC_KEY_BASE64 || "";
let cachedKey: CryptoKey | null = null;

async function importKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  if (!keyB64) throw new Error("FORM_ENC_KEY_BASE64 missing");
  const raw = Buffer.from(keyB64, "base64");
  if (raw.length !== 32) throw new Error("FORM_ENC_KEY_BASE64 must be 32 bytes (base64)");
  cachedKey = await webcrypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return cachedKey;
}

export async function encryptResponses(obj: unknown) {
  const key = await importKey();
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const pt = new TextEncoder().encode(JSON.stringify(obj));
  const ctBuf = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, pt);
  const payload = {
    v: 1,
    iv: Buffer.from(iv).toString("base64"),
    ct: Buffer.from(new Uint8Array(ctBuf)).toString("base64"),
  };
  return JSON.stringify(payload);
}

export async function decryptResponses(enc: string): Promise<any | null> {
  if (!enc) return null;
  const key = await importKey();
  const payload = JSON.parse(enc) as { v: number; iv: string; ct: string };
  if (payload.v !== 1) throw new Error("Unknown ciphertext version");
  const iv = Buffer.from(payload.iv, "base64");
  const ct = Buffer.from(payload.ct, "base64");
  const ptBuf = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(ct)
  );
  const txt = new TextDecoder().decode(ptBuf);
  return JSON.parse(txt);
}
