# Cloud Infrastructure

The Skytells CLI allows you to deploy and manage cloud compute instances — from general-purpose VMs to high-performance GPU instances powered by NVIDIA H100 and A100 accelerators. Skytells operates a globally distributed GPU infrastructure designed for AI/ML workloads, inference, and large-scale compute.

> Explore available infrastructure and regions at [skytells.ai/infrastructure](https://skytells.ai/infrastructure).
>
> For edge computing and low-latency deployments, see [skytells.ai/edge](https://skytells.ai/edge).

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## List Instances

```bash
skytells cloud ls
```

Lists all cloud instances in the linked project.

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example output:**

```
┌──────────┬──────────────┬──────────┬──────────┬───────────┐
│ ID       │ Label        │ Region   │ Status   │ IP        │
├──────────┼──────────────┼──────────┼──────────┼───────────┤
│ inst-001 │ web-server   │ ewr      │ active   │ 1.2.3.4   │
│ inst-002 │ db-server    │ lax      │ active   │ 5.6.7.8   │
└──────────┴──────────────┴──────────┴──────────┴───────────┘
```

## Deploy an Instance

```bash
skytells cloud deploy
```

Deploys a new cloud compute instance. Provide configuration via options.

| Option | Description |
|--------|-------------|
| `--region <region>` | Deployment region (e.g., `ewr`, `lax`, `fra`) |
| `--plan <plan>` | Instance plan/size (e.g., `vc2-1c-1gb`) |
| `--os <id>` | Operating system ID |
| `--label <label>` | Human-readable label for the instance |
| `--hostname <name>` | Hostname for the instance |
| `--tags <tags>` | Comma-separated tags |
| `--firewall-group <id>` | Firewall group to apply |
| `--vpc <id>` | VPC to attach the instance to |
| `--ipv6` | Enable IPv6 networking |
| `--json` | Output as JSON |

**Examples:**

```bash
# Deploy a basic instance
skytells cloud deploy \
  --region ewr \
  --plan vc2-1c-1gb \
  --os 387 \
  --label "web-server"

# Deploy with full configuration
skytells cloud deploy \
  --region fra \
  --plan vc2-2c-4gb \
  --os 387 \
  --label "production-api" \
  --hostname "prod-api-01" \
  --tags "production,api" \
  --firewall-group fw-001 \
  --vpc vpc-001 \
  --ipv6

# Deploy and get JSON response
skytells cloud deploy --region ewr --plan vc2-1c-1gb --os 387 --json
```

## Deploying GPU Instances

Skytells provides access to high-performance NVIDIA GPU instances across its global infrastructure. GPU instances are ideal for AI/ML training, fine-tuning, inference, and compute-intensive workloads.

> Browse all available GPU plans, regions, and pricing at [skytells.ai/infrastructure](https://skytells.ai/infrastructure).

### Deploy an NVIDIA H100 Instance

The NVIDIA H100 Tensor Core GPU is designed for large-scale AI training, generative AI, and high-performance inference.

```bash
# Deploy a single H100 GPU instance
skytells cloud deploy \
  --region ewr \
  --plan gpu-h100-1 \
  --os 387 \
  --label "h100-training" \
  --hostname "h100-train-01" \
  --tags "gpu,training,h100"

# Deploy a multi-GPU H100 instance (8x H100 80GB)
skytells cloud deploy \
  --region fra \
  --plan gpu-h100-8 \
  --os 387 \
  --label "h100-cluster" \
  --hostname "h100-cluster-01" \
  --tags "gpu,training,h100,multi-gpu" \
  --vpc vpc-ml \
  --ipv6
```

### Deploy an NVIDIA A100 Instance

The NVIDIA A100 Tensor Core GPU delivers versatile performance for AI training, inference, and data analytics workloads.

```bash
# Deploy a single A100 GPU instance
skytells cloud deploy \
  --region lax \
  --plan gpu-a100-1 \
  --os 387 \
  --label "a100-inference" \
  --hostname "a100-infer-01" \
  --tags "gpu,inference,a100"

# Deploy a multi-GPU A100 instance (4x A100 80GB)
skytells cloud deploy \
  --region ewr \
  --plan gpu-a100-4 \
  --os 387 \
  --label "a100-training" \
  --hostname "a100-train-01" \
  --tags "gpu,training,a100,multi-gpu" \
  --firewall-group fw-ml \
  --ipv6
```

### GPU Instance Workflow

A typical workflow for provisioning and using a GPU instance:

```bash
# 1. Deploy the GPU instance
skytells cloud deploy \
  --region ewr \
  --plan gpu-h100-1 \
  --os 387 \
  --label "ml-workload" \
  --tags "gpu,ml"

# 2. Verify it's running
skytells cloud ls

# 3. Get the instance IP and details
skytells cloud inspect <instance-id>

# 4. SSH into the instance and start your workload
ssh root@<instance-ip>

# 5. When finished, halt to stop billing
skytells cloud halt <instance-id>

# 6. Or destroy when no longer needed
skytells cloud destroy <instance-id>
```

### GPU Best Practices

1. **Choose the right GPU** — Use H100 for large-scale training and generative AI; use A100 for inference and mixed workloads
2. **Select the closest region** — Minimize latency by deploying in a region near your data or users. See [skytells.ai/infrastructure](https://skytells.ai/infrastructure) for all available regions
3. **Use VPCs for multi-node training** — Attach GPU instances to a VPC for high-bandwidth, private networking between nodes
4. **Halt when idle** — Halt GPU instances when not actively running workloads to optimize costs
5. **Tag your instances** — Use tags to organize and track GPU spending across teams and projects
6. **Consider edge deployment** — For low-latency inference at the edge, explore [skytells.ai/edge](https://skytells.ai/edge)

## Inspect an Instance

```bash
skytells cloud inspect <id>
```

Shows detailed information about a cloud instance, including IP addresses, configuration, and status.

| Argument | Description |
|----------|-------------|
| `id` | Instance ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example:**

```bash
skytells cloud inspect inst-001
```

## Destroy an Instance

```bash
skytells cloud destroy <id>
```

Permanently destroys a cloud instance. **This action cannot be undone. All data on the instance will be lost.**

| Argument | Description |
|----------|-------------|
| `id` | Instance ID |

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |
| `--json` | Output as JSON |

**Examples:**

```bash
# Destroy with confirmation
skytells cloud destroy inst-001

# Destroy without confirmation
skytells cloud destroy inst-001 --force
```

## Lifecycle Control

All lifecycle commands accept `--force` and `--json` options.

### Start an Instance

```bash
skytells cloud start <id>
```

Starts a halted instance.

### Halt an Instance

```bash
skytells cloud halt <id>
```

Halts (stops) a running instance. The instance remains provisioned but is not running.

### Reboot an Instance

```bash
skytells cloud reboot <id>
```

Reboots a running instance.

**Examples:**

```bash
# Start a halted instance
skytells cloud start inst-001

# Halt an instance
skytells cloud halt inst-001 --force

# Reboot an instance
skytells cloud reboot inst-001
```

## Common Workflows

### Provision a Production Server

```bash
# Deploy the instance
skytells cloud deploy \
  --region ewr \
  --plan vc2-4c-8gb \
  --os 387 \
  --label "production-server" \
  --hostname "prod-01" \
  --tags "production" \
  --firewall-group fw-prod \
  --ipv6

# Verify it's running
skytells cloud ls

# Get full details (including IP address)
skytells cloud inspect <instance-id>
```

### Maintenance Reboot

```bash
# Reboot the instance
skytells cloud reboot inst-001

# Verify it's back online
skytells cloud inspect inst-001
```
