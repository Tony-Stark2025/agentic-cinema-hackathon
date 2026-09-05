import { NextResponse } from 'next/server';
import { GrafanaMcpClient } from '@/src/mcp/grafana-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const mcpClient = GrafanaMcpClient.getInstance();
  const tools = mcpClient.getAvailableTools();
  const status = mcpClient.getStatus();

  return NextResponse.json({
    connected: true,
    protocol: 'Model Context Protocol (MCP) v1.0',
    mode: status.mode,
    mcpBridge: {
      connected: status.mcpConnected,
      endpoint: status.mcpEndpoint
    },
    grafanaRestDriver: {
      configured: status.restConfigured,
      baseUrl: status.grafanaUrl || null
    },
    toolsAvailable: tools.length,
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      requiredParameters: t.parameters.required
    }))
  });
}
