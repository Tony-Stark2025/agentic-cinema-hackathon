# 🎬 Showrunner: Autonomous Studio Operations & Observability Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Google Cloud Vertex AI](https://img.shields.io/badge/Google%20Cloud-Vertex%20AI%20(Gemini%203.8%20Flash)-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Live%20Demo-34A853?logo=googlecloud&logoColor=white)](https://showrunner-studio-ops-135010851380.us-central1.run.app)
[![Grafana Cloud MCP](https://img.shields.io/badge/Grafana%20Cloud-MCP%20Server-F46800?logo=grafana&logoColor=white)](https://grafana.com)
[![Devpost](https://img.shields.io/badge/Devpost-Agentic%20Cinema-003E54?logo=devpost&logoColor=white)](https://agentic-cinema.devpost.com)

**Live Production URL on Google Cloud Run**: [https://showrunner-studio-ops-135010851380.us-central1.run.app](https://showrunner-studio-ops-135010851380.us-central1.run.app)

**Showrunner** is an enterprise-grade autonomous studio operations copilot built for the **[Agentic Cinema Hackathon (Grafana Labs Track)](https://agentic-cinema.devpost.com)**.

Powered exclusively by **Google Cloud Vertex AI (Gemini 3.8 Flash)** on the **Gemini Enterprise Agent Platform** with uncapped adaptive reasoning and connected to the **Grafana Cloud Model Context Protocol (MCP)** server, Showrunner autonomously monitors, diagnoses, and self-heals VFX 3D render farms (Blender Cycles, Unreal Engine 5.4 Nanite/Lumen) and virtual production LED volumes.

---

## ⚡ Parallel Fan-Out / Fan-In Multi-Agent Architecture

Showrunner replaces slow, serialized pipelines with a high-performance **Central Orchestrator with Parallel Fan-Out / Fan-In** topology, driving end-to-end incident resolution down to **under 4 seconds**:

```
                      ┌──> 📡 Metric Scout (PromQL + Analytics) ──┐
Anomaly Alert ──> Orchestrator ┼──> 📜 Log Hunter (LogQL Error Stream)    ──┼──> [Diagnostic Agent] ──> Orchestrator ┌──> 🛠️ Node Remediation
(Instant)             └──> ⏱️ Trace Profiler (Tempo Span Tree)    ──┘    (Gemini 3.8 Flash)         (Instant)    ├──> 🏷️ Grafana Annotation
                      └─── Parallel Telemetry (~300ms) ───────────┘    (Uncapped Reasoning)                     └──> 💼 Executive ROI Briefing
                                                                                                                └─── Parallel Action (~700ms) ──┘
```

| Agent Role | Model Runtime | Reasoning Mode | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **Sentinel Agent** | `gemini-3.8-flash (Vertex AI)` | High-Speed Validation | Fast telemetry triage & anomaly declaration |
| **Diagnostic Agent** | `gemini-3.8-flash (Vertex AI)` | Uncapped Adaptive | Deep multi-signal synthesis across PromQL, LogQL, and Tempo |
| **Remediation Agent** | `gemini-3.8-flash (Vertex AI)` | Deterministic Tool Loop | Typed MCP self-healing tool execution & GPU memory flushing |
| **Executive Agent** | `gemini-3.8-flash (Vertex AI)` | Financial ROI Synthesis | Dailies production briefing & \$14,400 downtime report |

---

## 🌟 Key Capabilities

- 🧠 **Gemini 3.8 Flash Uncapped Intelligence**: Full, adaptive reasoning depth across all operational agents via `@google/genai` on Google Cloud Vertex AI.
- 🔌 **Official Model Context Protocol (MCP)**: Native integration with `grafana/mcp-grafana` tools for metrics (Mimir), logs (Loki), traces (Tempo), and dashboard annotations.
- 📐 **Deterministic Telemetry Analytics**: First-order derivative memory leak velocity ($\frac{dV}{dt}\text{ MB/s}$), 16-node cluster $Z$-score anomaly detection, and trace span outlier isolation.
- 🛡️ **Zero-Secret Cloud Run Security**: Runs natively on Google Cloud Run via Application Default Credentials (ADC) with zero hardcoded API keys.
- 🖥️ **Studio Operations Command Center**: High-density cinematic UI adhering to `/frontend-design`—zero lecture cards, interactive Tempo trace waterfalls, real-time VRAM velocity gauges, and 1-click blockbuster chaos triggers.

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/Tony-Stark2025/agentic-cinema-hackathon.git
cd agentic-cinema-hackathon
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
```env
GOOGLE_CLOUD_PROJECT=gen-lang-client-0942141479
GOOGLE_CLOUD_REGION=us-central1
GEMINI_MODEL=gemini-3.8-flash
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the **Showrunner Studio Operations Command Center**.

---

## 🧪 Testing

Run the automated unit and integration suite:
```bash
npm test
```

---

## 👥 Authors

- **Tony-Stark2025** ([@Tony-Stark2025](https://github.com/Tony-Stark2025)) - `brightonwe30@gmail.com`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
