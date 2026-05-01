import { execFile, spawn } from "node:child_process";
import { Command } from "commander";

import { CLIError } from "../lib/errors.js";
import { CLI_PACKAGE_NAME, CLI_VERSION } from "../lib/package.js";
import { code, dim, info, spinner, success, warn } from "../lib/ui.js";

function npmCommand(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function execNpm(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      npmCommand(),
      args,
      { encoding: "utf8", maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          const message = stderr.trim() || error.message;
          reject(new CLIError(message));
          return;
        }

        resolve(stdout.trim());
      },
    );
  });
}

function runNpm(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand(), args, {
      shell: false,
      stdio: ["ignore", "ignore", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(new CLIError(error.message));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const details = stderr.trim();
      reject(
        new CLIError(
          details
            ? `npm install failed: ${details}`
            : `npm install failed with exit code ${code}.`,
        ),
      );
    });
  });
}

function parseVersion(version: string): number[] | null {
  const core = version.trim().replace(/^v/, "").split("-")[0];
  const parts = core.split(".").map((part) => Number(part));

  if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return parts;
}

function compareVersions(left: string, right: string): number {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  if (!leftParts || !rightParts) {
    return left.localeCompare(right);
  }

  const maxLength = Math.max(leftParts.length, rightParts.length);
  for (let i = 0; i < maxLength; i += 1) {
    const leftPart = leftParts[i] ?? 0;
    const rightPart = rightParts[i] ?? 0;

    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

export const updateCommand = new Command("update")
  .description("Update the Skytells CLI to the latest npm version")
  .option("--check", "Only check for updates without installing")
  .action(async (opts: { check?: boolean }) => {
    const check = spinner("Checking npm for the latest Skytells CLI...");

    let latestVersion: string;
    try {
      latestVersion = await execNpm(["view", CLI_PACKAGE_NAME, "version", "--silent"]);
      if (!latestVersion) {
        throw new CLIError(`npm did not return a version for ${CLI_PACKAGE_NAME}.`);
      }

      check.succeed(`Latest npm version is ${code(latestVersion)}.`);
    } catch (err) {
      check.fail("Failed to check npm for updates.");
      throw err;
    }

    const comparison = compareVersions(CLI_VERSION, latestVersion);

    if (comparison === 0) {
      success(`Skytells CLI is already up to date (${code(CLI_VERSION)}).`);
      return;
    }

    if (comparison > 0) {
      warn(
        `Current version ${code(CLI_VERSION)} is newer than npm latest ${code(latestVersion)}.`,
      );
      return;
    }

    info(`Current version: ${code(CLI_VERSION)}`);

    if (opts.check) {
      info(`Update available: ${code(versionRange(CLI_VERSION, latestVersion))}`);
      console.log(dim(`Run ${code("skytells update")} to install it.`));
      return;
    }

    const install = spinner(`Installing ${CLI_PACKAGE_NAME}@latest globally...`);
    try {
      await runNpm(["install", "-g", `${CLI_PACKAGE_NAME}@latest`]);
      install.succeed(`Updated Skytells CLI to ${code(latestVersion)}.`);
      console.log(dim(`Run ${code("skytells --version")} to verify the installed version.`));
    } catch (err) {
      install.fail("Failed to update Skytells CLI.");
      throw err;
    }
  });

function versionRange(currentVersion: string, latestVersion: string): string {
  return `${currentVersion} -> ${latestVersion}`;
}
