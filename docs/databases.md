# Databases

The Skytells CLI supports provisioning and managing databases directly from your terminal. Supported database engines include PostgreSQL, MySQL, MariaDB, MongoDB, and Redis.

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## Supported Engines

| Type | Engine |
|------|--------|
| `postgres` | PostgreSQL |
| `mysql` | MySQL |
| `mariadb` | MariaDB |
| `mongo` | MongoDB |
| `redis` | Redis |

## List Databases

```bash
skytells databases ls
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example output:**

```
┌──────────┬──────────────┬──────────┬──────────┬──────────────────┐
│ ID       │ Name         │ Type     │ Status   │ Created          │
├──────────┼──────────────┼──────────┼──────────┼──────────────────┤
│ db-001   │ main-db      │ postgres │ running  │ 2026-01-20       │
│ db-002   │ cache        │ redis    │ running  │ 2026-02-05       │
└──────────┴──────────────┴──────────┴──────────┴──────────────────┘
```

## Create a Database

```bash
skytells databases add <name> <type>
```

| Argument | Description |
|----------|-------------|
| `name` | Database name |
| `type` | Engine type: `postgres`, `mysql`, `mariadb`, `mongo`, `redis` |

| Option | Description |
|--------|-------------|
| `--docker-image <image>` | Custom Docker image for the database engine |
| `--description <desc>` | Human-readable description |
| `--password <pass>` | Database password |
| `--db-name <name>` | Database name within the engine |
| `--db-user <user>` | Database user |
| `--json` | Output as JSON |

**Examples:**

```bash
# Create a PostgreSQL database
skytells databases add production-db postgres

# Create with full configuration
skytells databases add production-db postgres \
  --description "Main production database" \
  --password "secure-password" \
  --db-name app_production \
  --db-user app_user

# Create a Redis cache
skytells databases add session-cache redis

# Create a MongoDB instance
skytells databases add analytics mongo --description "Analytics data store"
```

## Inspect a Database

```bash
skytells databases inspect <id>
```

Displays detailed information about a database including connection details, configuration, and status.

| Argument | Description |
|----------|-------------|
| `id` | Database ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example:**

```bash
skytells databases inspect db-001
```

## Update Database Settings

```bash
skytells databases set <id> <field> <value>
```

| Argument | Description |
|----------|-------------|
| `id` | Database ID |
| `field` | Setting to update |
| `value` | New value |

**Allowed fields:**

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Database name | `"renamed-db"` |
| `description` | Description | `"Updated description"` |
| `backup_enabled` | Enable/disable backups | `true`, `false` |
| `backup_schedule` | Cron schedule for backups | `"0 2 * * *"` |
| `external_port` | External access port | `5432` |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Examples:**

```bash
# Rename a database
skytells databases set db-001 name "new-name"

# Enable backups
skytells databases set db-001 backup_enabled true

# Set backup schedule (daily at 2 AM)
skytells databases set db-001 backup_schedule "0 2 * * *"

# Set external port
skytells databases set db-001 external_port 5432
```

## Delete a Database

```bash
skytells databases rm <id>
```

Permanently deletes a database. **This action is destructive and cannot be undone. All data will be lost.**

| Argument | Description |
|----------|-------------|
| `id` | Database ID |

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |
| `--json` | Output as JSON |

**Examples:**

```bash
# Delete with confirmation prompt
skytells databases rm db-001

# Delete without confirmation
skytells databases rm db-001 --force
```

## Database Lifecycle Control

### Start a Database

```bash
skytells databases start <id>
```

Starts a stopped database instance.

### Stop a Database

```bash
skytells databases stop <id>
```

Stops a running database. You will be prompted for confirmation unless `--force` is used.

### Deploy a Database

```bash
skytells databases deploy <id>
```

Deploys the database (applies configuration and starts).

All control commands accept `--force` and `--json` options.

**Examples:**

```bash
# Start a database
skytells databases start db-001

# Stop without confirmation
skytells databases stop db-001 --force

# Deploy a database
skytells databases deploy db-001
```

## Common Workflows

### Set Up a Production Database

```bash
# Create the database
skytells databases add prod-db postgres \
  --description "Production PostgreSQL" \
  --db-name myapp_production \
  --db-user myapp \
  --password "$(openssl rand -base64 32)"

# Enable automated backups
skytells databases set <db-id> backup_enabled true
skytells databases set <db-id> backup_schedule "0 3 * * *"

# Deploy
skytells databases deploy <db-id>

# Set the connection string as an env variable for your app
skytells env set --app <app-id> DATABASE_URL=postgres://myapp:password@host:5432/myapp_production
```
