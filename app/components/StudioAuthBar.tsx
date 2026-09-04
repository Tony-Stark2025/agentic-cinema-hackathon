'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, Key, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';

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
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  isLiveApiConnected: boolean;
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
  onOperatorChange,
  apiKey,
  onApiKeyChange,
  isLiveApiConnected
}) => {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [probeStatus, setProbeStatus] = useState<'IDLE' | 'PROBING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [probeLatency, setProbeLatency] = useState<number | null>(null);

  const handleTestKey = async () => {
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

  const handleSaveKey = () => {
    onApiKeyChange(tempApiKey);
    setIsKeyModalOpen(false);
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

      {/* Operator Switcher & Live API Settings */}
      <div className="flex items-center gap-2.5">
        {/* Role Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-700/80 text-[11px]">
          <span className="text-slate-500 px-2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400" />
            Active Profile:
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

        {/* Live Vertex AI Connection Status Button */}
        <button
          onClick={() => setIsKeyModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
            isLiveApiConnected || apiKey
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900'
              : 'bg-purple-950/80 border-purple-500/80 text-purple-300 hover:bg-purple-900'
          }`}
          title="Configure Live Gemini 3.8 Flash & Vertex AI credentials"
        >
          <Key className="w-3.5 h-3.5" />
          <span>{apiKey ? 'Live API Key Set' : 'Connect Live Vertex AI'}</span>
          <span className={`w-2 h-2 rounded-full ${isLiveApiConnected || apiKey ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`} />
        </button>
      </div>

      {/* Live API / BYOK Settings Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Studio AI & Telemetry Connection Center</h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">
                  Google Cloud Gemini / Vertex AI Key (BYOK):
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy... (or leave empty to use Cloud Run ADC credentials)"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  When empty on Google Cloud Run, Showrunner automatically uses Application Default Credentials (ADC).
                </p>
              </div>

              {/* Probe Test Status */}
              <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {probeStatus === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : probeStatus === 'ERROR' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    )}
                    Model: gemini-3.8-flash (Vertex AI)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {probeStatus === 'SUCCESS'
                      ? `Probe succeeded (${probeLatency}ms) &bull; Uncapped adaptive reasoning ready`
                      : probeStatus === 'ERROR'
                      ? 'Probe failed &bull; Falling back to resilient deterministic studio engine'
                      : 'Status: Ready to test connection'}
                  </div>
                </div>

                <button
                  onClick={handleTestKey}
                  disabled={probeStatus === 'PROBING'}
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {probeStatus === 'PROBING' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Save & Apply Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
