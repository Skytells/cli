export const API_BASE_URL =
  process.env.SKYTELLS_API_URL || "https://console.skytells.ai";

export const CLI_API_PREFIX = "/api/v1/cli";

export const TOKEN_PREFIX = "sk_pat_";
export const TOKEN_LENGTH = 71;
export const TOKEN_DISPLAY_PREFIX_LENGTH = 11;

export const ACCESS_KEY_PREFIX = "sk_proj_";

export const GRANT_TYPE =
  "urn:ietf:params:oauth:grant-type:device_code" as const;

export const CONFIG_DIR =
  process.env.SKYTELLS_CONFIG_DIR ||
  `${process.env.HOME}/.config/skytells`;

export const CREDENTIALS_FILE = "credentials.json";

export const CONSOLE_URL = "https://console.skytells.ai";

export const AVAILABLE_SCOPES = [
  "inference",
  "projects.read",
  "projects.write",
  "deployments.read",
  "deployments.write",
  "keys.read",
  "keys.write",
  "account.read",
] as const;

export type Scope = (typeof AVAILABLE_SCOPES)[number];

export const DEFAULT_LOGIN_SCOPES: Scope[] = [
  "inference",
  "projects.read",
  "deployments.read",
  "account.read",
];

export const POLL_INTERVAL_MS = 5000;
export const DEVICE_CODE_LIFETIME_S = 900;
