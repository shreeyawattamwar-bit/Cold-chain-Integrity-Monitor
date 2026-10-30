import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';
import type { Unsubscribe } from 'firebase/database';
import type { TelemetryData, ConnectionStatus } from '../types';

export const FIREBASE_CONFIG = {
  projectId: 'coldchain-integrity-nonitor',
  databaseURL: 'https://coldchain-integrity-nonitor-default-rtdb.asia-southeast1.firebasedatabase.app',
};

export const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
export const database = getDatabase(app);

export const LATEST_PATH = 'coldchain/latest';

export interface FirebaseSubscriptionHandlers {
  onData: (data: TelemetryData) => void;
  onConnectionStatusChange: (status: ConnectionStatus, message?: string) => void;
  onError: (error: Error) => void;
}

/**
 * Subscribes to real-time cold-chain sensor telemetry at /coldchain/latest
 * and monitors the connection state via /.info/connected.
 */
export function subscribeToColdChainTelemetry(handlers: FirebaseSubscriptionHandlers): () => void {
  const telemetryRef = ref(database, LATEST_PATH);
  const connectedRef = ref(database, '.info/connected');

  handlers.onConnectionStatusChange('connecting');

  // Monitor RTDB socket connection
  const unsubscribeConnected: Unsubscribe = onValue(
    connectedRef,
    (snapshot) => {
      const isConnected = snapshot.val() === true;
      if (isConnected) {
        handlers.onConnectionStatusChange('connected');
      } else {
        handlers.onConnectionStatusChange('disconnected', 'Realtime socket disconnected. Attempting reconnect...');
      }
    },
    (error) => {
      console.error('Firebase connection error:', error);
      handlers.onConnectionStatusChange('error', error.message);
      handlers.onError(error);
    }
  );

  // Monitor /coldchain/latest data changes
  const unsubscribeTelemetry: Unsubscribe = onValue(
    telemetryRef,
    (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Sanitize incoming payload
        const telemetry: TelemetryData = {
          temperature: typeof val.temperature === 'number' ? val.temperature : parseFloat(val.temperature) || 0,
          humidity: typeof val.humidity === 'number' ? val.humidity : parseFloat(val.humidity) || 0,
          distance: typeof val.distance === 'number' ? val.distance : parseFloat(val.distance) || -1,
          lid: typeof val.lid === 'string' ? val.lid.toLowerCase() : String(val.lid ?? 'unknown'),
          timestamp: typeof val.timestamp === 'number' ? val.timestamp : Date.now(),
        };

        handlers.onData(telemetry);
        handlers.onConnectionStatusChange('connected');
      } else {
        console.warn('Snapshot at /coldchain/latest is null/empty');
      }
    },
    (error) => {
      console.error('Snapshot listener error on /coldchain/latest:', error);
      handlers.onConnectionStatusChange('error', error.message);
      handlers.onError(error);
    }
  );

  return () => {
    unsubscribeConnected();
    unsubscribeTelemetry();
    off(telemetryRef);
    off(connectedRef);
  };
}

/**
 * Perform a manual single fetch from Firebase RTDB (useful for quick verification)
 */
export async function fetchCurrentReading(): Promise<TelemetryData | null> {
  const telemetryRef = ref(database, LATEST_PATH);
  const snapshot = await get(telemetryRef);
  if (snapshot.exists()) {
    const val = snapshot.val();
    return {
      temperature: typeof val.temperature === 'number' ? val.temperature : parseFloat(val.temperature) || 0,
      humidity: typeof val.humidity === 'number' ? val.humidity : parseFloat(val.humidity) || 0,
      distance: typeof val.distance === 'number' ? val.distance : parseFloat(val.distance) || -1,
      lid: typeof val.lid === 'string' ? val.lid.toLowerCase() : String(val.lid ?? 'unknown'),
      timestamp: typeof val.timestamp === 'number' ? val.timestamp : Date.now(),
    };
  }
  return null;
}
