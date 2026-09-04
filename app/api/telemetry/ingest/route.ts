import { NextResponse } from 'next/server';
import { StudioStateManager } from '@/src/telemetry/studio-state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.vramUsedGb === undefined) {
      return NextResponse.json(
        { success: false, error: 'vramUsedGb is required' },
        { status: 400 }
      );
    }

    const stateManager = StudioStateManager.getInstance();
    const updatedNode = stateManager.ingestExternalGpuTelemetry({
      nodeId: body.nodeId || 'gpu-node-01',
      vramUsedGb: Number(body.vramUsedGb),
      vramTotalGb: body.vramTotalGb ? Number(body.vramTotalGb) : undefined,
      temperatureC: body.temperatureC ? Number(body.temperatureC) : undefined,
      powerWatts: body.powerWatts ? Number(body.powerWatts) : undefined,
      gpuUtilizationPct: body.gpuUtilizationPct !== undefined ? Number(body.gpuUtilizationPct) : undefined,
      gpuModel: body.gpuModel || 'NVIDIA Real GPU (Live Stream)'
    });

    return NextResponse.json({
      success: true,
      message: `Telemetry ingested for ${updatedNode.id}`,
      node: updatedNode,
      clusterHealth: stateManager.getSnapshot().nodes.filter(n => n.status === 'HEALTHY').length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'INGEST_READY',
    endpoint: '/api/telemetry/ingest',
    format: {
      nodeId: 'string (optional, e.g. "gpu-node-01")',
      vramUsedGb: 'number (required, e.g. 14.2)',
      vramTotalGb: 'number (optional, e.g. 16.0)',
      temperatureC: 'number (optional, e.g. 68)',
      powerWatts: 'number (optional, e.g. 180)',
      gpuUtilizationPct: 'number (optional, e.g. 95)',
      gpuModel: 'string (optional, e.g. "Tesla T4")'
    }
  });
}
