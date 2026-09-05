'use client';

import React, { useState } from 'react';
import { StudioIncident } from '@/src/types/incident';
import { StudioOperator } from './StudioAuthBar';
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
  Loader2,
  Lock
} from 'lucide-react';

interface IncidentRemediationProps {
  incidents: StudioIncident[];
  currentOperator: StudioOperator;
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
  currentOperator,
  onTriggerIncident,
  onAutoDiagnoseAndHeal,
  onApproveRemediation,
  onResetCluster,
  isLoading,
  selectedNodeId
}) => {
  const [executionMode, setExecutionMode] = useState<'AUTONOMOUS' | 'SUPERVISED'>('AUTONOMOUS');
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  const activeIncident = incidents.find(i => i.status !== 'RESOLVED') || incidents[0];
  const isResolved = activeIncident && activeIncident.status === 'RESOLVED';
  const isAwaitingApproval = activeIncident && activeIncident.status === 'AWAITING_APPROVAL';

  const defaultAction = activeIncident?.category === 'UNREAL_NANITE_SHADER_HANG'
    ? 'HOT_RELOAD_SHADER'
    : activeIncident?.category === 'STORAGE_IOPS_JITTER'
    ? 'FAILOVER_GPU_NODE'
    : 'SPLIT_RENDER_TILES';

  const canApprove = currentOperator.role === 'LEAD_TD';

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-xl p-5 shadow-2xl flex flex-col gap-4 font-mono">
      {/* Header & Mode Select */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Studio Incident & Self-Healing Command Center
            </h2>
            <p className="text-[11px] text-slate-400">
              Autonomous or Supervised remediation via Gemini 3.8 Flash &amp; Grafana MCP
            </p>
          </div>
        </div>

        {/* Mode Toggle & Chaos Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border-2 border-slate-800 text-xs">
            <button
              onClick={() => setExecutionMode('AUTONOMOUS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-bold ${
                executionMode === 'AUTONOMOUS'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full autonomous loop from detection to MCP self-healing"
            >
              <Zap className="w-3.5 h-3.5" />
              Auto-Pilot
            </button>
            <button
              onClick={() => setExecutionMode('SUPERVISED')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-bold ${
                executionMode === 'SUPERVISED'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Requires Technical Director approval before applying remediation"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Supervised (HITL)
            </button>
          </div>

          {/* Quick Chaos Simulation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setLastActionStatus('Simulating 8K Volumetric OOM on Node 04...');
                onTriggerIncident('CUDA_OOM_MEMORY_LEAK', selectedNodeId || 'gpu-node-04');
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-bold border-2 border-rose-600 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Simulate 8K Arrakis Sand VRAM OOM on target node"
            >
              <Flame className="w-3.5 h-3.5 text-rose-300" />
              8K OOM
            </button>

            <button
              onClick={() => {
                setLastActionStatus('Simulating Nanite Shader Lock on Node 11...');
                onTriggerIncident('UNREAL_NANITE_SHADER_HANG', selectedNodeId || 'gpu-node-11');
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold border-2 border-purple-600 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Simulate Unreal Nanite Shader Hang"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              Nanite Lock
            </button>

            <button
              onClick={() => {
                setLastActionStatus('Simulating Storage IOPS Jitter on Node 15...');
                onTriggerIncident('STORAGE_IOPS_JITTER', selectedNodeId || 'gpu-node-15');
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-900 hover:bg-cyan-800 text-white font-bold border-2 border-cyan-600 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Simulate Storage IOPS Jitter"
            >
              <Database className="w-3.5 h-3.5 text-cyan-300" />
              Storage Jitter
            </button>

            <button
              onClick={() => {
                setLastActionStatus('Cluster reset to nominal state.');
                onResetCluster();
              }}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-600 text-xs transition-all active:scale-95"
              title="Reset Cluster to Nominal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Incident Status Banner */}
      {!activeIncident ? (
        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-600/60 rounded-lg flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wide">
                All 16 GPU Render Blades Fully Operational
              </div>
              <div className="text-xs text-slate-300">
                Zero pipeline bottlenecks. Frame queues processing at 128 samples/px.
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded border border-emerald-600">
            NOMINAL
          </span>
        </div>
      ) : (
        <div
          className={`p-4 rounded-lg border-2 shadow-xl ${
            isResolved
              ? 'bg-emerald-950/50 border-emerald-500'
              : isAwaitingApproval
              ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50'
              : 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {isResolved ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : isAwaitingApproval ? (
                <UserCheck className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
              )}
              <span className="text-sm font-bold text-white">{activeIncident.title}</span>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded uppercase tracking-wider ${
                isResolved
                  ? 'bg-emerald-900 text-emerald-100 border border-emerald-600'
                  : isAwaitingApproval
                  ? 'bg-amber-900 text-amber-100 border border-amber-600'
                  : 'bg-rose-900 text-rose-100 border border-rose-600'
              }`}
            >
              {activeIncident.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded border-2 border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Target Shot & Frame</span>
              <span className="text-white font-bold text-sm mt-0.5 block">
                {activeIncident.affectedShot} &bull; Frame {activeIncident.affectedFrame}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded border-2 border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Affected Hardware Blade</span>
              <span className="text-amber-400 font-bold text-sm mt-0.5 block">
                {activeIncident.affectedNodeId} (RTX 6000 Ada)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded border-2 border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Studio Downtime Bleed</span>
              <span className="text-rose-400 font-bold text-sm mt-0.5 block">
                $300/min ($18,000/hr)
              </span>
            </div>
          </div>

          {/* Real-Time Phase Progress Tracker */}
          {isLoading && (
            <div className="mt-4 p-4 rounded-lg bg-slate-950 border-2 border-purple-600 space-y-3">
              <div className="flex items-center justify-between text-purple-300 font-bold text-xs">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  Showrunner Orchestrator Executing Parallel Agent Loop...
                </span>
                <span className="text-slate-400 text-[11px]">Sub-4s Target Latency</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-cyan-950 p-2 rounded border border-cyan-700 text-cyan-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. Parallel Scout</span>
                </div>
                <div className="bg-purple-950 p-2 rounded border border-purple-500 text-purple-100 flex items-center gap-2 animate-pulse font-bold">
                  <Cpu className="w-3.5 h-3.5 text-purple-300" />
                  <span>2. Gemini 3.8 Flash</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-slate-500 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>3. MCP Healing</span>
                </div>
              </div>
            </div>
          )}

          {/* Supervised Mode: Human-in-the-Loop Sign-off Panel */}
          {isAwaitingApproval && (
            <div className="mt-4 p-4 rounded-lg bg-amber-950/70 border-2 border-amber-500 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  Technical Director Sign-Off Required (HITL)
                </span>
                <span className="text-[11px] bg-amber-900 text-amber-200 px-2.5 py-1 rounded font-bold border border-amber-600">
                  AWAITING APPROVAL
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Gemini 3.8 Flash uncapped reasoning isolated root cause in{' '}
                <strong className="text-white">{activeIncident.rootCauseAnalysis?.culpritFile || 'OptiX BVH Raymarcher'}</strong>.
                Recommended action: <strong className="text-amber-300 bg-black/40 px-2 py-0.5 rounded">[{defaultAction}]</strong>.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-amber-800/60">
                <div className="text-[11px] text-slate-400">
                  Authorized Operator: <strong className="text-white">{currentOperator.name}</strong> ({currentOperator.roleTitle})
                </div>
                <div className="flex items-center gap-2">
                  {!canApprove ? (
                    <button
                      onClick={() => onApproveRemediation?.(activeIncident.id, defaultAction)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title="Elevate operator role to Lead TD to authorize fix"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Elevate &amp; Approve Fix ({defaultAction})
                    </button>
                  ) : (
                    <button
                      onClick={() => onApproveRemediation?.(activeIncident.id, defaultAction)}
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve &amp; Execute Fix ({defaultAction})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Autonomous Healer Button (When not awaiting approval) */}
          {!isResolved && !isAwaitingApproval && !isLoading && (
            <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-slate-800">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>
                  Mode: <strong className="text-amber-400 uppercase font-bold">{executionMode}</strong> &bull; Vertex AI Gemini 3.8 Flash Uncapped Reasoning
                </span>
              </div>
              <button
                onClick={() => onAutoDiagnoseAndHeal(activeIncident.id, executionMode)}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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

      {/* Financial Savings Card (When Resolved) */}
      {isResolved && activeIncident?.financialImpact && (
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border-2 border-emerald-500/80 rounded-lg p-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/60">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-200">
                ${activeIncident.financialImpact.costSavedByShowrunnerUsd.toLocaleString()} USD Studio Downtime Saved
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Resolved in {activeIncident.financialImpact.recoveryTimeSeconds}s &bull; 0 missing frames &bull; Schedule preserved
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950 px-3.5 py-1.5 rounded-lg border border-emerald-600">
            <Clock className="w-4 h-4" />
            48m Stall Prevented
          </div>
        </div>
      )}
    </div>
  );
};
