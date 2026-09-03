import { NextResponse } from 'next/server';
import { StudioStateManager } from '@/src/telemetry/studio-state';
import { ShowrunnerOrchestrator } from '@/src/agent/orchestrator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodeId, actionType, incidentId, session } = body;

    const stateManager = StudioStateManager.getInstance();
    const orchestrator = ShowrunnerOrchestrator.getInstance();

    let incident = stateManager.getActiveIncidents().find(i => i.id === incidentId);
    if (!incident) {
      incident = stateManager.getActiveIncidents().find(i => i.affectedNodeId === nodeId) || stateManager.getActiveIncidents()[0];
    }

    if (incident && session) {
      // Execute the approved remediation through the orchestrator
      const updatedSession = await orchestrator.executeApprovedRemediation(incident, session, actionType);
      return NextResponse.json({
        success: true,
        session: updatedSession,
        incident: stateManager.getActiveIncidents().find(i => i.id === incident.id)
      });
    }

    if (!nodeId || !actionType) {
      return NextResponse.json({ success: false, error: 'nodeId and actionType required' }, { status: 400 });
    }

    const result = stateManager.executeNodeRemediation(nodeId, actionType);
    return NextResponse.json({
      success: result.success,
      message: result.message
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
