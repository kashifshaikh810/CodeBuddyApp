import React, { useEffect, useSyncExternalStore } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { perfMonitorStore } from './perfMonitor';

type DevPerformanceMonitorProps = {
  watch?: string[];
};

const DevPerformanceMonitor: React.FC<DevPerformanceMonitorProps> = ({
  watch = [],
}) => {
  const snapshot = useSyncExternalStore(
    perfMonitorStore.subscribe,
    perfMonitorStore.getSnapshot,
    perfMonitorStore.getSnapshot
  );

  useEffect(() => {
    perfMonitorStore.start(DeviceInfo.getUsedMemory);

    return () => {
      perfMonitorStore.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perf Monitor</Text>
      <Text style={styles.text}>FPS: {snapshot.fps}</Text>
      <Text style={styles.text}>Memory: {snapshot.memoryMB} MB</Text>
      <Text style={styles.text}>Active Requests: {snapshot.activeRequests}</Text>

      {watch.map(name => {
        const info = snapshot.trackedRenders[name];

        return (
          <Text key={name} style={styles.text}>
            {name}: {info?.count ?? 0}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 10,
    borderRadius: 8,
    zIndex: 9999,
    minWidth: 170,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default DevPerformanceMonitor;