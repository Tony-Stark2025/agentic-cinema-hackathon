'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StudioHeader } from './components/StudioHeader';
import { RenderFarmCluster } from './components/RenderFarmCluster';
import { AgentInvestigation } from './components/AgentInvestigation';
import { IncidentRemediation } from './components/IncidentRemediation';
import { TelemetryExplorer } from './components/TelemetryExplorer';
import { StudioCopilotChat } from './components/StudioCopilotChat';
import { StudioTelemetrySnapshot } from '@/src/types/telemetry';
import { StudioIncident } from '@/src/types/incident';
import { AgentInvestigationSession, VertexAiMetricsSnapshot } from '@/src/types/agent';

export default function ShowrunnerDashboard() {
  const [telemetry, setTelemetry] = useState<StudioTelemetrySnapshot | null>(null);
  const [incidents, setIncidents] = useState<StudioIncident[]>([]);
  const [session, setSession] = useState<AgentInvestigationSession | null>(null);
  const [vertexAiMetrics, setVertexAiMetrics] = useState<VertexAiMetricsSnapshot>({
    modelId: 'gemini-3.7-flash',
    platform: 'Google Cloud Vertex AI',
    projectId: 'gen-lang-client-0942141479',
    region: 'us-central1',
    totalRequests: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    avgLatencyMs: 210,
    activeReasoningTokens: 1024
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
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const handleTriggerIncident = async (category: 'CUDA_OOM_MEMORY_LEAK' | 'UNREAL_NANITE_SHADER_HANG', nodeId: string) => {
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

  const handleAutoDiagnoseAndHeal = async (incidentId?: string) => {
    try {
      setIsInvestigating(true);
      const res = await fetch('/api/agent/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, nodeId: selectedNodeId })
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

  return (
    <div className="min-h-screen flex flex-col bg-studio-950 text-slate-100 pb-12">
      {/* Studio Top Navigation & Vertex AI Telemetry Badges */}
      <StudioHeader
        telemetry={telemetry}
        vertexAiMetrics={vertexAiMetrics}
        onRefresh={fetchTelemetry}
        isRefreshing={isRefreshing}
      />

      {/* Main Studio Operations Grid */}
      <main className="max-w-[1700px] mx-auto w-full px-6 pt-6 space-y-6">
        {/* 1. 16-Node GPU Cluster Grid */}
        <RenderFarmCluster
          nodes={telemetry?.nodes || []}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />

        {/* 2. Split Screen: Incident Center & Gemini 3.7 Flash Reasoning Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Incident & Remediation Box */}
            <IncidentRemediation
              incidents={incidents}
              onTriggerIncident={handleTriggerIncident}
              onAutoDiagnoseAndHeal={handleAutoDiagnoseAndHeal}
              onResetCluster={handleResetCluster}
              isLoading={isInvestigating}
              selectedNodeId={selectedNodeId}
            />

            {/* Grafana PromQL / LogQL / Tempo / MCP Tabs */}
            <TelemetryExplorer
              telemetry={telemetry}
              selectedNodeId={selectedNodeId}
            />
          </div>

          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Gemini 3.7 Flash Multi-Agent Reasoning Trace */}
            <AgentInvestigation
              session={session}
              isInvestigating={isInvestigating}
            />

            {/* Technical Director Chat Console */}
            <StudioCopilotChat />
          </div>
        </div>
      </main>
    </div>
  );
}
