'use client';

import React, { useState, useEffect } from 'react';
import { Film, Eye, Layers, Maximize2, AlertTriangle, CheckCircle2, Play, Pause, Activity } from 'lucide-react';
import { StudioIncident } from '@/src/types/incident';

interface CinemaViewportProps {
  activeIncident: StudioIncident | null | undefined;
  selectedNodeId: string;
}

export const CinemaViewport: React.FC<CinemaViewportProps> = ({
  activeIncident,
  selectedNodeId
}) => {
  const [viewMode, setViewMode] = useState<'BEAUTY' | 'TILES' | 'THERMAL'>('TILES');
  const [samples, setSamples] = useState(384);
  const [isLiveAnimating, setIsLiveAnimating] = useState(true);

  const isCritical = activeIncident && activeIncident.status !== 'RESOLVED';
  const isResolved = activeIncident && activeIncident.status === 'RESOLVED';

  // Real-time progressive rendering simulation loop
  useEffect(() => {
    if (!isLiveAnimating) return;
    const timer = setInterval(() => {
      setSamples(prev => (prev >= 512 ? 128 : prev + 16));
    }, 1200);
    return () => clearInterval(timer);
  }, [isLiveAnimating]);

  return (
    <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
      {/* Top Bar: Film Meta & Controls */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-wide">
                CHRONOS: SQ_04 &bull; SH_04_CITY_BATTLE
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/80">
                4K DCI (3840x2160)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Frame: <strong className="text-white">842</strong></span>
              <span>&bull;</span>
              <span>Engine: <strong className="text-amber-400">Blender Cycles OptiX 4.2</strong></span>
              <span>&bull;</span>
              <span>Color: <strong className="text-slate-300">ACEScg</strong></span>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Sample Progress */}
          <div className="bg-slate-900 px-3 py-1 rounded border border-slate-700/80 flex items-center gap-2">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-slate-300 text-[11px]">
              {samples} / 512 samples/px
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-700/80 text-[10px]">
            <button
              onClick={() => setViewMode('TILES')}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'TILES' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              Tile Buckets
            </button>
            <button
              onClick={() => setViewMode('BEAUTY')}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'BEAUTY' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              Beauty Pass
            </button>
            <button
              onClick={() => setViewMode('THERMAL')}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'THERMAL' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              False Color
            </button>
          </div>

          <button
            onClick={() => setIsLiveAnimating(!isLiveAnimating)}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
            title={isLiveAnimating ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isLiveAnimating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Viewport Canvas Screen */}
      <div className="relative w-full h-64 sm:h-72 bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-900 overflow-hidden flex items-center justify-center p-4">
        {/* Cinematic Backdrop Scene (Simulated 8K Volumetric Desert Shot) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/20 via-slate-950/90 to-black pointer-events-none" />

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

        {/* 1. TILE BUCKETS VIEW MODE */}
        {viewMode === 'TILES' && (
          <div className="relative z-10 grid grid-cols-8 grid-rows-4 gap-1.5 w-full h-full max-w-4xl p-2 border border-slate-700/60 rounded-lg bg-black/40 backdrop-blur-[2px]">
            {Array.from({ length: 32 }).map((_, idx) => {
              const isFailingTile = isCritical && idx === 14;
              const isResolvedTile = isResolved && idx === 14;
              const isSelectedNodeTile = selectedNodeId === 'gpu-node-04' && idx === 14;
              const isActiveRendering = idx === 11 || idx === 18 || idx === 22;

              return (
                <div
                  key={idx}
                  className={`relative rounded border text-[9px] flex flex-col justify-between p-1 transition-all duration-300 overflow-hidden ${
                    isFailingTile
                      ? 'bg-rose-950/90 border-rose-500 ring-2 ring-rose-500 animate-pulse text-rose-200'
                      : isResolvedTile
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : isActiveRendering
                      ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200'
                      : isSelectedNodeTile
                      ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">T{idx + 1}</span>
                    {isFailingTile ? (
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-400 animate-bounce" />
                    ) : isResolvedTile ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <span className="text-[7px] text-slate-500">N{(idx % 16) + 1}</span>
                    )}
                  </div>

                  {isFailingTile ? (
                    <span className="text-[7px] font-bold text-rose-300 uppercase leading-tight">
                      OOM CRITICAL
                    </span>
                  ) : isResolvedTile ? (
                    <span className="text-[7px] font-bold text-emerald-300 uppercase leading-tight">
                      SPLIT 8x8 OK
                    </span>
                  ) : (
                    <span className="text-[7px] text-slate-400">
                      {idx < 14 ? '128/128' : `${Math.min(128, samples / 4)}/128`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. BEAUTY PASS VIEW MODE (Photorealistic Denoised Film Frame) */}
        {viewMode === 'BEAUTY' && (
          <div className="relative z-10 w-full h-full max-w-4xl rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col justify-between p-4 bg-gradient-to-t from-black via-amber-950/40 to-slate-900">
            {/* Cinematic 2.39:1 Letterbox Bars */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-black/90 z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/90 z-10" />

            {/* Denoised Scene Content */}
            <div className="relative z-0 h-full flex flex-col justify-between py-3">
              {/* Top Camera HUD */}
              <div className="flex items-center justify-between text-[10px] text-amber-300/90 font-mono">
                <span className="bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                  ARRI ALEXA 65 &bull; 65mm T1.9 Prime &bull; EI 800
                </span>
                <span className="bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300">
                  ACEScg Color Pipeline &bull; OptiX AI Denoiser
                </span>
              </div>

              {/* Center Scene Artwork Simulation */}
              <div className="text-center space-y-1 my-auto">
                <div className="text-lg font-black tracking-widest text-amber-200 drop-shadow-md">
                  CHRONOS &bull; SCENE 04 &bull; ARRAKIS AMBUSH
                </div>
                <div className="text-[11px] text-slate-300 drop-shadow">
                  4K DCI (4096×2160) &bull; Frame 842 &bull; 14.8M Volumetric Micro-Polygons
                </div>
                {isCritical && (
                  <div className="inline-block mt-2 bg-rose-950/90 border border-rose-500 text-rose-300 px-3 py-1 rounded text-xs font-bold animate-pulse">
                    [OPTIX ERROR: Tile 15 Raymarcher Aborted on gpu-node-04]
                  </div>
                )}
                {isResolved && (
                  <div className="inline-block mt-2 bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-3 py-1 rounded text-xs font-bold">
                    [DENOISED BEAUTY PASS: 100% Convergence at 512 Samples/px]
                  </div>
                )}
              </div>

              {/* Bottom Timecode HUD */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>TC: 01:24:18:14</span>
                <span className="text-emerald-400 font-bold">DCI Theatrical DCP Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. FALSE COLOR THERMAL HEATMAP VIEW MODE */}
        {viewMode === 'THERMAL' && (
          <div className="relative z-10 w-full h-full max-w-4xl rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col justify-between p-4 bg-gradient-to-r from-blue-950 via-purple-900 to-rose-950">
            {/* Heatmap Grid & Legend */}
            <div className="flex items-center justify-between text-[10px] text-white font-mono bg-black/60 p-2 rounded border border-slate-700">
              <span className="font-bold text-cyan-300">VRAM Allocation &amp; DCGM Thermal Density Spectrum:</span>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="text-blue-400">16GB (Cool)</span>
                <span className="w-16 h-2 rounded bg-gradient-to-r from-blue-500 via-yellow-400 to-rose-600" />
                <span className="text-rose-400 font-bold">48GB (HOTSPOT)</span>
              </div>
            </div>

            {/* Hotspot Visualization */}
            <div className="h-full flex items-center justify-center relative">
              {isCritical ? (
                <div className="w-40 h-28 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-yellow-300 animate-pulse border-2 border-white flex flex-col items-center justify-center text-slate-950 font-bold p-2 shadow-2xl shadow-rose-500/50">
                  <span className="text-xs">HOTSPOT DETECTED</span>
                  <span className="text-[10px]">gpu-node-04 &bull; 86.4°C</span>
                  <span className="text-[9px]">47.8GB / 48.0GB VRAM</span>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <div className="text-emerald-300 font-bold text-sm">Cluster Thermal Equilibrium Normal</div>
                  <div className="text-slate-300 text-[10px]">All 16 GPU junction sensors between 61°C and 66°C (Delta &lt; 5°C)</div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 text-center font-mono">
              FLIR False-Color Radiometric Map &bull; Precision: &plusmn;0.5°C Junction Sensor
            </div>
          </div>
        )}

        {/* Live Incident Alert HUD Overlay */}
        {isCritical && (
          <div className="absolute top-4 right-4 z-20 bg-rose-950/95 border-2 border-rose-500 rounded-lg p-3 shadow-2xl flex items-center gap-3 animate-bounce">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                VRAM Allocation Fault &bull; Tile 15
              </div>
              <div className="text-[10px] text-rose-200">
                gpu-node-04 memory high-water mark reached (47.8GB/48.0GB).
              </div>
            </div>
          </div>
        )}

        {/* Remediation Complete HUD Overlay */}
        {isResolved && (
          <div className="absolute top-4 right-4 z-20 bg-emerald-950/95 border-2 border-emerald-500 rounded-lg p-3 shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Tile Split Remediation Complete
              </div>
              <div className="text-[10px] text-emerald-200">
                Frame 842 re-allocated to 8x8 sub-tiles across node-04 and node-05.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viewport Footer Diagnostics */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Stage LED Volume Sync: <strong className="text-white">120.0 fps Lock</strong>
          </span>
          <span>&bull;</span>
          <span>Camera Tracking: <strong className="text-slate-200">Mo-Sys StarTracker (Genlock Valid)</strong></span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Viewport Refresh: 60Hz &bull; Display Buffer: OptiX Denoised EXR
        </div>
      </div>
    </div>
  );
};
