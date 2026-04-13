import { Command } from "commander";
import { input, confirm, checkbox } from "@inquirer/prompts";
import {
  initiateDeviceFlow,
  showDeviceFlowInstructions,
  pollForToken,
  validateTokenFormat,
  validateTokenRemote,
} from "../../lib/auth.js";
import { saveToken, hasToken, getCredentialsFilePath } from "../../lib/config.js";
import { AVAILABLE_SCOPES, DEFAULT_LOGIN_SCOPES } from "../../lib/constants.js";
import type { Scope } from "../../lib/constants.js";
import { spinner, success, error, warn, info, dim, link } from "../../lib/ui.js";

export const loginCommand = new Command("login")
  .description("Authenticate with Skytells")
  .option("--token", "Authenticate by pasting a personal access token")
  .option(
    "--scopes <scopes>",
    "Comma-separated scopes for device flow login",
  )
  .action(async (opts) => {
    if (hasToken()) {
      const overwrite = await confirm({
        message: "You are already logged in. Do you want to re-authenticate?",
        default: false,
      });
      if (!overwrite) return;
    }

    if (opts.token) {
      await loginWithToken();
    } else {
      const scopes = opts.scopes
        ? (opts.scopes.split(",").map((s: string) => s.trim()) as Scope[])
        : DEFAULT_LOGIN_SCOPES;
      await loginWithDeviceFlow(scopes);
    }
  });

async function loginWithDeviceFlow(scopes: Scope[]): Promise<void> {
  const s = spinner("Initiating device authorization...");

  let flow: Awaited<ReturnType<typeof initiateDeviceFlow>>;
  try {
    flow = await initiateDeviceFlow(scopes);
    s.stop();
  } catch (err: unknown) {
    s.fail("Failed to initiate device flow.");
    error((err as Error).message);
    process.exit(1);
  }

  await showDeviceFlowInstructions(flow);

  const token = await pollForToken(
    flow.device_code,
    flow.interval,
    flow.expires_in,
  );

  if (!token) {
    process.exit(1);
  }

  saveToken(token!);
  console.log();
  success("Authenticated successfully!");
  info(`Credentials saved to ${dim(getCredentialsFilePath())}`);
}

async function loginWithToken(): Promise<void> {
  console.log();
  info(`Create a token at ${link("https://console.skytells.ai/settings/tokens")}`);
  console.log();

  const token = await input({
    message: "Paste your personal access token:",
  });

  const trimmed = token.trim();

  if (!validateTokenFormat(trimmed)) {
    error(
      "Invalid token format. Tokens start with 'sk_pat_' and are 71 characters long.",
    );
    process.exit(1);
  }

  const s = spinner("Validating token...");
  const valid = await validateTokenRemote(trimmed);

  if (!valid) {
    s.fail("Token is invalid or expired.");
    process.exit(1);
  }

  s.succeed("Token is valid!");

  saveToken(trimmed);
  console.log();
  success("Authenticated successfully!");
  info(`Credentials saved to ${dim(getCredentialsFilePath())}`);
}
