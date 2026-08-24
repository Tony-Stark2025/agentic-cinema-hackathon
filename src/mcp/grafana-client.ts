import { StudioStateManager } from '../telemetry/studio-state';

export interface GrafanaMcpToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export class GrafanaMcpClient {
  private static instance: GrafanaMcpClient;
  private stateManager: StudioStateManager;

  private constructor() {
    this.stateManager = StudioStateManager.getInstance();
  }

  public static getInstance(): GrafanaMcpClient {
    if (!GrafanaMcpClient.instance) {
      GrafanaMcpClient.instance = new GrafanaMcpClient();
    }
    return GrafanaMcpClient.instance;
  }

  public getAvailableTools(): GrafanaMcpToolDefinition[] {
    return [
      {
        name: 'grafana_query_metrics',
        description: 'Execute a PromQL query against Grafana Mimir/Prometheus to fetch GPU VRAM utilization, frame render latency, and cluster health metrics.',
        parameters: {
          type: 'object',
          properties: {
            promql: {
              type: 'string',
              description: 'The PromQL query string (e.g., `gpu_vram_utilization_ratio{cluster="alpha"}`, `render_tile_latency_seconds_bucket`)'
            },
            timeRange: {
              type: 'string',
              description: 'Time window for query (e.g., "5m", "15m", "1h")'
            }
          },
          required: ['promql']
        }
      },
      {
        name: 'grafana_query_logs',
        description: 'Execute a LogQL query against Grafana Loki to retrieve structured crash dumps, CUDA error stack traces, and shader compiler logs.',
        parameters: {
          type: 'object',
          properties: {
            logql: {
              type: 'string',
              description: 'The LogQL expression (e.g., `{service=~"blender-cycles|unreal-nanite"} |= "CUDA error" | json`)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of log lines to return (default 20)'
            }
          },
          required: ['logql']
        }
      },
      {
        name: 'grafana_get_trace',
        description: 'Fetch distributed trace waterfall from Grafana Tempo for a specific rendering transaction or frame assembly pipeline to identify exact bottleneck microservices.',
        parameters: {
          type: 'object',
          properties: {
            traceId: {
              type: 'string',
              description: 'The distributed trace ID (e.g., "trace-err-842")'
            }
          },
          required: ['traceId']
        }
      },
      {
        name: 'grafana_list_alerts',
        description: 'List active firing alerts and incident notifications from Grafana Alertmanager across render nodes and LED volume stages.',
        parameters: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              description: 'Filter by severity',
              enum: ['all', 'critical', 'warning', 'info']
            }
          },
          required: []
        }
      },
      {
        name: 'grafana_annotate_dashboard',
        description: 'Add an incident or remediation annotation marker to Grafana production dashboards to document automated root cause and fix.',
        parameters: {
          type: 'object',
          properties: {
            dashboardId: {
              type: 'string',
              description: 'Dashboard identifier (e.g., "vfx-render-farm-live")'
            },
            text: {
              type: 'string',
              description: 'Annotation note describing the remediation action or incident resolution'
            },
            tags: {
              type: 'string',
              description: 'Comma-separated tags (e.g., "showrunner,gemini-3.1,auto-remediation")'
            }
          },
          required: ['dashboardId', 'text']
        }
      },
      {
        name: 'studio_remediate_node',
        description: 'Execute an automated self-healing action on a GPU render node (flush VRAM memory pool, downscale render tile size, failover job, hot-reload shader).',
        parameters: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The target GPU node ID (e.g., "gpu-node-04")'
            },
            actionType: {
              type: 'string',
              description: 'The remediation operation to execute',
              enum: ['SPLIT_RENDER_TILES', 'PURGE_NODE_VRAM', 'FAILOVER_GPU_NODE', 'HOT_RELOAD_SHADER']
            }
          },
          required: ['nodeId', 'actionType']
        }
      }
    ];
  }

  public async executeTool(toolName: string, args: Record<string, unknown>): Promise<{ success: boolean; data: unknown }> {
    const snapshot = this.stateManager.getSnapshot();

    switch (toolName) {
      case 'grafana_query_metrics': {
        const promql = String(args.promql || '');
        const criticalNode = snapshot.nodes.find(n => n.status === 'CRITICAL');
        return {
          success: true,
          data: {
            query: promql,
            metricType: 'Prometheus Gauge / Histogram',
            result: snapshot.nodes.map(n => ({
              node: n.id,
              gpuModel: n.gpuModel,
              vramUtilizationRatio: Number((n.vramUsedGb / n.vramTotalGb).toFixed(4)),
              gpuUtilizationPct: n.gpuUtilizationPct,
              temperatureC: n.temperatureC,
              status: n.status
            })),
            anomaliesDetected: criticalNode ? [
              {
                node: criticalNode.id,
                severity: 'CRITICAL',
                message: `VRAM utilization at ${(criticalNode.vramUsedGb / criticalNode.vramTotalGb * 100).toFixed(1)}% on ${criticalNode.id} exceeding threshold (95%)`
              }
            ] : []
          }
        };
      }

      case 'grafana_query_logs': {
        const logql = String(args.logql || '');
        const limit = Number(args.limit || 20);
        const matchedLogs = snapshot.recentLogs
          .filter(l => l.level === 'ERROR' || l.level === 'WARN' || l.level === 'FATAL' || l.message.toLowerCase().includes('cuda') || l.message.toLowerCase().includes('error'))
          .slice(-limit);

        return {
          success: true,
          data: {
            query: logql,
            totalLogsScanned: snapshot.recentLogs.length,
            matchingEntries: matchedLogs.length > 0 ? matchedLogs : snapshot.recentLogs.slice(-5)
          }
        };
      }

      case 'grafana_get_trace': {
        const traceId = String(args.traceId || '');
        return {
          success: true,
          data: {
            traceId,
            spans: snapshot.activeTraces,
            rootService: 'studio-pipeline-orchestrator',
            errorSpan: snapshot.activeTraces.find(s => s.statusCode === 'ERROR') || null
          }
        };
      }

      case 'grafana_list_alerts': {
        return {
          success: true,
          data: {
            activeAlertCount: snapshot.alerts.length,
            alerts: snapshot.alerts
          }
        };
      }

      case 'grafana_annotate_dashboard': {
        return {
          success: true,
          data: {
            annotationId: `annot-${Date.now().toString(36)}`,
            dashboardId: args.dashboardId,
            text: args.text,
            tags: args.tags || 'showrunner,gemini-3.1,auto-remediated',
            timestamp: Date.now(),
            status: 'ANNOTATED'
          }
        };
      }

      case 'studio_remediate_node': {
        const nodeId = String(args.nodeId);
        const actionType = String(args.actionType);
        const result = this.stateManager.executeNodeRemediation(nodeId, actionType);
        return {
          success: result.success,
          data: {
            nodeId,
            actionType,
            message: result.message,
            clusterHealth: 'NORMALIZED'
          }
        };
      }

      default:
        return {
          success: false,
          data: `Unknown tool: ${toolName}`
        };
    }
  }
}
