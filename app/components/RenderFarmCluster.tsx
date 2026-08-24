'use client';

import React from 'react';
import { GpuNode } from '@/src/types/telemetry';
import { Cpu, Zap, Thermometer, ShieldAlert, CheckCircle2, Film } from 'lucide-react';

interface RenderFarmClusterProps {
  nodes: GpuNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export const RenderFarmCluster: React.FC<RenderFarmClusterProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode
}) => {
  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            VFX Render Farm Cluster Matrix (16 Nodes)
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-rose-400 font-semibold">OOM / Critical</span>
          </div>
        </div>
      </div>

      {/* GPU Nodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isCritical = node.status === 'CRITICAL';
          const vramPct = Math.round((node.vramUsedGb / node.vramTotalGb) * 100);

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-150 relative group ${
                isCritical
                  ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500'
                  : isSelected
                  ? 'bg-studio-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-studio-850/80 border-studio-700/60 hover:bg-studio-800 hover:border-studio-600'
              }`}
            >
              {/* Header: Node ID & Status Icon */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-200">{node.id}</span>
                {isCritical ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>

              {/* VRAM Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                  <span>VRAM</span>
                  <span className={vramPct > 90 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{vramPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-studio-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      vramPct > 90
                        ? 'bg-rose-500'
                        : vramPct > 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${vramPct}%` }}
                  />
                </div>
              </div>

              {/* Stats: Temp & Power */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Thermometer className="w-3 h-3 text-slate-500" />
                  {node.temperatureC}°C
                </span>
                <span className="flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-slate-500" />
                  {node.powerWatts}W
                </span>
              </div>

              {/* Current Job Tooltip / Subtext */}
              {node.currentJob && (
                <div className="mt-1.5 pt-1.5 border-t border-studio-700/40 text-[9px] font-mono text-slate-400 truncate flex items-center gap-1">
                  <Film className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />
                  <span className="truncate">F:{node.currentJob.frame} T:{node.currentJob.tileIndex}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
