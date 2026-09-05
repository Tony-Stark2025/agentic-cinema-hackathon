import { DistributedTraceSpan } from '../types/telemetry';

export class TraceGenerator {
  static generateRenderPipelineTrace(traceId = `trace-${Date.now().toString(36)}`, hasError = false, errorNode = 'gpu-node-04'): DistributedTraceSpan[] {
    const startTime = Date.now() - 4500;
    const rootSpanId = `span-root-${Math.random().toString(36).substring(2, 8)}`;
    const assemblySpanId = `span-asmb-${Math.random().toString(36).substring(2, 8)}`;
    const shaderSpanId = `span-shdr-${Math.random().toString(36).substring(2, 8)}`;
    const raytraceSpanId = `span-rayt-${Math.random().toString(36).substring(2, 8)}`;
    const compositeSpanId = `span-comp-${Math.random().toString(36).substring(2, 8)}`;

    const spans: DistributedTraceSpan[] = [
      {
        traceId,
        spanId: rootSpanId,
        serviceName: 'studio-pipeline-orchestrator',
        operationName: 'RenderFrame_SH_04_CITY_BATTLE_Frame842',
        startTime,
        durationMs: 4250,
        statusCode: hasError ? 'ERROR' : 'OK',
        attributes: {
          'cinema.project': 'PROJECT_CHRONOS',
          'cinema.sequence': 'SQ_04',
          'cinema.shot': 'SH_04_CITY_BATTLE',
          'cinema.frame': 842,
          'render.resolution': '3840x2160 (4K DCI)',
          'render.samples': 2048
        }
      },
      {
        traceId,
        spanId: assemblySpanId,
        parentSpanId: rootSpanId,
        serviceName: 'asset-cache-service',
        operationName: 'FetchUSDStageAndTextures',
        startTime: startTime + 50,
        durationMs: 480,
        statusCode: 'OK',
        attributes: {
          'usd.layer_count': 14,
          'usd.prim_count': 84200,
          'cache.hit_ratio': 0.94
        }
      },
      {
        traceId,
        spanId: shaderSpanId,
        parentSpanId: rootSpanId,
        serviceName: 'unreal-nanite-compiler',
        operationName: 'CompileMaterialShaders',
        startTime: startTime + 530,
        durationMs: 620,
        statusCode: 'OK',
        attributes: {
          'shader.pipeline': 'OptiX_Raytracing_Pipeline',
          'shader.variant_count': 32
        }
      },
      {
        traceId,
        spanId: raytraceSpanId,
        parentSpanId: rootSpanId,
        serviceName: 'blender-cycles-engine',
        operationName: `ComputeBvhRayIntersections [${errorNode}]`,
        startTime: startTime + 1150,
        durationMs: hasError ? 2400 : 2650,
        statusCode: hasError ? 'ERROR' : 'OK',
        errorMessage: hasError ? 'CUDA_ERROR_OUT_OF_MEMORY: VRAM allocation of 4GB exceeded 48GB buffer limit' : undefined,
        attributes: {
          'gpu.node_id': errorNode,
          'gpu.cuda_cores_active': 18432,
          'gpu.bvh_triangles': 14800000,
          'vram.peak_allocated_gb': hasError ? 47.9 : 32.4
        }
      },
      {
        traceId,
        spanId: compositeSpanId,
        parentSpanId: rootSpanId,
        serviceName: 'nuke-compositor',
        operationName: 'StitchTileBuffersAndApplyGrade',
        startTime: startTime + 3800,
        durationMs: hasError ? 120 : 450,
        statusCode: hasError ? 'ERROR' : 'OK',
        errorMessage: hasError ? 'Tile 4 buffer missing from gpu-node-04' : undefined,
        attributes: {
          'comp.layer_count': 8,
          'comp.color_space': 'ACEScg'
        }
      }
    ];

    return spans;
  }
}
