# Projects

Projects are the top-level organizational unit in Skytells. Every app, database, deployment, and resource belongs to a project.

## Overview

The CLI provides two levels of project commands:

- **`skytells projects`** — User-level project management (list and create projects). Requires user authentication.
- **`skytells project`** — Access a specific linked project (view and update settings). Requires an access key.

## List All Projects

```bash
skytells projects ls
```

Lists all projects you have access to.

**Options:**

| Option | Description |
|--------|-------------|
| `--type <type>` | Filter projects by type |
| `--json` | Output as JSON |

**Examples:**

```bash
# List all projects
skytells projects ls

# Filter by type
skytells projects ls --type production

# JSON output for scripting
skytells projects ls --json
```

**Example output:**

```
┌──────────┬──────────────┬────────────┬──────────────────┐
│ ID       │ Name         │ Type       │ Created          │
├──────────┼──────────────┼────────────┼──────────────────┤
│ abc123   │ my-project   │ production │ 2026-01-15       │
│ def456   │ staging      │ staging    │ 2026-02-01       │
└──────────┴──────────────┴────────────┴──────────────────┘
```

## Create a Project

```bash
skytells projects add <name>
```

Creates a new project with the given name.

| Argument | Description |
|----------|-------------|
| `name` | The name for the new project |

**Options:**

| Option | Description |
|--------|-------------|
| `--type <type>` | Project type |
| `--json` | Output as JSON |

**Examples:**

```bash
# Create a project
skytells projects add my-new-project

# Create with a specific type
skytells projects add staging-env --type staging
```

After creating a project, you can find the access key in your project settings at [console.skytells.ai](https://console.skytells.ai).

You can also create projects through the web console at [console.skytells.ai/projects/new](https://console.skytells.ai/projects/new).

## View Linked Project

```bash
skytells project
```

Displays detailed information about the currently linked project. This command requires an access key to be linked (see [Authentication](authentication.md)).

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example output:**

```
Project: my-project
  ID:           abc123
  Type:         production
  Network Mode: public
  Description:  My production project
  Created:      2026-01-15
```

## Update Project Settings

```bash
skytells project set <field> <value>
```

Updates a setting on the linked project.

| Argument | Description |
|----------|-------------|
| `field` | The field to update |
| `value` | The new value |

**Allowed fields:**

| Field | Description | Example Values |
|-------|-------------|----------------|
| `name` | Project name | `"My Project"` |
| `description` | Project description | `"Production environment"` |
| `network_mode` | Network access mode | `public`, `private` |

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Examples:**

```bash
# Rename a project
skytells project set name "My Renamed Project"

# Update description
skytells project set description "Updated description for the project"

# Change network mode
skytells project set network_mode private
```

## Linking a Project

To work with a specific project, link its access key:

```bash
skytells link sk_proj_your_access_key
```

This stores the access key locally and all subsequent project-scoped commands will operate on this project. See [Authentication](authentication.md) for details.
