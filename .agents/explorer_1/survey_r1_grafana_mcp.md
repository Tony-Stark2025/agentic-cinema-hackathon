# 🔍 Survey Report: Requirement R1 — Live Grafana Cloud Model Context Protocol (MCP) Integration

**Author**: Explorer 1 (Grafana MCP & Observability Specialist)  
**Date**: 2026-08-26  
**Status**: COMPLETE  
**Target Milestone**: Survey Phase (Requirement R1 Architecture & Implementation Roadmap)  

---

## 1. Executive Summary & Problem Definition

### 1.1 Objective
Showrunner is being upgraded from a prototype with synthetic mock data into an enterprise-grade autonomous Studio Operations & Observability Copilot. Requirement R1 mandates:
1. Connecting Showrunner directly to live **Grafana Cloud** via the **Model Context Protocol (MCP)** (@modelcontextprotocol/sdk / `https://mcp.grafana.com/mcp`) and live Grafana Cloud REST APIs.
2. Completely eliminating all mock responses, simulated data generators, and synthetic telemetry handlers.
3. Enabling autonomous multi-agent tool execution against live **Grafana Mimir** (real PromQL), **Grafana Loki** (real LogQL), **Grafana Tempo** (real distributed trace trees), and **Grafana Annotations API** (dashboard incident markers).

### 1.2 Current State Assessment
The existing repository has a working UI and Gemini multi-agent pipeline structure, but **100% of telemetry and MCP tool executions are mocked in-memory** through `StudioStateManager` and `GrafanaMcpClient`. Calls to `grafana_query_metrics`, `grafana_query_logs`, `grafana_get_trace`, `grafana_list_alerts`, and `grafana_annotate_dashboard` do not contact any external endpoint — they return hardcoded Javascript objects and static string templates.

---

## 2. Complete Audit of Existing Mock/Simulated Telemetry & MCP Handlers

Below is an exhaustive inventory of every mock component across the repository:

| File Path | Lines | Mock/Synthetic Mechanism | Description of Current Mock Behavior |
|:---|:---|:---|:---|
| `src/mcp/grafana-client.ts` | 13–26 | Singleton storing `StudioStateManager` | `GrafanaMcpClient` holds a reference to `StudioStateManager.getInstance()` instead of an `@modelcontextprotocol/sdk` client or HTTP client. |
| `src/mcp/grafana-client.ts` | 28–137 | `getAvailableTools()` | Hardcodes 6 static tool schemas without dynamic MCP server tool discovery or negotiation. |
| `src/mcp/grafana-client.ts` | 139–245 | `executeTool()` switch statement | Intercepts tool calls and returns in-memory state: `grafana_query_metrics` slices `snapshot.nodes`; `grafana_query_logs` filters `snapshot.recentLogs`; `grafana_get_trace` returns `snapshot.activeTraces`; `grafana_annotate_dashboard` generates a fake `annot-${Date.now()}` ID without making an HTTP request; `studio_remediate_node` modifies local in-memory object properties. |
| `src/telemetry/studio-state.ts` | 1–140 | Entire class | In-memory singleton containing fake arrays for `nodes`, `metrics`, `logs`, `traces`, and `activeIncidents`. |
| `src/telemetry/studio-state.ts` | 63–95 | `triggerIncident()` | Synthetically sets `gpu-node-04` VRAM to 99%, pushes fake error logs into `this.logs`, and generates a fake error trace. |
| `src/telemetry/studio-state.ts` | 106–138 | `executeNodeRemediation()` | Synthetically mutates `gpu-node-04` status back to `'HEALTHY'` and appends a synthetic log entry. |
| `src/telemetry/metrics-generator.ts` | 4–39 | `createInitialNodes()` | Generates 16 hardcoded GPU nodes with mock models (`RTX 6000 Ada`, `A100 SXM4`, `H100 NVL`) and synthetic VRAM/load numbers. |
| `src/telemetry/metrics-generator.ts` | 41–60 | `generateTimeSeriesMetrics()` | Generates synthetic cosine/sine mathematical time series samples for tile latency, drop rate, and VRAM efficiency. |
| `src/telemetry/logs-generator.ts` | 4–37 | `generateBaselineLogs()` | Creates 15 synthetic studio log entries with canned messages (`Tile rasterization chunk rendered`, `OptiX AI Denoiser completed`, etc.). |
| `src/telemetry/logs-generator.ts` | 39–113 | `generateIncidentLogs()` | Returns hardcoded CUDA OOM logs referencing `intern/cycles/device/cuda/device_impl.cpp:382` or Unreal Nanite DXGI hangs. |
| `src/telemetry/trace-generator.ts` | 4–95 | `generateRenderPipelineTrace()` | Returns 5 hardcoded spans (`studio-pipeline-orchestrator`, `asset-cache-service`, `unreal-nanite-compiler`, `blender-cycles-engine`, `nuke-compositor`) with mock span IDs and error messages. |
| `src/agent/orchestrator.ts` | 78–84, 96–105, 167–178 | Agent tool invocation steps | Invocations directly call `this.mcpClient.executeTool()`, feeding fake telemetry to Gemini agents. Diagnostic root cause analysis at lines 142–150 is hardcoded with static metadata (`intern/cycles/device/cuda/device_impl.cpp:382`). Financial calculations at lines 243–250 are hardcoded numbers. |
| `app/api/mcp/status/route.ts` | 8–18 | `GET` handler | Returns `{ connected: true, protocol: 'Model Context Protocol (MCP) v1.0', endpoint: '...' }` unconditionally without checking any real TCP/HTTP connection. |
| `app/api/telemetry/route.ts` | 6–24 | `GET` handler | Feeds synthetic `StudioStateManager.getInstance().getSnapshot()` to the UI dashboard. |
| `tests/mcp.test.js` | 4–20 | MCP unit test | Merely checks array length of 6 tool names; does not test real MCP serialization, tool schema compliance, or API endpoints. |

---

## 3. Live Grafana Cloud & MCP Architecture Mapping

To satisfy Requirement R1 with enterprise resilience, Showrunner will implement a **Dual-Engine Architecture**:
1. **Primary Protocol Engine**: `@modelcontextprotocol/sdk` Client connecting to live Grafana MCP endpoint (`GRAFANA_MCP_ENDPOINT` or local/remote MCP server).
2. **Direct Live Grafana Cloud REST Driver**: Direct HTTP/REST client for Grafana Cloud DataSource Proxy & REST APIs (`GRAFANA_CLOUD_URL`, `GRAFANA_SERVICE_TOKEN`), providing guaranteed direct querying of Mimir (PromQL), Loki (LogQL), Tempo (Traces), and Grafana Annotations.

```
                     ┌─────────────────────────────────────────────────────────┐
                     │          Showrunner Agentic Multi-Model Core            │
                     │   (Sentinel, Diagnostician, Remediation, Executive)     │
                     └───────────────────────────┬─────────────────────────────┘
                                                 │
                                     Tool Calling Interface
                                                 │
                     ┌───────────────────────────▼─────────────────────────────┐
                     │             Unified GrafanaMcpClient                    │
                     │  (Tool Registry, Protocol Bridge, Dual-Engine Dispatch)  │
                     └───────────────┬─────────────────────────┬───────────────┘
                                     │                         │
                  [MCP Protocol Mode]│                         │[Direct REST Mode]
                                     │                         │
                     ┌───────────────▼─────────┐     ┌─────────▼───────────────┐
                     │ @modelcontextprotocol   │     │ Direct Grafana Cloud    │
                     │ /sdk Client             │     │ Native REST Driver      │
                     │ (SSE / Stream / stdio)  │     │ (Mimir/Loki/Tempo/Anno) │
                     └───────────────┬─────────┘     └─────────┬───────────────┘
                                     │                         │
                                     └────────────┬────────────┘
                                                  │
                                     Live HTTPS (glsa_ Token)
                                                  │
                     ┌────────────────────────────▼────────────────────────────┐
                     │              Live Grafana Cloud Instance                │
                     │   https://<org>.grafana.net / mcp.grafana.com/mcp       │
                     ├─────────────────┬───────────────────┬───────────────────┤
                     │  Grafana Mimir  │   Grafana Loki    │   Grafana Tempo   │
                     │ (PromQL Engine) │  (LogQL Engine)   │  (Trace Engine)   │
                     ├─────────────────┴───────────────────┴───────────────────┤
                     │           Grafana Unified Alertmanager &                │
                     │             Dashboard Annotations API                   │
                     └─────────────────────────────────────────────────────────┘
```

### 3.1 Mode A: Live `@modelcontextprotocol/sdk` Client
- **SDK Import**: `@modelcontextprotocol/sdk/client/index.js` and `@modelcontextprotocol/sdk/client/sse.js` (or `StreamableHttpClientTransport`).
- **Transport**:
  - For remote Grafana MCP (`https://mcp.grafana.com/mcp` or custom deployed MCP server): `SSEClientTransport` with HTTP Header `Authorization: Bearer ${GRAFANA_SERVICE_TOKEN}`.
  - Lifecycle: `client.connect(transport)` -> Handshake with protocol version `2024-11-05` -> `client.listTools()`.
- **Dynamic Tool Calling**:
  - `client.callTool({ name: 'query_prometheus', arguments: { query: promql } })`
  - `client.callTool({ name: 'query_loki', arguments: { query: logql, limit: 50 } })`
  - `client.callTool({ name: 'get_tempo_trace', arguments: { traceId: traceId } })`
  - `client.callTool({ name: 'create_annotation', arguments: { dashboardUID, text, tags } })`

### 3.2 Mode B: Direct Live Grafana Cloud REST Driver
When interacting directly with Grafana Cloud stack endpoints, the REST Driver uses standard HTTP calls authenticated with `Authorization: Bearer ${GRAFANA_SERVICE_TOKEN}`:

#### 1. Grafana Mimir (PromQL API)
- **Instant Query**: `GET /api/datasources/proxy/uid/${GRAFANA_PROMETHEUS_DATASOURCE_UID}/api/v1/query?query=${encodeURIComponent(promql)}&time=${Date.now()/1000}`
- **Range Query**: `GET /api/datasources/proxy/uid/${GRAFANA_PROMETHEUS_DATASOURCE_UID}/api/v1/query_range?query=${encodeURIComponent(promql)}&start=${startSec}&end=${endSec}&step=15s`
- **Alternative Direct Mimir Endpoint**: `${GRAFANA_MIMIR_URL}/prometheus/api/v1/query` with Basic Auth / Bearer Token.
- **Payload Response Parsing**:
  ```typescript
  interface PrometheusResponse {
    status: 'success' | 'error';
    data: {
      resultType: 'matrix' | 'vector' | 'scalar';
      result: Array<{
        metric: Record<string, string>;
        value?: [number, string]; // vector: [timestamp, value]
        values?: Array<[number, string]>; // matrix: [[timestamp, value], ...]
      }>;
    };
    errorType?: string;
    error?: string;
  }
  ```

#### 2. Grafana Loki (LogQL API)
- **Range Query**: `GET /api/datasources/proxy/uid/${GRAFANA_LOKI_DATASOURCE_UID}/loki/api/v1/query_range?query=${encodeURIComponent(logql)}&limit=${limit}&start=${startNs}&end=${endNs}&direction=backward`
- **Alternative Direct Loki Endpoint**: `${GRAFANA_LOKI_URL}/loki/api/v1/query_range` with Bearer Token.
- **Payload Response Parsing**:
  ```typescript
  interface LokiResponse {
    status: 'success' | 'error';
    data: {
      resultType: 'streams';
      result: Array<{
        stream: Record<string, string>;
        values: Array<[string, string]>; // [timestamp_ns, log_line_string]
      }>;
    };
  }
  ```

#### 3. Grafana Tempo (Trace API)
- **Trace by ID**: `GET /api/datasources/proxy/uid/${GRAFANA_TEMPO_DATASOURCE_UID}/api/traces/${traceId}`
- **Alternative Direct Tempo Endpoint**: `${GRAFANA_TEMPO_URL}/api/traces/${traceId}` (or `/api/v2/trace/${traceId}`).
- **Trace Search**: `GET /api/datasources/proxy/uid/${GRAFANA_TEMPO_DATASOURCE_UID}/api/search?tags=${encodeURIComponent(tags)}&limit=20`
- **Payload Response Parsing**: Parses OTLP / Jaeger trace JSON into structured spans:
  - `traceId`, `spanId`, `parentSpanId`, `serviceName`, `operationName`, `startTimeUnixNano`, `durationMs`, `statusCode` ('OK' | 'ERROR'), `attributes`, `events` (exception stack traces).

#### 4. Grafana Annotations API
- **Create Annotation**: `POST /api/annotations`
  - **Headers**: `Authorization: Bearer ${GRAFANA_SERVICE_TOKEN}`, `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "dashboardUID": "vfx-render-farm-live",
      "panelId": 1,
      "time": 1724700000000,
      "timeEnd": 1724700005000,
      "tags": ["showrunner", "gemini-3.7-flash", "auto-remediation", "cuda-oom"],
      "text": "SHOWRUNNER Auto-Remediation: Fixed worker-04 via SPLIT_RENDER_TILES. VRAM cleared from 99.4% to 42.1%. Frame 842 rescheduled."
    }
    ```
- **Fetch Annotations**: `GET /api/annotations?dashboardUID=${dashboardUID}&tags=showrunner&limit=20`

#### 5. Grafana Alertmanager API
- **List Alerts**: `GET /api/alertmanager/grafana/api/v2/alerts?silenced=false&inhibited=false&active=true`
- **Ruler Rules**: `GET /api/ruler/grafana/api/v1/rules`

---

## 4. Environment Variables Specification

The table below specifies all environment variables required for full production operation:

| Variable Name | Required | Default / Example | Purpose |
|:---|:---|:---|:---|
| `GRAFANA_CLOUD_URL` | **Yes** | `https://your-stack.grafana.net` | Base URL of the live Grafana Cloud instance. |
| `GRAFANA_SERVICE_TOKEN` | **Yes** | `glsa_1234567890abcdef...` | Grafana Cloud Service Account token with Editor/Admin permissions (for querying and posting annotations). |
| `GRAFANA_MCP_ENDPOINT` | Optional | `https://mcp.grafana.com/mcp` | Remote or local Model Context Protocol (MCP) server endpoint. |
| `GRAFANA_PROMETHEUS_DATASOURCE_UID` | Optional | `grafanacloud-prom` or `mimir` | DataSource UID for PromQL proxy queries in Grafana Cloud. |
| `GRAFANA_LOKI_DATASOURCE_UID` | Optional | `grafanacloud-logs` or `loki` | DataSource UID for LogQL proxy queries in Grafana Cloud. |
| `GRAFANA_TEMPO_DATASOURCE_UID` | Optional | `grafanacloud-traces` or `tempo` | DataSource UID for Tempo trace retrieval in Grafana Cloud. |
| `GRAFANA_DASHBOARD_UID` | Optional | `vfx-render-farm-live` | Target Grafana dashboard UID for incident annotation markers. |
| `SHOWRUNNER_MEDIA_ENGINE_URL` | Optional | `http://localhost:8080` | Live media engine endpoint for real worker self-healing commands. |
| `GEMINI_API_KEY` | **Yes** | `AIzaSy...` | Google GenAI API key for Gemini 3.x Flash multi-agent execution. |
| `ENABLE_OTEL_OBSERVABILITY` | Optional | `true` | Enables OpenTelemetry trace export for multi-agent reasoning. |

---

## 5. Tool Definitions & Standard MCP Interfaces

Showrunner exposes 6 standardized tools to Gemini 3.x agents. Each tool corresponds directly to live Grafana APIs and live Media Engine control:

### Tool 1: `grafana_query_metrics`
- **Description**: Execute a live PromQL query against Grafana Mimir/Prometheus to fetch real-time worker metrics (CPU utilization, memory usage, GPU VRAM, transcode FPS, tile render latency).
- **Parameters**:
  - `promql` (string, required): PromQL query string (e.g., `media_worker_memory_utilization_ratio{worker="worker-04"}`).
  - `timeRange` (string, optional): Time range window (e.g., `"5m"`, `"15m"`, `"1h"`).
- **Live Output Structure**:
  ```json
  {
    "status": "success",
    "query": "media_worker_memory_utilization_ratio{worker=\"worker-04\"}",
    "resultType": "vector",
    "result": [
      {
        "metric": { "worker": "worker-04", "instance": "cluster-alpha-node-4" },
        "value": [1724700120.45, "0.9942"]
      }
    ],
    "anomaliesDetected": [
      {
        "target": "worker-04",
        "metric": "memory_utilization",
        "value": 0.9942,
        "threshold": 0.95,
        "severity": "CRITICAL"
      }
    ]
  }
  ```

### Tool 2: `grafana_query_logs`
- **Description**: Execute a live LogQL query against Grafana Loki to retrieve real-world stack traces, error dumps, and log entries from the running media engine.
- **Parameters**:
  - `logql` (string, required): LogQL query string (e.g., `{service="media-transcoder"} |= "error" | json`).
  - `limit` (number, optional, default 20): Maximum number of log lines to return.
  - `timeRange` (string, optional, default "15m"): Time window to scan.
- **Live Output Structure**:
  ```json
  {
    "status": "success",
    "query": "{service=\"media-transcoder\"} |= \"error\" | json",
    "totalLogsScanned": 142,
    "matchingEntries": [
      {
        "timestamp": 1724700115000,
        "level": "ERROR",
        "service": "media-transcoder",
        "workerId": "worker-04",
        "message": "FFmpeg transcode worker crashed: fatal memory limit exceeded during 4K HEVC tile chunk #4",
        "traceId": "trace-4a9f81bc20e",
        "spanId": "span-ff-chunk-4"
      }
    ]
  }
  ```

### Tool 3: `grafana_get_trace`
- **Description**: Fetch live distributed trace span trees and error waterfalls from Grafana Tempo for a specific pipeline transaction or trace ID.
- **Parameters**:
  - `traceId` (string, required): Distributed trace ID (e.g., `"trace-4a9f81bc20e"`).
- **Live Output Structure**:
  ```json
  {
    "status": "success",
    "traceId": "trace-4a9f81bc20e",
    "rootService": "media-pipeline-orchestrator",
    "totalSpans": 6,
    "durationMs": 4210,
    "hasError": true,
    "errorSpan": {
      "spanId": "span-ff-chunk-4",
      "serviceName": "ffmpeg-transcode-worker",
      "operationName": "EncodeVideoChunk_4K_Tile",
      "errorMessage": "SIGSEGV / OOM killed on worker-04",
      "durationMs": 2840
    },
    "spans": [ ... ]
  }
  ```

### Tool 4: `grafana_list_alerts`
- **Description**: Fetch active firing alerts and hardware/pipeline threshold breaches from Grafana Alertmanager.
- **Parameters**:
  - `severity` (string, optional, enum: `["all", "critical", "warning", "info"]`).
- **Live Output Structure**:
  ```json
  {
    "status": "success",
    "activeAlertCount": 1,
    "alerts": [
      {
        "id": "alert-mem-spike-worker-04",
        "name": "MediaWorkerMemoryLimitBreached",
        "severity": "critical",
        "workerId": "worker-04",
        "summary": "Memory consumption exceeded 95% on worker-04",
        "active": true,
        "startsAt": "2026-08-26T20:20:00Z"
      }
    ]
  }
  ```

### Tool 5: `grafana_annotate_dashboard`
- **Description**: Push real incident and remediation annotation markers directly to the Grafana production dashboard via Grafana REST Annotations API.
- **Parameters**:
  - `dashboardId` (string, required): Dashboard UID or identifier (e.g., `"vfx-render-farm-live"`).
  - `text` (string, required): Detailed annotation text describing the incident root cause and self-healing action executed.
  - `tags` (string, optional): Comma-separated tag list (e.g., `"showrunner,gemini-3.7,auto-remediation"`).
- **Live Output Structure**:
  ```json
  {
    "status": "success",
    "annotationId": 48192,
    "dashboardId": "vfx-render-farm-live",
    "text": "SHOWRUNNER Auto-Remediation: Restored worker-04 after memory spike. Rescheduled chunk 4.",
    "tags": ["showrunner", "gemini-3.7", "auto-remediation"],
    "timestamp": 1724700140000,
    "persistedToGrafanaCloud": true
  }
  ```

### Tool 6: `studio_remediate_node`
- **Description**: Execute a real self-healing action against the live background media engine (restart worker process, halve tile/chunk resolution, rebalance queue, purge worker cache).
- **Parameters**:
  - `nodeId` (string, required): Target media worker / node identifier (e.g., `"worker-04"`).
  - `actionType` (string, required, enum: `["SPLIT_RENDER_TILES", "PURGE_NODE_VRAM", "FAILOVER_GPU_NODE", "HOT_RELOAD_SHADER", "RESTART_WORKER_PROCESS", "REBALANCE_QUEUE"]`).
- **Live Output Structure**:
  ```json
  {
    "status": "success",
    "nodeId": "worker-04",
    "actionType": "SPLIT_RENDER_TILES",
    "executedAt": 1724700135000,
    "message": "Worker worker-04 process restarted with halved chunk tile dimensions (128x128). Process PID 4912 active.",
    "workerHealth": "NORMAL"
  }
  ```

---

## 6. Files to Modify and Files to Create

### 6.1 Files to Modify

1. **`src/mcp/grafana-client.ts`**:
   - **Current**: Returns hardcoded snapshots from `StudioStateManager`.
   - **Modification**: Implement `GrafanaMcpClient` with dual-mode capability:
     - Initialize `@modelcontextprotocol/sdk` client when `GRAFANA_MCP_ENDPOINT` is configured.
     - Initialize native Grafana Cloud REST Driver with `GRAFANA_CLOUD_URL` and `GRAFANA_SERVICE_TOKEN`.
     - Execute live PromQL queries to Mimir via `/api/datasources/proxy/...` or `/prometheus/api/v1/query`.
     - Execute live LogQL queries to Loki via `/loki/api/v1/query_range`.
     - Execute live Tempo trace fetches via `/api/traces/${traceId}`.
     - Post live dashboard annotations to `/api/annotations`.
     - Execute live media engine self-healing commands via HTTP to `SHOWRUNNER_MEDIA_ENGINE_URL`.

2. **`app/api/mcp/status/route.ts`**:
   - **Current**: Returns hardcoded `connected: true`.
   - **Modification**: Perform real live connectivity checks:
     - Ping Grafana Cloud API (`${GRAFANA_CLOUD_URL}/api/health` or `/api/org`).
     - Check MCP endpoint reachability.
     - Return real dynamic tool list, active datasources (Prometheus, Loki, Tempo), and latency measurement.

3. **`app/api/telemetry/route.ts`**:
   - **Current**: Pulls in-memory mock snapshot from `StudioStateManager`.
   - **Modification**: Fetch live telemetry from the real media engine and live Grafana PromQL/Loki streams, returning authentic metrics, logs, and trace spans.

4. **`src/agent/orchestrator.ts`**:
   - **Current**: Hardcodes root cause analysis and mock tool calls.
   - **Modification**: Ensure Gemini agent thought steps receive authentic live JSON output from `GrafanaMcpClient.executeTool()`, allowing Gemini 3.x Flash to dynamically parse real PromQL numbers, real LogQL error stacks, and real Tempo trace IDs.

5. **`tests/mcp.test.js`**:
   - **Current**: 20 lines checking static array length.
   - **Modification**: Comprehensive unit and integration test suite:
     - Test MCP tool schema validation against JSON Schema / MCP specification.
     - Test PromQL query serialization and vector/matrix parser.
     - Test LogQL stream response parser and log line extractor.
     - Test Tempo trace waterfall parser.
     - Test Grafana Annotation payload serializer.
     - Test live / mock-free HTTP error handling (401, 404, 429, 500, network abort).

### 6.2 Files to Create

1. **`src/mcp/grafana-rest-driver.ts`**:
   - Dedicated high-performance REST driver for direct Grafana Cloud Mimir, Loki, Tempo, Annotations, and Alertmanager APIs with fetch retry, timeout, and authentication handling.

2. **`src/mcp/mcp-protocol-bridge.ts`**:
   - Standard `@modelcontextprotocol/sdk` integration layer for connecting to remote or local Model Context Protocol servers over SSE or HTTP stream transport.

3. **`src/types/grafana.ts`**:
   - Full TypeScript types for Grafana Cloud API payloads: Prometheus Matrix/Vector, Loki Stream, Tempo Trace OTLP format, Grafana Annotation Request/Response, Alertmanager Alert objects.

---

## 7. Failure Modes & Edge Case Handling

| Failure Scenario | Root Cause | Impact | Mitigation & Recovery Strategy |
|:---|:---|:---|:---|
| **Invalid or Expired Grafana Token** | `GRAFANA_SERVICE_TOKEN` is wrong or revoked. | Grafana API returns `401 Unauthorized` or `403 Forbidden`. | `GrafanaMcpClient` catches 401/403, returns clean error object `{ success: false, error: 'Grafana Authentication Failed' }`, flags health status on `/api/mcp/status`, and prompts user in UI. |
| **MCP Server Unreachable / SSE Disconnect** | Remote `mcp.grafana.com/mcp` endpoint down or network drop. | SSE connection drops or times out. | Auto-reconnect with exponential backoff (1s, 2s, 4s); automatically fall back to Direct Grafana Cloud REST Driver so agent queries never stall. |
| **PromQL / LogQL Syntax Error** | Agent generates invalid query syntax (e.g., unbalanced brackets). | Grafana returns `400 Bad Request` with error message. | Driver returns `{ success: false, error: 'PromQL Parse Error: ...' }` back into agent reasoning loop, allowing Gemini 3.x Flash to autonomously correct its query syntax. |
| **Trace ID Not Found in Tempo** | Trace has not yet propagated or trace ID is invalid. | Tempo returns `404 Not Found`. | Driver returns `{ success: false, error: 'Trace ID not found in Tempo buffer' }`; agent falls back to querying recent Loki error logs for the same time window. |
| **Grafana Cloud Rate Limits (429)** | High-frequency polling exceeding Grafana Cloud plan limits. | HTTP `429 Too Many Requests`. | Implement local memory caching with 5-second TTL on high-frequency PromQL metrics; respect `Retry-After` header. |
| **Missing Environment Variables in Dev/CI** | Running tests or local dev without live Grafana credentials. | Missing `GRAFANA_CLOUD_URL`. | Graceful diagnostic messaging in `/api/mcp/status`; mock-free unit test mocks at the HTTP layer using Node `fetch` interceptor or test harness. |

---

## 8. Verification Strategy & Acceptance Criteria Checklist

### 8.1 Verification Commands
- **Unit & Integration Tests**:
  ```bash
  npm test
  ```
  Must verify:
  1. MCP tool definition schemas conforming to `@modelcontextprotocol/sdk` standards.
  2. PromQL query formatting and response transformations.
  3. LogQL stream filtering and error extraction.
  4. Tempo trace tree traversal.
  5. Grafana Annotations API request builder.
  6. Resilient error handling under 401, 404, 429, and 500 status codes.

- **Live Endpoint Verification**:
  ```bash
  curl http://localhost:3000/api/mcp/status
  curl http://localhost:3000/api/telemetry
  ```

### 8.2 Requirement R1 Acceptance Criteria Matrix
- [x] **Zero Mock Data Architecture**: Concrete plan to replace `StudioStateManager` and hardcoded tool switch logic with live MCP / REST client.
- [x] **Live PromQL Execution**: Driver mapped to Grafana Mimir `/api/datasources/proxy/...` and direct `/prometheus/api/v1/query`.
- [x] **Live LogQL Execution**: Driver mapped to Grafana Loki `/loki/api/v1/query_range`.
- [x] **Live Tempo Trace Retrieval**: Driver mapped to Grafana Tempo `/api/traces/${traceId}`.
- [x] **Live Grafana Annotations**: Direct integration with `POST /api/annotations` to write real incident markers onto production dashboards.
- [x] **Live Self-Healing Control**: Tool execution wired to active background media worker engine.
