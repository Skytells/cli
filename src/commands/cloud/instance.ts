import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Instance } from "../../types/index.js";
import { spinner, bold, dim, jsonOutput, formatDate, formatAppStatus } from "../../lib/ui.js";

export const cloudInstanceCommand = new Command("inspect")
  .description("View cloud instance details")
  .argument("<id>", "Instance ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    const s = spinner("Fetching instance...");

    try {
      const instance = await apiGet<Instance>(
        `${CLI_API_PREFIX}/cloud/instances/${encodeURIComponent(id)}`,
      );
      s.stop();

      if (opts.json) {
        jsonOutput(instance);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}       ${instance.id}`);
      console.log(`  ${bold("Label:")}    ${instance.label || dim("none")}`);
      console.log(`  ${bold("Region:")}   ${instance.region}`);
      console.log(`  ${bold("Plan:")}     ${instance.plan}`);
      console.log(`  ${bold("Status:")}   ${formatAppStatus(instance.status)}`);
      console.log(`  ${bold("IP:")}       ${instance.main_ip || dim("pending")}`);
      if (instance.hostname) {
        console.log(`  ${bold("Hostname:")} ${instance.hostname}`);
      }
      if (instance.os) {
        console.log(`  ${bold("OS:")}       ${instance.os}`);
      }
      if (instance.vcpu_count != null) {
        console.log(`  ${bold("vCPU:")}     ${instance.vcpu_count}`);
      }
      if (instance.ram != null) {
        console.log(`  ${bold("RAM:")}      ${instance.ram} MB`);
      }
      if (instance.disk != null) {
        console.log(`  ${bold("Disk:")}     ${instance.disk} GB`);
      }
      if (instance.tags && instance.tags.length > 0) {
        console.log(`  ${bold("Tags:")}     ${instance.tags.join(", ")}`);
      }
      console.log(`  ${bold("Created:")}  ${formatDate(instance.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to fetch instance.");
      throw err;
    }
  });
