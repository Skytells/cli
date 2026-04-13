# Deployments

Deployments represent the process of shipping your application code and configuration to the Skytells platform. This guide covers triggering deployments and viewing deployment history.

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## Trigger a Deployment

```bash
skytells deploy <app>
```

Triggers a new deployment for the specified app.

| Argument | Description |
|----------|-------------|
| `app` | App ID or slug |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Examples:**

```bash
# Deploy by app ID
skytells deploy abc123

# Deploy by app slug
skytells deploy my-api

# Deploy and get JSON response
skytells deploy my-api --json
```

After triggering a deployment, you can monitor its progress with:

```bash
# Stream deployment logs
skytells logs <app> --type deployment --follow
```

## List Deployments

```bash
skytells deployments ls
```

Lists the deployment history for the linked project.

| Option | Description |
|--------|-------------|
| `--app <id>` | Filter by a specific app |
| `--limit <n>` | Maximum number of deployments to return |
| `--offset <n>` | Number of deployments to skip (for pagination) |
| `--json` | Output as JSON |

**Examples:**

```bash
# List all deployments
skytells deployments ls

# Filter by app
skytells deployments ls --app abc123

# Paginate results (show deployments 11-20)
skytells deployments ls --limit 10 --offset 10

# Get JSON output
skytells deployments ls --json
```

**Example output:**

```
┌──────────┬──────────────┬──────────┬──────────────────┬──────────────────┐
│ ID       │ App          │ Status   │ Trigger          │ Created          │
├──────────┼──────────────┼──────────┼──────────────────┼──────────────────┤
│ dep-003  │ my-api       │ success  │ cli              │ 2026-04-13 10:30 │
│ dep-002  │ my-api       │ success  │ git-push         │ 2026-04-12 15:00 │
│ dep-001  │ my-api       │ failed   │ cli              │ 2026-04-10 09:00 │
└──────────┴──────────────┴──────────┴──────────────────┴──────────────────┘
```

## Deployment Workflow

A typical deployment workflow looks like this:

```bash
# 1. Check current status
skytells status

# 2. Set any new environment variables
skytells env set API_KEY=new-key

# 3. Trigger the deployment
skytells deploy my-api

# 4. Monitor deployment logs
skytells logs my-api --type deployment --follow

# 5. Verify the deployment
skytells deployments ls --app my-api --limit 1

# 6. Check app status
skytells status
```

## Troubleshooting Failed Deployments

If a deployment fails:

1. **Check deployment logs:**
   ```bash
   skytells logs <app> --type deployment
   ```

2. **Review environment variables:**
   ```bash
   skytells env ls --app <app-id>
   ```

3. **Check app configuration:**
   ```bash
   skytells apps inspect <app-id>
   ```

4. **Redeploy after fixing issues:**
   ```bash
   skytells apps redeploy <app-id>
   ```
