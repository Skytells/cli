# Logs & Status

Monitor your applications in real time with logs and status commands.

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## Status

```bash
skytells status
```

Displays a status overview of the linked project, including all apps and their current state.

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example output:**

```
Project: my-project (abc123)
Status: active

Apps:
┌──────────┬──────────────┬──────────┬───────────┐
│ ID       │ Name         │ Status   │ Uptime    │
├──────────┼──────────────┼──────────┼───────────┤
│ app-001  │ api-server   │ running  │ 5d 12h    │
│ app-002  │ worker       │ running  │ 3d 8h     │
│ app-003  │ cron-job     │ stopped  │ —         │
└──────────┴──────────────┴──────────┴───────────┘
```

## Logs

```bash
skytells logs <app>
```

Stream or view logs from a specific app.

| Argument | Description |
|----------|-------------|
| `app` | App ID or slug |

| Option | Description |
|--------|-------------|
| `--type <type>` | Log type: `container` (default) or `deployment` |
| `--deployment <id>` | Filter logs by a specific deployment |
| `--tail <n>` | Number of recent log lines to display |
| `--follow` | Stream logs in real time (keeps the connection open) |
| `--json` | Output as JSON |

### View Recent Logs

```bash
# Show recent container logs
skytells logs my-api

# Show last 100 lines
skytells logs my-api --tail 100
```

### Stream Logs in Real Time

```bash
skytells logs my-api --follow
```

This opens a persistent SSE (Server-Sent Events) connection and prints new log entries as they arrive. Press `Ctrl+C` to stop streaming.

### View Deployment Logs

```bash
# Latest deployment logs
skytells logs my-api --type deployment

# Logs for a specific deployment
skytells logs my-api --type deployment --deployment dep-003
```

### Follow Deployment Logs

```bash
skytells logs my-api --type deployment --follow
```

This is useful for monitoring a deployment in progress.

## Common Workflows

### Monitor a Deployment

```bash
# Trigger deployment
skytells deploy my-api

# Watch deployment logs
skytells logs my-api --type deployment --follow

# After deployment completes, watch container logs
skytells logs my-api --follow
```

### Debug an Issue

```bash
# Check project status first
skytells status

# View recent container logs
skytells logs my-api --tail 200

# Stream logs in real time to catch the next occurrence
skytells logs my-api --follow
```

### CI/CD Integration

```bash
# Get status as JSON for automated checks
STATUS=$(skytells status --json)

# Get recent logs as JSON
skytells logs my-api --tail 50 --json
```
