'use client';

import React, { useState } from 'react';
import { StudioTelemetrySnapshot } from '@/src/types/telemetry';
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

  const selectedNode = telemetry?.nodes.find(n => n.id === selectedNodeId) || telemetry?.nodes[0];

  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 shadow-lg flex flex-col h-[480px]">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-studio-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Grafana Observability Stream ({selectedNode?.id || 'Cluster-Alpha'})
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-studio-950 p-1 rounded-lg border border-studio-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'METRICS' ? 'bg-studio-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            PromQL
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'LOGS' ? 'bg-studio-800 text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            LogQL
          </button>
          <button
            onClick={() => setActiveTab('TRACES')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'TRACES' ? 'bg-studio-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            Tempo Traces
          </button>
          <button
            onClick={() => setActiveTab('MCP')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'MCP' ? 'bg-studio-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            MCP Status
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* PromQL Metrics Tab */}
        {activeTab === 'METRICS' && (
          <div className="space-y-4">
            <div className="bg-studio-950 p-3 rounded-lg border border-studio-800 font-mono text-xs">
              <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                <span>PromQL Query:</span>
                <span className="text-amber-400">gpu_vram_utilization_ratio&#123;node=&quot;{selectedNode?.id}&quot;&#125;</span>
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-3 mt-2">
                <span>VRAM: {selectedNode?.vramUsedGb}GB / {selectedNode?.vramTotalGb}GB</span>
                <span className="text-slate-500">|</span>
                <span>GPU Load: {selectedNode?.gpuUtilizationPct}%</span>
                <span className="text-slate-500">|</span>
                <span>Temp: {selectedNode?.temperatureC}°C</span>
              </div>
            </div>

            {/* Time Series Matrix */}
            <div className="bg-studio-950 p-3 rounded-lg border border-studio-800 font-mono text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cluster Historical Window (Last 15m)</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-studio-900 p-2 rounded border border-studio-800">
                  <div className="text-slate-500 text-[9px]">Tile Latency</div>
                  <div className="text-cyan-400 font-bold mt-0.5">342ms</div>
                </div>
                <div className="bg-studio-900 p-2 rounded border border-studio-800">
                  <div className="text-slate-500 text-[9px]">Frame Drop Rate</div>
                  <div className="text-emerald-400 font-bold mt-0.5">0.03%</div>
                </div>
                <div className="bg-studio-900 p-2 rounded border border-studio-800">
                  <div className="text-slate-500 text-[9px]">VRAM Efficiency</div>
                  <div className="text-amber-400 font-bold mt-0.5">94.2%</div>
                </div>
                <div className="bg-studio-900 p-2 rounded border border-studio-800">
                  <div className="text-slate-500 text-[9px]">Rendered Frames/Hr</div>
                  <div className="text-purple-400 font-bold mt-0.5">368 frames</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LogQL Logs Tab */}
        {activeTab === 'LOGS' && (
          <div className="space-y-2 font-mono text-xs">
            <div className="bg-studio-950 px-3 py-2 rounded border border-studio-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>LogQL: <span className="text-purple-400">&#123;cluster=&quot;alpha&quot;&#125; |= &quot;error&quot; | json</span></span>
              <span className="text-slate-500">{telemetry?.recentLogs.length || 0} entries</span>
            </div>

            <div className="space-y-1.5">
              {telemetry?.recentLogs.map((log) => {
                const isError = log.level === 'ERROR' || log.level === 'FATAL';
                const isWarn = log.level === 'WARN';

                return (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded border text-[11px] font-mono ${
                      isError
                        ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                        : isWarn
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                        : 'bg-studio-950/70 border-studio-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-2">
                        <span className={`px-1 rounded font-bold ${
                          isError ? 'bg-rose-900 text-rose-200' : isWarn ? 'bg-amber-900 text-amber-200' : 'bg-studio-800 text-slate-400'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-slate-400">{log.service}</span>
                        <span className="text-slate-600">[{log.nodeId}]</span>
                      </span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{log.message}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tempo Traces Tab */}
        {activeTab === 'TRACES' && (
          <div className="space-y-2.5 font-mono text-xs">
            <div className="bg-studio-950 px-3 py-2 rounded border border-studio-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Tempo Trace: <span className="text-cyan-400">{telemetry?.activeTraces[0]?.traceId || 'trace-current'}</span></span>
              <span className="text-slate-500">{telemetry?.activeTraces.length || 0} spans</span>
            </div>

            <div className="space-y-2">
              {telemetry?.activeTraces.map((span) => {
                const isErr = span.statusCode === 'ERROR';
                return (
                  <div
                    key={span.spanId}
                    className={`p-2.5 rounded border ${
                      isErr ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-studio-950/70 border-studio-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        {isErr && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                        {span.operationName}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold">{span.durationMs}ms</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-3">
                      <span>Service: {span.serviceName}</span>
                      <span>Span: {span.spanId}</span>
                    </div>
                    {span.errorMessage && (
                      <div className="mt-1.5 text-[10px] text-rose-300 bg-rose-950/60 p-1.5 rounded border border-rose-900">
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
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-300">Grafana Model Context Protocol (MCP) Server</span>
                <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold">CONNECTED</span>
              </div>
              <p className="text-[11px] text-slate-400">Official `grafana/mcp-grafana` protocol bridge active. 60+ tools registered for Gemini 3.x agent tool calling.</p>
            </div>

            <div className="bg-studio-950 p-3 rounded-lg border border-studio-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Available MCP Tools for Gemini 3.x:</span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
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
