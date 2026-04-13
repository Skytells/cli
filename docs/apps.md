# Apps

Apps are the deployable units within a Skytells project. This guide covers how to create, manage, configure, and control your apps using the CLI.

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## List Apps

```bash
skytells apps ls
```

Lists all apps in the linked project.

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example output:**

```
┌──────────┬──────────────┬──────────┬──────────┬──────────────────┐
│ ID       │ Name         │ Type     │ Status   │ Created          │
├──────────┼──────────────┼──────────┼──────────┼──────────────────┤
│ abc123   │ api-server   │ web      │ running  │ 2026-01-20       │
│ def456   │ worker       │ worker   │ stopped  │ 2026-02-10       │
└──────────┴──────────────┴──────────┴──────────┴──────────────────┘
```

## Create an App

```bash
skytells apps add <name>
```

| Argument | Description |
|----------|-------------|
| `name` | Name for the new app |

| Option | Description |
|--------|-------------|
| `--type <type>` | App type |
| `--json` | Output as JSON |

**Examples:**

```bash
# Create an app
skytells apps add my-api

# Create with a specific type
skytells apps add my-frontend --type web
```

## Inspect an App

```bash
skytells apps inspect <id>
```

Shows detailed information about a specific app including its configuration, status, and resource allocation.

| Argument | Description |
|----------|-------------|
| `id` | The app ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example:**

```bash
skytells apps inspect abc123
```

## Update an App

```bash
skytells apps set <id> <field> <value>
```

Updates a setting on an app.

| Argument | Description |
|----------|-------------|
| `id` | The app ID |
| `field` | The setting to update |
| `value` | The new value |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example:**

```bash
skytells apps set abc123 name "Renamed App"
```

## Delete an App

```bash
skytells apps rm <id>
```

Permanently deletes an app. This action cannot be undone.

| Argument | Description |
|----------|-------------|
| `id` | The app ID |

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |
| `--json` | Output as JSON |

**Examples:**

```bash
# Delete with confirmation prompt
skytells apps rm abc123

# Delete without confirmation
skytells apps rm abc123 --force
```

## App Lifecycle Control

Control the lifecycle of your apps with these commands. All commands accept the `--force` and `--json` options.

### Start an App

```bash
skytells apps start <id>
```

Starts a stopped app.

### Stop an App

```bash
skytells apps stop <id>
```

Stops a running app. You will be prompted for confirmation unless `--force` is provided.

### Restart an App

```bash
skytells apps restart <id>
```

Restarts a running app. This is equivalent to stopping and then starting the app.

### Redeploy an App

```bash
skytells apps redeploy <id>
```

Triggers a fresh redeployment of the app using the latest configuration.

**Examples:**

```bash
# Start an app
skytells apps start abc123

# Stop without confirmation
skytells apps stop abc123 --force

# Restart an app
skytells apps restart abc123

# Redeploy and get JSON response
skytells apps redeploy abc123 --json
```

## Common Workflows

### Create and Deploy an App

```bash
# Create the app
skytells apps add my-api --type web

# Set environment variables
skytells env set --app <app-id> NODE_ENV=production PORT=3000

# Deploy
skytells deploy <app-id>

# Stream logs to verify
skytells logs <app-id> --follow
```

### Update and Redeploy

```bash
# Update app configuration
skytells apps set <app-id> name "Updated API"

# Trigger redeployment
skytells apps redeploy <app-id>

# Check deployment status
skytells deployments ls --app <app-id> --limit 1
```
