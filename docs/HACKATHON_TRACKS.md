# 🎬 Agentic Cinema: The Blockbuster Hackathon - Tracks & Resources Reference

**Hackathon URL**: [https://agentic-cinema.devpost.com](https://agentic-cinema.devpost.com)  
**Resources URL**: [https://agentic-cinema.devpost.com/resources](https://agentic-cinema.devpost.com/resources)  
**Deadline**: September 9, 2026 @ 2:00pm PDT (5:00pm EDT)  
**Total Cash Prizes**: $75,000 across 3 identical prize buckets ($7,500 1st, $4,500 2nd, $3,000 3rd per track).

---

## 🎯 Judging Criteria

1. **Technological Implementation**: How well is the project built, and how effectively does it use Google Cloud and the Partner services as part of the solution?
2. **Design**: Does the project deliver a complete, coherent product experience not just a technical proof of concept?
3. **Potential Impact**: Does the project make a credible, specific case for solving a real problem for a real audience and does the solution actually address it based on what's demonstrated?
4. **Quality of the Idea**: Is this a creative, non-obvious use of Google Cloud and the Partner services and does the team show genuine understanding of the problem space?

---

## 🚀 The 5 Partner Tracks

### 1. IBM Track
- **Requirement**: Must be built using **IBM Bob** as part of the development process. Use of **Confluent** is optional but strongly encouraged for real-time data & event-driven workflows.
- **Resources**:
  - [IBM Google Partnership](https://agentic-cinema.devpost.com/details/ibm-resources)
  - IBM Bob Quick Start & Best Practices

### 2. Grafana Labs Track
- **Requirement**: Must actively use the Grafana stack at runtime, primarily through the **Grafana Cloud MCP server** (`grafana/mcp-grafana` or `https://mcp.grafana.com/mcp`), exposing 60+ tools for metrics (PromQL), logs (LogQL), traces (Tempo), dashboard search, and incident alerting.
- **AI Observability**: OpenTelemetry-native monitoring of LLM calls, token usage, latency, and MCP tool activity.
- **Resources**:
  - [Grafana MCP Docs](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/configure/cloud-mcp/)
  - [ADK Grafana Cloud Integration](https://agentic-cinema.devpost.com/details/grafana-resources)

### 3. Parallel Web Systems Track
- **Requirement**: Must actively use **Parallel's Search API** at runtime via `@parallel-web/ai-sdk-tools`, `parallel-web` Python/TS SDK, LangChain `ParallelWebSearchTool`, or Parallel Grounding provider.
- **Use Cases**: Real-time web intelligence, deep research, web content extraction (`Extract API`), market analysis, box-office and film review monitoring (`Monitor API`).
- **Resources**:
  - [Parallel Search API Quickstart](https://agentic-cinema.devpost.com/details/parallel-resources)
  - [Parallel MCP Server](https://agentic-cinema.devpost.com/details/parallel-resources)

### 4. ClickHouse Track
- **Requirement**: Must actively use ClickHouse at runtime via the official **ClickHouse MCP server** (`mcp-clickhouse`), connecting to ClickHouse Cloud or self-hosted cluster.
- **Use Cases**: High-performance real-time analytics, vector / script dataset queries, box office and streaming telemetry analysis.
- **Resources**:
  - [ClickHouse MCP Server](https://agentic-cinema.devpost.com/details/clickhouse-resources)
  - [AgentHouse Demo](https://llm.clickhouse.com)

### 5. Replit Track
- **Requirement**: Must be built using **Replit Agent** during development and deployed/hosted on Replit (`*.replit.app` or `*.replit.dev`).
- **Resources**:
  - [Replit Hackathon Resources](https://agentic-cinema.devpost.com/details/replit-resources)

---

## 🛠️ Google Cloud GenMedia & Agent Tooling

- **Gemini Enterprise Agent Platform & ADK**: `pip install "google-cloud-aiplatform[agent_engines,adk]>=1.101.0"`
- **Live API Streaming**: Low-latency bidirectional audio with Gemini Live API for script rehearsals and interactive voice director.
- **Multimodal Video & Script Analysis**: Video transcription, asset captioning, and screenplay RAG with BigQuery Vector Search.
- **GenMedia Asset Creation**: Imagen 3 for storyboard panels and Lyria 3 / Gemini TTS for multi-speaker dialogue and soundtracks.
