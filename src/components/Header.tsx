import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  RefreshCw,
  Cpu,
  Volume2,
  VolumeX,
  Shield,
  Snowflake,
} from 'lucide-react';
import type { ConnectionStatus } from '../types';
import { formatFullDateTime, getRelativeTime } from '../utils/evaluator';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  lastTelemetryTimestamp: number | null;
  onRefresh: () => void;
  onOpenDiagnostics: () => void;
  isBuzzerMuted: boolean;
  onToggleMute: () => void;
  isBuzzerSounding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  lastTelemetryTimestamp,
  onRefresh,
  onOpenDiagnostics,
  isBuzzerMuted,
  onToggleMute,
  isBuzzerSounding,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [relativeTime, setRelativeTime] = useState<string>('Never');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setRelativeTime(getRelativeTime(lastTelemetryTimestamp));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastTelemetryTimestamp]);

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Connected</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Connecting to Firebase...</span>
          </div>
        );
      case 'disconnected':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Firebase Disconnected</span>
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Firebase Error</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 text-white shadow-md shadow-teal-500/20">
              <Snowflake className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
              <Shield className="w-3.5 h-3.5 absolute bottom-1 right-1 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  COLDCHAIN <span className="text-teal-600 font-extrabold">INTEGRITY</span> MONITOR
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
                  ESP32 IoT
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>Medical Cold-Chain Realtime Telemetry</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] text-teal-700 font-medium">RTDB: /coldchain/latest</span>
              </p>
            </div>
          </div>

          {/* Right Status Group */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-slate-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tracking-wide">LIVE</span>
            </div>

            {/* Firebase Connection Pill */}
            {getConnectionBadge()}

            {/* Last Updated Telemetry */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200" title={`Last packet: ${formatFullDateTime(lastTelemetryTimestamp)}`}>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>ESP32 Sync:</span>
              <span className="font-mono font-semibold text-slate-800">{relativeTime}</span>
            </div>

            {/* System Clock */}
            <div className="hidden xl:flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            {/* Buzzer Sound Toggle */}
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                isBuzzerSounding
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : isBuzzerMuted
                  ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
              }`}
              title={isBuzzerMuted ? 'Buzzer audio muted. Click to enable sound alerts.' : 'Buzzer audio active. Click to mute sound.'}
            >
              {isBuzzerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
              <span className="hidden sm:inline">{isBuzzerMuted ? 'Muted' : 'Audio Alert'}</span>
            </button>

            {/* Hardware & Diagnostics Button */}
            <button
              onClick={onOpenDiagnostics}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              title="View Hardware Pinout, Firebase Config & Diagnostics"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Hardware &amp; API</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
              title="Manual refresh from Firebase"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
