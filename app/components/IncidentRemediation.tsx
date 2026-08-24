'use client';

import React from 'react';
import { StudioIncident } from '@/src/types/incident';
import { AlertTriangle, Wrench, DollarSign, Clock, ShieldCheck, Flame, Cpu, RotateCcw } from 'lucide-react';

interface IncidentRemediationProps {
  incidents: StudioIncident[];
  onTriggerIncident: (category: 'CUDA_OOM_MEMORY_LEAK' | 'UNREAL_NANITE_SHADER_HANG', nodeId: string) => void;
  onAutoDiagnoseAndHeal: (incidentId?: string) => void;
  onResetCluster: () => void;
  isLoading: boolean;
  selectedNodeId: string;
}

export const IncidentRemediation: React.FC<IncidentRemediationProps> = ({
  incidents,
  onTriggerIncident,
  onAutoDiagnoseAndHeal,
  onResetCluster,
  isLoading,
  selectedNodeId
}) => {
  const activeIncident = incidents.find(i => i.status !== 'RESOLVED') || incidents[0];
  const isResolved = activeIncident && activeIncident.status === 'RESOLVED';

  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-studio-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Studio Incident & Self-Healing Center
          </h2>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerIncident('CUDA_OOM_MEMORY_LEAK', selectedNodeId || 'gpu-node-04')}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-mono font-medium transition-all disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Inject 4K CUDA OOM ({selectedNodeId || 'gpu-node-04'})
          </button>

          <button
            onClick={() => onTriggerIncident('UNREAL_NANITE_SHADER_HANG', selectedNodeId || 'gpu-node-08')}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/60 text-xs font-mono font-medium transition-all disabled:opacity-50"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Inject Nanite Shader Hang
          </button>

          <button
            onClick={onResetCluster}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 text-slate-300 border border-studio-700 text-xs transition-colors"
            title="Reset to Healthy"
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
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">All Studio Render Clusters Operational</div>
              <div className="text-[11px] text-slate-400 font-mono">Zero pipeline bottlenecks. Frame queues processing at 128 samples/px.</div>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-700/40">
            NOMINAL
          </span>
        </div>
      ) : (
        <div className={`p-4 rounded-lg border ${
          isResolved
            ? 'bg-emerald-950/30 border-emerald-600/60'
            : 'bg-rose-950/40 border-rose-600/80 ring-1 ring-rose-500/50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isResolved ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
              )}
              <span className="text-xs font-bold font-mono text-white">{activeIncident.title}</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              isResolved ? 'bg-emerald-900 text-emerald-200' : 'bg-rose-900 text-rose-200'
            }`}>
              {activeIncident.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3 text-xs font-mono">
            <div className="bg-studio-950/80 p-2.5 rounded border border-studio-800">
              <span className="text-slate-500 text-[10px] block">Target Shot & Frame</span>
              <span className="text-slate-200 font-bold">{activeIncident.affectedShot} &bull; Frame {activeIncident.affectedFrame}</span>
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

          {/* Autonomous Healer Button */}
          {!isResolved && (
            <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-rose-800/40">
              <div className="text-[11px] text-slate-300">
                Trigger Gemini 3.x Multi-Agent Crew to diagnose via Grafana MCP and self-heal the render farm.
              </div>
              <button
                onClick={() => onAutoDiagnoseAndHeal(activeIncident.id)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-studio-950 font-bold font-mono text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Wrench className="w-4 h-4" />
                {isLoading ? 'Diagnosing via Grafana MCP...' : 'Auto-Diagnose & Heal (Gemini 3.x)'}
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
                Resolved in {activeIncident.financialImpact.recoveryTimeSeconds}s &bull; 0 missing frames &bull; Schedule preserved
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700/50">
            <Clock className="w-3.5 h-3.5" />
            48m Stall Prevented
          </div>
        </div>
      )}
    </div>
  );
};
