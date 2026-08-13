import { password } from "@inquirer/prompts";
import { AI_API_BASE_URL } from "./constants.js";
import { loadApiKey, saveApiKey, getCredentialsFilePath } from "./config.js";
import { ApiKeyRequiredError, CLIError } from "./errors.js";
import { spinner, info, link, dim } from "./ui.js";

interface ApiErrorBody {
  response?: string;
  message?: string;
  error_id?: string;
  error?: {
    message?: string;
    details?: unknown;
    error_id?: string;
  };
}

function formatApiError(status: number, body: ApiErrorBody): string {
  const apiError = body.error;
  const message = apiError?.message ?? body.message ?? body.response ?? `Request failed (${status}).`;
  const errorId = apiError?.error_id ?? body.error_id;
  const details = apiError?.details;
  const detailText = details
    ? typeof details === "string" ? details : JSON.stringify(details)
    : "";
  return [message, detailText, errorId ? `[${errorId}]` : ""].filter(Boolean).join(" ");
}

async function requestWithKey<T>(
  apiKey: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${AI_API_BASE_URL}${path}`, {
    method,
    headers: {
      "x-api-key": apiKey,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let errorBody: ApiErrorBody = {};
    try {
      errorBody = await response.json() as ApiErrorBody;
    } catch {
      errorBody = { message: response.statusText };
    }
    throw new CLIError(formatApiError(response.status, errorBody));
  }

  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

export async function validateApiKey(apiKey: string): Promise<void> {
  await requestWithKey<unknown>(apiKey, "GET", "/models");
}

export async function promptAndSaveApiKey(): Promise<string> {
  console.log();
  info(`Create an API key at ${link("https://console.skytells.ai/settings/api-keys")}`);
  console.log();

  const apiKey = (await password({
    message: "Paste your Skytells API key:",
    mask: "*",
  })).trim();
  if (!apiKey) throw new ApiKeyRequiredError();

  const progress = spinner("Validating API key...");
  try {
    await validateApiKey(apiKey);
    progress.succeed("API key is valid!");
  } catch (error) {
    progress.fail("API key validation failed.");
    throw error;
  }

  saveApiKey(apiKey);
  info(`API key saved to ${dim(getCredentialsFilePath())}`);
  return apiKey;
}

export async function requireApiKey(): Promise<string> {
  return loadApiKey() ?? promptAndSaveApiKey();
}

export async function aiApiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  return requestWithKey<T>(await requireApiKey(), method, path, body);
}