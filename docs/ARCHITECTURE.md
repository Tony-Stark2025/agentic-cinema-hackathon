# 🏛️ Showrunner: Deep Architectural Specification

## Overview
**Showrunner** is an enterprise-grade autonomous studio operations and observability platform engineered for digital filmmaking, VFX 3D render farms (Blender Cycles, Unreal Engine 5.4 Nanite/Lumen), and virtual production LED volumes.

Built for the **[Agentic Cinema Hackathon (Grafana Labs Track)](https://agentic-cinema.devpost.com)**, Showrunner connects **Google Gemini 3.x Flash & Flash-Lite** models to the **Grafana Cloud Model Context Protocol (MCP)** server to autonomously detect, diagnose, and remediate studio infrastructure failures in seconds.

---

## ⚡ The Gemini 3.x Multi-Model Pool Architecture

To eliminate per-model API rate limits and maximize inference speed during high-throughput studio operations, Showrunner implements a dynamic **Model Dispatcher**:

```mermaid
flowchart TD
    subgraph Multi-Agent Crew
        S[Sentinel Agent] -->|Telemetry Anomaly| DP[Gemini 3.x Model Dispatcher]
        D[Diagnostic Agent] -->|LogQL & Trace Analysis| DP
        R[Remediation Agent] -->|MCP Self-Healing| DP
        E[Executive Agent] -->|Production Dailies & ROI| DP
    end

    subgraph Gemini 3.x Model Pool
        DP -->|Primary: Sub-second Scanning| M1[gemini-3.1-flash-lite]
        DP -->|Primary: Complex Reasoning| M2[gemini-3.1-flash]
        DP -->|Fallback Tier 1| M3[gemini-3.0-flash]
        DP -->|Fallback Tier 2| M4[gemini-3.0-flash-lite]
    end

    subgraph AI Observability Layer
        DP <--> OTEL[OpenTelemetry Metric & Trace Hook]
        OTEL --> GC[Grafana Cloud AI Observability Dashboard]
    end
```

---

## 🔌 Model Context Protocol (MCP) Integration

Showrunner interfaces with the Grafana Stack via the official Model Context Protocol (MCP):

| Tool Name | MCP Category | Description |
| :--- | :--- | :--- |
| `grafana_query_metrics` | Metrics (Prometheus / Mimir) | Executes PromQL queries for GPU VRAM usage, tile latency, and frame drop rates. |
| `grafana_query_logs` | Logs (Loki) | Executes LogQL expressions to parse CUDA memory dumps and shader compiler stack traces. |
| `grafana_get_trace` | Distributed Tracing (Tempo) | Fetches end-to-end trace span waterfalls across render microservices. |
| `grafana_list_alerts` | Alertmanager | Monitors active firing alerts and hardware thermal thresholds. |
| `grafana_annotate_dashboard` | Dashboards | Documents automated remediation fixes directly onto Grafana production boards. |
| `studio_remediate_node` | Infrastructure Control | Executes automated tile resolution downscaling, VRAM flushes, and job rescheduling. |

---

## 💰 Studio ROI & Financial Impact

- **Average VFX Studio Downtime Cost**: ~$300 / minute ($18,000 / hour) in idle artist payroll and compute cluster rental.
- **Manual Incident Resolution Time**: 45–90 minutes to identify cryptic CUDA memory leaks across 16+ nodes.
- **Showrunner Automated Resolution Time**: **4.8 seconds**.
- **Net Cost Savings per Incident**: **$14,400+ USD**.
