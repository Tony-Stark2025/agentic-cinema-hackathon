'use client';

import React from 'react';
import { DistributedTraceSpan } from '@/src/types/telemetry';
import { GitCommit, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TraceWaterfallProps {
  spans: DistributedTraceSpan[];
}

export const TraceWaterfall: React.FC<TraceWaterfallProps> = ({ spans }) => {
  if (!spans || spans.length === 0) {
    return (
      <div className="p-4 bg-studio-950 rounded-lg border border-studio-800 text-xs font-mono text-slate-500 text-center">
        No active distributed traces in buffer.
      </div>
    );
  }

  const rootSpan = spans[0];
  const totalDuration = rootSpan?.durationMs || 4500;

  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 shadow-lg flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-studio-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Tempo Distributed Trace Waterfall &bull; {rootSpan?.traceId}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Total Frame Latency: <strong className="text-white">{totalDuration}ms</strong></span>
        </div>
      </div>

      {/* Waterfall Gantt Chart */}
      <div className="space-y-2.5">
        {spans.map((span, idx) => {
          const isError = span.statusCode === 'ERROR';
          const leftPercent = Math.min(90, Math.max(0, ((span.startTime - (rootSpan?.startTime || span.startTime)) / totalDuration) * 100));
          const widthPercent = Math.min(100 - leftPercent, Math.max(8, (span.durationMs / totalDuration) * 100));

          return (
            <div key={span.spanId || idx} className="bg-studio-950 p-2.5 rounded-lg border border-studio-800/90 text-xs space-y-1.5">
              {/* Span Meta */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold">
                  {isError ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className={isError ? 'text-rose-300' : 'text-slate-200'}>
                    {span.operationName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({span.serviceName})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${isError ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {span.durationMs}ms
                  </span>
                </div>
              </div>

              {/* Gantt Bar */}
              <div className="w-full bg-studio-900 rounded-full h-2 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isError
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                      : span.serviceName === 'blender-cycles-engine'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-cyan-400 to-cyan-500'
                  }`}
                  style={{
                    marginLeft: `${leftPercent}%`,
                    width: `${widthPercent}%`
                  }}
                />
              </div>

              {/* Error Message Snippet */}
              {span.errorMessage && (
                <div className="text-[10px] text-rose-300 bg-rose-950/70 p-1.5 rounded border border-rose-900/60 mt-1">
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
