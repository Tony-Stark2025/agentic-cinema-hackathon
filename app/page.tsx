'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StudioHeader } from './components/StudioHeader';
import { StudioAuthBar, OPERATOR_PROFILES, StudioOperator } from './components/StudioAuthBar';
import { CinemaViewport } from './components/CinemaViewport';
import { RenderFarmCluster } from './components/RenderFarmCluster';
import { AgentInvestigation } from './components/AgentInvestigation';
import { IncidentRemediation } from './components/IncidentRemediation';
import { TelemetryExplorer } from './components/TelemetryExplorer';
import { TelemetryVelocityMeter } from './components/TelemetryVelocityMeter';
import { TraceWaterfall } from './components/TraceWaterfall';
import { StudioCopilotChat } from './components/StudioCopilotChat';
import { StudioTelemetrySnapshot } from '@/src/types/telemetry';
import { StudioIncident } from '@/src/types/incident';
import { AgentInvestigationSession, VertexAiMetricsSnapshot } from '@/src/types/agent';
import {
  getEnterpriseBaselineTelemetry,
  getEnterpriseBaselineAnalytics
} from '@/src/telemetry/enterprise-baseline';

export default function ShowrunnerDashboard() {
  // Pre-hydrated initial state guarantees zero blank screens or empty cards on load
  const [telemetry, setTelemetry] = useState<StudioTelemetrySnapshot>(getEnterpriseBaselineTelemetry);
  const [incidents, setIncidents] = useState<StudioIncident[]>([]);
  const [clusterAnalytics, setClusterAnalytics] = useState<any>(getEnterpriseBaselineAnalytics);
  const [session, setSession] = useState<AgentInvestigationSession | null>(null);
  const [currentOperator, setCurrentOperator] = useState<StudioOperator>(OPERATOR_PROFILES[0]);
  const [apiKey, setApiKey] = useState<string>('');

  const [vertexAiMetrics, setVertexAiMetrics] = useState<VertexAiMetricsSnapshot>({
    modelId: 'gemini-3.8-flash',
    platform: 'Google Cloud Vertex AI',
    projectId: 'gen-lang-client-0942141479',
    region: 'us-central1',
    totalRequests: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    avgLatencyMs: 185,
    activeReasoningTokens: 2450
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('gpu-node-04');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/telemetry');
      const data = await res.json();
      if (data.telemetry) {
        setTelemetry(data.telemetry);
        setIncidents(data.incidents || []);
        if (data.clusterAnalytics) {
          setClusterAnalytics(data.clusterAnalytics);
        }
        if (data.vertexAi?.metrics) {
          setVertexAiMetrics(data.vertexAi.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to fetch studio telemetry:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const handleTriggerIncident = async (
    category: 'CUDA_OOM_MEMORY_LEAK' | 'UNREAL_NANITE_SHADER_HANG' | 'STORAGE_IOPS_JITTER',
    nodeId: string
  ) => {
    try {
      setSelectedNodeId(nodeId);
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TRIGGER_INCIDENT', category, nodeId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to trigger incident:', err);
    }
  };

  const handleAutoDiagnoseAndHeal = async (
    incidentId?: string,
    mode: 'AUTONOMOUS' | 'SUPERVISED' = 'AUTONOMOUS'
  ) => {
    try {
      setIsInvestigating(true);
      const res = await fetch('/api/agent/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, nodeId: selectedNodeId, mode, apiKey })
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        await fetchTelemetry();
      }
    } catch (err) {
      console.error('Auto diagnose & heal error:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleApproveRemediation = async (incidentId: string, actionType?: string) => {
    try {
      setIsInvestigating(true);
      const res = await fetch('/api/agent/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, actionType, session, nodeId: selectedNodeId })
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        await fetchTelemetry();
      }
    } catch (err) {
      console.error('Approve remediation error:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleResetCluster = async () => {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_HEALTHY' })
      });
      setSession(null);
      await fetchTelemetry();
    } catch (err) {
      console.error('Reset cluster error:', err);
    }
  };

  const selectedNode = telemetry.nodes.find(n => n.id === selectedNodeId) || telemetry.nodes[3];
  const nodeEvaluation = clusterAnalytics?.anomalies?.find((a: any) => a.nodeId === selectedNodeId);
  const activeIncident = incidents.find(i => i.status !== 'RESOLVED') || incidents[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100 pb-16 font-sans">
      {/* 1. Studio Top Navigation & System Badges */}
      <StudioHeader
        telemetry={telemetry}
        vertexAiMetrics={vertexAiMetrics}
        onRefresh={fetchTelemetry}
        isRefreshing={isRefreshing}
        isLiveApi={Boolean(apiKey)}
      />

      {/* 2. Studio Identity & RBAC Clearance Bar */}
      <StudioAuthBar
        currentOperator={currentOperator}
        onOperatorChange={setCurrentOperator}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        isLiveApiConnected={Boolean(apiKey)}
      />

      {/* 3. Main Studio Operations Grid */}
      <main className="max-w-[1750px] mx-auto w-full px-6 pt-6 space-y-6">
        {/* Cinema Viewport: Real-time 4K Raytracing & Tile Buffer Simulation */}
        <CinemaViewport
          activeIncident={activeIncident}
          selectedNodeId={selectedNodeId}
        />

        {/* 16-Node GPU Cluster Matrix */}
        <RenderFarmCluster
          nodes={telemetry.nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />

        {/* Telemetry Calculus & Z-Score Velocity Meter */}
        <TelemetryVelocityMeter
          velocityMbPerSec={nodeEvaluation?.vramVelocityMbPerSec || 0}
          vramZScore={nodeEvaluation?.vramZScore || (selectedNode && selectedNode.vramUsedGb > 40 ? 3.8 : 0.4)}
          temperatureZScore={nodeEvaluation?.temperatureZScore || (selectedNode && selectedNode.temperatureC > 80 ? 2.8 : 0.2)}
          vramRatio={selectedNode ? selectedNode.vramUsedGb / selectedNode.vramTotalGb : 0.65}
          isMemoryLeak={nodeEvaluation?.isMemoryLeak || (selectedNode ? selectedNode.status === 'CRITICAL' : false)}
          isThermalOutlier={nodeEvaluation?.isThermalOutlier || (selectedNode ? selectedNode.temperatureC > 82 : false)}
          nodeId={selectedNodeId}
        />

        {/* Split Screen 1: Incident Remediation Command Center & Gemini 3.8 Flash Agent Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col">
            <IncidentRemediation
              incidents={incidents}
              currentOperator={currentOperator}
              onTriggerIncident={handleTriggerIncident}
              onAutoDiagnoseAndHeal={handleAutoDiagnoseAndHeal}
              onApproveRemediation={handleApproveRemediation}
              onResetCluster={handleResetCluster}
              isLoading={isInvestigating}
              selectedNodeId={selectedNodeId}
            />
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <AgentInvestigation
              session={session}
              isLoading={isInvestigating}
            />
          </div>
        </div>

        {/* Split Screen 2: Grafana Observability Stream (Mimir/Loki/Tempo) & Technical Director Copilot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col">
            <TelemetryExplorer
              telemetry={telemetry}
              selectedNodeId={selectedNodeId}
            />
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <StudioCopilotChat />
          </div>
        </div>

        {/* Tempo Distributed Trace Waterfall Gantt */}
        <TraceWaterfall spans={telemetry.activeTraces} />
      </main>
    </div>
  );
}
