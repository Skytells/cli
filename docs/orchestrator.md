# Orchestrator

The Orchestrator enables you to build, manage, and monitor automated workflows. The CLI provides commands for viewing workflows, inspecting executions, and analyzing metrics.

> Learn more about Orchestrator at [orchestrator.skytells.ai](https://orchestrator.skytells.ai).

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## List Workflows

```bash
skytells workflows ls
```

Lists all orchestrator workflows in the linked project.

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example output:**

```
┌──────────┬──────────────────┬──────────┬───────────────────┐
│ ID       │ Name             │ Status   │ Last Run          │
├──────────┼──────────────────┼──────────┼───────────────────┤
│ wf-001   │ data-pipeline    │ active   │ 2026-04-13 09:00  │
│ wf-002   │ report-generator │ active   │ 2026-04-12 18:00  │
└──────────┴──────────────────┴──────────┴───────────────────┘
```

## Orchestrator Overview

```bash
skytells orchestrator overview
```

Displays a high-level overview of the orchestrator, including total workflows, recent executions, and health status.

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

## List Executions

```bash
skytells orchestrator executions
```

Lists workflow executions with optional filtering.

| Option | Description |
|--------|-------------|
| `--workflow <id>` | Filter by workflow ID |
| `--status <status>` | Filter by execution status (e.g., `completed`, `failed`, `running`) |
| `--limit <n>` | Maximum number of results |
| `--offset <n>` | Number of results to skip |
| `--json` | Output as JSON |

**Examples:**

```bash
# List all executions
skytells orchestrator executions

# Filter by workflow
skytells orchestrator executions --workflow wf-001

# Show only failed executions
skytells orchestrator executions --status failed

# Paginate results
skytells orchestrator executions --limit 20 --offset 0

# Combine filters
skytells orchestrator executions --workflow wf-001 --status completed --limit 10
```

**Example output:**

```
┌──────────┬──────────────────┬──────────┬───────────┬──────────────────┐
│ ID       │ Workflow         │ Status   │ Duration  │ Started          │
├──────────┼──────────────────┼──────────┼───────────┼──────────────────┤
│ ex-005   │ data-pipeline    │ success  │ 2m 30s    │ 2026-04-13 09:00 │
│ ex-004   │ data-pipeline    │ success  │ 2m 15s    │ 2026-04-12 09:00 │
│ ex-003   │ report-generator │ failed   │ 0m 45s    │ 2026-04-12 18:00 │
└──────────┴──────────────────┴──────────┴───────────┴──────────────────┘
```

## Inspect an Execution

```bash
skytells orchestrator inspect <id>
```

Shows detailed information about a specific execution, including step-by-step logs, timing, and output.

| Argument | Description |
|----------|-------------|
| `id` | Execution ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example:**

```bash
skytells orchestrator inspect ex-005
```

## Execution Metrics

```bash
skytells orchestrator metrics
```

Displays execution metrics over a time period, including success rates, average duration, and failure counts.

| Option | Description |
|--------|-------------|
| `--from <date>` | Start date in ISO format (e.g., `2026-01-01`) |
| `--to <date>` | End date in ISO format (e.g., `2026-01-31`) |
| `--json` | Output as JSON |

**Examples:**

```bash
# View metrics for the default period
skytells orchestrator metrics

# View metrics for January 2026
skytells orchestrator metrics --from 2026-01-01 --to 2026-01-31

# JSON output
skytells orchestrator metrics --json
```

## Usage Statistics

```bash
skytells orchestrator usage
```

Shows resource usage statistics for the orchestrator, including compute time, execution counts, and resource consumption.

| Option | Description |
|--------|-------------|
| `--from <date>` | Start date in ISO format |
| `--to <date>` | End date in ISO format |
| `--json` | Output as JSON |

**Examples:**

```bash
# View usage for the default period
skytells orchestrator usage

# View usage for a specific month
skytells orchestrator usage --from 2026-03-01 --to 2026-03-31
```

## Common Workflows

### Monitor a Workflow

```bash
# Check orchestrator health
skytells orchestrator overview

# List recent executions for a workflow
skytells orchestrator executions --workflow wf-001 --limit 5

# Inspect a specific execution
skytells orchestrator inspect ex-005
```

### Analyze Failures

```bash
# Find failed executions
skytells orchestrator executions --status failed --limit 10

# Inspect the failed execution for details
skytells orchestrator inspect <execution-id>

# Check overall metrics
skytells orchestrator metrics --from 2026-04-01 --to 2026-04-13
```

### Generate Usage Reports

```bash
# Get monthly usage as JSON for reporting
skytells orchestrator usage --from 2026-03-01 --to 2026-03-31 --json

# Get metrics for the same period
skytells orchestrator metrics --from 2026-03-01 --to 2026-03-31 --json
```
