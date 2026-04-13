import { API_BASE_URL, CLI_API_PREFIX } from "./constants.js";
import { loadToken, loadAccessKey } from "./config.js";
import { AuthRequiredError, AccessKeyRequiredError, handleApiError } from "./errors.js";

type AuthMode = "user" | "project" | "none";

interface RequestOptions {
  headers?: Record<string, string>;
  auth?: AuthMode;
}

function resolveAuth(mode: AuthMode): string | null {
  switch (mode) {
    case "user": {
      const token = loadToken();
      if (!token) throw new AuthRequiredError();
      return token;
    }
    case "project": {
      const key = loadAccessKey();
      if (!key) throw new AccessKeyRequiredError();
      return key;
    }
    case "none":
      return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const authMode = opts.auth ?? "project";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...opts.headers,
  };

  const bearer = resolveAuth(authMode);
  if (bearer) {
    headers["Authorization"] = `Bearer ${bearer}`;
  }

  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: Record<string, unknown>;
    try {
      errorBody = (await res.json()) as Record<string, unknown>;
    } catch {
      errorBody = { error: res.statusText };
    }
    handleApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  // Unwrap { data: ... } envelope if present
  if (json && typeof json === "object" && "data" in json) {
    const result = json as { data: T; total?: number };
    // For paginated responses, return the full envelope
    if ("total" in result) {
      return json as T;
    }
    return result.data;
  }

  return json as T;
}

function buildQueryString(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    (e): e is [string, string | number] => e[1] != null,
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  opts?: RequestOptions,
): Promise<T> {
  return request<T>("GET", `${path}${buildQueryString(params)}`, undefined, opts);
}

export function apiPost<T>(
  path: string,
  body: unknown,
  opts?: RequestOptions,
): Promise<T> {
  return request<T>("POST", path, body, opts);
}

export function apiPut<T>(
  path: string,
  body: unknown,
  opts?: RequestOptions,
): Promise<T> {
  return request<T>("PUT", path, body, opts);
}

export function apiPatch<T>(
  path: string,
  body: unknown,
  opts?: RequestOptions,
): Promise<T> {
  return request<T>("PATCH", path, body, opts);
}

export function apiDelete<T>(
  path: string,
  opts?: RequestOptions,
): Promise<T> {
  return request<T>("DELETE", path, undefined, opts);
}

// ── SSE streaming for logs ───────────────────────────────────

export interface SSEEvent {
  event: string;
  data: string;
}

export async function* apiSSE(
  path: string,
  params?: Record<string, string | number | undefined>,
): AsyncGenerator<SSEEvent> {
  const authMode: AuthMode = "project";
  const bearer = resolveAuth(authMode);
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
  };
  if (bearer) {
    headers["Authorization"] = `Bearer ${bearer}`;
  }

  const url = `${API_BASE_URL}${path}${buildQueryString(params)}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    let errorBody: Record<string, unknown>;
    try {
      errorBody = (await res.json()) as Record<string, unknown>;
    } catch {
      errorBody = { error: res.statusText };
    }
    handleApiError(res.status, errorBody);
  }

  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";
  let currentData = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          currentData = line.slice(6);
        } else if (line === "") {
          if (currentData) {
            yield { event: currentEvent, data: currentData };
            currentEvent = "message";
            currentData = "";
          }
        }
      }
    }

    // Flush remaining
    if (currentData) {
      yield { event: currentEvent, data: currentData };
    }
  } finally {
    reader.releaseLock();
  }
}
