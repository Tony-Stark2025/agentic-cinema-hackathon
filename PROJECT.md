# Project: Showrunner — Autonomous Studio Operations & Observability Copilot

## Architecture

Showrunner is an enterprise-grade autonomous Studio Operations & Observability Copilot running on Google Cloud Run. It integrates live Grafana Cloud telemetry with a multi-worker background media processing engine and a distributed pool of Gemini 3.x Flash agents.

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │               Studio Operations Frontend               │
                                  │   (Next.js App Router, Tailwind, Lucide, Glass UI)     │
                                  └───────────────┬────────────────────────┬───────────────┘
                                                  │                        │
                                  HTTP / SSE REST │                        │ React Query & SSE
                                                  ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Showrunner Core Engine (Cloud Run)                                     │
│                                                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ Gemini 3.x Multi-Agent Crew  │  │   Live Grafana MCP Client    │  │ Active Media Processing Engine │  │
│  │ - Sentinel (3.5-flash-lite)  │  │ - @modelcontextprotocol/sdk  │  │ - 16-Worker Render Cluster     │  │
│  │ - Diagnostician (3.7-flash)  │◄─┼─► Direct REST Driver         │◄─┼─► Real FFmpeg / Matrix Worker  │  │
│  │ - Remediation (3.6-flash)    │  │   - Mimir (PromQL)           │  │ - OpenTelemetry SDK Pipeline   │  │
│  │ - Executive (3.1-flash-lite) │  │   - Loki (LogQL)             │  │ - Live Incident Injector       │  │
│  │ - 5x Quota Pool & Breaker    │  │   - Tempo (Traces)           │  │ - Real Process Self-Healing    │  │
│  └──────────────┬───────────────┘  │   - Annotations API          │  └───────────────┬────────────────┘  │
│                 │                  └──────────────┬───────────────┘                  │                   │
└─────────────────┼─────────────────────────────────┼──────────────────────────────────┼───────────────────┘
                  │                                 │                                  │
                  ▼                                 ▼                                  ▼
      Google Cloud GenAI API               Grafana Cloud Instance              OTLP Exporter Pipeline
    (gemini-3.7/3.6/3.5/3.1)       (PromQL, LogQL, Tempo, Annotations)      (Metrics, Logs, Trace Spans)
```

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Grafana MCP Protocol Bridge | Standard `@modelcontextprotocol/sdk` client connecting to MCP endpoint | M1 | Survey R1 |
| F2 | Direct Grafana Cloud REST Driver | High-speed native REST driver for Mimir, Loki, Tempo, and Annotations | M1 | Survey R1 |
| F3 | PromQL Metric Query Tool | `grafana_query_metrics` with instant and range vector parser | M1 | Survey R1 |
| F4 | LogQL Error Log Query Tool | `grafana_query_logs` with stream filter and exception parser | M1 | Survey R1 |
| F5 | Tempo Distributed Trace Tool | `grafana_get_trace` with span tree waterfall and root cause locator | M1 | Survey R1 |
| F6 | Live Dashboard Annotations | `grafana_annotate_dashboard` posting incident markers to `POST /api/annotations` | M1 | Survey R1 |
| F7 | Active 16-Worker Media Engine | Continuous background render/transcode worker cluster with active job queue | M2 | Survey R2 |
| F8 | Real FFmpeg & Matrix Transcoder | Dual execution via child process FFmpeg and in-process RGBA matrix transforms | M2 | Survey R2 |
| F9 | OpenTelemetry SDK Pipeline | Full `@opentelemetry/sdk-node` with PromQL gauges, structured logs, and Tempo spans | M2 | Survey R2 |
| F10 | Dual-Dispatch Telemetry Flow | Remote OTLP push to Grafana Cloud + sub-second local ring buffer for UI/MCP | M2 | Survey R2 |
| F11 | Authentic Incident Injection | Real memory leak (OOM), process crash, and shader thread hang injection | M2 | Survey R2 |
| F12 | Real Self-Healing Process Control | Deterministic worker process restart, tile re-splitting, and queue rebalancing | M2 | Survey R2 |
| F13 | Gemini 3.x Flash 5-Model Pool | Pool of 3.7-flash, 3.6-flash, 3.5-flash, 3.5-flash-lite, 3.1-flash-lite | M3 | Survey R3 |
| F14 | 5x Horizontal Quota Multiplier | Weighted round-robin load distribution across 5 distinct model endpoints | M3 | Survey R3 |
| F15 | Dynamic 30s Circuit Breaker | Automatic 429 rate limit detection, 30s cooldown, sub-second fallback cascade | M3 | Survey R3 |
| F16 | 4-Agent Autonomous Pipeline | Sentinel -> Diagnostician -> Remediation -> Executive coordination | M3 | Survey R3 |
| F17 | Native Gemini Function Calling | Structured tool declarations and multi-turn tool invocation loop | M3 | Survey R3 |
| F18 | OpenTelemetry AI Observability | Real token counting, latency measurement, and AI cost metrics | M3 | Survey R3 |
| F19 | Cloud Run Multi-Stage Dockerfile | 3-stage minimal Alpine build with `ffmpeg`, `<180MB` standalone container | M4 | Survey R4 |
| F20 | Next.js Standalone Production Build | `output: 'standalone'` configuration with zero compilation errors | M4 | Survey R4 |
| F21 | Cloud Run Deployment & Live Probes | Deployed to `gen-lang-client-0942141479` in `us-central1`, verified endpoints | M4 | Survey R4 |
| F22 | Full E2E Automated Verification | 4-tier opaque-box test suite + Tier 5 adversarial coverage hardening | M5 | E2E Track |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Live Grafana MCP & Telemetry REST Client | Eliminate mock MCP client; build dual-engine `@modelcontextprotocol/sdk` + direct REST driver for PromQL, LogQL, Tempo, and Annotations. | none | COMPLETE |
| M2 | Active Media Processing Engine & OTel Pipeline | Build live 16-worker background engine (FFmpeg + matrix transforms), `@opentelemetry/sdk-node` pipeline, incident injector, and process self-healing. | none | PLANNED |
| M3 | Gemini 3.x Flash Multi-Agent Crew & Function Calling | Implement 5-model distributed pool, 30s circuit breaker, 4-agent autonomous pipeline, native tool calling, and AI observability. | M1, M2 | PLANNED |
| M4 | Full-Stack Integration & Google Cloud Run Deployment | Multi-stage Dockerfile with FFmpeg, standalone Next.js build, UI wiring, Cloud Run deployment to `gen-lang-client-0942141479`, and live probes. | M1, M2, M3 | PLANNED |
| M5 | Final Acceptance (100% E2E Pass & Adversarial Hardening) | Phase 1: Pass 100% of E2E tests (Tiers 1-4). Phase 2: Adversarial coverage hardening (Tier 5). | M4, TEST_READY.md | PLANNED |

---

## Interface Contracts

### GrafanaMcpClient ↔ Gemini Agent Crew
- `executeTool(name: string, args: Record<string, any>): Promise<ToolResult>`
  - `grafana_query_metrics({ promql, timeRange }): Promise<MetricQueryResult>`
  - `grafana_query_logs({ logql, limit, timeRange }): Promise<LogQueryResult>`
  - `grafana_get_trace({ traceId }): Promise<TraceQueryResult>`
  - `grafana_list_alerts({ severity }): Promise<AlertListResult>`
  - `grafana_annotate_dashboard({ dashboardId, text, tags }): Promise<AnnotationResult>`
  - `studio_remediate_node({ nodeId, actionType }): Promise<RemediationResult>`

### Gemini Multi-Agent Crew ↔ Media Processing Engine
- `MediaProcessingEngine.getInstance().executeRemediation(nodeId, actionType)`
  - Actions: `'SPLIT_RENDER_TILES' | 'PURGE_NODE_VRAM' | 'FAILOVER_GPU_NODE' | 'HOT_RELOAD_SHADER' | 'RESTART_WORKER_PROCESS' | 'REBALANCE_QUEUE'`
  - Returns: `{ success: boolean, nodeId: string, actionType: string, message: string, workerHealth: WorkerStatus, newPid?: number }`

### Media Processing Engine ↔ OpenTelemetry Pipeline
- Emits real metrics: `media.worker.cpu_utilization`, `media.worker.memory_utilization_ratio`, `media.worker.memory_bytes`, `media.transcode.fps`, `media.queue.depth`.
- Emits structured logs: `{ timestamp, level, service, workerId, traceId, spanId, message, metadata }`.
- Emits distributed traces: root span `RenderFrame_*` -> child spans `IngestAndDemuxChunk`, `CompileMaterialShaders`, `TranscodeAndRaytraceTile_*`, `CompositeAndGradeTile`.

---

## Code Layout & Write Ownership

| Module / Path | Owner Milestone | Description |
|:---|:---|:---|
| `src/mcp/grafana-client.ts` | M1 | Unified MCP client entrypoint and tool registry |
| `src/mcp/grafana-rest-driver.ts` | M1 | Direct REST driver for Grafana Mimir, Loki, Tempo, Annotations |
| `src/mcp/mcp-protocol-bridge.ts` | M1 | `@modelcontextprotocol/sdk` SSE / HTTP stream connector |
| `src/types/grafana.ts` | M1 | TypeScript types for Grafana payloads and tool schemas |
| `app/api/mcp/status/route.ts` | M1 | MCP connection status and dynamic tool discovery |
| `src/media-engine/engine.ts` | M2 | 16-worker background engine, job queue, incident injection |
| `src/media-engine/worker.ts` | M2 | MediaWorker instance managing execution and OS metrics |
| `src/media-engine/transcoder.ts` | M2 | FFmpeg CLI runner and in-process matrix transform worker |
| `src/media-engine/types.ts` | M2 | Media engine job, worker, and incident types |
| `src/telemetry/otel-pipeline.ts` | M2 | OpenTelemetry SDK pipeline, OTLP exporters, dual-dispatch buffer |
| `src/telemetry/studio-state.ts` | M2 | Lightweight state bridge to MediaProcessingEngine |
| `app/api/telemetry/route.ts` | M2 | Real telemetry snapshot and incident trigger endpoint |
| `src/agent/model-pool.ts` | M3 | 5-model distributed pool, circuit breaker, failover engine |
| `src/agent/orchestrator.ts` | M3 | 4-agent crew pipeline with live function calling loop |
| `src/agent/prompts.ts` | M3 | Role-specialized prompts and function schemas |
| `src/agent/otel.ts` | M3 | AI Observability token and latency tracker |
| `app/api/agent/diagnose/route.ts` | M3 | Multi-agent autonomous investigation endpoint |
| `app/api/agent/chat/route.ts` | M3 | Technical Director copilot chat endpoint |
| `app/api/agent/remediate/route.ts`| M3 | Self-healing node remediation execution endpoint |
| `next.config.mjs` | M4 | Next.js standalone build configuration |
| `Dockerfile` | M4 | 3-stage minimal Alpine container with FFmpeg |
| `.dockerignore` | M4 | Ignore rules for build optimization |
| `tests/*` | E2E Track / M5 | Comprehensive 4-tier test suite |
