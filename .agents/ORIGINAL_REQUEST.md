# Original User Request

## 2026-08-26T19:18:13Z

Build and deploy an enterprise-grade, production-ready version of Showrunner (Autonomous Studio Operations & Observability Copilot) on Google Cloud Run, completely replacing all mock tools and synthetic data with live Model Context Protocol (MCP) connections to Grafana Cloud, real OpenTelemetry metric/log/trace instrumentation on live media processing workloads, and live Gemini 3.x Flash multi-agent execution on Google Cloud Agent Platform.

Working directory: c:\Users\brigh\project\agentic-cinema-hackathon
Integrity mode: development

## Requirements

### R1. Live Grafana Cloud Model Context Protocol (MCP) Integration
Connect Showrunner directly to live Grafana Cloud via the Model Context Protocol (MCP) client (@modelcontextprotocol/sdk / https://mcp.grafana.com/mcp or direct Grafana Mimir/Loki/Tempo APIs). Remove all mock responses and simulated MCP handlers. The agent must execute real PromQL queries against Grafana metrics, real LogQL queries against Loki logs, fetch real distributed trace span trees from Tempo, and push real incident annotation markers to Grafana dashboards.

### R2. Live Production Media Engine & OpenTelemetry Pipeline
Implement an active, real background media processing engine (e.g. real FFmpeg / video transcoding and rendering worker cluster) instrumented with live OpenTelemetry (@opentelemetry/sdk-node or OpenLIT). This engine must emit real-time CPU/GPU/memory metrics, structured application logs, and distributed trace spans to Grafana Cloud / OpenTelemetry collector, enabling the multi-agent system to monitor and diagnose real-world media pipeline workloads.

### R3. Gemini 3.x Flash Multi-Agent Crew & Rate-Limit Evasion
Implement the multi-agent crew (Sentinel, Diagnostician, Remediation, Executive) using live Google GenAI SDK (@google/generative-ai) and the Gemini 3.x Flash distributed pool (gemini-3.7-flash, gemini-3.6-flash, gemini-3.5-flash, gemini-3.5-flash-lite, gemini-3.1-flash-lite) with live function calling / tool invocation. When an operational failure occurs in the live media pipeline (e.g. process memory limit, transcoding crash, hung thread), the agents must autonomously diagnose root causes from real telemetry and execute real self-healing actions (e.g. worker process restart, tile/chunk re-splitting, queue rebalancing).

### R4. Google Cloud Run Deployment & Production Hardening
Containerize and deploy the full-stack Next.js application to Google Cloud Run on GCP project gen-lang-client-0942141479 in region us-central1. Ensure zero compilation errors, full environment variable configuration (for GEMINI_API_KEY, GRAFANA_CLOUD_URL, GRAFANA_SERVICE_TOKEN, GRAFANA_MCP_ENDPOINT), secure public accessibility, and sub-second UI responsiveness.

## Verification Resources

- Automated Test Suite: Execute npm test verifying live MCP tool calling, PromQL/LogQL query parsers, and multi-agent state transitions.
- Live Endpoint Verification: Programmatic health check and API probe against the deployed Cloud Run service URL (https://showrunner-studio-ops-135010851380.us-central1.run.app/api/telemetry and /api/mcp/status).
- Live Incident & Remediation Test: Trigger a real media worker error and verify end-to-end that:
  1. Real PromQL detects the CPU/memory spike.
  2. Live LogQL captures the real error stack trace.
  3. Live Tempo trace isolates the failing pipeline span.
  4. The Remediation Agent restores the live worker process and verifies recovery.

## Acceptance Criteria

### Live Observability & Real MCP Connectivity
- [ ] Zero mock data: All PromQL, LogQL, and Tempo queries route through live Grafana MCP / Grafana Cloud APIs.
- [ ] Live MCP tool execution returns authentic Grafana response structures and displays them in the UI.
- [ ] Incident annotations are visibly written to the Grafana production dashboard.

### Real Media Workload & Telemetry
- [ ] A live media processing worker service actively runs and streams real OpenTelemetry metrics, logs, and trace spans.
- [ ] Triggered pipeline incidents cause real telemetry anomalies measurable via Grafana.

### Autonomous Agent Intelligence on Google Cloud
- [ ] The 4-agent crew executes live reasoning steps using the Gemini 3.x Flash model pool with automatic failover and circuit breaking.
- [ ] Remediation actions actually execute real process control (restarting workers, reallocating chunks) on the running media engine.
- [ ] OpenTelemetry AI Observability captures live token counts, latency, and model metrics for every agent invocation.

### Production Cloud Run Deployment
- [ ] The application is deployed and healthy on Google Cloud Run (gen-lang-client-0942141479).
- [ ] All UI features (GPU cluster visualizer, multi-agent reasoning trace, incident center, technical director chat) operate flawlessly with real data.

## Follow-up — 2026-08-26T19:48:06Z

IMPORTANT USER INSTRUCTION UPDATE:
The user has requested:
"Use gemini 3.7 flash in Vertex AI for all agents. Scrap the multi-model and rate-limit-bypass system."

Please update your project architecture, requirements, and implementation plans accordingly:
1. Standardize on `gemini-3.7-flash` across all agent roles (Sentinel, Diagnostician, Remediation, Executive).
2. Use Google Cloud Vertex AI SDK / API for agent model execution.
3. Remove the multi-model rotation / fallback pooling mechanism and replace it with a clean, unified Vertex AI Gemini 3.7 Flash integration.
