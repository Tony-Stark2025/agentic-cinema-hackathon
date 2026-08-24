import { NextResponse } from 'next/server';
import { ShowrunnerOrchestrator } from '@/src/agent/orchestrator';
import { StudioStateManager } from '@/src/telemetry/studio-state';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stateManager = StudioStateManager.getInstance();
    const orchestrator = ShowrunnerOrchestrator.getInstance();

    let incident = stateManager.getActiveIncidents().find(i => i.id === body.incidentId);

    if (!incident) {
      // Trigger a fresh incident if none was provided
      incident = stateManager.triggerIncident(
        body.category || 'CUDA_OOM_MEMORY_LEAK',
        body.nodeId || 'gpu-node-04'
      );
    }

    const session = await orchestrator.investigateAndRemediateIncident(incident);

    return NextResponse.json({
      success: true,
      session,
      incident: stateManager.getActiveIncidents().find(i => i.id === incident!.id)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
