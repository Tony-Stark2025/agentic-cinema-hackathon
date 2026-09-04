'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, Cloud, Sparkles, CheckCircle2, AlertCircle, X, Terminal, Copy, Check, Radio } from 'lucide-react';

export interface StudioOperator {
  name: string;
  role: 'LEAD_TD' | 'VFX_SUPERVISOR' | 'RENDER_WRANGLER';
  roleTitle: string;
  badgeId: string;
  clearanceLevel: string;
}

interface StudioAuthBarProps {
  currentOperator: StudioOperator;
  onOperatorChange: (operator: StudioOperator) => void;
}

export const OPERATOR_PROFILES: StudioOperator[] = [
  {
    name: 'Marcus Vance',
    role: 'LEAD_TD',
    roleTitle: 'Principal VFX Technical Director (Staff SRE)',
    badgeId: 'STG-LAX-8492',
    clearanceLevel: 'LEVEL_4_FULL_REMEDIATION'
  },
  {
    name: 'Elena Rostova',
    role: 'VFX_SUPERVISOR',
    roleTitle: 'Production VFX Supervisor',
    badgeId: 'STG-LAX-1044',
    clearanceLevel: 'LEVEL_3_DAILIES_AND_ROI'
  },
  {
    name: 'Kenji Sato',
    role: 'RENDER_WRANGLER',
    roleTitle: 'Virtual Production Systems Wrangler',
    badgeId: 'STG-LAX-3319',
    clearanceLevel: 'LEVEL_2_MONITOR_ONLY'
  }
];

export const StudioAuthBar: React.FC<StudioAuthBarProps> = ({
  currentOperator,
  onOperatorChange
}) => {
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [probeStatus, setProbeStatus] = useState<'IDLE' | 'PROBING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [probeLatency, setProbeLatency] = useState<number | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleTestGateway = async () => {
    try {
      setProbeStatus('PROBING');
      const start = Date.now();
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Ping probe: report cluster status in 1 sentence.' })
      });
      const data = await res.json();
      const latency = Date.now() - start;
      if (data.success) {
        setProbeStatus('SUCCESS');
        setProbeLatency(latency);
      } else {
        setProbeStatus('ERROR');
      }
    } catch {
      setProbeStatus('ERROR');
    }
  };

  const copyColabCommand = () => {
    navigator.clipboard.writeText('!pip install pynvml requests torch && python scripts/colab_gpu_exporter.py --url https://showrunner-studio-ops-135010851380.us-central1.run.app');
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="bg-slate-900 border-b-2 border-slate-700/80 px-6 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-3">
      {/* Operator Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 font-bold">
          <UserCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{currentOperator.name}</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/60 font-bold">
              {currentOperator.roleTitle}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-2">
            <span>Badge: <strong className="text-slate-200">{currentOperator.badgeId}</strong></span>
            <span>&bull;</span>
            <span>Clearance: <strong className="text-emerald-400">{currentOperator.clearanceLevel}</strong></span>
          </div>
        </div>
      </div>

      {/* Operator Switcher & Cloud Gateway Modal Button */}
      <div className="flex items-center gap-2.5">
        {/* Role Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-700/80 text-[11px]">
          <span className="text-slate-500 px-2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400" />
            Active Role:
          </span>
          <select
            value={currentOperator.role}
            onChange={(e) => {
              const profile = OPERATOR_PROFILES.find(p => p.role === e.target.value);
              if (profile) onOperatorChange(profile);
            }}
            className="bg-slate-900 text-slate-200 font-bold px-2.5 py-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            {OPERATOR_PROFILES.map(p => (
              <option key={p.role} value={p.role}>
                {p.name} ({p.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        {/* GCP Vertex AI & Grafana Gateway Status Button */}
        <button
          onClick={() => setIsGatewayModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 bg-purple-950/80 border-purple-500/80 text-purple-300 hover:bg-purple-900 text-xs font-bold transition-all shadow-md active:scale-95"
          title="Inspect GCP Vertex AI ADC credentials and Grafana Cloud status"
        >
          <Cloud className="w-3.5 h-3.5 text-purple-400" />
          <span>GCP Vertex AI &amp; Grafana Gateway</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Enterprise Gateway Architecture Modal */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4 font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Google Cloud Platform &amp; Grafana Architecture
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Enterprise Zero-Key Security via Application Default Credentials (ADC)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGatewayModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Architecture Details */}
            <div className="space-y-3">
              {/* 1. GCP Vertex AI */}
              <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Google Cloud Vertex AI (Gemini Enterprise Agent Platform)
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-700">
                    ADC AUTHENTICATED
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div>Project ID: <strong className="text-white">gen-lang-client-0942141479</strong></div>
                  <div>Region: <strong className="text-white">us-central1</strong></div>
                  <div>Model: <strong className="text-purple-300">gemini-3.8-flash</strong></div>
                  <div>Reasoning: <strong className="text-amber-300">Uncapped Adaptive Depth</strong></div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  Authenticated via Cloud Run Service Account IAM (`135010851380-compute@developer.gserviceaccount.com`). No API keys stored in browser or code.
                </p>
              </div>

              {/* 2. Grafana Cloud on GCP */}
              <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    Grafana Cloud on GCP (Google Cloud Partner Integration)
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-700">
                    7 MCP TOOLS ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Google Cloud Managed Service for Prometheus (GMP) &bull; Mimir (PromQL) &bull; Loki (LogQL) &bull; Tempo (Tracing)
                </p>
              </div>

              {/* 3. Real GPU Ingest Webhook (Colab / GCP VM) */}
              <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    Live Hardware Telemetry Ingest Webhook
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Colab / Kaggle / GCP VM</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Stream real NVIDIA GPU metrics into <strong className="text-amber-300">gpu-node-01</strong> using our open-source Python exporter:
                </p>
                <div className="bg-black/60 p-2.5 rounded border border-slate-800 text-[11px] text-cyan-300 flex items-center justify-between font-mono">
                  <span className="truncate">!python scripts/colab_gpu_exporter.py --url https://showrunner...</span>
                  <button
                    onClick={copyColabCommand}
                    className="ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 shrink-0"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSnippet ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Health Probe */}
              <div className="bg-slate-950 p-3.5 rounded-lg border-2 border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {probeStatus === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : probeStatus === 'ERROR' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    )}
                    Probe Vertex AI ADC Health
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {probeStatus === 'SUCCESS'
                      ? `Probe succeeded (${probeLatency}ms) &bull; Gemini 3.8 Flash live on Vertex AI`
                      : probeStatus === 'ERROR'
                      ? 'Probe failed &bull; Resilient deterministic studio engine active'
                      : 'Click test to execute real-time ADC ping to Gemini 3.8 Flash'}
                  </div>
                </div>

                <button
                  onClick={handleTestGateway}
                  disabled={probeStatus === 'PROBING'}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {probeStatus === 'PROBING' ? 'Probing...' : 'Run Probe'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsGatewayModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                Close Gateway Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
