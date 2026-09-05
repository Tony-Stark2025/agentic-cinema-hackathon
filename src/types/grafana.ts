export interface GrafanaMcpToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export interface GrafanaPrometheusMetricResult {
  metric: Record<string, string>;
  value?: [number, string];
  values?: [number, string][];
}

export interface GrafanaPrometheusQueryResponse {
  status: 'success' | 'error';
  data?: {
    resultType: 'vector' | 'matrix' | 'scalar' | 'string';
    result: GrafanaPrometheusMetricResult[];
  };
  errorType?: string;
  error?: string;
}

export interface GrafanaLokiStreamResult {
  stream: Record<string, string>;
  values: [string, string][]; // [nanosecond_timestamp, line]
}

export interface GrafanaLokiQueryResponse {
  status: 'success' | 'error';
  data?: {
    resultType: 'streams';
    result: GrafanaLokiStreamResult[];
    stats?: Record<string, unknown>;
  };
  error?: string;
}

export interface GrafanaTempoSpan {
  traceID: string;
  spanID: string;
  parentSpanID?: string;
  operationName: string;
  startTime: number;
  duration: number;
  tags?: Record<string, unknown>;
  logs?: Array<{ timestamp: number; fields: Record<string, unknown> }>;
}

export interface GrafanaTempoTraceResponse {
  batches?: Array<{
    resource?: Record<string, unknown>;
    scopeSpans?: Array<{
      spans: GrafanaTempoSpan[];
    }>;
  }>;
  trace?: {
    spans: GrafanaTempoSpan[];
  };
}

export interface GrafanaAlertItem {
  labels: Record<string, string>;
  annotations: Record<string, string>;
  state: 'firing' | 'pending' | 'resolved';
  activeAt?: string;
  value?: string;
}

export interface GrafanaAnnotationPayload {
  dashboardUID?: string;
  time?: number;
  timeEnd?: number;
  tags: string[];
  text: string;
}

export interface GrafanaAnnotationResponse {
  id?: number | string;
  message?: string;
  status?: string;
}

export interface McpExecutionResult {
  success: boolean;
  data: any;
  source?: 'mcp-protocol' | 'grafana-cloud-rest' | 'studio-telemetry-engine';
  latencyMs?: number;
}
