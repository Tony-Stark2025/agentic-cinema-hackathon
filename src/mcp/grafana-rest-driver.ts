import {
  GrafanaPrometheusQueryResponse,
  GrafanaLokiQueryResponse,
  GrafanaTempoTraceResponse,
  GrafanaAnnotationResponse
} from '../types/grafana';

export class GrafanaRestDriver {
  private static instance: GrafanaRestDriver;
  private baseUrl: string;
  private token: string;
  private timeoutMs: number;

  private constructor() {
    this.baseUrl = (process.env.GRAFANA_CLOUD_URL || '').replace(/\/$/, '');
    this.token = process.env.GRAFANA_SERVICE_TOKEN || process.env.GRAFANA_API_KEY || '';
    this.timeoutMs = parseInt(process.env.GRAFANA_HTTP_TIMEOUT_MS || '3500', 10);
  }

  public static getInstance(): GrafanaRestDriver {
    if (!GrafanaRestDriver.instance) {
      GrafanaRestDriver.instance = new GrafanaRestDriver();
    }
    return GrafanaRestDriver.instance;
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'User-Agent': 'Showrunner-Studio-Ops-Copilot/1.0.0 (Vertex-AI/Gemini-3.8-Flash)'
    };
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {})
        }
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Tests live connectivity and authentication against Grafana Cloud.
   */
  public async testConnection(): Promise<{ connected: boolean; status: string; orgName?: string; error?: string }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        status: 'UNCONFIGURED',
        error: 'Missing GRAFANA_CLOUD_URL or GRAFANA_SERVICE_TOKEN in environment'
      };
    }

    try {
      // 1. Try /api/org endpoint (returns org details for valid token)
      const res = await this.fetchWithTimeout(`${this.baseUrl}/api/org`);
      if (res.ok) {
        const data = await res.json();
        return {
          connected: true,
          status: 'AUTHENTICATED',
          orgName: data.name || 'Grafana Cloud Organization'
        };
      }

      // 2. Fallback to /api/health
      const healthRes = await this.fetchWithTimeout(`${this.baseUrl}/api/health`);
      if (healthRes.ok) {
        return {
          connected: true,
          status: 'HEALTHY'
        };
      }

      return {
        connected: false,
        status: `HTTP_${res.status}`,
        error: `Grafana Cloud returned HTTP status ${res.status}: ${res.statusText}`
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        connected: false,
        status: 'CONNECTION_FAILED',
        error: msg
      };
    }
  }

  /**
   * Query PromQL metrics from Grafana Cloud Mimir / Prometheus.
   */
  public async queryMetrics(promql: string, timeRange: string = '5m'): Promise<{ success: boolean; data: unknown }> {
    if (!this.isConfigured()) {
      throw new Error('Grafana Cloud is not configured');
    }

    // Method 1: Try Unified Grafana DataSource Query API (/api/ds/query)
    try {
      const dsQueryPayload = {
        queries: [
          {
            refId: 'A',
            datasource: { type: 'prometheus' },
            expr: promql,
            instant: true,
            range: false
          }
        ],
        from: `now-${timeRange}`,
        to: 'now'
      };

      const dsRes = await this.fetchWithTimeout(`${this.baseUrl}/api/ds/query`, {
        method: 'POST',
        body: JSON.stringify(dsQueryPayload)
      });

      if (dsRes.ok) {
        const json = await dsRes.json();
        if (json.results?.A?.frames?.length > 0) {
          return {
            success: true,
            data: {
              source: 'Grafana Cloud (Mimir Live /api/ds/query)',
              query: promql,
              frames: json.results.A.frames,
              status: 'LIVE_OK'
            }
          };
        }
      }
    } catch {
      // Fall through to direct proxy endpoint
    }

    // Method 2: Direct Prometheus Instant Query (/api/v1/query)
    const directUrl = `${this.baseUrl}/api/v1/query?query=${encodeURIComponent(promql)}`;
    const directRes = await this.fetchWithTimeout(directUrl);
    if (!directRes.ok) {
      throw new Error(`Grafana Mimir query failed: HTTP ${directRes.status} ${directRes.statusText}`);
    }

    const payload: GrafanaPrometheusQueryResponse = await directRes.json();
    return {
      success: payload.status === 'success',
      data: {
        source: 'Grafana Cloud (Mimir Live /api/v1/query)',
        query: promql,
        resultType: payload.data?.resultType,
        result: payload.data?.result || []
      }
    };
  }

  /**
   * Query LogQL logs from Grafana Cloud Loki.
   */
  public async queryLogs(logql: string, limit: number = 20): Promise<{ success: boolean; data: unknown }> {
    if (!this.isConfigured()) {
      throw new Error('Grafana Cloud is not configured');
    }

    // Method 1: Try Unified DataSource Query API
    try {
      const dsPayload = {
        queries: [
          {
            refId: 'A',
            datasource: { type: 'loki' },
            expr: logql,
            maxLines: limit
          }
        ],
        from: 'now-1h',
        to: 'now'
      };

      const dsRes = await this.fetchWithTimeout(`${this.baseUrl}/api/ds/query`, {
        method: 'POST',
        body: JSON.stringify(dsPayload)
      });

      if (dsRes.ok) {
        const json = await dsRes.json();
        if (json.results?.A?.frames) {
          return {
            success: true,
            data: {
              source: 'Grafana Cloud (Loki Live /api/ds/query)',
              query: logql,
              frames: json.results.A.frames,
              status: 'LIVE_OK'
            }
          };
        }
      }
    } catch {
      // Fall through to direct proxy
    }

    // Method 2: Direct Loki Query Range
    const lokiUrl = `${this.baseUrl}/loki/api/v1/query_range?query=${encodeURIComponent(logql)}&limit=${limit}`;
    const lokiRes = await this.fetchWithTimeout(lokiUrl);
    if (!lokiRes.ok) {
      throw new Error(`Grafana Loki query failed: HTTP ${lokiRes.status} ${lokiRes.statusText}`);
    }

    const payload: GrafanaLokiQueryResponse = await lokiRes.json();
    return {
      success: payload.status === 'success',
      data: {
        source: 'Grafana Cloud (Loki Live /loki/api/v1/query_range)',
        query: logql,
        streams: payload.data?.result || []
      }
    };
  }

  /**
   * Query distributed trace waterfall from Grafana Cloud Tempo.
   */
  public async getTrace(traceId: string): Promise<{ success: boolean; data: unknown }> {
    if (!this.isConfigured()) {
      throw new Error('Grafana Cloud is not configured');
    }

    // Method 1: Standard Tempo Trace API endpoint
    const tempoUrl = `${this.baseUrl}/api/traces/${encodeURIComponent(traceId)}`;
    const tempoRes = await this.fetchWithTimeout(tempoUrl);
    if (tempoRes.ok) {
      const payload: GrafanaTempoTraceResponse = await tempoRes.json();
      return {
        success: true,
        data: {
          source: 'Grafana Cloud (Tempo Live /api/traces)',
          traceId,
          trace: payload
        }
      };
    }

    // Method 2: Unified DataSource Query API
    const dsPayload = {
      queries: [
        {
          refId: 'A',
          datasource: { type: 'tempo' },
          queryType: 'traceId',
          query: traceId
        }
      ]
    };

    const dsRes = await this.fetchWithTimeout(`${this.baseUrl}/api/ds/query`, {
      method: 'POST',
      body: JSON.stringify(dsPayload)
    });

    if (dsRes.ok) {
      const json = await dsRes.json();
      return {
        success: true,
        data: {
          source: 'Grafana Cloud (Tempo Live /api/ds/query)',
          traceId,
          frames: json.results?.A?.frames || []
        }
      };
    }

    throw new Error(`Grafana Tempo trace lookup failed: HTTP ${tempoRes.status}`);
  }

  /**
   * List active firing alerts from Grafana Cloud Alertmanager.
   */
  public async listAlerts(severity?: string): Promise<{ success: boolean; data: unknown }> {
    if (!this.isConfigured()) {
      throw new Error('Grafana Cloud is not configured');
    }

    const endpoints = [
      `${this.baseUrl}/api/alertmanager/grafana/api/v2/alerts`,
      `${this.baseUrl}/api/v1/alerts`,
      `${this.baseUrl}/api/alerts`
    ];

    for (const ep of endpoints) {
      try {
        const res = await this.fetchWithTimeout(ep);
        if (res.ok) {
          const rawAlerts = await res.json();
          const alerts = Array.isArray(rawAlerts) ? rawAlerts : (rawAlerts.data || []);
          const filtered = severity && severity !== 'all'
            ? alerts.filter((a: Record<string, unknown>) => {
                const labels = (a.labels || {}) as Record<string, string>;
                return labels.severity === severity;
              })
            : alerts;

          return {
            success: true,
            data: {
              source: `Grafana Cloud (Alertmanager Live ${ep})`,
              activeAlertCount: filtered.length,
              alerts: filtered
            }
          };
        }
      } catch {
        continue;
      }
    }

    throw new Error('Unable to reach Grafana Alertmanager endpoints');
  }

  /**
   * Post an incident or remediation annotation marker to Grafana Cloud dashboards.
   */
  public async annotateDashboard(
    dashboardId: string,
    text: string,
    tags?: string | string[]
  ): Promise<{ success: boolean; data: unknown }> {
    if (!this.isConfigured()) {
      throw new Error('Grafana Cloud is not configured');
    }

    const endpoint = `${this.baseUrl}/api/annotations`;
    const formattedTags = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : ['showrunner', 'vertex-ai', 'gemini-3.8-flash']);

    const payload = {
      dashboardUID: dashboardId,
      text,
      tags: formattedTags,
      time: Date.now()
    };

    const res = await this.fetchWithTimeout(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Grafana Annotation failed: HTTP ${res.status} ${res.statusText}`);
    }

    const data: GrafanaAnnotationResponse = await res.json();
    return {
      success: true,
      data: {
        source: 'Grafana Cloud (Live /api/annotations)',
        annotationId: data.id || `annot-${Date.now().toString(36)}`,
        dashboardId,
        text,
        tags: formattedTags,
        timestamp: Date.now(),
        status: 'LIVE_GRAFANA_ANNOTATION_POSTED'
      }
    };
  }
}
