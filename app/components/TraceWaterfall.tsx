'use client';

import React from 'react';
import { DistributedTraceSpan } from '@/src/types/telemetry';
import { getEnterpriseBaselineTraces } from '@/src/telemetry/enterprise-baseline';
import { GitCommit, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TraceWaterfallProps {
  spans: DistributedTraceSpan[];
}

export const TraceWaterfall: React.FC<TraceWaterfallProps> = ({ spans }) => {
  const effectiveSpans = spans && spans.length > 0 ? spans : getEnterpriseBaselineTraces();
  const rootSpan = effectiveSpans[0];
  const totalDuration = rootSpan?.durationMs || 3850;

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-xl p-5 shadow-2xl flex flex-col gap-3.5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <GitCommit className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Tempo Distributed Trace Waterfall &bull; {rootSpan?.traceId || 'tr-4k-render-842-live'}
            </span>
            <span className="text-[10px] text-slate-400">
              Frame Assembly Critical Path Latency &bull; OpenTelemetry v1.28
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1 rounded border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Total Latency: <strong className="text-white">{totalDuration}ms</strong></span>
        </div>
      </div>

      {/* Waterfall Gantt Chart */}
      <div className="space-y-2.5">
        {effectiveSpans.map((span, idx) => {
          const isError = span.statusCode === 'ERROR';
          const leftPercent = Math.min(85, Math.max(0, ((span.startTime - (rootSpan?.startTime || span.startTime)) / totalDuration) * 100));
          const widthPercent = Math.min(100 - leftPercent, Math.max(12, (span.durationMs / totalDuration) * 100));

          return (
            <div
              key={span.spanId || idx}
              className={`p-3 rounded-lg border-2 text-xs space-y-1.5 transition-all ${
                isError
                  ? 'bg-rose-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              {/* Span Meta */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold">
                  {isError ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className={isError ? 'text-rose-300' : 'text-white'}>
                    {span.operationName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({span.serviceName})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isError ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {span.durationMs}ms
                  </span>
                </div>
              </div>

              {/* Gantt Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden relative border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isError
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                      : span.serviceName === 'blender-cycles-engine'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                  }`}
                  style={{
                    marginLeft: `${leftPercent}%`,
                    width: `${widthPercent}%`
                  }}
                />
              </div>

              {/* Error Message Snippet */}
              {span.errorMessage && (
                <div className="text-[11px] text-rose-200 bg-rose-950/90 p-2 rounded border border-rose-600 mt-1 font-mono">
                  {span.errorMessage}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
