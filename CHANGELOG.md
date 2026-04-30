# Changelog

All notable changes to the Skytells CLI will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] — 2026-04-30

### Added

#### Cloud Agents (`skytells agents`)
- **`skytells agents ls`** — List all Cloud Agents owned by the authenticated user.
- **`skytells agents add`** — Create a new Cloud Agent with name, description, type, model, capabilities, and repo bindings.
- **`skytells agents inspect <id>`** — View full details of an agent including config, pinned prompts, and repo bindings.
- **`skytells agents set <id>`** — Update any field on an existing agent.
- **`skytells agents rm <id>`** — Delete an agent (runs are preserved).

#### Agent Repository Bindings (`skytells agents repos`)
- **`skytells agents repos ls <agent-id>`** — List all repositories bound to an agent.
- **`skytells agents repos add <agent-id> <repos...>`** — Add one or more repositories to an agent.
- **`skytells agents repos rm <agent-id> <repo>`** — Remove a repository from an agent.

#### Agent Runs (`skytells agents runs`)
- **`skytells agents runs ls`** — List runs across all agents with filtering by status, run type, trigger source, and agent.
- **`skytells agents runs inspect <run-id>`** — Show full run details: token usage, result summary, error codes, and timing.
- **`skytells agents runs run <agent-id>`** — Enqueue a new `review`, `execute`, or `investigate` run for an agent.

### Improved

#### Error Handling
- Added `422 Unprocessable Entity` handling with full `details` field forwarding.
- Added `429 Too Many Requests` handling with upgrade hint for run limit exhaustion.
- API error responses now also read the `message` field alongside `error` for richer messages.

---

## [1.0.0] — 2026-04-13

### Initial Release

The first stable release of the Skytells CLI. A full-featured command-line interface for managing the entire Skytells platform from your terminal.

#### Authentication
- Device flow (OAuth 2.0) browser-based authentication
- Personal access token authentication
- Project-scoped access key linking
- Secure credential storage (`~/.config/skytells/credentials.json`)

#### Project Management
- List all projects
- Create new projects
- View and update project settings (name, description, network mode)

#### App Management
- List, create, inspect, update, and delete apps
- Start, stop, restart, and redeploy apps
- Trigger deployments by app ID or slug
- View deployment history with pagination

#### Database Management
- Create and manage databases (PostgreSQL, MySQL, MariaDB, MongoDB, Redis)
- Start, stop, and deploy database instances
- Configure backups, external ports, and database settings

#### Environment Variables
- List environment variables at project and app level
- Set one or more variables in a single command (`KEY=value` format)

#### Domain Management
- Add, list, and remove custom domains
- Associate domains with specific apps

#### Team Management
- List project team members and roles

#### Status & Logs
- View project and app status overviews
- Stream real-time container and deployment logs via SSE
- Filter logs by type, deployment, and tail count

#### Cloud Infrastructure
- Deploy, list, inspect, and destroy cloud instances
- Start, halt, and reboot instances
- Configure regions, plans, OS, networking, firewalls, and VPCs

#### Orchestrator
- List workflows
- View orchestrator overview
- List, inspect, and filter workflow executions
- View execution metrics and resource usage statistics

#### Cognition (Observability)
- View application health overview
- Track errors, security events, and anomalies
- Monitor runtime performance snapshots
- Stream real-time events with polling support
- Analyze time-series metrics

#### Developer Experience
- JSON output on all commands (`--json`)
- Interactive confirmation prompts for destructive operations
- Bypass prompts with `--force` flag
- Colorized terminal output with tables and spinners
- Environment variable overrides for all configuration

[1.0.1]: https://github.com/skytells/cli/releases/tag/v1.0.1
[1.0.0]: https://github.com/skytells/cli/releases/tag/v1.0.0
