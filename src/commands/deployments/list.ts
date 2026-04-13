import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Deployment, PaginatedResponse } from "../../types/index.js";
import {
  spinner,
  renderTable,
  jsonOutput,
  formatDate,
  formatDeploymentStatus,
  warn,
  dim,
} from "../../lib/ui.js";
import chalk from "chalk";

export const deploymentsListCommand = new Command("ls")
  .description("List deployment history")
  .option("--app <id>", "Filter by app ID or slug")
  .option("--limit <n>", "Max results (default 20, max 100)", parseInt)
  .option("--offset <n>", "Pagination offset", parseInt)
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching deployments...");

    try {
      const params: Record<string, string | number | undefined> = {};
      if (opts.app) params.app_slug = opts.app;
      if (opts.limit) params.limit = opts.limit;
      if (opts.offset) params.offset = opts.offset;

      const result = await apiGet<PaginatedResponse<Deployment>>(
        `${CLI_API_PREFIX}/deployments`,
        params,
      );
      s.stop();

      const deployments = result.data;
      const total = result.total;

      if (opts.json) {
        jsonOutput(result);
        return;
      }

      if (deployments.length === 0) {
        warn("No deployments found.");
        return;
      }

      renderTable(
        ["ID", "Status", "Trigger", "Branch", "Commit", "Created"],
        deployments.map((d) => [
          d.id.substring(0, 8),
          formatDeploymentStatus(d.status),
          d.trigger || chalk.dim("—"),
          d.branch || chalk.dim("—"),
          d.commit_sha ? d.commit_sha.substring(0, 7) : chalk.dim("—"),
          formatDate(d.created_at),
        ]),
      );

      if (total > deployments.length) {
        console.log(dim(`  Showing ${deployments.length} of ${total} deployments`));
      }
    } catch (err) {
      s.fail("Failed to fetch deployments.");
      throw err;
    }
  });
