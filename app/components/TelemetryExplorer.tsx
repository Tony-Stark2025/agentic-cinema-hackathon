'use client';

import React, { useState } from 'react';
import { StudioTelemetrySnapshot } from '@/src/types/telemetry';
import { getEnterpriseBaselineNodes } from '@/src/telemetry/enterprise-baseline';
import { LineChart, FileText, GitCommit, Radio, Terminal, AlertCircle } from 'lucide-react';

interface TelemetryExplorerProps {
  telemetry: StudioTelemetrySnapshot | null;
  selectedNodeId: string;
}

export const TelemetryExplorer: React.FC<TelemetryExplorerProps> = ({
  telemetry,
  selectedNodeId
}) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'LOGS' | 'TRACES' | 'MCP'>('METRICS');

  const baselineNodes = getEnterpriseBaselineNodes();
  const selectedNode = telemetry?.nodes.find(n => n.id === selectedNodeId) || baselineNodes.find(n => n.id === selectedNodeId) || baselineNodes[3];

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-xl p-5 shadow-2xl flex flex-col h-[460px] font-mono text-xs">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Grafana Observability Stream &bull; {selectedNode.id}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'METRICS' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            PromQL
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'LOGS' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            LogQL
          </button>
          <button
            onClick={() => setActiveTab('TRACES')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'TRACES' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            Tempo
          </button>
          <button
            onClick={() => setActiveTab('MCP')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'MCP' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            MCP Tools
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* PromQL Metrics Tab */}
        {activeTab === 'METRICS' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border-2 border-slate-800">
              <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
                <span>PromQL Gauge Query:</span>
                <span className="text-amber-400 font-bold">gpu_vram_utilization_ratio&#123;node=&quot;{selectedNode.id}&quot;&#125;</span>
              </div>
              <div className="text-sm font-bold text-white flex flex-wrap items-center gap-4 mt-1">
                <span>VRAM: <strong className="text-amber-400">{selectedNode.vramUsedGb.toFixed(1)}GB</strong> / {selectedNode.vramTotalGb}GB</span>
                <span className="text-slate-600">|</span>
                <span>GPU Core Load: <strong className="text-cyan-400">{selectedNode.gpuUtilizationPct}%</strong></span>
                <span className="text-slate-600">|</span>
                <span>Diode Temp: <strong className={selectedNode.temperatureC > 80 ? 'text-rose-400' : 'text-emerald-400'}>{selectedNode.temperatureC}°C</strong></span>
              </div>
            </div>

            {/* Time Series Matrix */}
            <div className="bg-slate-950 p-4 rounded-lg border-2 border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cluster Historical Window (Last 15m Mimir Sample)</span>
              <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Tile Latency</div>
                  <div className="text-cyan-400 font-bold mt-1 text-sm">310ms</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Frame Drop Rate</div>
                  <div className="text-emerald-400 font-bold mt-1 text-sm">0.01%</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">VRAM Efficiency</div>
                  <div className="text-amber-400 font-bold mt-1 text-sm">94.8%</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Rendered Frames/Hr</div>
                  <div className="text-purple-400 font-bold mt-1 text-sm">412 frames</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LogQL Logs Tab */}
        {activeTab === 'LOGS' && (
          <div className="space-y-2">
            <div className="bg-slate-950 px-3.5 py-2.5 rounded border-2 border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>LogQL: <strong className="text-purple-400">&#123;cluster=&quot;STG-VIRTUAL-STAGE-A&quot;&#125; |= &quot;error&quot; | json</strong></span>
              <span className="text-slate-400 font-bold">{telemetry?.recentLogs.length || 2} entries</span>
            </div>

            <div className="space-y-2">
              {(telemetry?.recentLogs && telemetry.recentLogs.length > 0 ? telemetry.recentLogs : [
                {
                  id: 'log-default-1',
                  timestamp: Date.now() - 4000,
                  level: 'INFO' as const,
                  service: 'blender-cycles' as const,
                  nodeId: selectedNode.id,
                  message: 'OptiX BVH ray intersection pipeline healthy; 128 samples per tile'
                }
              ]).map((log) => {
                const isError = log.level === 'ERROR' || log.level === 'FATAL';
                const isWarn = log.level === 'WARN';

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border-2 text-[11px] ${
                      isError
                        ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                        : isWarn
                        ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                          isError ? 'bg-rose-900 text-rose-200' : isWarn ? 'bg-amber-900 text-amber-200' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-slate-300 font-bold">{log.service}</span>
                        <span className="text-slate-400">[{log.nodeId}]</span>
                      </span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-xs mt-1">{log.message}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tempo Traces Tab */}
        {activeTab === 'TRACES' && (
          <div className="space-y-2.5">
            <div className="bg-slate-950 px-3.5 py-2.5 rounded border-2 border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Tempo Trace: <strong className="text-cyan-400">{telemetry?.activeTraces[0]?.traceId || 'tr-4k-render-842-live'}</strong></span>
              <span className="text-slate-400 font-bold">5 active spans</span>
            </div>

            <div className="space-y-2">
              {(telemetry?.activeTraces && telemetry.activeTraces.length > 0 ? telemetry.activeTraces : []).map((span) => {
                const isErr = span.statusCode === 'ERROR';
                return (
                  <div
                    key={span.spanId}
                    className={`p-3 rounded-lg border-2 ${
                      isErr ? 'bg-rose-950/70 border-rose-600 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {isErr && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                        {span.operationName}
                      </span>
                      <span className="text-xs text-cyan-400 font-bold">{span.durationMs}ms</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-3">
                      <span>Service: {span.serviceName}</span>
                      <span>Span: {span.spanId}</span>
                    </div>
                    {span.errorMessage && (
                      <div className="mt-1.5 text-[11px] text-rose-200 bg-rose-950/90 p-2 rounded border border-rose-700">
                        {span.errorMessage}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MCP Status Tab */}
        {activeTab === 'MCP' && (
          <div className="space-y-3">
            <div className="bg-emerald-950/40 border-2 border-emerald-600/60 p-3.5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-300 text-sm">Grafana Model Context Protocol (MCP) Server</span>
                <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold border border-emerald-700">CONNECTED</span>
              </div>
              <p className="text-[11px] text-slate-300">Official `grafana/mcp-grafana` protocol bridge active. 7 enterprise studio tools registered for Gemini 3.8 Flash agent tool calling.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Available MCP Tools for Gemini 3.8 Flash:</span>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&bull; grafana_query_metrics:</span>
                  <span className="text-slate-400">PromQL gauge & histogram execution</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">&bull; grafana_query_logs:</span>
                  <span className="text-slate-400">Loki LogQL crash-dump pattern matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">&bull; grafana_get_trace:</span>
                  <span className="text-slate-400">Tempo distributed trace waterfall inspection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">&bull; studio_remediate_node:</span>
                  <span className="text-slate-400">Autonomous GPU VRAM flush & tile rebalance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">&bull; compute_telemetry_analytics:</span>
                  <span className="text-slate-400">Deterministic dV/dt calculus & cluster Z-scores</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-300 font-bold">&bull; grafana_annotate_dashboard:</span>
                  <span className="text-slate-400">Dashboard post-incident audit annotations</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
