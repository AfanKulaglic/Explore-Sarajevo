import { randomUUID } from "crypto";
import { Buffer } from "node:buffer";
import { supabaseAdmin } from "./supabaseDb";
import { SSO_CODE_TTL_SECONDS } from "./ssoConfig";

interface CreateSsoCodeInput {
  accountId: string;
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt?: number | null;
  redirectUri: string;
  state?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface SsoCodeRecord {
  code: string;
  account_id: string;
  access_token: string;
  refresh_token: string;
  session_expires_at: string | null;
  expires_at: string;
  redirect_uri: string | null;
  state: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
}

// In-memory fallback store for SSO codes
const memoryStore = new Map<string, SsoCodeRecord & { user_agent: string | null; ip_address: string | null }>();
let useMemoryStore = false;

const BUCKET = process.env.SSO_STORAGE_BUCKET || "sso-codes";
const BUCKET_PREFIX = "codes";
let bucketReady = false;

async function ensureBucket() {
  if (bucketReady || useMemoryStore) return;

  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      console.warn(`[SSO] Failed to list buckets: ${error.message}, using memory store`);
      useMemoryStore = true;
      return;
    }

    const exists = buckets?.some((bucket) => bucket.name === BUCKET);
    if (!exists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: false,
      });

      if (createError && !createError.message?.includes("already exists")) {
        console.warn(`[SSO] Failed to create bucket: ${createError.message}, using memory store`);
        useMemoryStore = true;
        return;
      }
    }

    bucketReady = true;
  } catch (e) {
    console.warn(`[SSO] ensureBucket error, using memory store:`, e);
    useMemoryStore = true;
  }
}

function buildObjectKey(code: string) {
  return `${BUCKET_PREFIX}/${code}.json`;
}

export async function createSsoCode(input: CreateSsoCodeInput) {
  await ensureBucket();

  const code = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + SSO_CODE_TTL_SECONDS * 1000).toISOString();
  const sessionExpiresAt = input.sessionExpiresAt
    ? new Date(input.sessionExpiresAt * 1000).toISOString()
    : null;

  const payload: SsoCodeRecord & { user_agent: string | null; ip_address: string | null } = {
    code,
    account_id: input.accountId,
    access_token: input.accessToken,
    refresh_token: input.refreshToken,
    session_expires_at: sessionExpiresAt,
    redirect_uri: input.redirectUri,
    state: input.state ?? null,
    expires_at: expiresAt,
    user_agent: input.userAgent ?? null,
    ip_address: input.ipAddress ?? null,
  };

  // Use memory store if storage is not available
  if (useMemoryStore) {
    memoryStore.set(code, payload);
    // Auto-expire from memory after TTL
    setTimeout(() => memoryStore.delete(code), SSO_CODE_TTL_SECONDS * 1000);
    return { code, expiresAt };
  }

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(buildObjectKey(code), JSON.stringify(payload), {
      contentType: "application/json",
      upsert: false,
    });

  if (error) {
    // Fallback to memory store on upload failure
    console.warn(`[SSO] Storage upload failed: ${error.message}, using memory store`);
    useMemoryStore = true;
    memoryStore.set(code, payload);
    setTimeout(() => memoryStore.delete(code), SSO_CODE_TTL_SECONDS * 1000);
    return { code, expiresAt };
  }

  return { code, expiresAt };
}

export async function consumeSsoCode(code: string): Promise<SsoCodeRecord | null> {
  await ensureBucket();

  // Check memory store first
  if (useMemoryStore || memoryStore.has(code)) {
    const record = memoryStore.get(code);
    if (!record) return null;
    
    memoryStore.delete(code); // One-time use
    
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return null;
    }
    
    return record;
  }

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(buildObjectKey(code));
  if (error || !data) {
    // Maybe it's in memory store from a previous fallback
    const memRecord = memoryStore.get(code);
    if (memRecord) {
      memoryStore.delete(code);
      if (new Date(memRecord.expires_at).getTime() < Date.now()) {
        return null;
      }
      return memRecord;
    }
    return null;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const record = JSON.parse(buffer.toString("utf-8")) as SsoCodeRecord & {
    user_agent?: string | null;
    ip_address?: string | null;
  };

  if (new Date(record.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.storage.from(BUCKET).remove([buildObjectKey(code)]);
    return null;
  }

  await supabaseAdmin.storage.from(BUCKET).remove([buildObjectKey(code)]);
  return record;
}
