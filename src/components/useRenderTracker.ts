import { useLayoutEffect } from 'react';
import { perfMonitorStore } from './perfMonitor';

export const useRenderTracker = (name: string) => {
  useLayoutEffect(() => {
    perfMonitorStore.incrementRender(name);
  });
};