# 🤝 Handoff Report: Explorer 2 (Media Engine & OpenTelemetry Specialist)

**Date**: 2026-08-26  
**Status**: Hard Handoff (Task Complete)  
**Survey Report Location**: `c:\Users\brigh\project\agentic-cinema-hackathon\.agents\explorer_2\survey_r2_media_otel.md`  

---

## 1. Observation
1. **Mock In-Memory Telemetry State**:
   - `src/telemetry/studio-state.ts` (lines 10–35): Holds static arrays for `nodes`, `metrics`, `logs`, `traces`, and `activeIncidents`. No background processes or threads exist.
   - `src/telemetry/metrics-generator.ts` (lines 4–60): Generates 16 hardcoded GPU nodes and mathematical sine/cosine values (`Math.sin(i * 0.5) * 45`) for latency and VRAM metrics.
   - `src/telemetry/logs-generator.ts` (lines 4–113): Generates canned string arrays for baseline logs and incidents (`intern/cycles/device/cuda/device_impl.cpp:382`).
   - `src/telemetry/trace-generator.ts` (lines 4–95): Returns 5 static mock spans with fabricated duration and IDs.
2. **Missing OpenTelemetry SDK Packages**:
   - `package.json` (lines 13–22): Contains `@google/generative-ai`, `@modelcontextprotocol/sdk`, `next`, `react`, `tailwind-merge`. Does not include `@opentelemetry/sdk-node`, `@opentelemetry/api`, or any OTLP exporters.
   - `src/agent/otel.ts` (lines 17–82): Contains a lightweight in-memory prompt token tracker (`OtelAiObservability`), but does not interface with OpenTelemetry SDK or export to any OTLP collector.
3. **No FFmpeg in Container**:
   - `Dockerfile` (lines 1–22): Base image `node:20-alpine` runs `apk add --no-cache libc6-compat` but lacks `ffmpeg`.
4. **Mock Incident & Remediation Triggers**:
   - `src/telemetry/studio-state.ts` (lines 63–138): `triggerIncident()` and `executeNodeRemediation()` simply mutate in-memory JavaScript object properties (`vramUsedGb`, `gpuUtilizationPct`) without controlling any background process, allocating actual memory buffers, or resetting process PIDs.

---

## 2. Logic Chain
1. **From Observation 1**: Because all metrics, logs, and traces are static arrays generated on the fly by helper classes without any underlying media workload, the system currently produces 0% real telemetry.
2. **From Observation 2 & 3**: Because `@opentelemetry/sdk-node` and OTLP exporters are absent and `ffmpeg` is not in `Dockerfile`, real background video transcoding and live streaming to Grafana Cloud (Tempo, Mimir, Loki) cannot occur without adding the OpenTelemetry SDK dependencies and container tools.
3. **From Observation 4**: Because incident injection and remediation only mutate JavaScript object fields in memory, Gemini 3.x agents are diagnosing synthetic data rather than authentic process failures.
4. **Synthesized Architecture**:
   - Building a `MediaProcessingEngine` with a 16-worker pool and continuous active job queue running dual execution (real FFmpeg CLI child processes when available + high-throughput in-process video buffer matrix transforms).
   - Instrumenting the engine with `@opentelemetry/sdk-node`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/exporter-metrics-otlp-http`, and `@opentelemetry/exporter-logs-otlp-http`.
   - Employing a Dual-Dispatch Telemetry architecture (streaming OTLP to Grafana Cloud while retaining a fast in-memory ring buffer) guarantees sub-second UI responsiveness and resilient offline development.
   - Implementing authentic incident injection (buffer memory spikes, process exit crashes, async thread hangs) and real process control remediation (`SPLIT_RENDER_TILES`, `RESTART_WORKER_PROCESS`, `PURGE_NODE_VRAM`, `REBALANCE_QUEUE`).

---

## 3. Caveats
- Host environments without local `ffmpeg` installed will execute the high-throughput In-Process Video Matrix Engine rather than the FFmpeg CLI. The containerized deployment on Google Cloud Run will have native FFmpeg installed via `apk add --no-cache ffmpeg`.
- Memory spike incident injection in Node.js must be capped (e.g. allocating buffers within safe limits) to avoid unhandled Node process termination (`FATAL ERROR: Ineffective mark-compacts near heap limit`) while accurately driving worker-level memory telemetry to 99.4%.

---

## 4. Conclusion
Requirement R2 is fully surveyed, mapped, and architected. The blueprint provides:
1. `src/media-engine/engine.ts`, `src/media-engine/worker.ts`, `src/media-engine/transcoder.ts`, and `src/media-engine/types.ts` for the live 16-worker media engine.
2. `src/telemetry/otel-pipeline.ts` for the official OpenTelemetry SDK setup and OTLP export to Grafana Cloud.
3. Concrete file modifications for `Dockerfile`, `package.json`, `app/api/telemetry/route.ts`, `src/telemetry/studio-state.ts`, and `src/mcp/grafana-client.ts`.
4. Detailed verification scripts for `npm test` and API endpoint probing.

---

## 5. Verification Method
1. **Inspect Survey Report**:
   - `view_file` on `c:\Users\brigh\project\agentic-cinema-hackathon\.agents\explorer_2\survey_r2_media_otel.md`
2. **Review Codebase Locations**:
   - `view_file` on `src/telemetry/studio-state.ts`, `src/agent/otel.ts`, `package.json`, `Dockerfile`.
3. **Execution Command**:
   - Run `npm test` once test suite is updated to verify media engine lifecycle, worker queue, incident injection, and OpenTelemetry instrumentation.
