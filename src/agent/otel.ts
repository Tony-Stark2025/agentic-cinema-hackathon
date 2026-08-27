import { GeminiModelId, AgentRole } from '../types/agent';

export interface OtelSpanRecord {
  spanId: string;
  traceId: string;
  name: string;
  role: AgentRole;
  model: GeminiModelId | string;
  durationMs: number;
  tokensIn: number;
  tokensOut: number;
  timestamp: number;
  status: 'OK' | 'ERROR';
  attributes: Record<string, string | number | boolean>;
}

export class OtelAiObservability {
  private static instance: OtelAiObservability;
  private spans: OtelSpanRecord[] = [];

  private constructor() {}

  public static getInstance(): OtelAiObservability {
    if (!OtelAiObservability.instance) {
      OtelAiObservability.instance = new OtelAiObservability();
    }
    return OtelAiObservability.instance;
  }

  public recordSpan(span: OtelSpanRecord): void {
    this.spans.push(span);
    if (this.spans.length > 100) {
      this.spans.shift();
    }
  }

  public getRecentSpans(limit = 20): OtelSpanRecord[] {
    return this.spans.slice(-limit);
  }

  public getAggregates(): {
    totalLlmCalls: number;
    totalTokens: number;
    avgLatencyMs: number;
    estimatedCostUsd: number;
    activeModels: Record<string, number>;
  } {
    if (this.spans.length === 0) {
      return {
        totalLlmCalls: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        estimatedCostUsd: 0,
        activeModels: {}
      };
    }

    const totalCalls = this.spans.length;
    let totalTokens = 0;
    let totalLatency = 0;
    const activeModels: Record<string, number> = {};

    for (const span of this.spans) {
      totalTokens += span.tokensIn + span.tokensOut;
      totalLatency += span.durationMs;
      activeModels[span.model] = (activeModels[span.model] || 0) + 1;
    }

    // Google Cloud Vertex AI Gemini 3.7 Flash estimation (~$0.075 per 1M tokens)
    const estimatedCostUsd = Number(((totalTokens / 1_000_000) * 0.075).toFixed(6));

    return {
      totalLlmCalls: totalCalls,
      totalTokens,
      avgLatencyMs: Math.round(totalLatency / totalCalls),
      estimatedCostUsd,
      activeModels
    };
  }
}
