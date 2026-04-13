import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, jsonOutput, renderTable, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const cognitionSecurityCommand = new Command("security")
  .description("List security events")
  .requiredOption("--project <id>", "Project ID or slug")
  .option("--limit <n>", "Page size (max 100)", "50")
  .option("--offset <n>", "Pagination offset", "0")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching security events...");

    try {
      const res = await apiGet<Record<string, unknown>[]>(
        `${CLI_API_PREFIX}/cognition/security`,
        { project_id: opts.project, limit: opts.limit, offset: opts.offset },
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(res);
        return;
      }

      const events = Array.isArray(res) ? res : [];
      if (events.length === 0) {
        warn("No security events found.");
        return;
      }

      renderTable(
        ["ID", "Type", "Severity", "Timestamp"],
        events.map((e) => [
          String(e.id ?? "—"),
          String(e.type ?? e.event_type ?? "—"),
          String(e.severity ?? chalk.dim("—")),
          String(e.timestamp ?? e.created_at ?? chalk.dim("—")),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch security events.");
      throw err;
    }
  });
