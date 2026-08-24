import { NextResponse } from 'next/server';
import { StudioStateManager } from '@/src/telemetry/studio-state';
import { GrafanaMcpClient } from '@/src/mcp/grafana-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodeId, actionType } = body;

    if (!nodeId || !actionType) {
      return NextResponse.json({ success: false, error: 'nodeId and actionType required' }, { status: 400 });
    }

    const stateManager = StudioStateManager.getInstance();
    const result = stateManager.executeNodeRemediation(nodeId, actionType);

    // Annotate Grafana
    const mcpClient = GrafanaMcpClient.getInstance();
    await mcpClient.executeTool('grafana_annotate_dashboard', {
      dashboardId: 'vfx-render-farm-live',
      text: `Manual Remediation Triggered: ${actionType} on ${nodeId}`,
      tags: 'showrunner,manual-action'
    });

    return NextResponse.json({
      success: result.success,
      message: result.message
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
