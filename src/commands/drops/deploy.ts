import path from "node:path";
import { stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Command } from "commander";
import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { apiPostFormData } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { CLIError } from "../../lib/errors.js";
import { spinner, bold, jsonOutput, link } from "../../lib/ui.js";
import type { DropDeployment } from "../../types/index.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DROP_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;

export const dropDeployCommand = new Command("deploy")
  .description("Deploy a ZIP archive as a Drop")
  .argument("<zip>", "Path to the ZIP archive")
  .requiredOption("--project <uuid>", "Project UUID")
  .requiredOption("--slug <slug>", "Globally unique Drop slug")
  .option("--build-path <path>", "Build path inside the archive")
  .option("--upload-id <uuid>", "Upload correlation UUID")
  .option("--name <name>", "Display name")
  .option("--json", "Output as JSON")
  .action(async (zip: string, opts) => {
    const zipPath = path.resolve(zip);
    const fileInfo = await stat(zipPath).catch(() => null);
    if (!fileInfo?.isFile()) {
      throw new CLIError(`ZIP archive not found: ${zip}`);
    }
    if (!zipPath.toLowerCase().endsWith(".zip")) {
      throw new CLIError("Drop archive filename must end in .zip.");
    }
    if (!UUID_RE.test(opts.project)) {
      throw new CLIError("Project ID must be a valid UUID.");
    }
    if (opts.slug.length < 2 || opts.slug.length > 63 || !DROP_SLUG_RE.test(opts.slug)) {
      throw new CLIError("Drop slug must be 2-63 lowercase letters, digits, or internal hyphens.");
    }
    if (opts.buildPath?.split(/[\\/]/).includes("..")) {
      throw new CLIError("Build path cannot contain '..'.");
    }
    if (opts.uploadId && !UUID_RE.test(opts.uploadId)) {
      throw new CLIError("Upload ID must be a valid UUID.");
    }
    if (opts.name && opts.name.trim().length > 100) {
      throw new CLIError("Drop name cannot exceed 100 characters.");
    }

    const form = new FormData();
    form.set("zip", await fileFromPath(zipPath, "application/zip"));
    form.set("project_id", opts.project);
    form.set("drop_slug", opts.slug);
    form.set("upload_id", opts.uploadId ?? randomUUID());
    if (opts.buildPath !== undefined) form.set("dropBuildPath", opts.buildPath);
    if (opts.name?.trim()) form.set("name", opts.name.trim());

    const query = new URLSearchParams({ project_id: opts.project });
    const progress = spinner("Uploading and deploying Drop...");

    try {
      const deployment = await apiPostFormData<DropDeployment>(
        `${CLI_API_PREFIX}/drops/deploy?${query}`,
        form,
      );
      progress.succeed("Drop deployment accepted!");

      if (opts.json) {
        jsonOutput(deployment);
        return;
      }

      console.log();
      console.log(`  ${bold("Drop ID:")}       ${deployment.drop_id}`);
      console.log(`  ${bold("Deployment ID:")} ${deployment.deployment_id}`);
      console.log(`  ${bold("Slug:")}          ${deployment.drop_slug}`);
      console.log(`  ${bold("Status:")}        ${deployment.status}`);
      console.log(`  ${bold("URL:")}           ${link(deployment.domain_url)}`);
      console.log();
    } catch (err) {
      progress.fail("Drop deployment failed.");
      throw err;
    }
  });