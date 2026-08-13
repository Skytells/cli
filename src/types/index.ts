import type { Scope } from "../lib/constants.js";

// ── Device Flow ──────────────────────────────────────────────

export interface DeviceFlowRequest {
  client_name: string;
  scopes: Scope[];
}

export interface DeviceFlowResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

export interface TokenPollRequest {
  device_code: string;
  grant_type: string;
}

export interface TokenPollSuccess {
  access_token: string;
  token_type: string;
  scopes: Scope[];
}

// ── API Response Envelopes ───────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface ApiError {
  error: string;
  limit_type?: string;
}

// ── Credentials ──────────────────────────────────────────────

export interface Credentials {
  token?: string;
  access_key?: string;
  api_key?: string;
  created_at: number;
}

// ── Projects ─────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  network_mode?: string;
  status: string;
  settings?: Record<string, unknown>;
  owner_id?: string;
  server_id?: string;
  created_at: string;
  updated_at: string;
}

// ── Apps ─────────────────────────────────────────────────────

export interface App {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  app_type: string;
  build_type?: string;
  status?: string;
  unified_status?: string;
  docker_image?: string;
  repository_url?: string;
  branch?: string;
  build_command?: string;
  install_command?: string;
  framework?: string;
  output_dir?: string;
  root_dir?: string;
  created_at: string;
  updated_at: string;
}

// ── Deployments ──────────────────────────────────────────────

export interface Deployment {
  id: string;
  project_id: string;
  app_id?: string;
  user_id?: string;
  status: string;
  trigger?: string;
  commit_sha?: string;
  commit_message?: string;
  branch?: string;
  build_duration_ms?: number;
  created_at: string;
  updated_at?: string;
}

export interface DropDeployment {
  drop_id: string;
  drop_slug: string;
  domain_url: string;
  deployment_id: string;
  status: string;
}

// ── Databases ────────────────────────────────────────────────

export interface Database {
  id: string;
  project_id: string;
  name: string;
  type: string;
  description?: string;
  status?: string;
  external_port?: number | null;
  backup_enabled?: boolean;
  backup_schedule?: string;
  docker_image?: string;
  created_at: string;
  updated_at?: string;
}

// ── Domains ──────────────────────────────────────────────────

export interface Domain {
  id: string;
  project_id: string;
  app_id?: string;
  domain: string;
  created_at?: string;
}

// ── Members ──────────────────────────────────────────────────

export interface Member {
  user_id: string;
  project_id: string;
  role: string;
  email?: string;
  name?: string;
  joined_at?: string;
}

// ── Status ───────────────────────────────────────────────────

export interface StatusOverview {
  project: Record<string, unknown>;
  apps?: Record<string, unknown>[];
  [key: string]: unknown;
}

// ── Cloud Instances ──────────────────────────────────────────

export interface Instance {
  id: string;
  region: string;
  plan: string;
  status: string;
  label?: string;
  hostname?: string;
  os?: string;
  main_ip?: string;
  vcpu_count?: number;
  ram?: number;
  disk?: number;
  tags?: string[];
  created_at?: string;
}

// ── Control Actions ──────────────────────────────────────────

export interface ControlResponse {
  status: string;
  action: string;
  deployment_id?: string;
}

export interface DeleteResponse {
  id: string;
  deleted: boolean;
}

// ── Predictions ──────────────────────────────────────────────

export interface Prediction {
  id: string;
  status: string;
  stream?: boolean;
  type?: string;
  model?: string | { name: string; type?: string };
  input?: Record<string, unknown>;
  output?: string[] | string | null;
  error?: string | null;
  privacy?: string;
  source?: string;
  webhook?: { url?: string | null; events?: string[] };
  metrics?: Record<string, number>;
  metadata?: Record<string, unknown>;
  urls?: Record<string, string>;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface PredictionCreateRequest {
  model: string;
  input: Record<string, unknown>;
  webhook?: string;
}

export interface Model {
  name: string;
  description?: string;
  namespace: string;
  type: string;
  privacy?: string;
  img_url?: string | null;
  vendor?: {
    name?: string;
    verified?: boolean;
    slug?: string;
    [key: string]: unknown;
  };
  billable?: boolean;
  pricing?: {
    amount?: number;
    currency?: string;
    unit?: string;
    [key: string]: unknown;
  };
  capabilities?: string[];
  metadata?: Record<string, unknown>;
  status: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── Orchestrator ─────────────────────────────────────────────

export interface Workflow {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface OrchestratorOverview {
  stats: {
    workflowCount: number;
    executionCount30d: number;
    apiKeyCount: number;
    integrationCount: number;
    isRegistered: boolean;
  };
  recentExecutions: unknown[];
}

export interface Execution {
  id: string;
  status: string;
  [key: string]: unknown;
}

export interface ExecutionDetail {
  execution: Execution;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  nodeId: string;
  status: string;
  input?: string;
  output?: string;
}

export interface ExecutionMetrics {
  total: number;
  success: number;
  error: number;
  pending: number;
  running: number;
  avgDurationMs: number;
}

export interface OrchestratorUsage {
  totalExecutions: number;
  successRate: number;
  dailyTrend: { date: string; count: number; success: number; error: number }[];
  byWorkflow: { workflowId: string; workflowName: string; executionCount: number }[];
}

// ── Cognition ────────────────────────────────────────────────

export interface CognitionOverview {
  [key: string]: unknown;
}

export interface CognitionEvent {
  id?: string;
  [key: string]: unknown;
}

export interface CognitionTimeseries {
  [key: string]: unknown;
}

// ── Cloud Agents ──────────────────────────────────────────────

export type AgentType = "review" | "execute" | "hybrid" | "custom";
export type RunType = "review" | "execute" | "investigate";
export type RunStatus =
  | "queued"
  | "running"
  | "awaiting_approval"
  | "approved"
  | "completed"
  | "failed"
  | "cancelled";

export interface PinnedPrompt {
  id: string;
  label: string;
  content: string;
  run_type?: RunType;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string;
  type: AgentType;
  is_active: boolean;
  is_system?: boolean;
  capabilities: string[];
  config: Record<string, unknown>;
  pinned_prompts: PinnedPrompt[];
  repo_binding: string[];
  trigger_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  id: string;
  run_type: RunType;
  status: RunStatus;
  trigger_source: string;
  repo_full_name: string;
  branch: string | null;
  pr_number: number | null;
  commit_sha: string | null;
  result_summary: string | null;
  tokens_input: number;
  tokens_output: number;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface AgentRunEnvelope {
  data: AgentRun[];
  meta: { page: number; total: number; per_page: number };
}

export interface AgentCreateRequest {
  name: string;
  description: string;
  type: AgentType;
  capabilities?: string[];
  config?: Record<string, unknown>;
  pinned_prompts?: PinnedPrompt[];
  repo_binding?: string[];
  trigger_config?: Record<string, unknown>;
  is_active?: boolean;
}

export interface AgentUpdateRequest {
  name?: string;
  description?: string;
  type?: AgentType;
  capabilities?: string[];
  config?: Record<string, unknown>;
  pinned_prompts?: PinnedPrompt[];
  repo_binding?: string[];
  trigger_config?: Record<string, unknown>;
  is_active?: boolean;
}

export interface AgentRunCreateRequest {
  run_type: RunType;
  repo_full_name: string;
  branch?: string;
  pr_number?: number;
  prompt?: string;
  instruction?: string;
}
