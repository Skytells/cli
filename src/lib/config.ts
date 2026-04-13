import fs from "node:fs";
import path from "node:path";
import { CONFIG_DIR, CREDENTIALS_FILE } from "./constants.js";
import type { Credentials } from "../types/index.js";

function getCredentialsPath(): string {
  return path.join(CONFIG_DIR, CREDENTIALS_FILE);
}

export function loadToken(): string | null {
  // 1. Environment variable takes priority
  const envToken = process.env.SKYTELLS_TOKEN;
  if (envToken) return envToken;

  // 2. Credentials file
  const filePath = getCredentialsPath();
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const creds: Credentials = JSON.parse(raw);
    return creds.token || null;
  } catch {
    return null;
  }
}

export function loadAccessKey(): string | null {
  // 1. Environment variable takes priority
  const envKey = process.env.SKYTELLS_ACCESS_KEY;
  if (envKey) return envKey;

  // 2. Credentials file
  const filePath = getCredentialsPath();
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const creds: Credentials = JSON.parse(raw);
    return creds.access_key || null;
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });

  const filePath = getCredentialsPath();
  let creds: Credentials = { created_at: Date.now() };

  // Preserve existing fields
  if (fs.existsSync(filePath)) {
    try {
      creds = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      // ignore
    }
  }

  creds.token = token;
  creds.created_at = Date.now();

  const fd = fs.openSync(filePath, "w", 0o600);
  fs.writeSync(fd, JSON.stringify(creds, null, 2));
  fs.closeSync(fd);
}

export function saveAccessKey(key: string): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });

  const filePath = getCredentialsPath();
  let creds: Credentials = { created_at: Date.now() };

  // Preserve existing fields
  if (fs.existsSync(filePath)) {
    try {
      creds = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      // ignore
    }
  }

  creds.access_key = key;

  const fd = fs.openSync(filePath, "w", 0o600);
  fs.writeSync(fd, JSON.stringify(creds, null, 2));
  fs.closeSync(fd);
}

export function deleteToken(): boolean {
  const filePath = getCredentialsPath();
  if (!fs.existsSync(filePath)) return false;

  // If there's an access key, just remove the token field
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const creds: Credentials = JSON.parse(raw);
    if (creds.access_key) {
      delete creds.token;
      const fd = fs.openSync(filePath, "w", 0o600);
      fs.writeSync(fd, JSON.stringify(creds, null, 2));
      fs.closeSync(fd);
      return true;
    }
  } catch {
    // fall through to delete
  }

  fs.unlinkSync(filePath);
  return true;
}

export function hasToken(): boolean {
  return loadToken() !== null;
}

export function hasAccessKey(): boolean {
  return loadAccessKey() !== null;
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function getCredentialsFilePath(): string {
  return getCredentialsPath();
}
