import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { HistoryPoint, ThresholdConfig } from '../types';
import { Activity } from 'lucide-react';

interface TelemetryChartsProps {
  history: HistoryPoint[];
  thresholds: ThresholdConfig;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  history,
  thresholds,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'temperature' | 'humidity' | 'distance'>('all');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              Live Session Telemetry Charts
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              In-Memory Session History
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sensor telemetry points recorded during this browser session ({history.length} samples captured)
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Charts (Grid)
          </button>
          <button
            onClick={() => setActiveTab('temperature')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'temperature'
                ? 'bg-white text-teal-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveTab('humidity')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'humidity'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Humidity
          </button>
          <button
            onClick={() => setActiveTab('distance')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'distance'
                ? 'bg-white text-cyan-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Distance
          </button>
        </div>
      </div>

      {/* History Information Banner */}
      {history.length <= 1 && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>
              {history.length === 1
                ? 'Initial live reading loaded. New data points will plot continuously as the ESP32 updates Firebase (~every 3 seconds).'
                : 'Connecting to Firebase listener... Waiting for initial reading.'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">No mock data used</span>
        </div>
      )}

      {/* Chart Render Area */}
      <div className={`grid gap-5 ${activeTab === 'all' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        
        {/* TEMPERATURE CHART */}
        {(activeTab === 'all' || activeTab === 'temperature') && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Temperature History (°C)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Safe: 2°C–8°C
              </span>
            </div>

            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="timeStr"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax + 2), 12)]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    unit="°"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#2dd4bf' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}
                    formatter={(value: any) => [`${typeof value === 'number' ? value.toFixed(1) : value} °C`, 'Temperature']}
                  />
                  {/* Reference Lines for Safe Window */}
                  <ReferenceLine
                    y={thresholds.tempMin}
                    stroke="#059669"
                    strokeDasharray="4 4"
                    label={{ value: '2°C Min', position: 'insideBottomLeft', fill: '#059669', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={thresholds.tempMax}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: '8°C Max', position: 'insideTopLeft', fill: '#dc2626', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0d9488', strokeWidth: 1, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#0f766e', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Points: {history.length}</span>
              <span className="font-mono text-slate-700">Latest: {history.length > 0 ? `${history[history.length - 1].temperature.toFixed(1)}°C` : '--'}</span>
            </div>
          </div>
        )}

        {/* HUMIDITY CHART */}
        {(activeTab === 'all' || activeTab === 'humidity') && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Relative Humidity (%)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Max: 50% RH
              </span>
            </div>

            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="timeStr"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#60a5fa' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}
                    formatter={(value: any) => [`${typeof value === 'number' ? value.toFixed(1) : value} %`, 'Humidity']}
                  />
                  {/* Reference Line for Max Humidity */}
                  <ReferenceLine
                    y={thresholds.humidityMax}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: '50% Max', position: 'insideTopLeft', fill: '#dc2626', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#2563eb', strokeWidth: 1, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Points: {history.length}</span>
              <span className="font-mono text-slate-700">Latest: {history.length > 0 ? `${history[history.length - 1].humidity.toFixed(1)}%` : '--'}</span>
            </div>
          </div>
        )}

        {/* DISTANCE CHART */}
        {(activeTab === 'all' || activeTab === 'distance') && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ultrasonic Distance (cm)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                Trigger: 15 cm
              </span>
            </div>

            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="timeStr"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax + 5), 30)]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    unit="cm"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#38bdf8' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}
                    formatter={(value: any) => [`${typeof value === 'number' ? value.toFixed(1) : value} cm`, 'Distance']}
                  />
                  {/* Reference Line for Lid Trigger */}
                  <ReferenceLine
                    y={thresholds.lidThresholdCm}
                    stroke="#ea580c"
                    strokeDasharray="4 4"
                    label={{ value: '15 cm Lid Trigger', position: 'insideTopLeft', fill: '#ea580c', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0284c7', strokeWidth: 1, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#0369a1', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Points: {history.length}</span>
              <span className="font-mono text-slate-700">Latest: {history.length > 0 ? `${history[history.length - 1].distance.toFixed(1)} cm` : '--'}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
