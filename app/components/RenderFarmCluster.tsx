'use client';

import React, { useState } from 'react';
import { GpuNode } from '@/src/types/telemetry';
import { getEnterpriseBaselineNodes } from '@/src/telemetry/enterprise-baseline';
import {
  Cpu,
  Zap,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  Film,
  Activity,
  X,
  Server,
  RefreshCw,
  HardDrive
} from 'lucide-react';

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
  // Guarantee that all 16 nodes are rendered even before initial fetch
  const effectiveNodes = nodes && nodes.length > 0 ? nodes : getEnterpriseBaselineNodes();
  const [inspectingNode, setInspectingNode] = useState<GpuNode | null>(null);
  const criticalNodes = effectiveNodes.filter(n => n.status === 'CRITICAL');
  const healthyCount = effectiveNodes.filter(n => n.status === 'HEALTHY').length;

  return (
    <div className="bg-slate-900 border-2 border-slate-700/90 rounded-xl p-5 shadow-2xl space-y-4 font-mono">
      {/* Matrix Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Hollywood VFX Render Farm Matrix (16 GPU Nodes)
            </h2>
            <p className="text-[11px] text-slate-400">
              Cluster: <strong className="text-slate-200">STG-VIRTUAL-STAGE-A</strong> &bull; Total Compute: <strong className="text-amber-400">768 GB GDDR6X</strong> across 16x RTX 6000 Ada
            </p>
          </div>
        </div>

        {/* Dynamic Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-700/60 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">Nominal ({healthyCount})</span>
          </div>
          {criticalNodes.length > 0 ? (
            <button
              onClick={() => {
                onSelectNode(criticalNodes[0].id);
                setInspectingNode(criticalNodes[0]);
              }}
              className="flex items-center gap-1.5 bg-rose-950 px-3 py-1 rounded border-2 border-rose-500 text-rose-300 font-bold animate-pulse hover:bg-rose-900 cursor-pointer shadow-lg shadow-rose-500/30 transition-all"
              title="Click to jump directly to failing GPU node"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>{criticalNodes.length} OOM Anomaly ({criticalNodes[0].id}) &rarr;</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>0 Anomalies</span>
            </div>
          )}
        </div>
      </div>

      {/* 16-Node Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {effectiveNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isCritical = node.status === 'CRITICAL';
          const vramPct = Math.round((node.vramUsedGb / node.vramTotalGb) * 100);

          return (
            <div
              key={node.id}
              onClick={() => {
                onSelectNode(node.id);
                setInspectingNode(node);
              }}
              className={`p-3 rounded-lg border-2 text-left transition-all duration-150 relative cursor-pointer group shadow-md ${
                isCritical
                  ? 'bg-rose-950/80 border-rose-500 shadow-rose-500/20 ring-2 ring-rose-500 animate-pulse'
                  : isSelected
                  ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/60 shadow-lg'
                  : 'bg-slate-950/90 border-slate-700 hover:border-slate-500 hover:bg-slate-850'
              }`}
            >
              {/* Card Header: Node ID & Status Icon */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white tracking-wide">{node.id}</span>
                {isCritical ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>

              {/* VRAM Gauge */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                  <span>VRAM</span>
                  <span className={`font-bold ${vramPct > 90 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {vramPct}% ({node.vramUsedGb.toFixed(1)}G)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      vramPct > 90
                        ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                        : vramPct > 75
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, vramPct))}%` }}
                  />
                </div>
              </div>

              {/* Thermal & Power Draw */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <span className={`flex items-center gap-0.5 font-bold ${node.temperatureC > 80 ? 'text-rose-400' : 'text-slate-300'}`}>
                  <Thermometer className="w-3 h-3 text-slate-400" />
                  {node.temperatureC}°C
                </span>
                <span className="flex items-center gap-0.5 text-slate-400">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {node.powerWatts}W
                </span>
              </div>

              {/* Active DCC Job Subtitle */}
              {node.currentJob && (
                <div className="pt-1.5 border-t border-slate-800 text-[9px] text-slate-300 truncate flex items-center gap-1">
                  <Film className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="truncate">T:{node.currentJob.tileIndex} &bull; F:{node.currentJob.frame}</span>
                </div>
              )}

              <div className="mt-1 text-[8px] text-center text-slate-500 group-hover:text-cyan-400 transition-colors uppercase">
                Click to inspect
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Hardware Node Inspector Drawer / Modal */}
      {inspectingNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    Hardware Inspector: {inspectingNode.id}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      inspectingNode.status === 'CRITICAL' ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                    }`}>
                      {inspectingNode.status}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">{inspectingNode.gpuModel} &bull; PCIe Gen5 x16</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingNode(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">VRAM Allocation</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {inspectingNode.vramUsedGb.toFixed(1)} / {inspectingNode.vramTotalGb} GB
                </span>
                <span className="text-[10px] text-amber-400">
                  {Math.round((inspectingNode.vramUsedGb / inspectingNode.vramTotalGb) * 100)}% Envelope
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Junction Temperature</span>
                <span className={`text-base font-bold mt-1 block ${inspectingNode.temperatureC > 80 ? 'text-rose-400' : 'text-white'}`}>
                  {inspectingNode.temperatureC}°C
                </span>
                <span className="text-[10px] text-slate-400">DCGM Diode 0</span>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Power Draw</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {inspectingNode.powerWatts} W
                </span>
                <span className="text-[10px] text-emerald-400">TDP: 450W Limit</span>
              </div>
            </div>

            {/* Active Render Context */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Active Studio DCC Workload Context:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Project: <strong className="text-white">CHRONOS: BEYOND THE HORIZON</strong></div>
                <div>Sequence: <strong className="text-white">SQ_04_DESERT_AMBUSH</strong></div>
                <div>Target Shot: <strong className="text-white">SH_04_CITY_BATTLE</strong></div>
                <div>Frame &amp; Tile: <strong className="text-amber-400">Frame 842 &bull; Tile {inspectingNode.currentJob?.tileIndex || 1}</strong></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-[10px] text-slate-500">
                Direct hardware commands executed via Grafana Studio MCP Bridge.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingNode(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
