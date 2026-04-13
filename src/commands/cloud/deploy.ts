import { Command } from "commander";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Instance } from "../../types/index.js";
import { spinner, bold, jsonOutput, formatDate } from "../../lib/ui.js";

export const cloudDeployCommand = new Command("deploy")
  .description("Deploy a new cloud instance")
  .requiredOption("--region <region>", "Region code")
  .requiredOption("--plan <plan>", "Plan identifier")
  .option("--os <id>", "OS template ID", parseInt)
  .option("--label <label>", "Instance label")
  .option("--hostname <hostname>", "Hostname")
  .option("--tags <tags>", "Comma-separated tags")
  .option("--firewall-group <id>", "Firewall group ID")
  .option("--vpc <ids>", "Comma-separated VPC IDs")
  .option("--ipv6", "Enable IPv6")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const body: Record<string, unknown> = {
      region: opts.region,
      plan: opts.plan,
    };
    if (opts.os != null) body.os_id = opts.os;
    if (opts.label) body.label = opts.label;
    if (opts.hostname) body.hostname = opts.hostname;
    if (opts.tags) body.tags = opts.tags.split(",").map((t: string) => t.trim());
    if (opts.firewallGroup) body.firewall_group_id = opts.firewallGroup;
    if (opts.vpc) body.vpc_ids = opts.vpc.split(",").map((v: string) => v.trim());
    if (opts.ipv6) body.enable_ipv6 = true;

    const s = spinner("Deploying cloud instance...");

    try {
      const instance = await apiPost<Instance>(
        `${CLI_API_PREFIX}/cloud/instances`,
        body,
      );
      s.succeed("Cloud instance deployed!");

      if (opts.json) {
        jsonOutput(instance);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}     ${instance.id}`);
      console.log(`  ${bold("Region:")} ${instance.region}`);
      console.log(`  ${bold("Plan:")}   ${instance.plan}`);
      console.log(`  ${bold("Status:")} ${instance.status}`);
      if (instance.label) {
        console.log(`  ${bold("Label:")}  ${instance.label}`);
      }
      if (instance.main_ip) {
        console.log(`  ${bold("IP:")}     ${instance.main_ip}`);
      }
      console.log(`  ${bold("Created:")} ${formatDate(instance.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to deploy cloud instance.");
      throw err;
    }
  });
