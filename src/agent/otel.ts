import { GeminiModelId, AgentRole } from '../types/agent';

export interface OtelSpanRecord {
  spanId: string;
  traceId: string;
  name: string;
  role: AgentRole;
  model: GeminiModelId;
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
    const totalCalls = this.spans.length;
    if (totalCalls === 0) {
      return {
        totalLlmCalls: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        estimatedCostUsd: 0,
        activeModels: {}
      };
    }

    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalLatency = 0;
    const modelDistribution: Record<string, number> = {};

    for (const span of this.spans) {
      totalTokensIn += span.tokensIn;
      totalTokensOut += span.tokensOut;
      totalLatency += span.durationMs;
      modelDistribution[span.model] = (modelDistribution[span.model] || 0) + 1;
    }

    // Gemini 3.x Flash pricing benchmark (~$0.075 / 1M input, $0.30 / 1M output)
    const estimatedCostUsd = (totalTokensIn * 0.000000075) + (totalTokensOut * 0.00000030);

    return {
      totalLlmCalls: totalCalls,
      totalTokens: totalTokensIn + totalTokensOut,
      avgLatencyMs: Math.floor(totalLatency / totalCalls),
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      activeModels: modelDistribution
    };
  }
}
