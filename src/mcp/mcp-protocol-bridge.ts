import { GrafanaMcpToolDefinition } from '../types/grafana';

export class McpProtocolBridge {
  private static instance: McpProtocolBridge;
  private endpointUrl: string;
  private token: string;
  private client: any = null;
  private transport: any = null;
  private connected: boolean = false;
  private remoteTools: GrafanaMcpToolDefinition[] = [];
  private connectionPromise: Promise<boolean> | null = null;

  private constructor() {
    this.endpointUrl = process.env.GRAFANA_MCP_ENDPOINT || 'https://mcp.grafana.com/mcp';
    this.token = process.env.GRAFANA_SERVICE_TOKEN || process.env.GRAFANA_API_KEY || '';
  }

  public static getInstance(): McpProtocolBridge {
    if (!McpProtocolBridge.instance) {
      McpProtocolBridge.instance = new McpProtocolBridge();
    }
    return McpProtocolBridge.instance;
  }

  public getEndpoint(): string {
    return this.endpointUrl;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getDiscoveredTools(): GrafanaMcpToolDefinition[] {
    return this.remoteTools;
  }

  /**
   * Initializes connection to the MCP Server over SSE.
   * Gracefully fails without throwing if the remote server is unreachable.
   */
  public async connect(): Promise<boolean> {
    if (this.connected) return true;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = (async () => {
      try {
        const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
        const { SSEClientTransport } = await import('@modelcontextprotocol/sdk/client/sse.js');

        const headers: Record<string, string> = {
          'User-Agent': 'Showrunner-Studio-Ops-Copilot/1.0.0'
        };
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const url = new URL(this.endpointUrl);
        const transport = new SSEClientTransport(url, {
          requestInit: {
            headers,
            signal: AbortSignal.timeout(3000)
          }
        });

        const client = new Client(
          {
            name: 'showrunner-studio-ops-copilot',
            version: '1.0.0'
          },
          {
            capabilities: {}
          }
        );

        await client.connect(transport);
        this.client = client;
        this.transport = transport;
        this.connected = true;

        // Discover remote MCP tools
        const toolsResult = await client.listTools();
        if (toolsResult?.tools) {
          this.remoteTools = toolsResult.tools.map((t: any) => ({
            name: t.name,
            description: t.description || '',
            parameters: t.inputSchema || { type: 'object', properties: {}, required: [] }
          }));
        }

        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[McpProtocolBridge] MCP server connection to ${this.endpointUrl} unavailable (${msg}). Gracefully operating in hybrid fallback mode.`);
        this.connected = false;
        return false;
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  /**
   * Calls a tool on the remote MCP server.
   */
  public async callTool(name: string, args: Record<string, unknown>): Promise<{ success: boolean; data: unknown }> {
    if (!this.connected || !this.client) {
      throw new Error(`McpProtocolBridge is not connected to ${this.endpointUrl}`);
    }

    const timeoutSignal = AbortSignal.timeout(4000);
    const result = await this.client.callTool(
      {
        name,
        arguments: args
      },
      undefined,
      { signal: timeoutSignal }
    );

    return {
      success: true,
      data: {
        source: `Grafana Cloud MCP Server (${this.endpointUrl})`,
        tool: name,
        result: result.content
      }
    };
  }

  public async close(): Promise<void> {
    if (this.transport) {
      try {
        await this.transport.close();
      } catch {
        // Ignored
      }
      this.transport = null;
    }
    this.client = null;
    this.connected = false;
  }
}
