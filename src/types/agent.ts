export type AgentRole = 'SENTINEL' | 'DIAGNOSTICIAN' | 'REMEDIATION' | 'EXECUTIVE' | 'COPILOT';

export type GeminiModelId = 'gemini-3.8-flash' | 'gemini-3.8-flash (Vertex AI)' | 'gemini-3.7-flash' | 'gemini-3.7-flash (Vertex AI)';

export interface AgentThoughtStep {
  id: string;
  agentRole: AgentRole;
  modelUsed: string;
  timestamp: number;
  thought: string;
  reasoningBudget?: number;
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
  status: 'ANALYZING' | 'TOOL_INVOCATION' | 'WAITING_FOR_APPROVAL' | 'HEALING' | 'COMPLETED';
}

export interface VertexAiMetricsSnapshot {
  modelId: string;
  platform: 'Google Cloud Vertex AI';
  projectId: string;
  region: string;
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  avgLatencyMs: number;
  activeReasoningTokens: number;
}
