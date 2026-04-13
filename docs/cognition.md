# Cognition

Cognition is Skytells' observability and monitoring suite. It provides error tracking, security event detection, anomaly detection, runtime performance monitoring, and real-time event streaming.

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## Overview

```bash
skytells cognition overview
```

Displays a high-level overview of application health, including error counts, security events, anomalies, and performance summaries.

| Option | Description |
|--------|-------------|
| `--project <id>` | Specify a project ID (optional if access key is linked) |
| `--hours <n>` | Time window in hours (e.g., `24` for the last 24 hours) |
| `--json` | Output as JSON |

**Examples:**

```bash
# Overview for the last 24 hours
skytells cognition overview --hours 24

# Overview for a specific project
skytells cognition overview --project proj-001

# JSON output
skytells cognition overview --json
```

## Error Tracking

```bash
skytells cognition errors
```

Lists application errors with details.

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of errors to display |
| `--offset <n>` | Number of errors to skip (pagination) |
| `--json` | Output as JSON |

**Examples:**

```bash
# List recent errors
skytells cognition errors

# Paginate through errors
skytells cognition errors --limit 20 --offset 0

# Get errors as JSON
skytells cognition errors --json
```

## Security Events

```bash
skytells cognition security
```

Lists security events and alerts detected across your applications.

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of events |
| `--offset <n>` | Pagination offset |
| `--json` | Output as JSON |

**Examples:**

```bash
# List security events
skytells cognition security

# Get security events as JSON
skytells cognition security --json
```

## Runtime Snapshots

```bash
skytells cognition runtime
```

View runtime performance snapshots including CPU usage, memory consumption, and request latency.

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of snapshots |
| `--offset <n>` | Pagination offset |
| `--json` | Output as JSON |

**Examples:**

```bash
# View runtime snapshots
skytells cognition runtime

# Paginate results
skytells cognition runtime --limit 10 --offset 0
```

## Anomaly Detection

```bash
skytells cognition anomalies
```

Lists detected anomalies in your application behavior, such as unusual traffic patterns, error spikes, or performance degradation.

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of anomalies |
| `--offset <n>` | Pagination offset |
| `--json` | Output as JSON |

**Examples:**

```bash
# List anomalies
skytells cognition anomalies

# JSON output for automation
skytells cognition anomalies --json
```

## Events

```bash
skytells cognition events
```

Lists real-time events with support for incremental polling. Use the `--since` flag to fetch only events that occurred after a specific event ID.

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--limit <n>` | Maximum number of events |
| `--since <id>` | Fetch events after this event ID (for polling) |
| `--json` | Output as JSON |

**Examples:**

```bash
# List recent events
skytells cognition events

# Poll for new events since a specific event
skytells cognition events --since evt-100

# Limit results
skytells cognition events --limit 50
```

### Polling Pattern

For continuous monitoring, you can poll for new events:

```bash
# Get the latest events and note the last event ID
skytells cognition events --limit 10 --json

# Later, fetch only new events
skytells cognition events --since <last-event-id> --json
```

## Time-Series Metrics

```bash
skytells cognition timeseries
```

View time-series metrics data, including request rates, error rates, and latency percentiles over time.

| Option | Description |
|--------|-------------|
| `--project <id>` | Project ID |
| `--hours <n>` | Time window in hours |
| `--json` | Output as JSON |

**Examples:**

```bash
# View metrics for the last 24 hours
skytells cognition timeseries --hours 24

# View metrics for the last week
skytells cognition timeseries --hours 168

# JSON output
skytells cognition timeseries --json
```

## Common Workflows

### Daily Health Check

```bash
# Get the overview for the last 24 hours
skytells cognition overview --hours 24

# Check for any errors
skytells cognition errors --limit 10

# Look for security events
skytells cognition security --limit 10

# Check for anomalies
skytells cognition anomalies
```

### Incident Investigation

```bash
# 1. Start with the overview
skytells cognition overview --hours 6

# 2. Check recent errors for root cause
skytells cognition errors --limit 20

# 3. Check security events
skytells cognition security

# 4. Review runtime performance
skytells cognition runtime

# 5. Look at time-series for patterns
skytells cognition timeseries --hours 6

# 6. Stream real-time events
skytells cognition events --limit 50
```

### Automated Monitoring Script

```bash
#!/bin/bash
# Check for new errors every 5 minutes
LAST_EVENT=""
while true; do
  if [ -z "$LAST_EVENT" ]; then
    RESULT=$(skytells cognition events --limit 1 --json)
  else
    RESULT=$(skytells cognition events --since "$LAST_EVENT" --json)
  fi
  echo "$RESULT"
  # Parse the last event ID for the next poll
  LAST_EVENT=$(echo "$RESULT" | jq -r '.[-1].id // empty')
  sleep 300
done
```
