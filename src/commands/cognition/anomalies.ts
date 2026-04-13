import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, jsonOutput, renderTable, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const cognitionAnomaliesCommand = new Command("anomalies")
  .description("List anomalies")
  .requiredOption("--project <id>", "Project ID or slug")
  .option("--limit <n>", "Page size (max 100)", "50")
  .option("--offset <n>", "Pagination offset", "0")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching anomalies...");

    try {
      const res = await apiGet<Record<string, unknown>[]>(
        `${CLI_API_PREFIX}/cognition/anomalies`,
        { project_id: opts.project, limit: opts.limit, offset: opts.offset },
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(res);
        return;
      }

      const anomalies = Array.isArray(res) ? res : [];
      if (anomalies.length === 0) {
        warn("No anomalies found.");
        return;
      }

      renderTable(
        ["ID", "Type", "Severity", "Details", "Timestamp"],
        anomalies.map((a) => [
          String(a.id ?? "—"),
          String(a.type ?? chalk.dim("—")),
          String(a.severity ?? chalk.dim("—")),
          String(a.details ?? a.message ?? chalk.dim("—")),
          String(a.timestamp ?? a.created_at ?? chalk.dim("—")),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch anomalies.");
      throw err;
    }
  });
