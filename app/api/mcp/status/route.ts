import { NextResponse } from 'next/server';
import { GrafanaMcpClient } from '@/src/mcp/grafana-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const mcpClient = GrafanaMcpClient.getInstance();
  const tools = mcpClient.getAvailableTools();

  return NextResponse.json({
    connected: true,
    protocol: 'Model Context Protocol (MCP) v1.0',
    endpoint: process.env.GRAFANA_MCP_ENDPOINT || 'https://mcp.grafana.com/mcp (or local studio harness)',
    toolsAvailable: tools.length,
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      requiredParameters: t.parameters.required
    }))
  });
}
