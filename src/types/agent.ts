export type AgentRole = 'SENTINEL' | 'DIAGNOSTICIAN' | 'REMEDIATION' | 'EXECUTIVE';

export type GeminiModelId = 
  | 'gemini-3.7-flash'
  | 'gemini-3.5-flash'
  | 'gemini-3.5-flash-lite'
  | 'gemini-3.1-flash-lite';

export interface AgentThoughtStep {
  id: string;
  agentRole: AgentRole;
  modelUsed: GeminiModelId;
  timestamp: number;
  thought: string;
  toolCall?: {
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
    status: 'PENDING' | 'EXECUTED' | 'ERROR';
  };
}

export interface AgentInvestigationSession {
  sessionId: string;
  incidentId: string;
  startedAt: number;
  completedAt?: number;
  steps: AgentThoughtStep[];
  activeAgent: AgentRole;
  status: 'ANALYZING' | 'TOOL_INVOCATION' | 'HEALING' | 'COMPLETED';
}

export interface ModelMetricsSnapshot {
  modelId: GeminiModelId;
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  avgLatencyMs: number;
  rateLimitHits: number;
  fallbacksTriggered: number;
}
