# 🎬 Showrunner: Autonomous Studio Operations & Observability Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Google Cloud Vertex AI](https://img.shields.io/badge/Google%20Cloud-Vertex%20AI%20(Gemini%203.7%20Flash)-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Live%20Demo-34A853?logo=googlecloud&logoColor=white)](https://showrunner-studio-ops-135010851380.us-central1.run.app)
[![Grafana Cloud MCP](https://img.shields.io/badge/Grafana%20Cloud-MCP%20Server-F46800?logo=grafana&logoColor=white)](https://grafana.com)
[![Devpost](https://img.shields.io/badge/Devpost-Agentic%20Cinema-003E54?logo=devpost&logoColor=white)](https://agentic-cinema.devpost.com)

**Live Production URL on Google Cloud Run**: [https://showrunner-studio-ops-135010851380.us-central1.run.app](https://showrunner-studio-ops-135010851380.us-central1.run.app)

**Showrunner** is an enterprise-grade autonomous studio operations copilot built for the **[Agentic Cinema Hackathon (Grafana Labs Track)](https://agentic-cinema.devpost.com)**.

Powered exclusively by **Google Cloud Vertex AI (Gemini 3.7 Flash)** with native hybrid reasoning budgets and connected to the **Grafana Cloud Model Context Protocol (MCP)** server, Showrunner autonomously monitors, diagnoses, and self-heals VFX 3D render farms (Blender Cycles, Unreal Engine 5.4 Nanite/Lumen) and virtual production LED volumes.

---

## ⚡ Google Cloud Vertex AI & Gemini 3.7 Flash Multi-Agent Architecture

All agents across the autonomous studio crew run on **`gemini-3.7-flash`** with role-tailored reasoning token budgets:

| Agent Role | Model Runtime | Reasoning Budget | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **Sentinel Agent** | `gemini-3.7-flash (Vertex AI)` | `1024 tokens` | High-speed telemetry scanning & anomaly declaration |
| **Diagnostic Agent** | `gemini-3.7-flash (Vertex AI)` | `2048 tokens` | Deep LogQL crash dump parsing & Tempo trace root cause isolation |
| **Remediation Agent** | `gemini-3.7-flash (Vertex AI)` | `1024 tokens` | Deterministic MCP self-healing tool execution & GPU memory flushing |
| **Executive Agent** | `gemini-3.7-flash (Vertex AI)` | `1024 tokens` | Studio dailies synthesis & \$14,400 financial downtime report |

---

## 🌟 Key Capabilities

- 🧠 **Universal Gemini 3.7 Flash Intelligence**: Flagship multimodal reasoning model across all operational agents.
- 🔌 **Official Model Context Protocol (MCP)**: Native integration with `grafana/mcp-grafana` tools for metrics (Mimir), logs (Loki), traces (Tempo), and dashboard annotations.
- 📊 **OpenTelemetry AI Observability**: Real-time token tracking, latency profiling, and reasoning metrics.
- 🖥️ **Studio Operations Command Center**: High-fidelity dark cinematic UI displaying real-time 16-node GPU clusters, live agent reasoning streams, interactive incident simulators, and Technical Director chat console.

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
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_PROJECT=gen-lang-client-0942141479
GOOGLE_CLOUD_REGION=us-central1
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the **Showrunner Studio Operations Command Center**.

---

## 🧪 Testing

Run the automated test suite:
```bash
npm test
```

---

## 👥 Authors

- **Tony-Stark2025** ([@Tony-Stark2025](https://github.com/Tony-Stark2025)) - `brightonwe30@gmail.com`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
