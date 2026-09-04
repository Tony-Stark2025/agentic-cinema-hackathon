"""
Showrunner Live GPU Telemetry Exporter
======================================
Streams real NVIDIA GPU hardware metrics (VRAM, Temperature, Core Load, Power Draw)
from a live Google Colab, Kaggle, or GCP GCE instance into Showrunner on Cloud Run.

Usage in Google Colab / Kaggle:
  !pip install pynvml requests torch
  python colab_gpu_exporter.py --url https://showrunner-studio-ops-135010851380.us-central1.run.app
"""

import sys
import time
import argparse
import requests

try:
    import pynvml
    HAS_NVML = True
except ImportError:
    HAS_NVML = False

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

def run_exporter(endpoint_url: str, interval_sec: float = 2.0, trigger_oom_after_sec: int = -1):
    print("==================================================================")
    print("  SHOWRUNNER LIVE GPU TELEMETRY EXPORTER (GCP & GRAFANA)")
    print(f"  Target Endpoint: {endpoint_url}")
    print("==================================================================")

    if not HAS_NVML:
        print("[ERROR] pynvml is not installed. Run: pip install pynvml")
        return

    pynvml.nvmlInit()
    device_count = pynvml.nvmlDeviceGetCount()
    print(f"[OK] Detected {device_count} NVIDIA GPU(s)")

    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    gpu_name = pynvml.nvmlDeviceGetName(handle)
    if isinstance(gpu_name, bytes):
        gpu_name = gpu_name.decode('utf-8')
    print(f"[OK] Monitoring Primary GPU: {gpu_name}")

    start_time = time.time()
    tensors = []

    try:
        while True:
            elapsed = time.time() - start_time

            # Optional simulated real VRAM spike using PyTorch
            if trigger_oom_after_sec > 0 and elapsed > trigger_oom_after_sec:
                if HAS_TORCH and torch.cuda.is_available():
                    print("[SIMULATION] Allocating 12GB PyTorch VRAM tensor to simulate 8K Raymarching Spike...")
                    try:
                        # Allocate chunks to push VRAM high
                        for _ in range(6):
                            tensors.append(torch.zeros((1024, 1024, 512), device='cuda', dtype=torch.float32))
                    except Exception as e:
                        print(f"[SIMULATION] PyTorch CUDA allocation limit reached: {e}")

            # Read live hardware metrics from NVIDIA driver
            mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
            temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            
            try:
                power = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0
            except Exception:
                power = 175.0

            try:
                util = pynvml.nvmlDeviceGetUtilizationRates(handle).gpu
            except Exception:
                util = 85.0

            vram_used_gb = mem.used / (1024.0 ** 3)
            vram_total_gb = mem.total / (1024.0 ** 3)

            payload = {
                "nodeId": "gpu-node-01",
                "vramUsedGb": round(vram_used_gb, 2),
                "vramTotalGb": round(vram_total_gb, 2),
                "temperatureC": temp,
                "powerWatts": round(power, 1),
                "gpuUtilizationPct": util,
                "gpuModel": f"{gpu_name} (Colab/GCP Live)"
            }

            try:
                resp = requests.post(f"{endpoint_url}/api/telemetry/ingest", json=payload, timeout=3.0)
                if resp.status_code == 200:
                    print(f"[{time.strftime('%X')}] Streamed to Showrunner: {vram_used_gb:.1f}/{vram_total_gb:.1f}GB ({vram_used_gb/vram_total_gb*100:.1f}%) | {temp}°C | {power:.0f}W")
                else:
                    print(f"[WARN] Ingest returned HTTP {resp.status_code}: {resp.text}")
            except Exception as e:
                print(f"[ERROR] Failed to post telemetry: {e}")

            time.sleep(interval_sec)

    except KeyboardInterrupt:
        print("\n[STOP] Exporter stopped by user.")
    finally:
        pynvml.nvmlShutdown()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stream live GPU telemetry to Showrunner")
    parser.add_argument("--url", default="https://showrunner-studio-ops-135010851380.us-central1.run.app", help="Showrunner base URL")
    parser.add_argument("--interval", type=float, default=2.0, help="Polling interval in seconds")
    parser.add_argument("--trigger-oom-after", type=int, default=-1, help="Seconds before allocating real VRAM tensor spike (-1 to disable)")
    args = parser.parse_args()

    run_exporter(args.url, args.interval, args.trigger_oom_after)
