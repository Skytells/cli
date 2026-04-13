import open from "open";
import { apiPost, apiGet } from "./api.js";
import { saveToken, loadToken } from "./config.js";
import {
  API_BASE_URL,
  GRANT_TYPE,
  TOKEN_PREFIX,
  TOKEN_LENGTH,
  DEFAULT_LOGIN_SCOPES,
} from "./constants.js";
import type { Scope } from "./constants.js";
import type {
  DeviceFlowResponse,
  TokenPollSuccess,
} from "../types/index.js";
import { spinner, success, info, link, code, bold, error as errorMsg } from "./ui.js";

export async function initiateDeviceFlow(
  scopes: Scope[] = DEFAULT_LOGIN_SCOPES,
  clientVersion: string = "0.1.0",
): Promise<DeviceFlowResponse> {
  return apiPost<DeviceFlowResponse>(
    "/api/oauth/device",
    {
      client_name: `Skytells CLI v${clientVersion}`,
      scopes,
    },
    { auth: "none" },
  );
}

export async function showDeviceFlowInstructions(
  flow: DeviceFlowResponse,
): Promise<void> {
  console.log();
  console.log(`  To authenticate, visit:`);
  console.log(`    ${link(flow.verification_uri)}`);
  console.log();
  console.log(`  And enter code: ${bold(code(flow.user_code))}`);
  console.log();

  try {
    await open(flow.verification_uri_complete);
    info("Your browser has been opened automatically.");
  } catch {
    console.log(`  Or open: ${link(flow.verification_uri_complete)}`);
  }

  console.log();
  console.log(
    `  This code expires in ${Math.floor(flow.expires_in / 60)} minutes.`,
  );
  console.log();
}

export async function pollForToken(
  deviceCode: string,
  interval: number,
  expiresIn: number,
): Promise<string | null> {
  const s = spinner("Waiting for authorization...");
  const deadline = Date.now() + expiresIn * 1000;

  while (Date.now() < deadline) {
    await sleep(interval * 1000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_code: deviceCode,
          grant_type: GRANT_TYPE,
        }),
      });

      if (res.status === 200) {
        const data = (await res.json()) as TokenPollSuccess;
        s.succeed("Authorization received!");
        return data.access_token;
      }

      if (res.status === 428) {
        // Still pending — keep polling
        continue;
      }

      if (res.status === 403) {
        s.fail("Authorization denied by user.");
        return null;
      }

      if (res.status === 410) {
        s.fail("Code expired. Please try again.");
        return null;
      }

      // Unexpected response
      s.fail(`Unexpected response (${res.status}).`);
      return null;
    } catch (err) {
      // Network error — keep retrying until deadline
      continue;
    }
  }

  s.fail("Timed out waiting for authorization.");
  return null;
}

export function validateTokenFormat(token: string): boolean {
  return token.startsWith(TOKEN_PREFIX) && token.length === TOKEN_LENGTH;
}

export async function validateTokenRemote(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/cli/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
