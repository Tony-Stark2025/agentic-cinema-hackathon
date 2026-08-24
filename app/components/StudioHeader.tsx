'use client';

import React from 'react';
import { Clapperboard, Activity, ShieldAlert, Cpu, Sparkles, RefreshCw } from 'lucide-react';
import { StudioTelemetrySnapshot } from '@/src/types/telemetry';

interface StudioHeaderProps {
  telemetry: StudioTelemetrySnapshot | null;
  modelPoolMetrics: {
    totalLlmCalls: number;
    totalTokens: number;
    avgLatencyMs: number;
    estimatedCostUsd: number;
    activeModels: Record<string, number>;
  };
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  telemetry,
  modelPoolMetrics,
  onRefresh,
  isRefreshing
}) => {
  const criticalCount = telemetry?.nodes.filter(n => n.status === 'CRITICAL').length || 0;
  const healthyCount = telemetry?.nodes.filter(n => n.status === 'HEALTHY').length || 0;

  return (
    <header className="border-b border-studio-800 bg-studio-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Stage Info */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Clapperboard className="w-6 h-6 text-studio-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SHOWRUNNER
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  STUDIO OPS
                </span>
              </h1>
              <span className="text-xs text-studio-500">|</span>
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {telemetry?.stageName || 'STG-VIRTUAL-STAGE-A'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {telemetry?.projectName} &bull; <span className="text-amber-400">{telemetry?.activeSequence}</span>
            </p>
          </div>
        </div>

        {/* Live Cluster Stats & Gemini 3.x Model Pool */}
        <div className="flex items-center gap-3">
          {/* Cluster Status Badge */}
          <div className="bg-studio-850 border border-studio-700/60 rounded-lg px-3.5 py-2 flex items-center gap-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Render Nodes</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">{healthyCount} Healthy</span>
                {criticalCount > 0 && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {criticalCount} Critical
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Gemini 3.x Flash Pool Observability */}
          <div className="bg-studio-850 border border-studio-700/60 rounded-lg px-3.5 py-2 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Gemini 3.x Flash Pool</div>
              <div className="text-xs font-mono text-white flex items-center gap-2">
                <span className="text-purple-300">{modelPoolMetrics.totalTokens.toLocaleString()} tokens</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-cyan-400">{modelPoolMetrics.avgLatencyMs}ms avg</span>
              </div>
            </div>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-studio-800 hover:bg-studio-700 text-slate-200 border border-studio-700 rounded-lg p-2.5 transition-all duration-150 disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
