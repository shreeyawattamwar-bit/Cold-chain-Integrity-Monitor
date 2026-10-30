import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { OverallStatus } from './components/OverallStatus';
import { SensorCards } from './components/SensorCards';
import { TelemetryCharts } from './components/TelemetryCharts';
import { AlertSection } from './components/AlertSection';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import type {
  TelemetryData,
  HistoryPoint,
  SystemAlert,
  ConnectionStatus,
  ThresholdConfig,
} from './types';
import { DEFAULT_THRESHOLDS } from './types';
import { evaluateIntegrity, formatTimestamp } from './utils/evaluator';
import {
  subscribeToColdChainTelemetry,
  fetchCurrentReading,
} from './services/firebase';
import { buzzerSound } from './utils/audioAlert';
import { HeartPulse, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<SystemAlert | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isBuzzerMuted, setIsBuzzerMuted] = useState<boolean>(buzzerSound.getMuted());
  const [thresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);

  const prevEvaluationRef = useRef<string>('UNKNOWN');
  const lastPacketTimestampRef = useRef<number>(0);

  // Helper to add an alert
  const addAlert = useCallback((
    type: SystemAlert['type'],
    severity: SystemAlert['severity'],
    title: string,
    message: string
  ) => {
    const newAlert: SystemAlert = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      severity,
      title,
      message,
      timestamp: Date.now(),
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]);
    setLatestAlert(newAlert);
  }, []);

  // Process incoming telemetry data
  const handleIncomingData = useCallback((data: TelemetryData) => {
    setTelemetry(data);
    setLastSyncTime(Date.now());

    const evaluation = evaluateIntegrity(data, thresholds);

    // Audio Alert buzzer trigger
    if (evaluation.overall === 'COMPROMISED') {
      buzzerSound.startAlertBuzzer();
    } else {
      buzzerSound.stopAlertBuzzer();
    }

    // Detect state transitions for alerts
    const prevOverall = prevEvaluationRef.current;
    if (prevOverall !== evaluation.overall) {
      if (evaluation.overall === 'COMPROMISED') {
        const primaryBreach = evaluation.violations[0] || 'Safety threshold breach detected.';
        addAlert(
          evaluation.tempBad ? (evaluation.tempReason === 'TOO_HIGH' ? 'TEMP_HIGH' : 'TEMP_LOW') :
          evaluation.humBad ? 'HUMIDITY_HIGH' :
          evaluation.lidBad ? 'LID_OPEN' : 'SENSOR_ERROR',
          'critical',
          'Cold Chain Integrity Breach',
          primaryBreach
        );
      } else if (evaluation.overall === 'SAFE' && prevOverall === 'COMPROMISED') {
        addAlert(
          'SYSTEM_NORMAL',
          'info',
          'Cold Chain Restored to Safe Parameters',
          `All conditions returned within target limits (Temp: ${data.temperature.toFixed(1)}°C, Hum: ${data.humidity.toFixed(0)}%, Lid: Closed).`
        );
      }
      prevEvaluationRef.current = evaluation.overall;
    }

    // In-memory history accumulation (no fabricated history)
    // Avoid duplicate point if timestamp matches exactly and is recent
    setHistory((prev) => {
      const pointTimeStr = formatTimestamp(data.timestamp);
      const newPoint: HistoryPoint = {
        id: `${data.timestamp}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: data.timestamp,
        timeStr: pointTimeStr,
        temperature: data.temperature,
        humidity: data.humidity,
        distance: data.distance >= 0 ? data.distance : 0,
        lid: data.lid,
        isSafe: evaluation.overall === 'SAFE',
      };

      // If we have previous points, check if this is a fresh reading
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.timestamp === data.timestamp && last.temperature === data.temperature && last.humidity === data.humidity) {
          return prev;
        }
      }

      // Keep up to 60 recent session data points
      const updated = [...prev, newPoint];
      if (updated.length > 60) {
        return updated.slice(updated.length - 60);
      }
      return updated;
    });

    lastPacketTimestampRef.current = data.timestamp;
  }, [thresholds, addAlert]);

  // Subscribe to Firebase on mount
  useEffect(() => {
    const unsubscribe = subscribeToColdChainTelemetry({
      onData: (data) => {
        handleIncomingData(data);
      },
      onConnectionStatusChange: (status, message) => {
        setConnectionStatus(status);
        if (status === 'disconnected') {
          addAlert('CONNECTION_LOST', 'warning', 'Firebase Disconnected', message || 'Lost connection to Firebase RTDB server.');
        } else if (status === 'error') {
          addAlert('CONNECTION_LOST', 'critical', 'Firebase Communication Error', message || 'Failed to query Realtime Database.');
        }
      },
      onError: (err) => {
        console.error('Firebase error in subscription:', err);
      },
    });

    return () => {
      unsubscribe();
      buzzerSound.stopAlertBuzzer();
    };
  }, [handleIncomingData, addAlert]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    try {
      const freshData = await fetchCurrentReading();
      if (freshData) {
        handleIncomingData(freshData);
      }
    } catch (err) {
      console.error('Manual fetch error:', err);
    }
  };

  const handleToggleMute = () => {
    const isNowMuted = buzzerSound.toggleMute();
    setIsBuzzerMuted(isNowMuted);
  };

  const evaluation = evaluateIntegrity(telemetry, thresholds);
  const isBuzzerSounding = evaluation.overall === 'COMPROMISED' && !isBuzzerMuted;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Header */}
      <Header
        connectionStatus={connectionStatus}
        lastTelemetryTimestamp={telemetry?.timestamp ?? null}
        onRefresh={handleManualRefresh}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        isBuzzerMuted={isBuzzerMuted}
        onToggleMute={handleToggleMute}
        isBuzzerSounding={isBuzzerSounding}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Prominent Overall Integrity Status Banner */}
        <OverallStatus
          evaluation={evaluation}
          telemetry={telemetry}
          thresholds={thresholds}
        />

        {/* 4 Sensor Telemetry Cards */}
        <SensorCards
          telemetry={telemetry}
          evaluation={evaluation}
          thresholds={thresholds}
        />

        {/* Realtime In-Memory Telemetry Charts */}
        <TelemetryCharts
          history={history}
          thresholds={thresholds}
        />

        {/* Active Alerts & Session Event Log */}
        <AlertSection
          alerts={alerts}
          latestAlert={latestAlert}
          onClearAlerts={() => setAlerts([])}
        />

      </main>

      {/* Hardware & Firebase Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        telemetry={telemetry}
        connectionStatus={connectionStatus}
        lastSyncTime={lastSyncTime}
      />

      {/* Modern Medical Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">
              Medical Cold-Chain Integrity Monitoring Prototype
            </span>
            <span className="text-slate-300">•</span>
            <span>ESP32 + DHT11 + HC-SR04 + Buzzer</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsDiagnosticsOpen(true)}
              className="hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span>Hardware Setup</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-500">
              Firebase: coldchain-integrity-nonitor
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
