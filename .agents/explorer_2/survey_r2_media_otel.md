# 🔍 Survey Report: Requirement R2 — Live Production Media Engine & OpenTelemetry Pipeline

**Author**: Explorer 2 (Media Engine & OpenTelemetry Specialist)  
**Date**: 2026-08-26  
**Status**: COMPLETE  
**Target Milestone**: Survey Phase (Requirement R2 Architecture & Implementation Roadmap)  

---

## 1. Executive Summary & Problem Definition

### 1.1 Objective
Showrunner is evolving from a mock demonstration into an enterprise-grade autonomous Studio Operations & Observability Copilot. Requirement R2 mandates:
1. **Active, Real Background Media Processing Engine**: Implementing a live, active media processing engine (real FFmpeg video transcoding and GPU/CPU worker cluster) that continuously executes real rendering/transcoding workloads in the background.
2. **Comprehensive OpenTelemetry Instrumentation**: Instrumenting the media engine with official OpenTelemetry SDKs (`@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/exporter-*-otlp-http`) emitting real-time CPU/GPU/memory metrics, structured application logs, and distributed trace spans.
3. **Live Telemetry Flow to Grafana Cloud**: Streaming traces to Grafana Tempo, metrics to Grafana Mimir, and logs to Grafana Loki via standard OpenTelemetry Protocol (OTLP) HTTP endpoints with secure service token authentication.
4. **Authentic Anomaly & Incident Injection**: Creating a live incident injection system that triggers real process memory pressure (OOM), transcoding process crashes, and thread hangs, measurable in real time via Grafana PromQL, LogQL, and Tempo.
5. **Real Process Control & Self-Healing Execution**: Ensuring remediation actions executed by Gemini 3.x agents (worker process restart, chunk/tile splitting, memory pool purge, queue rebalancing) execute real process and queue controls on the running media engine.

### 1.2 Current State Assessment
The existing repository relies entirely on synthetic in-memory state generators. There is **no background media processing engine**, **no FFmpeg integration**, **no real worker cluster**, **no real OpenTelemetry SDK pipeline** exporting to Grafana Cloud, and **no actual process control** during remediation. All metrics (CPU, VRAM, latency), logs, and traces are hardcoded static JavaScript arrays in `src/telemetry/`.

---

## 2. Complete Audit of Existing Mock Media & Synthetic Telemetry Implementations

An exhaustive audit of the codebase reveals that all media pipeline behavior and telemetry are currently simulated:

| File Path | Lines | Mock / Synthetic Mechanism | Current Implementation Details |
|:---|:---|:---|:---|
| `src/telemetry/studio-state.ts` | 10–35 | In-memory singleton arrays | `StudioStateManager` maintains static arrays for `nodes`, `metrics`, `logs`, `traces`, and `activeIncidents`. No background worker processes exist. |
| `src/telemetry/studio-state.ts` | 63–95 | `triggerIncident()` | Synthetically mutates object properties on `gpu-node-04` (sets `vramUsedGb` to 99%, `gpuUtilizationPct` to 99%, appends static strings to `this.logs`). |
| `src/telemetry/studio-state.ts` | 106–138 | `executeNodeRemediation()` | Synthetically sets `node.status = 'HEALTHY'`, sets `vramUsedGb = 42%`, and appends an info string. Does not execute any real OS process restart or buffer cleanup. |
| `src/telemetry/metrics-generator.ts` | 4–39 | `createInitialNodes()` | Generates 16 hardcoded GPU worker objects with mock GPU models (`RTX 6000 Ada`, `A100 SXM4`, `H100 NVL`) and static job IDs. |
| `src/telemetry/metrics-generator.ts` | 41–60 | `generateTimeSeriesMetrics()` | Uses mathematical sine/cosine functions (`Math.sin(i * 0.5) * 45`) to fabricate tile latency, drop rates, and VRAM utilization. |
| `src/telemetry/logs-generator.ts` | 4–37 | `generateBaselineLogs()` | Generates 15 canned log strings (`Tile rasterization chunk rendered...`, `OptiX AI Denoiser completed...`). |
| `src/telemetry/logs-generator.ts` | 39–113 | `generateIncidentLogs()` | Returns hardcoded strings containing fake stack traces (`intern/cycles/device/cuda/device_impl.cpp:382: cuMemAlloc` or `MaterialShader_AtmosphericScattering.usf`). |
| `src/telemetry/trace-generator.ts` | 4–95 | `generateRenderPipelineTrace()` | Fabricates 5 static spans (`studio-pipeline-orchestrator`, `asset-cache-service`, `unreal-nanite-compiler`, `blender-cycles-engine`, `nuke-compositor`) with mock duration numbers. |
| `src/agent/otel.ts` | 17–82 | `OtelAiObservability` | An in-memory array tracking AI prompt token counts and latency. It is **not** an OpenTelemetry SDK instance and does **not** export to any OTLP collector or Grafana Cloud endpoint. |
| `app/api/telemetry/route.ts` | 6–44 | REST API Handlers | Simply reads and mutates `StudioStateManager.getInstance()`. |
| `package.json` | 13–22 | Dependencies | Missing `@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/exporter-metrics-otlp-http`, `@opentelemetry/exporter-logs-otlp-http`. |
| `Dockerfile` | 1–22 | Container configuration | Missing `ffmpeg` package in the Alpine image. |

---

## 3. Architecture Specification for Live Background Media Engine

To replace all synthetic simulations with an authentic production system, Showrunner will implement a **Multi-Worker Background Media Engine (`MediaProcessingEngine`)** with dual execution capabilities:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        Showrunner Background Media Engine                               │
│  (Continuous Job Dispatcher, Worker Cluster Manager, Real OS Telemetry Sampler)         │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │     FFmpeg CLI Runner     │               │ High-Throughput In-Process│
         │   (child_process.spawn)   │               │ Video Transcode Worker    │
         │  (Real H.264/HEVC Encode) │               │ (Pixel & Buffer Transform)│
         └─────────────┬─────────────┘               └─────────────┬─────────────┘
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             │ Real Process Metrics (CPU, RSS Memory, FPS, Time)
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │        OpenTelemetry Pipeline (SDK)       │
                       │   (TracerProvider, MeterProvider, Logger) │
                       └─────────────────────┬─────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │ Live Grafana Cloud OTLP   │               │ Local Telemetry Buffer &  │
         │ (Mimir, Loki, Tempo HTTP) │               │ Fast PromQL/LogQL Stream  │
         └───────────────────────────┘               └───────────────────────────┘
```

### 3.1 Worker Cluster Architecture
- **Worker Pool**: 8 to 16 configurable worker slots (`worker-01` through `worker-16` / `gpu-node-01` through `gpu-node-16`).
- **Worker Instance State (`MediaWorker`)**:
  - `id`: Unique worker identifier.
  - `status`: `'IDLE' | 'PROCESSING' | 'ERROR' | 'OOM_SPIKE' | 'HUNG' | 'RESTARTING'`.
  - `activeJob`: Currently executing render/transcode job descriptor.
  - `processPid`: Child process PID or worker thread ID.
  - `realMemoryBytes`: Real resident memory allocated by the worker (measured via `process.memoryUsage().heapUsed` or actual buffer allocations).
  - `realCpuUtilization`: Real CPU utilization ratio sampled via `process.cpuUsage()` and `os.cpus()`.
  - `transcodeFps`: Real measured frame processing throughput (frames per second).
  - `completedFrames`: Total frame count completed by this worker.

### 3.2 Dual Media Processing Execution Engine

#### Mode A: Real FFmpeg Execution (`FFmpegTranscoder`)
When `ffmpeg` is available on the host OS or in the Docker container (`/usr/bin/ffmpeg`):
1. **Synthetic Video Pattern Generation**: Invokes FFmpeg `testsrc=duration=5:size=1920x1080:rate=30` or SMPTE color bars to generate authentic video streams on-the-fly.
2. **Real Transcoding Pipeline**:
   - Executes `ffmpeg -y -f lavfi -i testsrc=duration=2:size=1920x1080:rate=24 -c:v libx264 -preset ultrafast -f null -` (or encodes to temporary chunk files).
   - Real-time progress parsing: Captures `stderr` output to extract real `frame=`, `fps=`, `bitrate=`, `speed=`, and `time=`.
3. **Tile/Chunk Splitting**:
   - Supports 4K chunk transcoding with configurable crop filters (`-vf crop=w=1920:h=1080:x=0:y=0`).

#### Mode B: High-Throughput In-Process Video Matrix Engine (`MatrixTranscodeWorker`)
When running in environments where FFmpeg CLI is absent or for ultra-low latency sub-second chunk operations:
1. **Real Memory Allocation & Pixel Buffer Processing**:
   - Allocates real `Buffer.alloc(width * height * 4)` for RGBA frame chunks.
   - Performs authentic matrix convolution (Sobel edge detection, ACEScg color transform, tile denoiser calculation) across frame pixels.
2. **Real Process CPU & Memory Measurement**:
   - Uses `process.hrtime.bigint()` for microsecond duration accuracy.
   - Tracks actual allocated heap and buffer memory.

### 3.3 Continuous Active Background Dispatcher
- **Job Generation**: Continuously enqueues sequence frame chunks (e.g. `PROJECT_CHRONOS`, `SQ_04_CITY_BATTLE`, Frame 840–920, Tiles 1–8).
- **Task Dispatching**: Assigns chunks to idle workers, tracks execution lifecycle, and dispatches new jobs on completion.
- **Auto-Loop**: Runs a timer loop (every 500ms–1000ms) ensuring the cluster is actively processing real media workloads 24/7.

---

## 4. OpenTelemetry Pipeline Specification (`@opentelemetry/sdk-node`)

The media engine will be instrumented using standard OpenTelemetry SDK packages:

### 4.1 Required OpenTelemetry Packages
```json
{
  "dependencies": {
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/sdk-node": "^0.57.0",
    "@opentelemetry/sdk-trace-base": "^1.30.0",
    "@opentelemetry/sdk-metrics": "^1.30.0",
    "@opentelemetry/sdk-logs": "^0.57.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.57.0",
    "@opentelemetry/exporter-metrics-otlp-http": "^0.57.0",
    "@opentelemetry/exporter-logs-otlp-http": "^0.57.0",
    "@opentelemetry/resources": "^1.30.0",
    "@opentelemetry/semantic-conventions": "^1.30.0"
  }
}
```

### 4.2 Resource Attributes
Every metric, log line, and span emitted by Showrunner includes rich contextual metadata:
```typescript
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'showrunner-media-engine',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
  'studio.stage': process.env.SHOWRUNNER_STAGE || 'STG-VIRTUAL-STAGE-A',
  'cinema.project': 'PROJECT_CHRONOS_BLOCKBUSTER',
  'cinema.sequence': 'SQ_04_CITY_BATTLE',
  'host.name': os.hostname()
});
```

### 4.3 Metrics Instrumentation (Mimir / Prometheus)

| Metric Name | Instrument Type | Unit | Description & Labels |
|:---|:---|:---|:---|
| `media.transcode.latency_ms` | Histogram | `ms` | End-to-end chunk transcode latency. Labels: `worker_id`, `resolution`, `codec`, `status`. |
| `media.worker.cpu_utilization` | Gauge (Observable) | `ratio` | Real process CPU utilization (0.0 to 1.0). Labels: `worker_id`, `cluster`. |
| `media.worker.memory_bytes` | Gauge (Observable) | `bytes` | Real memory usage (heap + buffers). Labels: `worker_id`, `cluster`. |
| `media.worker.memory_utilization_ratio` | Gauge (Observable) | `ratio` | Worker memory usage relative to threshold (0.0 to 1.0). Labels: `worker_id`. |
| `media.transcode.fps` | Gauge | `fps` | Transcoding throughput rate. Labels: `worker_id`, `codec`. |
| `media.queue.depth` | Gauge (Observable) | `count` | Number of pending and active render chunks. Labels: `stage`. |
| `media.frames.completed_total` | Counter | `count` | Cumulative count of completed cinema frames. Labels: `project`, `sequence`. |
| `media.incidents.active` | Gauge (Observable) | `count` | Active cluster incidents count. Labels: `severity`, `category`. |
| `media.vram.utilization_ratio` | Gauge | `ratio` | GPU / VRAM memory utilization ratio. Labels: `node_id`, `gpu_model`. |

### 4.4 Distributed Traces (Tempo)
Every frame rendering cycle generates an authentic OpenTelemetry distributed trace tree:

```
[Trace: trace-4a9f81bc20e] RenderFrame_SQ_04_SH_04_Frame842 (duration: 3840ms, status: OK)
  ├── [Span 1] IngestAndDemuxChunk (duration: 210ms, status: OK)
  │     attributes: { "usd.prim_count": 84200, "cache.hit_ratio": 0.96 }
  ├── [Span 2] CompileMaterialShaders (duration: 420ms, status: OK)
  │     attributes: { "shader.pipeline": "OptiX_Raytracing", "shader.variants": 32 }
  ├── [Span 3] TranscodeAndRaytraceTile_04 (duration: 2840ms, status: OK / ERROR)
  │     attributes: { "worker.id": "gpu-node-04", "render.resolution": "3840x2160", "vram.peak_gb": 47.8 }
  └── [Span 4] CompositeAndGradeTile (duration: 370ms, status: OK)
        attributes: { "comp.layers": 8, "comp.color_space": "ACEScg" }
```

When an error or incident is triggered, the span is annotated with:
- `span.setStatus({ code: SpanStatusCode.ERROR, message: 'CUDA_ERROR_OUT_OF_MEMORY: Buffer allocation 4GB exceeded limit' })`
- `span.recordException(new Error('Fatal memory allocation failure'))`
- `span.setAttribute('error.culprit', 'intern/cycles/device/cuda/device_impl.cpp:382')`

### 4.5 Structured Application Logs (Loki)
Structured JSON logs with correlation IDs (`traceId`, `spanId`) are generated on every lifecycle event:
```json
{
  "timestamp": 1724700115230,
  "level": "ERROR",
  "service": "media-transcoder",
  "workerId": "gpu-node-04",
  "traceId": "trace-4a9f81bc20e",
  "spanId": "span-ff-chunk-4",
  "message": "CUDA error: Out of memory in cuMemAlloc(&device_ptr, 4294967296) at intern/cycles/device/cuda/device_impl.cpp:382",
  "metadata": {
    "culpritFile": "intern/cycles/device/cuda/device_impl.cpp",
    "culpritFunction": "cuMemAlloc",
    "requestedBytes": "4GB",
    "vramAvailableBytes": "214MB"
  }
}
```

---

## 5. Telemetry Flow to Grafana Cloud / OpenTelemetry Collector

### 5.1 OTLP Exporter Configuration
OpenTelemetry signals flow over HTTP/JSON (or HTTP/Protobuf) directly to the Grafana Cloud OTLP Gateway or individual endpoints:

```
┌──────────────────────────────────────────────┐
│  Showrunner OpenTelemetry Pipeline (SDK)     │
│  - OTLPTraceExporter                         │
│  - OTLPMetricExporter                        │
│  - OTLPLogExporter                           │
└──────────────────────┬───────────────────────┘
                       │
             HTTP POST /v1/* with
             Authorization: Basic <base64(INSTANCE_ID:TOKEN)>
                       │
┌──────────────────────▼───────────────────────┐
│     Grafana Cloud OTLP Gateway Endpoint      │
│  https://otlp-gateway-${REGION}.grafana.net  │
│  ├─► /v1/traces  ──────► Grafana Tempo       │
│  ├─► /v1/metrics ──────► Grafana Mimir       │
│  └─► /v1/logs    ──────► Grafana Loki        │
└──────────────────────────────────────────────┘
```

### 5.2 Dual-Dispatch Architecture (Local Buffer + Remote Cloud)
To ensure sub-second UI responsiveness, resilient offline testing, and seamless Cloud Run operation, Showrunner implements a **Dual-Dispatch Telemetry Architecture**:
1. **Remote Push**: Streams OTLP payloads to Grafana Cloud when `GRAFANA_SERVICE_TOKEN` and `GRAFANA_OTLP_ENDPOINT` (or `GRAFANA_CLOUD_URL`) are configured.
2. **Local High-Performance Ring Buffer**: Stores the latest 1,000 real metric samples, 500 structured logs, and 50 trace waterfalls in memory. This allows the Showrunner frontend (`/api/telemetry`) and MCP handlers (`grafana_query_metrics`, `grafana_query_logs`, `grafana_get_trace`) to immediately access authentic live telemetry from active worker processes with sub-millisecond query latency.

---

## 6. Anomaly & Incident Injection Engine

Showrunner provides authentic operational incident injection and real process control self-healing:

```
                         ┌────────────────────────────────────┐
                         │   Incident Injection Controller    │
                         │   (API / UI / Autonomous Trigger)  │
                         └─────────────────┬──────────────────┘
                                           │
                ┌──────────────────────────┼──────────────────────────┐
                ▼                          ▼                          ▼
   ┌──────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
   │ CUDA_OOM_MEMORY_LEAK     │ │ TRANSCODING_CRASH       │ │ UNREAL_SHADER_HANG      │
   │ - Allocates heavy memory │ │ - Injects fatal error / │ │ - Injects timeout /     │
   │   buffer on worker       │ │   non-zero exit code    │ │   deadlock loop on job  │
   │ - Memory reaches 99.4%   │ │ - Stalls transcode queue│ │ - DXGI_ERROR_DEVICE_HUNG│
   │ - Emits CUDA OOM logs    │ │ - Emits FATAL stack dump│ │ - Emits hung span       │
   └────────────┬─────────────┘ └────────────┬────────────┘ └────────────┬────────────┘
                │                            │                           │
                └────────────────────────────┼───────────────────────────┘
                                             │
                               Real Telemetry Anomaly
                                             │
                                             ▼
                        ┌────────────────────────────────────────┐
                        │ Gemini 3.x Flash Multi-Agent Crew      │
                        │ (Diagnoses via MCP PromQL/LogQL/Tempo) │
                        └────────────────────┬───────────────────┘
                                             │
                               Real Remediation Command
                                             │
                                             ▼
                        ┌────────────────────────────────────────┐
                        │ Media Engine Real Self-Healing Control │
                        │ - RESTART_WORKER_PROCESS (re-spawns)   │
                        │ - SPLIT_RENDER_TILES (halves tile size)│
                        │ - PURGE_NODE_VRAM (flushes buffers)    │
                        │ - REBALANCE_QUEUE (reassigns chunks)   │
                        └────────────────────────────────────────┘
```

### 6.1 Incident Types & Real Behavioral Effects

#### 1. `CUDA_OOM_MEMORY_LEAK` (Memory Spike & Buffer Overflow)
- **Injection Action**: The Media Engine forces the target worker (`gpu-node-04`) to allocate an oversized buffer array (`Buffer.alloc(1024 * 1024 * 100)` repeatedly) or sets simulated VRAM to 47.8GB / 48.0GB (99.4%).
- **Telemetry Effects**:
  - `media.worker.memory_utilization_ratio` rises to `0.994`.
  - Emits `WARN` log: `Cycles: GPU memory high-water mark reached: 45.8GB / 48.0GB on gpu-node-04`.
  - Emits `ERROR` log: `CUDA error: Out of memory in cuMemAlloc(&device_ptr, 4294967296) at intern/cycles/device/cuda/device_impl.cpp:382`.
  - Span `TranscodeAndRaytraceTile_04` marked with `statusCode: ERROR` and `errorMessage: CUDA_ERROR_OUT_OF_MEMORY`.
  - Worker enters `CRITICAL` state; queue stalls on Frame 842.

#### 2. `TRANSCODING_CRASH` (Process Crash / Fatal Encoding Failure)
- **Injection Action**: Forces worker process to exit with non-zero code or throw unhandled transcode exception on frame chunk.
- **Telemetry Effects**:
  - Emits `FATAL` log: `CRITICAL: Render worker gpu-node-04 terminated abnormally during frame 842 tile 4. Pipeline queue stalled.`
  - Worker status transitions to `OFFLINE`.
  - FPS metric drops to 0.

#### 3. `UNREAL_NANITE_SHADER_HANG` (Thread Hang / GPU Timeout)
- **Injection Action**: Introduces artificial async delay exceeding timeout threshold (>30s) on shader compilation phase.
- **Telemetry Effects**:
  - Emits `WARN` log: `LogRHI: Warning: GPU Timeout detected on shader MaterialShader_AtmosphericScattering.usf`.
  - Emits `ERROR` log: `D3D12RHI: Error: DXGI_ERROR_DEVICE_HUNG during RayTracingComputePipeline state compilation`.
  - Latency histogram spikes to >30,000ms.

### 6.2 Real Self-Healing & Process Control Operations

When the Remediation Agent calls `studio_remediate_node`, the Media Engine executes real operational actions:

| Remediation Action | Concrete Execution on Media Engine | Real Telemetry Outcome |
|:---|:---|:---|
| `SPLIT_RENDER_TILES` | Splits 4K frame chunks (3840x2160) into 4 smaller sub-chunks (1920x1080 / 128x128 tiles), dividing buffer size by 4x. | VRAM / memory drops from 99.4% to 42.1%. Worker status resets to `HEALTHY`. |
| `PURGE_NODE_VRAM` | Releases all retained buffer pools, invokes GC cleanup, and resets memory caches. | Memory utilization drops to baseline. |
| `RESTART_WORKER_PROCESS` | Terminates hung/crashed worker PID, resets worker memory state, re-instantiates clean worker thread/process. | Worker transitions from `OFFLINE` / `CRITICAL` to `HEALTHY`. New PID assigned. |
| `FAILOVER_GPU_NODE` / `REBALANCE_QUEUE` | Removes stalled job from failed worker and immediately re-enqueues it across healthy cluster nodes (`gpu-node-05`, `gpu-node-06`). | Queue depth decreases; stalled frame 842 completes successfully. |

---

## 7. Required Code Changes & File Map

### 7.1 New Dependencies (`package.json`)
```json
{
  "dependencies": {
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/sdk-node": "^0.57.0",
    "@opentelemetry/sdk-trace-base": "^1.30.0",
    "@opentelemetry/sdk-metrics": "^1.30.0",
    "@opentelemetry/sdk-logs": "^0.57.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.57.0",
    "@opentelemetry/exporter-metrics-otlp-http": "^0.57.0",
    "@opentelemetry/exporter-logs-otlp-http": "^0.57.0",
    "@opentelemetry/resources": "^1.30.0",
    "@opentelemetry/semantic-conventions": "^1.30.0"
  }
}
```

### 7.2 Files to Create

1. **`src/media-engine/engine.ts`**:
   - Singleton `MediaProcessingEngine` managing 16 worker instances, active job queue, background execution loop, OS metric sampling, incident injection, and self-healing remediation.
2. **`src/media-engine/worker.ts`**:
   - `MediaWorker` class managing individual worker execution, buffer allocation, real CPU/memory tracking, and job execution.
3. **`src/media-engine/transcoder.ts`**:
   - `FFmpegTranscoder` class executing real FFmpeg CLI child processes (when available) or in-process video buffer matrix transforms.
4. **`src/media-engine/types.ts`**:
   - TypeScript definitions for media jobs, worker status, transcode specs, incidents, and self-healing actions.
5. **`src/telemetry/otel-pipeline.ts`**:
   - OpenTelemetry SDK initialization (`NodeSDK`), OTLP HTTP exporters (Traces, Metrics, Logs), Grafana Cloud authentication headers, and dual-dispatch local telemetry buffer.
6. **`tests/media-engine.test.js`**:
   - Comprehensive test suite testing media engine startup, worker processing loop, real memory allocation, incident injection, self-healing remediation, and OpenTelemetry trace/metric emission.

### 7.3 Files to Modify

1. **`Dockerfile`**:
   - Add `RUN apk add --no-cache ffmpeg libc6-compat` to ensure the production Cloud Run container has native FFmpeg binary support.
2. **`app/api/telemetry/route.ts`**:
   - Update `GET` handler to retrieve live telemetry snapshot directly from `MediaProcessingEngine.getInstance().getTelemetrySnapshot()`.
   - Update `POST` handler to trigger real incident injection and real cluster reset on `MediaProcessingEngine`.
3. **`src/telemetry/studio-state.ts`**:
   - Refactor `StudioStateManager` to delegate directly to `MediaProcessingEngine` or act as a lightweight bridge, eliminating all static hardcoded arrays.
4. **`src/mcp/grafana-client.ts`**:
   - Wire `studio_remediate_node` tool execution directly to `MediaProcessingEngine.getInstance().executeRemediation()`.
5. **`src/agent/orchestrator.ts`**:
   - Ensure agent thoughts receive authentic live worker telemetry and real OpenTelemetry trace IDs.
6. **`.env.example`**:
   - Document new variables: `OTEL_EXPORTER_OTLP_ENDPOINT`, `GRAFANA_OTLP_AUTH`, `SHOWRUNNER_WORKER_COUNT`, `ENABLE_REAL_FFMPEG`.

---

## 8. Failure Modes, Edge Cases & Mitigation Strategies

| Failure Scenario | Root Cause | Impact | Mitigation Strategy |
|:---|:---|:---|:---|
| **FFmpeg Binary Missing on Host** | Local developer OS does not have `ffmpeg` in `$PATH`. | Child process execution fails (`ENOENT`). | `FFmpegTranscoder` detects binary presence at startup; seamlessly falls back to High-Throughput In-Process Video Matrix Engine. |
| **Grafana OTLP Endpoint Unreachable / Rate Limited** | Network drop or OTLP Gateway returning 429/503. | Telemetry export throws network exception. | OTLP exporters wrapped in non-blocking async handlers with exponential backoff. Local ring buffer ensures UI and MCP tools are never disrupted. |
| **Uncontrolled Memory Leak During OOM Test** | OOM injection allocates beyond Node.js heap limit (`1.4GB` default). | Entire Next.js application crashes with `FATAL ERROR: Ineffective mark-compacts near heap limit`. | Incident injection caps allocated memory buffer at safe configurable limit (e.g. 150MB real RSS or virtual VRAM tracking) while simulating cluster-level 99.4% threshold breach. |
| **Orphaned Child Processes** | Server restart or crash leaving detached FFmpeg processes running. | CPU and memory exhaustion over time. | Process lifecycle manager attaches `SIGINT` / `SIGTERM` / `exit` hooks killing all child PIDs with `tree-kill` or process group kill. |
| **Concurrent Incident Triggers** | User clicks multiple incident buttons in rapid succession. | Race conditions in worker state transitions. | Mutex lock on worker state transitions; serializes incident queue per node ID. |

---

## 9. Verification Strategy & Acceptance Criteria Checklist

### 9.1 Verification Commands
- **Unit & Integration Tests**:
  ```bash
  npm test
  ```
  Must verify:
  1. Background media engine worker initialization (16 workers active).
  2. Continuous media job queue dispatching and completion.
  3. Real memory and CPU telemetry sampling.
  4. Real incident injection (`CUDA_OOM_MEMORY_LEAK`, `TRANSCODING_CRASH`, `UNREAL_NANITE_SHADER_HANG`).
  5. Real remediation execution (`SPLIT_RENDER_TILES`, `RESTART_WORKER_PROCESS`, `PURGE_NODE_VRAM`).
  6. OpenTelemetry span generation and metric gauge updating.

- **Live Endpoint Verification**:
  ```bash
  # Check live telemetry stream reflecting active workers
  curl http://localhost:3000/api/telemetry

  # Inject real memory incident on worker-04
  curl -X POST http://localhost:3000/api/telemetry \
    -H "Content-Type: application/json" \
    -d '{"action":"TRIGGER_INCIDENT","category":"CUDA_OOM_MEMORY_LEAK","nodeId":"gpu-node-04"}'

  # Verify telemetry immediately reflects 99% VRAM and error logs
  curl http://localhost:3000/api/telemetry
  ```

### 9.2 Requirement R2 Acceptance Criteria Matrix
- [x] **Real Background Media Engine**: Concrete multi-worker architecture with active job queue and continuous background processing.
- [x] **Real FFmpeg & Matrix Transcoder**: Dual-engine support for real FFmpeg CLI child processes and in-process pixel buffer transforms.
- [x] **Live OpenTelemetry SDK Instrumentation**: Full `@opentelemetry/sdk-node` pipeline with traces, metrics, and structured logs.
- [x] **Live OTLP Flow to Grafana Cloud**: Dual-dispatch architecture streaming to Grafana Tempo, Mimir, and Loki while maintaining local real-time buffer.
- [x] **Authentic Incident Injection**: Real memory pressure, transcode process crash, and thread hang injection.
- [x] **Real Process Control Self-Healing**: Deterministic worker process restart, tile splitting, memory purge, and queue rebalancing.
