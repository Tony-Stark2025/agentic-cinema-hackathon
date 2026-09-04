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
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-xl p-5 shadow-2xl flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Deterministic Telemetry Calculus Engine &bull; {nodeId || 'gpu-node-04'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          {isCritical ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-600 font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              ANOMALY CONFIRMED (LEAK DETECTED)
            </span>
          ) : isWarning ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              ELEVATED VRAM PRESSURE
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              NOMINAL HARDWARE ENVELOPE
            </span>
          )}
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Metric 1: Memory Velocity (dV/dt) */}
        <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              VRAM Velocity (dV/dt)
            </span>
            <span className="text-[10px] text-slate-500">10s window</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-2xl font-bold ${velocityMbPerSec > 150 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {velocityMbPerSec > 0 ? `+${velocityMbPerSec}` : velocityMbPerSec}
            </span>
            <span className="text-xs text-slate-400 font-bold">MB/sec</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ${
                velocityMbPerSec > 250 ? 'bg-rose-500' : velocityMbPerSec > 100 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (Math.abs(velocityMbPerSec) / 500) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Cluster VRAM Z-Score */}
        <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Gauge className="w-4 h-4 text-cyan-400" />
              VRAM Z-Score (&sigma;)
            </span>
            <span className="text-[10px] text-slate-500">16-node cluster</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-2xl font-bold ${vramZScore > 2.5 ? 'text-rose-400' : 'text-white'}`}>
              {vramZScore > 0 ? `+${vramZScore.toFixed(2)}` : vramZScore.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-bold">&sigma; dev</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ${
                vramZScore > 2.5 ? 'bg-rose-500' : vramZScore > 1.5 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (Math.abs(vramZScore) / 4) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Thermal Junction Z-Score */}
        <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Gauge className="w-4 h-4 text-purple-400" />
              Thermal Z-Score (&sigma;)
            </span>
            <span className="text-[10px] text-slate-500">DCGM Junction</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-2xl font-bold ${temperatureZScore > 2.0 ? 'text-rose-400' : 'text-white'}`}>
              {temperatureZScore > 0 ? `+${temperatureZScore.toFixed(2)}` : temperatureZScore.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-bold">&sigma; dev</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ${
                temperatureZScore > 2.5 ? 'bg-rose-500' : temperatureZScore > 1.5 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (Math.abs(temperatureZScore) / 4) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
