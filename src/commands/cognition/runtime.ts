import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, jsonOutput, renderTable, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const cognitionRuntimeCommand = new Command("runtime")
  .description("List runtime snapshots")
  .requiredOption("--project <id>", "Project ID or slug")
  .option("--limit <n>", "Page size (max 100)", "100")
  .option("--offset <n>", "Pagination offset", "0")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching runtime snapshots...");

    try {
      const res = await apiGet<Record<string, unknown>[]>(
        `${CLI_API_PREFIX}/cognition/runtime`,
        { project_id: opts.project, limit: opts.limit, offset: opts.offset },
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(res);
        return;
      }

      const snapshots = Array.isArray(res) ? res : [];
      if (snapshots.length === 0) {
        warn("No runtime snapshots found.");
        return;
      }

      renderTable(
        ["ID", "Status", "CPU", "Memory", "Timestamp"],
        snapshots.map((s) => [
          String(s.id ?? "—"),
          String(s.status ?? chalk.dim("—")),
          String(s.cpu ?? chalk.dim("—")),
          String(s.memory ?? chalk.dim("—")),
          String(s.timestamp ?? s.created_at ?? chalk.dim("—")),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch runtime snapshots.");
      throw err;
    }
  });
