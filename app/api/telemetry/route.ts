import { NextResponse } from 'next/server';
import { StudioStateManager } from '@/src/telemetry/studio-state';
import { GeminiModelPool } from '@/src/agent/model-pool';
import { OtelAiObservability } from '@/src/agent/otel';

export async function GET() {
  const stateManager = StudioStateManager.getInstance();
  const modelPool = GeminiModelPool.getInstance();
  const otel = OtelAiObservability.getInstance();

  const snapshot = stateManager.getSnapshot();
  const incidents = stateManager.getActiveIncidents();
  const modelMetrics = modelPool.getModelMetrics();
  const otelAggregates = otel.getAggregates();

  return NextResponse.json({
    telemetry: snapshot,
    incidents,
    modelPool: {
      activeModels: modelMetrics,
      aiObservability: otelAggregates
    }
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const stateManager = StudioStateManager.getInstance();

  if (body.action === 'TRIGGER_INCIDENT') {
    const incident = stateManager.triggerIncident(
      body.category || 'CUDA_OOM_MEMORY_LEAK',
      body.nodeId || 'gpu-node-04'
    );
    return NextResponse.json({ success: true, incident });
  }

  if (body.action === 'RESET_HEALTHY') {
    stateManager.resetToHealthy();
    return NextResponse.json({ success: true, message: 'Studio cluster reset to healthy state.' });
  }

  return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
}
