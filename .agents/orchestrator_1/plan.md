# Orchestration Plan — Showrunner Project

## 1. Survey Phase
- Spawn 3 parallel Explorers:
  - **Explorer 1**: Analyze R1 (Grafana Cloud MCP integration, PromQL/LogQL/Tempo trace retrieval, annotations, existing simulated MCP endpoints, @modelcontextprotocol/sdk integration).
  - **Explorer 2**: Analyze R2 (Live Media Processing Engine, background worker cluster / FFmpeg, OpenTelemetry SDK instrumentation, metric/log/trace emitter, failure injection).
  - **Explorer 3**: Analyze R3 & R4 (Gemini 3.x Flash multi-agent crew, @google/generative-ai integration, self-healing tool handlers, Next.js application architecture, Dockerfile, Google Cloud Run deployment configuration on project gen-lang-client-0942141479).
- Synthesize survey findings into `PROJECT.md` (Architecture, Feature Inventory, Milestones, Interface Contracts, Code Layout).

## 2. Decomposition & Dual Track Architecture
- **E2E Testing Track**:
  - Spawn E2E Testing subagents to build opaque-box 4-tier test harness.
  - Generates `TEST_INFRA.md` and signals completion via `TEST_READY.md`.
- **Implementation Track**:
  - Decompose into modular milestones:
    - Milestone 1: Live Grafana MCP Client & Observability Data Source Layer
    - Milestone 2: Live Media Engine Cluster with OpenTelemetry Instrumentation
    - Milestone 3: Gemini 3.x Flash Multi-Agent Crew & Autonomous Remediation
    - Milestone 4: Full-Stack Integration, UI Wiring & Cloud Run Deployment
    - Milestone 5: Final Acceptance (100% E2E tests pass + Adversarial Hardening)

## 3. Execution & Verification Flow
- Each milestone executes the strict gate: Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.
- Deploy full-stack service to Google Cloud Run (gen-lang-client-0942141479, us-central1).
- Live incident remediation end-to-end verification.
- Comprehensive handoff report to Sentinel.
