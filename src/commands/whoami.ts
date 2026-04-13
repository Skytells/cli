import { Command } from "commander";
import { apiGet } from "../lib/api.js";
import { loadToken, loadAccessKey } from "../lib/config.js";
import { CLI_API_PREFIX } from "../lib/constants.js";
import type { Project } from "../types/index.js";
import {
  warn,
  info,
  dim,
  bold,
  jsonOutput,
} from "../lib/ui.js";

export const whoamiCommand = new Command("whoami")
  .description("Show the current authenticated user and linked project")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const token = loadToken();
    const accessKey = loadAccessKey();

    if (!token && !accessKey) {
      warn("Not authenticated. Run 'skytells login' or 'skytells link <key>' first.");
      process.exit(1);
      return;
    }

    const result: Record<string, unknown> = {};

    // Show token info (local only — no remote lookup)
    if (token) {
      const isEnv = !!process.env.SKYTELLS_TOKEN;
      const prefix = token.substring(0, 11);

      if (opts.json) {
        result.token = {
          prefix: prefix + "...",
          source: isEnv ? "environment" : "credentials_file",
        };
      } else {
        console.log();
        info(`Token: ${bold(prefix + "...")}`);
        info(`Source: ${isEnv ? "SKYTELLS_TOKEN env var" : "credentials file"}`);
      }
    }

    // Show access key info — verify via GET /api/v1/cli/project
    if (accessKey) {
      const isEnv = !!process.env.SKYTELLS_ACCESS_KEY;
      const prefix = accessKey.substring(0, 12);

      try {
        const project = await apiGet<Project>(`${CLI_API_PREFIX}/project`);

        if (opts.json) {
          result.access_key = {
            prefix: prefix + "...",
            source: isEnv ? "environment" : "credentials_file",
            project: { id: project.id, name: project.name, slug: project.slug },
          };
        } else {
          console.log();
          info(`Access Key: ${bold(prefix + "...")}`);
          info(`Source: ${isEnv ? "SKYTELLS_ACCESS_KEY env var" : "credentials file"}`);
          info(`Project: ${bold(project.name)} (${dim(project.slug)})`);
        }
      } catch {
        if (opts.json) {
          result.access_key = { prefix: prefix + "...", source: isEnv ? "environment" : "credentials_file" };
        } else {
          console.log();
          info(`Access Key: ${bold(prefix + "...")}`);
          info(`Source: ${isEnv ? "SKYTELLS_ACCESS_KEY env var" : "credentials file"}`);
          warn("Could not verify access key.");
        }
      }
    }

    if (opts.json) {
      jsonOutput(result);
    } else {
      console.log();
    }
  });
