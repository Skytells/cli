import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { CognitionEvent } from "../../types/index.js";
import { spinner, jsonOutput, renderTable, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const cognitionEventsCommand = new Command("events")
  .description("List events (supports polling with --since)")
  .requiredOption("--project <id>", "Project ID or slug")
  .option("--limit <n>", "Page size (max 100)", "50")
  .option("--since <id>", "Return events after this ID (for polling)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching events...");

    try {
      const params: Record<string, string> = {
        project_id: opts.project,
        limit: opts.limit,
      };
      if (opts.since) params.since_id = opts.since;

      const res = await apiGet<CognitionEvent[]>(
        `${CLI_API_PREFIX}/cognition/events`,
        params,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(res);
        return;
      }

      const events = Array.isArray(res) ? res : [];
      if (events.length === 0) {
        warn("No events found.");
        return;
      }

      renderTable(
        ["ID", "Type", "Details", "Timestamp"],
        events.map((e) => [
          String(e.id ?? "—"),
          String(e.type ?? e.event_type ?? chalk.dim("—")),
          String(e.message ?? e.details ?? chalk.dim("—")),
          String(e.timestamp ?? e.created_at ?? chalk.dim("—")),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch events.");
      throw err;
    }
  });
