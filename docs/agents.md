# Cloud Agents

The `agents` command group lets you create, manage, and run Cloud Agents — autonomous AI agents that can review pull requests, execute instructions, and investigate issues in your repositories.

> **Requirements**
>
> - PAT must include the `cli` scope.
> - Accounts with outstanding dues receive `402 Payment Required`.
> - Some agent types require a plan feature gate (`403` if unavailable).

---

## Commands

### `skytells agents ls`

List all Cloud Agents owned by the authenticated user.

```
skytells agents ls [--json]
```

| Option | Description |
|--------|-------------|
| `--json` | Output raw JSON |

---

### `skytells agents add`

Create a new Cloud Agent.

```
skytells agents add \
  --name "My Reviewer" \
  --description "Reviews PRs in the monorepo" \
  --type review \
  [--model gpt-4o] \
  [--capabilities "code-review,security"] \
  [--repos "org/repo-a,org/repo-b"] \
  [--inactive] \
  [--json]
```

| Option | Required | Description |
|--------|----------|-------------|
| `--name <name>` | ✅ | Agent name (1–100 chars) |
| `--description <desc>` | ✅ | Agent description (1–500 chars) |
| `--type <type>` | ✅ | One of: `review`, `execute`, `hybrid`, `custom` |
| `--model <model_id>` | — | Model to use (e.g. `gpt-4o`) |
| `--capabilities <tags>` | — | Comma-separated capability tags |
| `--repos <repos>` | — | Comma-separated repo bindings (`owner/repo`; max 50) |
| `--inactive` | — | Create agent in inactive state (default: active) |
| `--json` | — | Output raw JSON |

**Agent type compatibility with run types:**

| Agent Type | Allowed Run Types |
|------------|-------------------|
| `review` | `review`, `investigate` |
| `execute` | `execute` |
| `hybrid` | `review`, `execute`, `investigate` |
| `custom` | `review`, `execute`, `investigate` |

---

### `skytells agents inspect <id>`

Show full details of a Cloud Agent.

```
skytells agents inspect <agent-uuid> [--json]
```

---

### `skytells agents set <id>`

Update an existing Cloud Agent. All fields are optional; only supplied fields are changed.

```
skytells agents set <agent-uuid> \
  [--name "New Name"] \
  [--description "New description"] \
  [--type hybrid] \
  [--model gpt-4o-mini] \
  [--capabilities "review,execute"] \
  [--repos "org/repo-a,org/repo-b"] \
  [--active | --inactive] \
  [--json]
```

> **Note:** System agents cannot be modified. Changing `type` to one requiring a plan feature gate is rejected if the plan does not include it.

---

### `skytells agents rm <id>`

Delete a Cloud Agent. Associated runs are preserved with their `agent_id` set to null.

```
skytells agents rm <agent-uuid> [-f] 
```

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |

---

## Repository Bindings

### `skytells agents repos ls <agent-id>`

List the current repository bindings for an agent.

```
skytells agents repos ls <agent-uuid> [--json]
```

**Response:**

```
┌───────────────────┐
│ Repository        │
├───────────────────┤
│ org/repo-a        │
│ org/repo-b        │
└───────────────────┘
```

---

### `skytells agents repos add <agent-id> <repos...>`

Add one or more repositories to an agent's binding list. Duplicates are ignored automatically.

```
skytells agents repos add <agent-uuid> org/repo-c org/repo-d [--json]
```

> The total number of bound repos must not exceed 50.

---

### `skytells agents repos rm <agent-id> <repo>`

Remove a repository from an agent's binding list.

```
skytells agents repos rm <agent-uuid> org/repo-c [--json]
```

---

## Runs

### `skytells agents runs ls`

List runs across all agents, or filter by a specific agent.

```
skytells agents runs ls \
  [--agent <agent-uuid>] \
  [--status <status>] \
  [--run-type <type>] \
  [--trigger <source>] \
  [--page <n>] \
  [--per-page <n>] \
  [--json]
```

| Option | Description |
|--------|-------------|
| `--agent <id>` | Filter to a specific agent (UUID) |
| `--status <status>` | One of: `queued`, `running`, `awaiting_approval`, `approved`, `completed`, `failed`, `cancelled` |
| `--run-type <type>` | One of: `review`, `execute`, `investigate` |
| `--trigger <source>` | One of: `github`, `console`, `slack`, `chat` (cross-agent only) |
| `--page <n>` | Page number (default: 1) |
| `--per-page <n>` | Results per page, max 100 (default: 20) |
| `--json` | Output raw JSON including pagination metadata |

---

### `skytells agents runs inspect <run-id>`

Show full details of a single run, including token usage, result summary, and error information.

```
skytells agents runs inspect <run-uuid> [--json]
```

---

### `skytells agents runs run <agent-id>`

Create and enqueue a new run for a Cloud Agent.

```
skytells agents runs run <agent-uuid> \
  --type review \
  --repo org/repo \
  --pr 42 \
  [--branch main] \
  [--json]

skytells agents runs run <agent-uuid> \
  --type execute \
  --repo org/repo \
  --prompt "Refactor the authentication module to use JWT" \
  [--branch feature/auth] \
  [--json]
```

| Option | Required | Description |
|--------|----------|-------------|
| `--type <run_type>` | ✅ | One of: `review`, `execute`, `investigate` |
| `--repo <repo>` | ✅ | Repository in `owner/repo` format |
| `--branch <branch>` | — | Target branch |
| `--pr <number>` | ✅ for `review`/`investigate` | Pull request number |
| `--prompt <text>` | ✅ for `execute` | Instruction prompt (1–4000 chars) |
| `--json` | — | Output raw JSON |

**Billing gates (checked in order):**

1. Daily run cap
2. Monthly review limit (for `review` and `investigate`)
3. Monthly execute limit (for `execute`)

**Errors:**

| Status | Reason |
|--------|---------|
| `402` | Account suspended or payment outstanding |
| `403` | Agent is inactive |
| `422` | Validation error (missing `--pr`, incompatible run type, etc.) |
| `429` | Daily or monthly run limit reached — upgrade your plan |

---

## Examples

```bash
# Create a review agent bound to a monorepo
skytells agents add \
  --name "PR Reviewer" \
  --description "Automatically reviews all pull requests" \
  --type review \
  --model gpt-4o \
  --repos "acme/monorepo"

# List agents as JSON
skytells agents ls --json

# Add another repo to an agent
skytells agents repos add 550e8400-e29b-41d4-a716-446655440000 acme/frontend

# Kick off a review run
skytells agents runs run 550e8400-e29b-41d4-a716-446655440000 \
  --type review \
  --repo acme/monorepo \
  --pr 123

# Watch the latest runs
skytells agents runs ls --agent 550e8400-e29b-41d4-a716-446655440000 --status running

# Inspect a completed run
skytells agents runs inspect 7c9e6679-7425-40de-944b-e07fc1f90ae7
```
