import axios from 'axios';

export type TrackedRenderInfo = {
  count: number;
  lastRenderedAt: number | null;
};

export type PerfSnapshot = {
  fps: number;
  memoryMB: string;
  activeRequests: number;
  trackedRenders: Record<string, TrackedRenderInfo>;
};

type Listener = () => void;

class PerfMonitorStore {
  private listeners = new Set<Listener>();

  private snapshot: PerfSnapshot = {
    fps: 0,
    memoryMB: '0.0',
    activeRequests: 0,
    trackedRenders: {},
  };

  private rafId: number | null = null;
  private memoryInterval: ReturnType<typeof setInterval> | null = null;
  private started = false;

  private requestInterceptorId: number | null = null;
  private responseInterceptorId: number | null = null;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  private emit = () => {
    this.listeners.forEach(listener => listener());
  };

  private updateSnapshot = (partial: Partial<PerfSnapshot>) => {
    this.snapshot = {
      ...this.snapshot,
      ...partial,
    };
    this.emit();
  };

  incrementRender = (name: string) => {
    const current = this.snapshot.trackedRenders[name] || {
      count: 0,
      lastRenderedAt: null,
    };

    this.snapshot = {
      ...this.snapshot,
      trackedRenders: {
        ...this.snapshot.trackedRenders,
        [name]: {
          count: current.count + 1,
          lastRenderedAt: Date.now(),
        },
      },
    };

    this.emit();
  };

  resetRender = (name: string) => {
    this.snapshot = {
      ...this.snapshot,
      trackedRenders: {
        ...this.snapshot.trackedRenders,
        [name]: {
          count: 0,
          lastRenderedAt: null,
        },
      },
    };

    this.emit();
  };

  setMemory = (memoryMB: string) => {
    this.updateSnapshot({ memoryMB });
  };

  setRequests = (activeRequests: number) => {
    this.updateSnapshot({ activeRequests });
  };

  setFps = (fps: number) => {
    this.updateSnapshot({ fps });
  };

  start = (getUsedMemory?: () => Promise<number>) => {
    if (this.started) return;
    this.started = true;

    this.attachAxiosInterceptors();

    let frames = 0;
    let lastTime = Date.now();

    const loop = () => {
      frames += 1;
      const now = Date.now();
      const diff = now - lastTime;

      if (diff >= 1000) {
        this.setFps(frames);
        frames = 0;
        lastTime = now;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);

    if (getUsedMemory) {
      this.memoryInterval = setInterval(async () => {
        try {
          const usedMemory = await getUsedMemory();
          this.setMemory((usedMemory / 1024 / 1024).toFixed(1));
        } catch {
          this.setMemory('N/A');
        }
      }, 1000);
    }
  };

  stop = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = null;
    }

    this.detachAxiosInterceptors();
    this.started = false;
  };

  private attachAxiosInterceptors = () => {
    if (this.requestInterceptorId !== null || this.responseInterceptorId !== null) {
      return;
    }

    this.requestInterceptorId = axios.interceptors.request.use(
      config => {
        this.setRequests(this.snapshot.activeRequests + 1);
        return config;
      },
      error => Promise.reject(error)
    );

    this.responseInterceptorId = axios.interceptors.response.use(
      response => {
        this.setRequests(Math.max(0, this.snapshot.activeRequests - 1));
        return response;
      },
      error => {
        this.setRequests(Math.max(0, this.snapshot.activeRequests - 1));
        return Promise.reject(error);
      }
    );
  };

  private detachAxiosInterceptors = () => {
    if (this.requestInterceptorId !== null) {
      axios.interceptors.request.eject(this.requestInterceptorId);
      this.requestInterceptorId = null;
    }

    if (this.responseInterceptorId !== null) {
      axios.interceptors.response.eject(this.responseInterceptorId);
      this.responseInterceptorId = null;
    }
  };
}

export const perfMonitorStore = new PerfMonitorStore();