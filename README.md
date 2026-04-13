

<h1 align="center">Skytells CLI</h1>

<p align="center">
  The official command-line interface for the <a href="https://skytells.ai">Skytells</a> platform.<br />
  Manage projects, apps, databases, cloud infrastructure, and more — directly from your terminal.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/skytells/cli/main/assets/cli.png" alt="Skytells CLI" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@skytells/cli"><img src="https://img.shields.io/npm/v/@skytells/cli.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@skytells/cli"><img src="https://img.shields.io/npm/dm/@skytells/cli.svg" alt="npm downloads" /></a>
  <a href="https://github.com/skytells/cli/blob/main/LICENSE"><img src="https://img.shields.io/github/license/skytells/cli.svg" alt="license" /></a>
  <a href="https://github.com/skytells/cli"><img src="https://img.shields.io/github/stars/skytells/cli.svg?style=social" alt="GitHub stars" /></a>
</p>

<p align="center">
  <a href="https://learn.skytells.ai/docs/cli">Documentation</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="CHANGELOG.md">Changelog</a> •
  <a href="SECURITY.md">Security</a>
</p>

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Commands](#commands)
  - [Auth](#auth)
  - [Projects](#projects)
  - [Apps](#apps)
  - [Deployments](#deployments)
  - [Databases](#databases)
  - [Environment Variables](#environment-variables)
  - [Domains](#domains)
  - [Members](#members)
  - [Status & Logs](#status--logs)
  - [Cloud Infrastructure](#cloud-infrastructure)
  - [Orchestrator](#orchestrator)
  - [Cognition](#cognition)
- [Global Options](#global-options)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables-1)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

Install the Skytells CLI globally using npm:

```bash
npm install -g @skytells/cli
```

Verify the installation:

```bash
skytells --version
```

You should see `1.0.0` printed to the terminal.

---

## Quick Start

**1. Sign in to your Skytells account:**

```bash
skytells login
```

This opens your browser for secure authentication. You can also authenticate with a personal access token:

```bash
skytells login --token
```

> Create a personal access token at [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens).

**2. Link a project to your working directory:**

```bash
skytells link <your-access-key>
```

> Find your project access key at [console.skytells.ai/projects/{project}/settings](https://console.skytells.ai/projects).

**3. View your project:**

```bash
skytells project
```

**4. Deploy an app:**

```bash
skytells deploy <app-id>
```

**5. Stream logs in real time:**

```bash
skytells logs <app-id> --follow
```

For detailed documentation, visit [Skytells Learn](https://learn.skytells.ai/docs/cli).

---

## Authentication

The Skytells CLI supports two authentication methods:

### Device Flow (Recommended)

```bash
skytells login
```

This initiates a secure browser-based OAuth device flow. A code is displayed in your terminal — open the provided URL in your browser, enter the code, and authorize the CLI.

### Personal Access Token

```bash
skytells login --token
```

You will be prompted to paste a personal access token. Create one at [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens).

### Access Keys (Project-Scoped)

Access keys scope CLI operations to a specific project. Link an access key with:

```bash
skytells link <access-key>
```

Access keys use the format `sk_proj_*` and can be generated in your project settings at [console.skytells.ai](https://console.skytells.ai).

---

## Commands

### Auth

#### `skytells login`

Authenticate with Skytells.

```bash
# Interactive browser-based login (recommended)
skytells login

# Login with a personal access token
skytells login --token

# Login with specific scopes
skytells login --scopes inference,projects.read,deployments.read,account.read
```

| Option | Description |
|--------|-------------|
| `--token` | Authenticate by pasting a personal access token |
| `--scopes <scopes>` | Comma-separated scopes for device flow login |

**Available scopes:** `inference`, `projects.read`, `projects.write`, `deployments.read`, `deployments.write`, `keys.read`, `keys.write`, `account.read`

#### `skytells logout`

Remove stored credentials and log out.

```bash
skytells logout

# Skip confirmation prompt
skytells logout --force
```

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |

#### `skytells whoami`

Display the currently authenticated user or linked project.

```bash
skytells whoami

# Output as JSON
skytells whoami --json
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells link <access-key>`

Link a project access key to the CLI. This key scopes subsequent commands to the associated project.

```bash
skytells link sk_proj_abc123...
```

| Argument | Description |
|----------|-------------|
| `access-key` | A project-scoped access key (starts with `sk_proj_`) |

---

### Projects

#### `skytells projects ls`

List all projects in your account.

```bash
skytells projects ls

# Filter by project type
skytells projects ls --type production

# Output as JSON
skytells projects ls --json
```

| Option | Description |
|--------|-------------|
| `--type <type>` | Filter projects by type |
| `--json` | Output as JSON |

#### `skytells projects add <name>`

Create a new project.

```bash
skytells projects add my-project

# Specify project type
skytells projects add my-project --type production
```

| Argument | Description |
|----------|-------------|
| `name` | Name for the new project |

| Option | Description |
|--------|-------------|
| `--type <type>` | Project type |
| `--json` | Output as JSON |

#### `skytells project`

View the currently linked project (requires access key).

```bash
skytells project

# Output as JSON
skytells project --json
```

#### `skytells project set <field> <value>`

Update a project setting.

```bash
skytells project set name "My New Project Name"
skytells project set description "Updated description"
skytells project set network_mode private
```

| Argument | Description |
|----------|-------------|
| `field` | Setting to update: `name`, `description`, `network_mode` |
| `value` | New value for the setting |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

---

### Apps

#### `skytells apps ls`

List all apps in the linked project.

```bash
skytells apps ls

# Output as JSON
skytells apps ls --json
```

#### `skytells apps add <name>`

Create a new app.

```bash
skytells apps add my-app

# Specify app type
skytells apps add my-app --type web
```

| Argument | Description |
|----------|-------------|
| `name` | Name for the new app |

| Option | Description |
|--------|-------------|
| `--type <type>` | App type |
| `--json` | Output as JSON |

#### `skytells apps inspect <id>`

View detailed information about a specific app.

```bash
skytells apps inspect abc123
```

| Argument | Description |
|----------|-------------|
| `id` | App ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells apps set <id> <field> <value>`

Update an app setting.

```bash
skytells apps set abc123 name "Updated App Name"
```

| Argument | Description |
|----------|-------------|
| `id` | App ID |
| `field` | Setting to update |
| `value` | New value |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells apps rm <id>`

Delete an app.

```bash
skytells apps rm abc123

# Skip confirmation prompt
skytells apps rm abc123 --force
```

| Argument | Description |
|----------|-------------|
| `id` | App ID |

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |
| `--json` | Output as JSON |

#### `skytells apps start <id>`

Start a stopped app.

```bash
skytells apps start abc123
```

#### `skytells apps stop <id>`

Stop a running app.

```bash
skytells apps stop abc123

# Skip confirmation prompt
skytells apps stop abc123 --force
```

#### `skytells apps restart <id>`

Restart an app.

```bash
skytells apps restart abc123
```

#### `skytells apps redeploy <id>`

Trigger a redeployment of an app.

```bash
skytells apps redeploy abc123
```

All control commands (`start`, `stop`, `restart`, `redeploy`) support `--force` and `--json` options.

---

### Deployments

#### `skytells deploy <app>`

Trigger a deployment for an app.

```bash
skytells deploy my-app

# Output as JSON
skytells deploy my-app --json
```

| Argument | Description |
|----------|-------------|
| `app` | App ID or slug |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells deployments ls`

List deployment history.

```bash
skytells deployments ls

# Filter by app
skytells deployments ls --app abc123

# Paginate results
skytells deployments ls --limit 10 --offset 20

# Output as JSON
skytells deployments ls --json
```

| Option | Description |
|--------|-------------|
| `--app <id>` | Filter deployments by app ID |
| `--limit <n>` | Maximum number of results to return |
| `--offset <n>` | Number of results to skip |
| `--json` | Output as JSON |

---

### Databases

#### `skytells databases ls`

List all databases in the linked project.

```bash
skytells databases ls

# Output as JSON
skytells databases ls --json
```

#### `skytells databases add <name> <type>`

Create a new database.

```bash
# Create a PostgreSQL database
skytells databases add my-db postgres

# Create a Redis database
skytells databases add cache redis

# Create with additional options
skytells databases add my-db postgres \
  --description "Production database" \
  --password mypassword \
  --db-name app_db \
  --db-user app_user
```

| Argument | Description |
|----------|-------------|
| `name` | Database name |
| `type` | Database engine: `postgres`, `mysql`, `mariadb`, `mongo`, `redis` |

| Option | Description |
|--------|-------------|
| `--docker-image <image>` | Custom Docker image |
| `--description <desc>` | Database description |
| `--password <pass>` | Database password |
| `--db-name <name>` | Database name within the engine |
| `--db-user <user>` | Database user |
| `--json` | Output as JSON |

#### `skytells databases inspect <id>`

View detailed information about a database.

```bash
skytells databases inspect abc123
```

| Argument | Description |
|----------|-------------|
| `id` | Database ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells databases set <id> <field> <value>`

Update a database setting.

```bash
skytells databases set abc123 name "Renamed DB"
skytells databases set abc123 backup_enabled true
skytells databases set abc123 backup_schedule "0 2 * * *"
skytells databases set abc123 external_port 5432
```

| Argument | Description |
|----------|-------------|
| `id` | Database ID |
| `field` | Setting to update: `name`, `description`, `backup_enabled`, `backup_schedule`, `external_port` |
| `value` | New value |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells databases rm <id>`

Delete a database.

```bash
skytells databases rm abc123

# Skip confirmation
skytells databases rm abc123 --force
```

#### `skytells databases start <id>`

Start a stopped database.

```bash
skytells databases start abc123
```

#### `skytells databases stop <id>`

Stop a running database.

```bash
skytells databases stop abc123
```

#### `skytells databases deploy <id>`

Deploy a database.

```bash
skytells databases deploy abc123
```

All database control commands support `--force` and `--json` options.

---

### Environment Variables

#### `skytells env ls`

List environment variables.

```bash
# List project-level variables
skytells env ls

# List variables for a specific app
skytells env ls --app abc123

# Output as JSON
skytells env ls --json
```

| Option | Description |
|--------|-------------|
| `--app <id>` | Scope to a specific app |
| `--json` | Output as JSON |

#### `skytells env set <pairs...>`

Set one or more environment variables using `KEY=value` format.

```bash
# Set a single variable
skytells env set DATABASE_URL=postgres://...

# Set multiple variables at once
skytells env set API_KEY=abc123 NODE_ENV=production PORT=3000

# Set for a specific app
skytells env set --app abc123 SECRET_KEY=mykey
```

| Argument | Description |
|----------|-------------|
| `pairs` | One or more `KEY=value` pairs |

| Option | Description |
|--------|-------------|
| `--app <id>` | Scope to a specific app |
| `--json` | Output as JSON |

---

### Domains

#### `skytells domains ls`

List custom domains.

```bash
skytells domains ls

# Output as JSON
skytells domains ls --json
```

#### `skytells domains add <domain>`

Add a custom domain.

```bash
skytells domains add example.com

# Assign to a specific app
skytells domains add example.com --app abc123
```

| Argument | Description |
|----------|-------------|
| `domain` | The domain name to add |

| Option | Description |
|--------|-------------|
| `--app <id>` | Associate with a specific app |
| `--json` | Output as JSON |

#### `skytells domains rm <id>`

Remove a custom domain.

```bash
skytells domains rm domain-id

# Skip confirmation
skytells domains rm domain-id --force
```

| Argument | Description |
|----------|-------------|
| `id` | Domain ID |

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |
| `--json` | Output as JSON |

---

### Members

#### `skytells members ls`

List team members of the linked project.

```bash
skytells members ls

# Output as JSON
skytells members ls --json
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

---

### Status & Logs

#### `skytells status`

View the status overview of the linked project and its apps.

```bash
skytells status

# Output as JSON
skytells status --json
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells logs <app>`

Stream real-time logs from an app.

```bash
# View recent logs
skytells logs my-app

# Follow logs in real time (streaming)
skytells logs my-app --follow

# View deployment logs
skytells logs my-app --type deployment

# Show last 50 lines
skytells logs my-app --tail 50

# Logs for a specific deployment
skytells logs my-app --deployment dep-id
```

| Argument | Description |
|----------|-------------|
| `app` | App ID or slug |

| Option | Description |
|--------|-------------|
| `--type <type>` | Log type: `container` (default), `deployment` |
| `--deployment <id>` | Filter by deployment ID |
| `--tail <n>` | Number of recent log lines to show |
| `--follow` | Stream logs in real time (SSE) |
| `--json` | Output as JSON |

---

### Cloud Infrastructure

> Skytells operates a globally distributed GPU infrastructure. Explore available plans and regions at [skytells.ai/infrastructure](https://skytells.ai/infrastructure). For edge computing, see [skytells.ai/edge](https://skytells.ai/edge).

#### `skytells cloud ls`

List all cloud instances.

```bash
skytells cloud ls

# Output as JSON
skytells cloud ls --json
```

#### `skytells cloud deploy`

Deploy a new cloud instance.

```bash
skytells cloud deploy \
  --region ewr \
  --plan vc2-1c-1gb \
  --os 387 \
  --label "my-server" \
  --hostname "my-server"
```

**GPU instances (H100 / A100):**

```bash
# Deploy an NVIDIA H100 instance
skytells cloud deploy \
  --region ewr \
  --plan gpu-h100-1 \
  --os 387 \
  --label "h100-training"

# Deploy an NVIDIA A100 instance
skytells cloud deploy \
  --region lax \
  --plan gpu-a100-1 \
  --os 387 \
  --label "a100-inference"
```

| Option | Description |
|--------|-------------|
| `--region <region>` | Deployment region |
| `--plan <plan>` | Instance plan/size |
| `--os <id>` | Operating system ID |
| `--label <label>` | Instance label |
| `--hostname <name>` | Instance hostname |
| `--tags <tags>` | Comma-separated tags |
| `--firewall-group <id>` | Firewall group ID |
| `--vpc <id>` | VPC ID |
| `--ipv6` | Enable IPv6 |
| `--json` | Output as JSON |

#### `skytells cloud inspect <id>`

View detailed information about a cloud instance.

```bash
skytells cloud inspect instance-id
```

| Argument | Description |
|----------|-------------|
| `id` | Instance ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells cloud destroy <id>`

Destroy a cloud instance.

```bash
skytells cloud destroy instance-id

# Skip confirmation
skytells cloud destroy instance-id --force
```

| Argument | Description |
|----------|-------------|
| `id` | Instance ID |

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |
| `--json` | Output as JSON |

#### `skytells cloud start <id>`

Start a halted cloud instance.

```bash
skytells cloud start instance-id
```

#### `skytells cloud halt <id>`

Halt (stop) a running cloud instance.

```bash
skytells cloud halt instance-id
```

#### `skytells cloud reboot <id>`

Reboot a cloud instance.

```bash
skytells cloud reboot instance-id
```

All cloud control commands support `--force` and `--json` options.

---

### Orchestrator

#### `skytells workflows ls`

List all orchestrator workflows.

```bash
skytells workflows ls

# Output as JSON
skytells workflows ls --json
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells orchestrator overview`

View orchestrator overview, stats, and health.

```bash
skytells orchestrator overview

# Output as JSON
skytells orchestrator overview --json
```

> Learn more about Orchestrator at [orchestrator.skytells.ai](https://orchestrator.skytells.ai).

#### `skytells orchestrator executions`

List workflow executions.

```bash
skytells orchestrator executions

# Filter by workflow
skytells orchestrator executions --workflow wf-id

# Filter by status
skytells orchestrator executions --status completed

# Paginate
skytells orchestrator executions --limit 20 --offset 0
```

| Option | Description |
|--------|-------------|
| `--workflow <id>` | Filter by workflow ID |
| `--status <status>` | Filter by execution status |
| `--limit <n>` | Maximum number of results |
| `--offset <n>` | Number of results to skip |
| `--json` | Output as JSON |

#### `skytells orchestrator inspect <id>`

View details and logs for a specific execution.

```bash
skytells orchestrator inspect exec-id
```

| Argument | Description |
|----------|-------------|
| `id` | Execution ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

#### `skytells orchestrator metrics`

View execution metrics over a time period.

```bash
skytells orchestrator metrics

# Specify date range
skytells orchestrator metrics --from 2026-01-01 --to 2026-01-31
```

| Option | Description |
|--------|-------------|
| `--from <date>` | Start date (ISO format) |
| `--to <date>` | End date (ISO format) |
| `--json` | Output as JSON |

#### `skytells orchestrator usage`

View resource usage statistics.

```bash
skytells orchestrator usage

# Specify date range
skytells orchestrator usage --from 2026-01-01 --to 2026-01-31
```

| Option | Description |
|--------|-------------|
| `--from <date>` | Start date (ISO format) |
| `--to <date>` | End date (ISO format) |
| `--json` | Output as JSON |

---

### Cognition

Cognition provides observability, monitoring, error tracking, and security insights for your applications.

#### `skytells cognition overview`

View a high-level overview of application health and observability.

```bash
skytells cognition overview

# Specify project and time window
skytells cognition overview --project proj-id --hours 24
```

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--hours <n>` | Time window in hours |
| `--json` | Output as JSON |

#### `skytells cognition errors`

List application errors.

```bash
skytells cognition errors

# Paginate results
skytells cognition errors --limit 20 --offset 0
```

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of results |
| `--offset <n>` | Number of results to skip |
| `--json` | Output as JSON |

#### `skytells cognition security`

List security events and alerts.

```bash
skytells cognition security
```

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of results |
| `--offset <n>` | Number of results to skip |
| `--json` | Output as JSON |

#### `skytells cognition runtime`

View runtime performance snapshots.

```bash
skytells cognition runtime
```

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of results |
| `--offset <n>` | Number of results to skip |
| `--json` | Output as JSON |

#### `skytells cognition anomalies`

List detected anomalies.

```bash
skytells cognition anomalies
```

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of results |
| `--offset <n>` | Number of results to skip |
| `--json` | Output as JSON |

#### `skytells cognition events`

List real-time events with polling support.

```bash
skytells cognition events

# Fetch events after a specific event ID
skytells cognition events --since event-id
```

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of results |
| `--since <id>` | Fetch events after this event ID |
| `--json` | Output as JSON |

#### `skytells cognition timeseries`

View time-series metrics data.

```bash
skytells cognition timeseries

# Specify time window
skytells cognition timeseries --hours 48
```

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--hours <n>` | Time window in hours |
| `--json` | Output as JSON |

---

## Global Options

These options are available on all commands:

| Option | Description |
|--------|-------------|
| `-v, --version` | Display the CLI version |
| `-h, --help` | Display help for a command |
| `--json` | Output results as JSON (available on most commands) |

---

## Configuration

### Credentials

Credentials are stored securely at:

```
~/.config/skytells/credentials.json
```

The file is created with restrictive permissions (`0600`) and contains your authentication token and/or project access key.

### Custom Config Directory

Override the default config directory:

```bash
export SKYTELLS_CONFIG_DIR=/path/to/config
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SKYTELLS_API_URL` | Override the API base URL |
| `SKYTELLS_TOKEN` | Override the stored authentication token |
| `SKYTELLS_ACCESS_KEY` | Override the stored project access key |
| `SKYTELLS_CONFIG_DIR` | Override the config directory path |

---

## Requirements

- **Node.js** >= 18.0.0
- A [Skytells account](https://console.skytells.ai/login)

---

## Useful Links

- [Documentation](https://learn.skytells.ai/docs/cli)
- [Console](https://console.skytells.ai)
- [GPU Infrastructure & Regions](https://skytells.ai/infrastructure)
- [Edge Computing](https://skytells.ai/edge)
- [Create a Project](https://console.skytells.ai/projects/new)
- [API Keys](https://console.skytells.ai/settings/api-keys)
- [Personal Access Tokens](https://console.skytells.ai/settings/tokens)
- [Orchestrator](https://orchestrator.skytells.ai)
- [Status Page](https://status.skytells.ai)

---

## Contributing

We welcome contributions. Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "feat: add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with precision by <a href="https://skytells.ai">Skytells</a>
</p>
