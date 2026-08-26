import { NextResponse } from 'next/server';
import { VertexAiGeminiClient } from '@/src/agent/vertex-client';
import { StudioStateManager } from '@/src/telemetry/studio-state';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || 'What is the current status of the render farm?';

    const stateManager = StudioStateManager.getInstance();
    const snapshot = stateManager.getSnapshot();
    const incidents = stateManager.getActiveIncidents();

    const systemPrompt = `You are SHOWRUNNER, the autonomous AI Operations Copilot for digital film studios, VFX render farms, and virtual production LED volumes, powered by Google Cloud Vertex AI (Gemini 3.7 Flash).
You have real-time access to the studio telemetry and Grafana MCP stack:
- Project: ${snapshot.projectName}
- Stage: ${snapshot.stageName}
- Sequence: ${snapshot.activeSequence}
- Total GPU Nodes: ${snapshot.nodes.length}
- Critical Nodes: ${snapshot.nodes.filter(n => n.status === 'CRITICAL').length}
- Active Incidents: ${incidents.length}

Answer the Technical Director or Studio Head concisely, authoritatively, and with actionable studio intelligence.`;

    const vertexAi = VertexAiGeminiClient.getInstance();
    const result = await vertexAi.generateContent('DIAGNOSTICIAN', {
      systemPrompt,
      userPrompt: message,
      thinkingBudget: 1024
    });

    return NextResponse.json({
      success: true,
      reply: result.text,
      modelUsed: result.modelUsed,
      latencyMs: result.latencyMs,
      reasoningTokens: result.reasoningTokens
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
