'use client';

import React, { useState } from 'react';
import { StudioIncident } from '@/src/types/incident';
import {
  AlertTriangle,
  Wrench,
  DollarSign,
  Clock,
  ShieldCheck,
  Flame,
  Cpu,
  Database,
  RotateCcw,
  UserCheck,
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface IncidentRemediationProps {
  incidents: StudioIncident[];
  onTriggerIncident: (
    category: 'CUDA_OOM_MEMORY_LEAK' | 'UNREAL_NANITE_SHADER_HANG' | 'STORAGE_IOPS_JITTER',
    nodeId: string
  ) => void;
  onAutoDiagnoseAndHeal: (incidentId?: string, mode?: 'AUTONOMOUS' | 'SUPERVISED') => void;
  onApproveRemediation?: (incidentId: string, actionType?: string) => void;
  onResetCluster: () => void;
  isLoading: boolean;
  selectedNodeId: string;
}

export const IncidentRemediation: React.FC<IncidentRemediationProps> = ({
  incidents,
  onTriggerIncident,
  onAutoDiagnoseAndHeal,
  onApproveRemediation,
  onResetCluster,
  isLoading,
  selectedNodeId
}) => {
  const [executionMode, setExecutionMode] = useState<'AUTONOMOUS' | 'SUPERVISED'>('AUTONOMOUS');
  const activeIncident = incidents.find(i => i.status !== 'RESOLVED') || incidents[0];
  const isResolved = activeIncident && activeIncident.status === 'RESOLVED';
  const isAwaitingApproval = activeIncident && activeIncident.status === 'AWAITING_APPROVAL';

  const defaultAction = activeIncident?.category === 'UNREAL_NANITE_SHADER_HANG'
    ? 'HOT_RELOAD_SHADER'
    : activeIncident?.category === 'STORAGE_IOPS_JITTER'
    ? 'FAILOVER_GPU_NODE'
    : 'SPLIT_RENDER_TILES';

  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-studio-800/80 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Studio Incident & Self-Healing Center
          </h2>
        </div>

        {/* Execution Mode Toggle & Action Triggers */}
        <div className="flex items-center gap-2">
          {/* Auto-Pilot vs Supervised Mode Toggle */}
          <div className="flex items-center bg-studio-950 p-0.5 rounded-lg border border-studio-800 text-[11px] font-mono">
            <button
              onClick={() => setExecutionMode('AUTONOMOUS')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                executionMode === 'AUTONOMOUS'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full autonomous detection-to-remediation loop"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              Auto-Pilot
            </button>
            <button
              onClick={() => setExecutionMode('SUPERVISED')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                executionMode === 'SUPERVISED'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Requires Technical Director approval before executing self-healing actions"
            >
              <UserCheck className="w-3 h-3 text-cyan-400" />
              Supervised (HITL)
            </button>
          </div>

          {/* Quick Simulation Triggers */}
          <button
            onClick={() => onTriggerIncident('CUDA_OOM_MEMORY_LEAK', selectedNodeId || 'gpu-node-04')}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-mono transition-all disabled:opacity-50"
            title="Simulate 8K Arrakis Sand VRAM OOM on target node"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            8K OOM
          </button>

          <button
            onClick={() => onTriggerIncident('UNREAL_NANITE_SHADER_HANG', selectedNodeId || 'gpu-node-11')}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/60 text-xs font-mono transition-all disabled:opacity-50"
            title="Simulate Nanite Shader Thread Lock"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Nanite Lock
          </button>

          <button
            onClick={() => onTriggerIncident('STORAGE_IOPS_JITTER', selectedNodeId || 'gpu-node-15')}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 text-xs font-mono transition-all disabled:opacity-50"
            title="Simulate Storage IOPS Jitter"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Storage Jitter
          </button>

          <button
            onClick={onResetCluster}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 text-slate-300 border border-studio-700 text-xs transition-colors"
            title="Reset Cluster to Nominal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Incident Status Banner */}
      {!activeIncident ? (
        <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                All Studio Render Clusters Operational
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Zero pipeline bottlenecks. Frame queues processing at 128 samples/px.
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-700/40">
            NOMINAL
          </span>
        </div>
      ) : (
        <div
          className={`p-4 rounded-lg border ${
            isResolved
              ? 'bg-emerald-950/30 border-emerald-600/60'
              : isAwaitingApproval
              ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/50'
              : 'bg-rose-950/40 border-rose-600/80 ring-1 ring-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isResolved ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : isAwaitingApproval ? (
                <UserCheck className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
              )}
              <span className="text-xs font-bold font-mono text-white">{activeIncident.title}</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isResolved
                  ? 'bg-emerald-900 text-emerald-200'
                  : isAwaitingApproval
                  ? 'bg-amber-900 text-amber-200'
                  : 'bg-rose-900 text-rose-200'
              }`}
            >
              {activeIncident.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3 text-xs font-mono">
            <div className="bg-studio-950/80 p-2.5 rounded border border-studio-800">
              <span className="text-slate-500 text-[10px] block">Target Shot & Frame</span>
              <span className="text-slate-200 font-bold">
                {activeIncident.affectedShot} &bull; Frame {activeIncident.affectedFrame}
              </span>
            </div>

            <div className="bg-studio-950/80 p-2.5 rounded border border-studio-800">
              <span className="text-slate-500 text-[10px] block">Affected Hardware</span>
              <span className="text-amber-400 font-bold">{activeIncident.affectedNodeId} (RTX 6000 Ada)</span>
            </div>

            <div className="bg-studio-950/80 p-2.5 rounded border border-studio-800">
              <span className="text-slate-500 text-[10px] block">Estimated Studio Loss</span>
              <span className="text-rose-400 font-bold">$300/min idle rate</span>
            </div>
          </div>

          {/* Phase-by-Phase Progress Tracker (Active during investigation) */}
          {isLoading && (
            <div className="mt-3.5 p-3 rounded bg-studio-950/90 border border-purple-800/60 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  Orchestrator Executing Parallel Agent Loop...
                </span>
                <span className="text-slate-500 text-[10px]">sub-4s target</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-cyan-950/50 p-1.5 rounded border border-cyan-800/60 text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  <span>1. Telemetry Scout</span>
                </div>
                <div className="bg-purple-950/70 p-1.5 rounded border border-purple-700 text-purple-200 flex items-center gap-1.5 animate-pulse">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  <span>2. Gemini 3.8 Flash</span>
                </div>
                <div className="bg-studio-900 p-1.5 rounded border border-studio-800 text-slate-500 flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" />
                  <span>3. MCP Remediation</span>
                </div>
              </div>
            </div>
          )}

          {/* Supervised Mode: Human-in-the-Loop Approval Card */}
          {isAwaitingApproval && (
            <div className="mt-3.5 p-3.5 rounded bg-amber-950/50 border border-amber-500/80 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Technical Director Approval Required
                </span>
                <span className="text-[10px] bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded border border-amber-700">
                  AWAITING HUMAN SIGN-OFF
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Gemini 3.8 Flash diagnosed root cause in{' '}
                <strong className="text-white">{activeIncident.rootCauseAnalysis?.culpritFile || 'render pipeline'}</strong>.
                Recommended action: <strong className="text-amber-300">[{defaultAction}]</strong>.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => onApproveRemediation?.(activeIncident.id, defaultAction)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-studio-950 font-bold font-mono text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve & Execute Fix ({defaultAction})
                </button>
              </div>
            </div>
          )}

          {/* Autonomous Healer Button (When Not in Approval State) */}
          {!isResolved && !isAwaitingApproval && !isLoading && (
            <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-rose-800/40">
              <div className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>
                  Mode: <strong className="text-amber-400">{executionMode}</strong> &bull; Gemini 3.8 Flash Uncapped
                  Reasoning
                </span>
              </div>
              <button
                onClick={() => onAutoDiagnoseAndHeal(activeIncident.id, executionMode)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-studio-950 font-bold font-mono text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Wrench className="w-4 h-4" />
                {executionMode === 'AUTONOMOUS'
                  ? 'Dispatch Parallel Healing Crew'
                  : 'Run Diagnostic Analysis (HITL)'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Financial Savings & Impact Card (When Resolved) */}
      {isResolved && activeIncident?.financialImpact && (
        <div className="bg-gradient-to-r from-emerald-950/40 to-studio-900 border border-emerald-700/40 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300">
                ${activeIncident.financialImpact.costSavedByShowrunnerUsd.toLocaleString()} USD Studio Downtime Saved
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Resolved in {activeIncident.financialImpact.recoveryTimeSeconds}s &bull; 0 missing frames &bull; Schedule
                preserved
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700/50">
            <Clock className="w-3.5 h-3.5" />
            Downtime Stalls Avoided
          </div>
        </div>
      )}
    </div>
  );
};
