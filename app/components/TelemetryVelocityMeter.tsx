'use client';

import React from 'react';
import { Activity, Gauge, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TelemetryVelocityMeterProps {
  velocityMbPerSec: number;
  vramZScore: number;
  temperatureZScore: number;
  vramRatio: number;
  isMemoryLeak: boolean;
  isThermalOutlier: boolean;
  nodeId: string;
}

export const TelemetryVelocityMeter: React.FC<TelemetryVelocityMeterProps> = ({
  velocityMbPerSec,
  vramZScore,
  temperatureZScore,
  vramRatio,
  isMemoryLeak,
  isThermalOutlier,
  nodeId
}) => {
  const isCritical = isMemoryLeak || vramRatio > 0.95;
  const isWarning = vramRatio > 0.85 || isThermalOutlier;

  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 shadow-lg flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-studio-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Deterministic Telemetry Analytics &bull; {nodeId}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          {isCritical ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              ANOMALY CONFIRMED
            </span>
          ) : isWarning ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              ELEVATED PRESSURE
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              NOMINAL STABILITY
            </span>
          )}
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Metric 1: Memory Velocity (dV/dt) */}
        <div className="bg-studio-950 p-3 rounded-lg border border-studio-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              VRAM Velocity (dV/dt)
            </span>
            <span className="text-[9px] text-slate-500">10s window</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-lg font-bold ${velocityMbPerSec > 150 ? 'text-rose-400' : 'text-slate-100'}`}>
              {velocityMbPerSec > 0 ? `+${velocityMbPerSec}` : velocityMbPerSec}
            </span>
            <span className="text-[10px] text-slate-500">MB/s</span>
          </div>
          <div className="mt-2 w-full bg-studio-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                velocityMbPerSec > 250 ? 'bg-rose-500' : velocityMbPerSec > 100 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (velocityMbPerSec / 500) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Cluster VRAM Z-Score */}
        <div className="bg-studio-950 p-3 rounded-lg border border-studio-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              VRAM Z-Score (&sigma;)
            </span>
            <span className="text-[9px] text-slate-500">16-node</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-lg font-bold ${vramZScore > 2.5 ? 'text-rose-400' : 'text-slate-100'}`}>
              {vramZScore > 0 ? `+${vramZScore.toFixed(2)}` : vramZScore.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500">&sigma;</span>
          </div>
          <div className="mt-2 w-full bg-studio-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                vramZScore > 2.5 ? 'bg-rose-500' : vramZScore > 1.5 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (vramZScore / 4) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Thermal Junction Z-Score */}
        <div className="bg-studio-950 p-3 rounded-lg border border-studio-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-purple-400" />
              Thermal Z-Score (&sigma;)
            </span>
            <span className="text-[9px] text-slate-500">Junction</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-lg font-bold ${temperatureZScore > 2.0 ? 'text-amber-400' : 'text-slate-100'}`}>
              {temperatureZScore > 0 ? `+${temperatureZScore.toFixed(2)}` : temperatureZScore.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500">&sigma;</span>
          </div>
          <div className="mt-2 w-full bg-studio-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                temperatureZScore > 2.5 ? 'bg-rose-500' : temperatureZScore > 1.5 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (temperatureZScore / 4) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
