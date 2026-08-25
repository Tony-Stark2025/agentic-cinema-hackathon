'use client';

import React, { useState } from 'react';
import { AgentInvestigationSession, AgentThoughtStep } from '@/src/types/agent';
import { Bot, Terminal, ChevronDown, ChevronRight, CheckCircle, Sparkles, Cpu, Wrench, FileText } from 'lucide-react';

interface AgentInvestigationProps {
  session: AgentInvestigationSession | null;
  isInvestigating: boolean;
}

export const AgentInvestigation: React.FC<AgentInvestigationProps> = ({
  session,
  isInvestigating
}) => {
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedStepIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getAgentBadge = (role: string) => {
    switch (role) {
      case 'SENTINEL':
        return {
          icon: <Bot className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'Sentinel Agent',
          color: 'bg-cyan-950/40 text-cyan-300 border-cyan-700/50'
        };
      case 'DIAGNOSTICIAN':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Diagnostic Agent',
          color: 'bg-purple-950/40 text-purple-300 border-purple-700/50'
        };
      case 'REMEDIATION':
        return {
          icon: <Wrench className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Remediation Agent',
          color: 'bg-amber-950/40 text-amber-300 border-amber-700/50'
        };
      case 'EXECUTIVE':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Executive Briefing Agent',
          color: 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-400" />,
          label: role,
          color: 'bg-studio-800 text-slate-300 border-studio-700'
        };
    }
  };

  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-studio-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Gemini 3.x Multi-Agent Reasoning Trace
          </h2>
        </div>
        {isInvestigating && (
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-800/60 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            Autonomous Reasoning Active
          </div>
        )}
      </div>

      {/* Steps Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {!session || session.steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-xs font-mono">
            <Terminal className="w-8 h-8 mb-2 text-studio-600" />
            <p>Awaiting incident trigger or studio anomaly...</p>
            <p className="text-[11px] text-slate-600 mt-1">Click "Simulate Incident" to watch Gemini 3.x investigate and self-heal.</p>
          </div>
        ) : (
          session.steps.map((step: AgentThoughtStep) => {
            const badge = getAgentBadge(step.agentRole);
            const isExpanded = expandedStepIds[step.id] ?? true;

            return (
              <div key={step.id} className="bg-studio-850 border border-studio-700/60 rounded-lg p-3.5 transition-all">
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${badge.color}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-studio-800 text-slate-400 border border-studio-700">
                      {step.modelUsed}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Thought Content */}
                <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line mb-2 bg-studio-900/60 p-2.5 rounded border border-studio-800">
                  {step.thought}
                </div>

                {/* MCP Tool Execution Card */}
                {step.toolCall && (
                  <div className="mt-2 border border-studio-700/80 rounded bg-studio-950/80 overflow-hidden">
                    <button
                      onClick={() => toggleExpand(step.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 bg-studio-900/80 text-[11px] font-mono text-amber-400 hover:bg-studio-850 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        MCP Tool Execution: <span className="text-white font-bold">{step.toolCall.name}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-2.5 text-[11px] font-mono border-t border-studio-800/80 space-y-2 overflow-x-auto">
                        <div>
                          <span className="text-slate-500 uppercase text-[9px] font-bold">Arguments:</span>
                          <pre className="text-cyan-300 mt-0.5">{JSON.stringify(step.toolCall.arguments, null, 2)}</pre>
                        </div>
                        {Boolean(step.toolCall.result) && (
                          <div>
                            <span className="text-slate-500 uppercase text-[9px] font-bold">Grafana MCP Result:</span>
                            <pre className="text-slate-300 mt-0.5 max-h-36 overflow-y-auto">{JSON.stringify(step.toolCall.result, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
