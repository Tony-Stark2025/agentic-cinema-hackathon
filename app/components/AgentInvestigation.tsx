'use client';

import React from 'react';
import { AgentInvestigationSession } from '@/src/types/agent';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Terminal,
  Cpu,
  Activity
} from 'lucide-react';

interface AgentInvestigationProps {
  session: AgentInvestigationSession | null;
  isLoading: boolean;
}

export const AgentInvestigation: React.FC<AgentInvestigationProps> = ({
  session,
  isLoading
}) => {
  const durationMs = session
    ? session.completedAt
      ? session.completedAt - session.startedAt
      : Math.max(300, Date.now() - session.startedAt)
    : 3850;

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-xl p-5 shadow-2xl flex flex-col h-[460px] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Vertex AI Gemini 3.8 Flash Parallel Agent Trace
            </h2>
            <p className="text-[10px] text-slate-400">
              Parallel Fan-Out / Fan-In Central Orchestrator &bull; Sub-4s Resolution
            </p>
          </div>
        </div>

        {session && (
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase ${
                session.status === 'COMPLETED'
                  ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                  : session.status === 'WAITING_FOR_APPROVAL'
                  ? 'bg-amber-900 text-amber-200 border border-amber-600 animate-pulse'
                  : 'bg-purple-900 text-purple-200 border border-purple-600 animate-pulse'
              }`}
            >
              {session.status.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{durationMs}ms</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {!session ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border-2 border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Cpu className="w-7 h-7 text-purple-400" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="font-bold text-white text-sm">
              Showrunner Central Orchestrator Ready
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Standing by with 4 concurrent telemetry scouts. Ready for parallel PromQL, LogQL, Tempo trace inspection, and Gemini 3.8 Flash uncapped reasoning.
            </p>
          </div>

          {/* Architecture Topology Badge */}
          <div className="w-full max-w-md bg-slate-950 p-3 rounded-lg border-2 border-slate-800 text-[11px] text-slate-300">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Parallel Diagnostic Topology:</div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-cyan-300 font-bold">PromQL</div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-purple-300 font-bold">LogQL</div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-amber-300 font-bold">Tempo</div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-emerald-300 font-bold">Calculus</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {session.steps.map((step, idx) => {
            const isCompleted = session.status === 'COMPLETED' || idx < session.steps.length - 1;
            const isDiagnostician = step.agentRole === 'DIAGNOSTICIAN';
            const isRemediation = step.agentRole === 'REMEDIATION';
            const isExecutive = step.agentRole === 'EXECUTIVE';

            return (
              <div
                key={step.id || idx}
                className={`p-3.5 rounded-lg border-2 transition-all space-y-2 ${
                  isDiagnostician
                    ? 'bg-purple-950/40 border-purple-600/60 shadow-lg'
                    : isRemediation
                    ? 'bg-amber-950/40 border-amber-600/60 shadow-lg'
                    : isExecutive
                    ? 'bg-emerald-950/40 border-emerald-600/60 shadow-lg'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {/* Step Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-amber-400 animate-spin" />
                    )}
                    <span className="font-bold text-white tracking-wide">
                      {step.agentRole}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({step.modelUsed})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Agent Thought / Synthesis Body */}
                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap pl-6 border-l-2 border-slate-800">
                  {step.thought}
                </div>

                {/* Tool Invocations */}
                {step.toolCall && (
                  <div className="pl-6 pt-1">
                    <div className="bg-black/50 p-2 rounded border border-slate-800 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-300 font-bold">{step.toolCall.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {JSON.stringify(step.toolCall.arguments).substring(0, 45)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
