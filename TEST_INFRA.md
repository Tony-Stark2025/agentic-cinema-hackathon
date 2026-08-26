# E2E Test Infra: Showrunner Autonomous Studio Operations & Observability Copilot

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md`.
- No reliance on mock objects or simulated tool stubs.
- Multi-tiered verification: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workloads + Adversarial White-Box Hardening.

---

## Feature Inventory & Test Coverage Mapping

| # | Feature | Requirement Source | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Scenario) |
|---|---------|-------------------|:----------------:|:-----------------:|:----------------------:|:-----------------:|
| F1 | Grafana MCP Protocol Bridge | R1 | 5 | 5 | ✓ | ✓ |
| F2 | Direct Grafana REST Driver | R1 | 5 | 5 | ✓ | ✓ |
| F3 | PromQL Metric Query Tool | R1 | 5 | 5 | ✓ | ✓ |
| F4 | LogQL Error Log Query Tool | R1 | 5 | 5 | ✓ | ✓ |
| F5 | Tempo Distributed Trace Tool | R1 | 5 | 5 | ✓ | ✓ |
| F6 | Live Dashboard Annotations | R1 | 5 | 5 | ✓ | ✓ |
| F7 | Active 16-Worker Media Engine | R2 | 5 | 5 | ✓ | ✓ |
| F8 | Real FFmpeg & Matrix Transcoder | R2 | 5 | 5 | ✓ | ✓ |
| F9 | OpenTelemetry SDK Pipeline | R2 | 5 | 5 | ✓ | ✓ |
| F10 | Dual-Dispatch Telemetry Flow | R2 | 5 | 5 | ✓ | ✓ |
| F11 | Authentic Incident Injection | R2 | 5 | 5 | ✓ | ✓ |
| F12 | Real Self-Healing Process Control | R2 | 5 | 5 | ✓ | ✓ |
| F13 | Gemini 3.x Flash 5-Model Pool | R3 | 5 | 5 | ✓ | ✓ |
| F14 | 5x Horizontal Quota Multiplier | R3 | 5 | 5 | ✓ | ✓ |
| F15 | Dynamic 30s Circuit Breaker | R3 | 5 | 5 | ✓ | ✓ |
| F16 | 4-Agent Autonomous Pipeline | R3 | 5 | 5 | ✓ | ✓ |
| F17 | Native Gemini Function Calling | R3 | 5 | 5 | ✓ | ✓ |
| F18 | OpenTelemetry AI Observability | R3 | 5 | 5 | ✓ | ✓ |
| F19 | Cloud Run Standalone Build | R4 | 5 | 5 | ✓ | ✓ |
| F20 | Cloud Run Production Probes | R4 | 5 | 5 | ✓ | ✓ |

---

## Test Architecture
- Test Runner: Node.js Test Runner (`node --test tests/**/*.test.js`)
- Exit Code Semantics: 0 = PASS, non-zero = FAIL
- Test Structure:
  - `tests/tier1-feature-coverage.test.js`: Comprehensive feature unit & component tests.
  - `tests/tier2-boundary-corner.test.js`: Limit boundaries, rate limit trips, network drops, malformed queries.
  - `tests/tier3-pairwise-combinations.test.js`: Cross-module pipelines (Incident -> Telemetry -> Diagnosis -> Remediation -> Verification).
  - `tests/tier4-application-scenarios.test.js`: Real-world end-to-end studio operations scenarios.
  - `tests/tier5-adversarial-hardening.test.js`: White-box adversarial stress tests.

---

## Real-World Application Scenarios (Tier 4)

| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | 4K Render Farm Memory Spike (CUDA OOM) Auto-Remediation | F3, F4, F5, F6, F7, F11, F12, F16, F17 | High |
| 2 | Transcoding Worker Crash & Queue Failover | F4, F7, F8, F11, F12, F16 | High |
| 3 | GPU Shader Deadlock / Thread Hang Recovery | F3, F4, F5, F7, F11, F12, F16 | High |
| 4 | Gemini Multi-Model 429 Quota Exhaustion & Circuit Breaker Failover | F13, F14, F15, F16, F18 | Medium |
| 5 | Cloud Run Live Production Health & Telemetry Sub-Second Stream | F1, F2, F9, F10, F19, F20 | High |

---

## Coverage Thresholds
- Tier 1: ≥5 test cases per feature (Total ≥ 100 tests)
- Tier 2: ≥5 test cases per feature boundaries (Total ≥ 100 tests)
- Tier 3: ≥20 cross-feature pairwise integration tests
- Tier 4: ≥5 realistic application scenarios
- **Total Minimum Test Cases**: ≥ 225 test cases across the test suite
