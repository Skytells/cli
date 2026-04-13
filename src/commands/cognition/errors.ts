import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, jsonOutput, renderTable, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const cognitionErrorsCommand = new Command("errors")
  .description("List cognition errors")
  .requiredOption("--project <id>", "Project ID or slug")
  .option("--limit <n>", "Page size (max 100)", "50")
  .option("--offset <n>", "Pagination offset", "0")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching errors...");

    try {
      const res = await apiGet<Record<string, unknown>[]>(
        `${CLI_API_PREFIX}/cognition/errors`,
        { project_id: opts.project, limit: opts.limit, offset: opts.offset },
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(res);
        return;
      }

      const errors = Array.isArray(res) ? res : [];
      if (errors.length === 0) {
        warn("No errors found.");
        return;
      }

      renderTable(
        ["ID", "Message", "Level", "Timestamp"],
        errors.map((e) => [
          String(e.id ?? "—"),
          String(e.message ?? e.error ?? "—"),
          String(e.level ?? e.severity ?? chalk.dim("—")),
          String(e.timestamp ?? e.created_at ?? chalk.dim("—")),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch errors.");
      throw err;
    }
  });
