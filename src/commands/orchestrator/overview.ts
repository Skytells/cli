import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { OrchestratorOverview } from "../../types/index.js";
import { spinner, jsonOutput, info, bold, warn } from "../../lib/ui.js";

export const orchestratorOverviewCommand = new Command("overview")
  .description("Show orchestrator overview and stats")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching overview...");

    try {
      const res = await apiGet<OrchestratorOverview | null>(
        `${CLI_API_PREFIX}/orchestrator/overview`,
        undefined,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(res);
        return;
      }

      if (!res) {
        warn("Orchestrator not registered. No resources found.");
        return;
      }

      const st = res.stats;
      console.log();
      info(`${bold("Workflows:")}     ${st.workflowCount}`);
      info(`${bold("Executions (30d):")} ${st.executionCount30d}`);
      info(`${bold("API Keys:")}      ${st.apiKeyCount}`);
      info(`${bold("Integrations:")}  ${st.integrationCount}`);
      info(`${bold("Registered:")}    ${st.isRegistered ? "yes" : "no"}`);
      console.log();
    } catch (err) {
      s.fail("Failed to fetch overview.");
      throw err;
    }
  });
