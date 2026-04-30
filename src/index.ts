import { Command } from "commander";

import { CLIError } from "./lib/errors.js";
import { error as showError } from "./lib/ui.js";

// ── Auth ─────────────────────────────────────────────────────
import { loginCommand } from "./commands/auth/login.js";
import { logoutCommand } from "./commands/auth/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { linkCommand } from "./commands/link.js";

// ── Projects (user-level) ────────────────────────────────────
import { projectsListCommand } from "./commands/projects/list.js";
import { createProjectCommand } from "./commands/projects/create.js";

// ── Project (access-key scoped) ──────────────────────────────
import { projectViewCommand } from "./commands/project/view.js";
import { projectSetCommand } from "./commands/project/set.js";

// ── Apps ─────────────────────────────────────────────────────
import { appsListCommand } from "./commands/apps/list.js";
import { createAppCommand } from "./commands/apps/create.js";
import { appViewCommand } from "./commands/apps/view.js";
import { appSetCommand } from "./commands/apps/set.js";
import { appDeleteCommand } from "./commands/apps/delete.js";
import { startCommand, stopCommand, restartCommand, redeployCommand } from "./commands/apps/control.js";

// ── Deploy & Deployments ─────────────────────────────────────
import { deployCommand } from "./commands/deploy.js";
import { deploymentsListCommand } from "./commands/deployments/list.js";

// ── Databases ────────────────────────────────────────────────
import { databasesListCommand } from "./commands/databases/list.js";
import { createDatabaseCommand } from "./commands/databases/create.js";
import { databaseViewCommand } from "./commands/databases/view.js";
import { databaseSetCommand } from "./commands/databases/set.js";
import { databaseDeleteCommand } from "./commands/databases/delete.js";
import { dbStartCommand, dbStopCommand, dbDeployCommand } from "./commands/databases/control.js";

// ── Env ──────────────────────────────────────────────────────
import { envGetCommand } from "./commands/env/get.js";
import { envSetCommand } from "./commands/env/set.js";

// ── Domains ──────────────────────────────────────────────────
import { domainsListCommand } from "./commands/domains/list.js";
import { domainAddCommand } from "./commands/domains/add.js";
import { domainRemoveCommand } from "./commands/domains/remove.js";

// ── Members & Status ─────────────────────────────────────────
import { membersListCommand } from "./commands/members/list.js";
import { statusCommand } from "./commands/status.js";

// ── Logs ─────────────────────────────────────────────────────
import { logsCommand } from "./commands/logs.js";

// ── Cloud ────────────────────────────────────────────────────
import { cloudInstancesCommand } from "./commands/cloud/instances.js";
import { cloudDeployCommand } from "./commands/cloud/deploy.js";
import { cloudInstanceCommand } from "./commands/cloud/instance.js";
import { cloudDestroyCommand } from "./commands/cloud/destroy.js";
import { cloudStartCommand, cloudHaltCommand, cloudRebootCommand } from "./commands/cloud/control.js";

// ── Orchestrator ─────────────────────────────────────────────
import { orchestratorWorkflowsCommand } from "./commands/orchestrator/workflows.js";
import { orchestratorOverviewCommand } from "./commands/orchestrator/overview.js";
import { orchestratorExecutionsCommand } from "./commands/orchestrator/executions.js";
import { orchestratorInspectCommand } from "./commands/orchestrator/inspect.js";
import { orchestratorMetricsCommand } from "./commands/orchestrator/metrics.js";
import { orchestratorUsageCommand } from "./commands/orchestrator/usage.js";

// ── Agents ───────────────────────────────────────────────────
import { agentsListCommand } from "./commands/agents/list.js";
import { agentCreateCommand } from "./commands/agents/create.js";
import { agentViewCommand } from "./commands/agents/view.js";
import { agentUpdateCommand } from "./commands/agents/update.js";
import { agentDeleteCommand } from "./commands/agents/delete.js";
import { agentReposCommand } from "./commands/agents/repos.js";
import { agentRunsCommand } from "./commands/agents/runs.js";

// ── Cognition ────────────────────────────────────────────────
import { cognitionOverviewCommand } from "./commands/cognition/overview.js";
import { cognitionErrorsCommand } from "./commands/cognition/errors.js";
import { cognitionSecurityCommand } from "./commands/cognition/security.js";
import { cognitionRuntimeCommand } from "./commands/cognition/runtime.js";
import { cognitionAnomaliesCommand } from "./commands/cognition/anomalies.js";
import { cognitionEventsCommand } from "./commands/cognition/events.js";
import { cognitionTimeseriesCommand } from "./commands/cognition/timeseries.js";

// ── Program ──────────────────────────────────────────────────

const program = new Command();

program
  .name("skytells")
  .description("Skytells CLI — manage projects, apps, databases, and cloud infrastructure")
  .version("1.0.1", "-v, --version");

// ── Auth & identity ──────────────────────────────────────────
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(linkCommand);

// ── Projects (user-level) ────────────────────────────────────
const projects = new Command("projects").description("Manage projects");
projects.addCommand(projectsListCommand);   // skytells projects ls
projects.addCommand(createProjectCommand);  // skytells projects add <name>
program.addCommand(projects);

// ── Project (access-key scoped) ──────────────────────────────
const project = projectViewCommand;         // skytells project
project.addCommand(projectSetCommand);      // skytells project set <field> <value>
program.addCommand(project);

// ── Apps ─────────────────────────────────────────────────────
const apps = new Command("apps").description("Manage apps");
apps.addCommand(appsListCommand);           // skytells apps ls
apps.addCommand(createAppCommand);          // skytells apps add <name>
apps.addCommand(appViewCommand);            // skytells apps inspect <id>
apps.addCommand(appSetCommand);             // skytells apps set <id> <field> <value>
apps.addCommand(appDeleteCommand);          // skytells apps rm <id>
apps.addCommand(startCommand);              // skytells apps start <id>
apps.addCommand(stopCommand);               // skytells apps stop <id>
apps.addCommand(restartCommand);            // skytells apps restart <id>
apps.addCommand(redeployCommand);           // skytells apps redeploy <id>
program.addCommand(apps);

// ── Deploy & Deployments ─────────────────────────────────────
program.addCommand(deployCommand);          // skytells deploy <app>

const deployments = new Command("deployments").description("Manage deployments");
deployments.addCommand(deploymentsListCommand); // skytells deployments ls
program.addCommand(deployments);

// ── Databases ────────────────────────────────────────────────
const databases = new Command("databases").description("Manage databases");
databases.addCommand(databasesListCommand);     // skytells databases ls
databases.addCommand(createDatabaseCommand);    // skytells databases add <name> <type>
databases.addCommand(databaseViewCommand);      // skytells databases inspect <id>
databases.addCommand(databaseSetCommand);       // skytells databases set <id> <field> <value>
databases.addCommand(databaseDeleteCommand);    // skytells databases rm <id>
databases.addCommand(dbStartCommand);           // skytells databases start <id>
databases.addCommand(dbStopCommand);            // skytells databases stop <id>
databases.addCommand(dbDeployCommand);          // skytells databases deploy <id>
program.addCommand(databases);

// ── Env ──────────────────────────────────────────────────────
const env = new Command("env").description("Manage environment variables");
env.addCommand(envGetCommand);              // skytells env ls
env.addCommand(envSetCommand);              // skytells env set KEY=value ...
program.addCommand(env);

// ── Domains ──────────────────────────────────────────────────
const domains = new Command("domains").description("Manage custom domains");
domains.addCommand(domainsListCommand);     // skytells domains ls
domains.addCommand(domainAddCommand);       // skytells domains add <domain>
domains.addCommand(domainRemoveCommand);    // skytells domains rm <id>
program.addCommand(domains);

// ── Members ──────────────────────────────────────────────────
const members = new Command("members").description("Manage project members");
members.addCommand(membersListCommand);     // skytells members ls
program.addCommand(members);

// ── Status & Logs ────────────────────────────────────────────
program.addCommand(statusCommand);          // skytells status
program.addCommand(logsCommand);            // skytells logs <app>

// ── Cloud ────────────────────────────────────────────────────
const cloud = new Command("cloud").description("Manage cloud infrastructure");
cloud.addCommand(cloudInstancesCommand);    // skytells cloud ls
cloud.addCommand(cloudDeployCommand);       // skytells cloud deploy
cloud.addCommand(cloudInstanceCommand);     // skytells cloud inspect <id>
cloud.addCommand(cloudDestroyCommand);      // skytells cloud destroy <id>
cloud.addCommand(cloudStartCommand);        // skytells cloud start <id>
cloud.addCommand(cloudHaltCommand);         // skytells cloud halt <id>
cloud.addCommand(cloudRebootCommand);       // skytells cloud reboot <id>
program.addCommand(cloud);

// ── Orchestrator ─────────────────────────────────────────────
const workflows = new Command("workflows").description("Manage orchestrator workflows");
workflows.addCommand(orchestratorWorkflowsCommand); // skytells workflows ls
program.addCommand(workflows);

const orchestrator = new Command("orchestrator").description("Orchestrator executions, metrics, and usage");
orchestrator.addCommand(orchestratorOverviewCommand);   // skytells orchestrator overview
orchestrator.addCommand(orchestratorExecutionsCommand); // skytells orchestrator executions
orchestrator.addCommand(orchestratorInspectCommand);    // skytells orchestrator inspect <id>
orchestrator.addCommand(orchestratorMetricsCommand);    // skytells orchestrator metrics
orchestrator.addCommand(orchestratorUsageCommand);      // skytells orchestrator usage
program.addCommand(orchestrator);

// ── Agents ───────────────────────────────────────────────────
const agents = new Command("agents").description("Manage Cloud Agents");
agents.addCommand(agentsListCommand);       // skytells agents ls
agents.addCommand(agentCreateCommand);      // skytells agents add
agents.addCommand(agentViewCommand);        // skytells agents inspect <id>
agents.addCommand(agentUpdateCommand);      // skytells agents set <id>
agents.addCommand(agentDeleteCommand);      // skytells agents rm <id>
agents.addCommand(agentReposCommand);       // skytells agents repos ...
agents.addCommand(agentRunsCommand);        // skytells agents runs ...
program.addCommand(agents);

// ── Cognition ────────────────────────────────────────────────
const cognition = new Command("cognition").description("Cognition observability and monitoring");
cognition.addCommand(cognitionOverviewCommand);     // skytells cognition overview
cognition.addCommand(cognitionErrorsCommand);       // skytells cognition errors
cognition.addCommand(cognitionSecurityCommand);     // skytells cognition security
cognition.addCommand(cognitionRuntimeCommand);      // skytells cognition runtime
cognition.addCommand(cognitionAnomaliesCommand);    // skytells cognition anomalies
cognition.addCommand(cognitionEventsCommand);       // skytells cognition events
cognition.addCommand(cognitionTimeseriesCommand);   // skytells cognition timeseries
program.addCommand(cognition);

// ── Global error handler ─────────────────────────────────────

program.exitOverride();

async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (err: unknown) {
    if (err instanceof CLIError) {
      showError(err.message);
      process.exit(err.exitCode);
    }

    // Commander exit override (e.g., --help, --version)
    if (
      err &&
      typeof err === "object" &&
      "exitCode" in err &&
      (err as { exitCode: number }).exitCode === 0
    ) {
      process.exit(0);
    }

    if (err instanceof Error) {
      showError(err.message);
    } else {
      showError("An unexpected error occurred.");
    }
    process.exit(1);
  }
}

main();
