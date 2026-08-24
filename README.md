# 🎬 Showrunner: Autonomous Studio Operations & Observability Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Google Gemini 3.x](https://img.shields.io/badge/Google%20Gemini-3.x%20Flash%20Pool-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Grafana Cloud MCP](https://img.shields.io/badge/Grafana%20Cloud-MCP%20Server-F46800?logo=grafana&logoColor=white)](https://grafana.com)
[![Devpost](https://img.shields.io/badge/Devpost-Agentic%20Cinema-003E54?logo=devpost&logoColor=white)](https://agentic-cinema.devpost.com)

**Showrunner** is an enterprise-grade autonomous studio operations copilot built for the **[Agentic Cinema Hackathon (Grafana Labs Track)](https://agentic-cinema.devpost.com)**.

Powered by a high-throughput **Google Gemini 3.x Flash & Flash-Lite Multi-Model Pool** and connected to the **Grafana Cloud Model Context Protocol (MCP)** server, Showrunner autonomously monitors, diagnoses, and self-heals VFX 3D render farms (Blender Cycles, Unreal Engine 5.4 Nanite/Lumen) and virtual production LED volumes.

---

## 🌟 Key Features

- 🧠 **Gemini 3.x Multi-Model Pool**: Intelligently load-balances across `gemini-3.1-flash`, `gemini-3.1-flash-lite`, `gemini-3.0-flash`, and `gemini-3.0-flash-lite` to eliminate per-model rate limits.
- 🤖 **Autonomous Multi-Agent Crew**:
  - **Sentinel Agent** (`gemini-3.1-flash-lite`): Real-time sub-second PromQL anomaly detection.
  - **Diagnostic Agent** (`gemini-3.1-flash`): LogQL crash dump extraction & Tempo distributed trace isolation.
  - **Remediation Agent** (`gemini-3.1-flash`): Autonomous GPU VRAM flushing, tile re-splitting, and job failover via MCP.
  - **Executive Agent** (`gemini-3.1-flash-lite`): Financial downtime savings calculation and daily studio production summaries.
- 🔌 **Official Model Context Protocol (MCP)**: Native integration with `grafana/mcp-grafana` tools for metrics (Mimir), logs (Loki), traces (Tempo), and dashboard annotations.
- 📊 **OpenTelemetry AI Observability**: In-depth monitoring of LLM latency, token usage, and tool invocations.
- 🖥️ **Studio Operations Command Center**: High-fidelity dark cinematic UI displaying real-time 16-node GPU clusters, live agent reasoning streams, interactive incident simulators, and Technical Director chat console.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Studio Infrastructure
        RF[VFX 3D Render Clusters: Unreal Engine 5.4 / Blender] -->|Prometheus Metrics| GC[Grafana Cloud Observability Stack]
        VP[Virtual Production LED Stages & Video Ingest] -->|Loki Logs| GC
        MS[GenMedia Microservices & Transcoding Nodes] -->|Tempo Distributed Traces| GC
    end

    subgraph Showrunner Agentic Core (Gemini 3.x + MCP)
        GC <-->|Grafana Cloud MCP Server 60+ Tools| MCPG[MCP Gateway Client]
        MCPG <--> GE[Gemini 3.x Multi-Agent Orchestrator]
        
        subgraph Multi-Model Pool
            M1[gemini-3.1-flash]
            M2[gemini-3.1-flash-lite]
            M3[gemini-3.0-flash]
            M4[gemini-3.0-flash-lite]
        end
        GE --- Multi-Model Pool
        
        subgraph Multi-Agent Crew
            A1[Sentinel Agent: Anomaly Detection]
            A2[Diagnostic Agent: Root Cause Analysis]
            A3[Remediation Agent: Dynamic Self-Healing]
            A4[Executive Agent: Financial Impact & Dailies]
        end
        GE --- A1
        GE --- A2
        GE --- A3
        GE --- A4
        
        GE <--> OTEL[OpenTelemetry AI Observability]
        OTEL -->|LLM Spans, Latency, Token Metrics| GC
    end

    subgraph Studio Command Center
        GE <--> UI[Next.js 15 Dark Studio Command Center]
        UI --> TD[VFX Technical Director & Studio Executives]
    end
```

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
GEMINI_PRIMARY_MODEL=gemini-3.1-flash
GEMINI_LITE_MODEL=gemini-3.1-flash-lite
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
