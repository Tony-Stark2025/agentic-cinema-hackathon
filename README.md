# 🎬 Showrunner: Autonomous Studio Operations & Observability Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Google Gemini 3.x](https://img.shields.io/badge/Google%20Gemini-3.x%20Flash%20Pool%20(5x%20Quota)-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Grafana Cloud MCP](https://img.shields.io/badge/Grafana%20Cloud-MCP%20Server-F46800?logo=grafana&logoColor=white)](https://grafana.com)
[![Devpost](https://img.shields.io/badge/Devpost-Agentic%20Cinema-003E54?logo=devpost&logoColor=white)](https://agentic-cinema.devpost.com)

**Showrunner** is an enterprise-grade autonomous studio operations copilot built for the **[Agentic Cinema Hackathon (Grafana Labs Track)](https://agentic-cinema.devpost.com)**.

Powered by a high-throughput **Google Gemini 3.x Distributed Model Pool (`gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`)** and connected to the **Grafana Cloud Model Context Protocol (MCP)** server, Showrunner autonomously monitors, diagnoses, and self-heals VFX 3D render farms (Blender Cycles, Unreal Engine 5.4 Nanite/Lumen) and virtual production LED volumes.

---

## ⚡ 5x Rate-Limit Evasion & Multi-Model Pool

Google Gemini API enforces rate limits (RPM / TPM) **per model ID**. Showrunner pools all 5 official Gemini 3.x Flash and Flash-Lite models into a dynamic load-balanced cluster with automatic circuit breakers:

| Agent Role | Primary Model | Fallback Cascade | Purpose |
| :--- | :--- | :--- | :--- |
| **Sentinel Agent** | `gemini-3.5-flash-lite` | `3.1-lite` &rarr; `3.6` &rarr; `3.5` &rarr; `3.7` | Sub-second telemetry scanning |
| **Diagnostic Agent** | `gemini-3.7-flash` | `3.6` &rarr; `3.5` &rarr; `3.5-lite` &rarr; `3.1-lite` | Deep LogQL crash dump & Tempo trace reasoning |
| **Remediation Agent** | `gemini-3.6-flash` | `3.7` &rarr; `3.5` &rarr; `3.5-lite` &rarr; `3.1-lite` | Deterministic MCP self-healing tool execution |
| **Executive Agent** | `gemini-3.1-flash-lite` | `3.5-lite` &rarr; `3.6` &rarr; `3.5` &rarr; `3.7` | Studio dailies & \$14,400 financial savings report |

---

## 🌟 Key Capabilities

- 🛡️ **500% Quota Multiplier & Circuit Breaker**: Distributes requests across 5 model endpoints with 30s automatic cooldown on HTTP 429 errors.
- 🔌 **Official Model Context Protocol (MCP)**: Native integration with `grafana/mcp-grafana` tools for metrics (Mimir), logs (Loki), traces (Tempo), and dashboard annotations.
- 📊 **OpenTelemetry AI Observability**: In-depth monitoring of LLM latency, token throughput, and model utilization.
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
Copy `.env.example` to `.env.local` and add your **Gemini API Key**:
```bash
cp .env.example .env.local
```
```env
GEMINI_API_KEY=your_gemini_api_key_here
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
