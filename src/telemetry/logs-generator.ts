import { StudioLogEntry } from '../types/telemetry';

export class LogsGenerator {
  static generateBaselineLogs(count = 15): StudioLogEntry[] {
    const logs: StudioLogEntry[] = [];
    const now = Date.now();
    const services = ['blender-cycles', 'unreal-nanite', 'nuke-compositor', 'asset-cache', 'render-dispatcher'] as const;

    const standardMessages = [
      'Tile rasterization chunk rendered: 256x256 @ 128 samples/px (0.42s)',
      'OptiX AI Denoiser completed pass for pass_diffuse_direct',
      'Unreal Engine Nanite mesh cluster streamed 4.2M triangles to VRAM',
      'Asset cache hit: /assets/textures/alien_surface_8k_normal.exr (64MB)',
      'Frame sync signal ACK received from Virtual Stage LED Processor',
      'Nuke compositor write node completed tile stitch for SH_04_CITY_BATTLE_02',
      'CUDA context memory pool recycled 1.2GB allocated buffers',
      'Pipeline dispatcher dispatched job-seq-112 to gpu-node-08',
      'Lumen hardware raytracing BVH rebuild time: 14.2ms'
    ];

    for (let i = 0; i < count; i++) {
      const service = services[i % services.length];
      const nodeId = `gpu-node-${String((i % 16) + 1).padStart(2, '0')}`;
      logs.push({
        id: `log-${now - (count - i) * 3000}-${i}`,
        timestamp: now - (count - i) * 3000,
        level: i % 10 === 0 ? 'INFO' : 'DEBUG',
        nodeId,
        service,
        message: standardMessages[i % standardMessages.length],
        traceId: `trace-${1000 + i}`,
        spanId: `span-${5000 + i}`
      });
    }

    return logs;
  }

  static generateIncidentLogs(nodeId: string, incidentCategory: string): StudioLogEntry[] {
    const now = Date.now();
    const traceId = `trace-err-${Date.now().toString(36)}`;

    if (incidentCategory === 'CUDA_OOM_MEMORY_LEAK') {
      return [
        {
          id: `log-inc-1-${now}`,
          timestamp: now - 8000,
          level: 'WARN',
          nodeId,
          service: 'blender-cycles',
          message: `Cycles: GPU memory high-water mark reached: 45.8GB / 48.0GB on ${nodeId}`,
          traceId,
          spanId: 'span-vram-01'
        },
        {
          id: `log-inc-2-${now}`,
          timestamp: now - 5000,
          level: 'ERROR',
          nodeId,
          service: 'blender-cycles',
          message: `CUDA error: Out of memory in cuMemAlloc(&device_ptr, 4294967296) at intern/cycles/device/cuda/device_impl.cpp:382`,
          traceId,
          spanId: 'span-vram-02',
          metadata: {
            culpritFile: 'intern/cycles/device/cuda/device_impl.cpp',
            culpritFunction: 'cuMemAlloc',
            requestedBytes: '4GB',
            vramAvailableBytes: '214MB'
          }
        },
        {
          id: `log-inc-3-${now}`,
          timestamp: now - 2000,
          level: 'FATAL',
          nodeId,
          service: 'render-dispatcher',
          message: `CRITICAL: Render worker ${nodeId} terminated abnormally during frame 842 tile 4. Pipeline queue stalled.`,
          traceId,
          spanId: 'span-vram-03'
        }
      ];
    }

    // Default Unreal Nanite Shader Hang logs
    return [
      {
        id: `log-inc-ue-1-${now}`,
        timestamp: now - 10000,
        level: 'WARN',
        nodeId,
        service: 'unreal-nanite',
        message: `LogRHI: Warning: GPU Timeout detected on shader MaterialShader_AtmosphericScattering.usf`,
        traceId,
        spanId: 'span-sh-01'
      },
      {
        id: `log-inc-ue-2-${now}`,
        timestamp: now - 4000,
        level: 'ERROR',
        nodeId,
        service: 'unreal-nanite',
        message: `D3D12RHI: Error: DXGI_ERROR_DEVICE_HUNG during RayTracingComputePipeline state compilation`,
        traceId,
        spanId: 'span-sh-02',
        metadata: {
          culpritFile: 'MaterialShader_AtmosphericScattering.usf',
          culpritFunction: 'EvaluateVolumetricScatterRay',
          hungThreadId: 'WorkerThread_09'
        }
      }
    ];
  }
}
