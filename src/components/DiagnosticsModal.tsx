import React, { useState } from 'react';
import {
  X,
  Cpu,
  Database,
  Copy,
  Check,
  Server,
} from 'lucide-react';
import type { TelemetryData, ConnectionStatus } from '../types';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData | null;
  connectionStatus: ConnectionStatus;
  lastSyncTime: number | null;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  connectionStatus,
  lastSyncTime,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'payload' | 'hardware' | 'firebase'>('payload');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const dbUrl = 'https://coldchain-integrity-nonitor-default-rtdb.asia-southeast1.firebasedatabase.app';
  const putEndpoint = `${dbUrl}/coldchain/latest.json`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-sans">
                Hardware &amp; Firebase System Diagnostics
              </h2>
              <p className="text-xs text-slate-500">
                ESP32 pinouts, Realtime Database telemetry payload, and integration endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('payload')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'payload'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Live Payload</span>
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'hardware'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>ESP32 Pinout</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Firebase Config</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: LIVE PAYLOAD */}
          {activeTab === 'payload' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Current JSON payload stored at <code className="text-teal-700">/coldchain/latest</code>:
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(telemetry, null, 2), 'payload')}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-teal-700"
                >
                  {copied === 'payload' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'payload' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                <pre>{telemetry ? JSON.stringify(telemetry, null, 2) : '// No payload received yet'}</pre>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Connection</div>
                  <div className="font-semibold capitalize text-slate-800">{connectionStatus}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Timestamp Type</div>
                  <div className="font-semibold text-slate-800 font-mono">Server ms epoch</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Lid String</div>
                  <div className="font-semibold font-mono text-slate-800">{telemetry?.lid ?? 'N/A'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Last Sync</div>
                  <div className="font-semibold font-mono text-slate-800">
                    {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE PINOUT */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800">
                ESP32 Microcontroller GPIO Mapping
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Component</th>
                      <th className="py-2.5 px-4">Pin / Signal</th>
                      <th className="py-2.5 px-4">ESP32 GPIO</th>
                      <th className="py-2.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">DHT11 Sensor</td>
                      <td className="py-2.5 px-4 font-mono">DATA</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-teal-700">GPIO 4</td>
                      <td className="py-2.5 px-4 text-slate-600">Reads temperature (°C) &amp; humidity (%)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">Ultrasonic Sensor (HC-SR04)</td>
                      <td className="py-2.5 px-4 font-mono">TRIG</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-teal-700">GPIO 5</td>
                      <td className="py-2.5 px-4 text-slate-600">10µs trigger pulse generator</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">Ultrasonic Sensor (HC-SR04)</td>
                      <td className="py-2.5 px-4 font-mono">ECHO</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-teal-700">GPIO 18</td>
                      <td className="py-2.5 px-4 text-amber-700 font-medium">Use voltage divider to step 5V echo down to 3.3V</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">Active Buzzer</td>
                      <td className="py-2.5 px-4 font-mono">I/O (+)</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-teal-700">GPIO 19</td>
                      <td className="py-2.5 px-4 text-slate-600">Driven HIGH when condition is COMPROMISED</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Important Hardware Protection: </span>
                Standard HC-SR04 ultrasonic sensor ECHO pin outputs a 5V signal. Connecting 5V directly to ESP32 GPIO 18 can damage the microcontroller over time. Use a simple 2-resistor voltage divider (e.g. 1kΩ and 2kΩ) or a logic level shifter to feed a safe 3.3V signal into GPIO 18.
              </div>
            </div>
          )}

          {/* TAB 3: FIREBASE CONFIG */}
          {activeTab === 'firebase' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Firebase Realtime Database Project Reference
                </h4>
                <p className="text-slate-600">
                  Target Firebase RTDB instance configured for this cold-chain monitor:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Firebase Project ID:</div>
                  <div className="font-mono font-bold text-slate-800 select-all">
                    coldchain-integrity-nonitor
                  </div>
                  <div className="text-[10px] text-teal-700 mt-0.5">
                    *Spelling verified: contains NONITOR, not MONITOR
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">ESP32 HTTP PUT Upload Endpoint:</span>
                    <button
                      onClick={() => handleCopy(putEndpoint, 'endpoint')}
                      className="text-teal-700 hover:underline flex items-center gap-1"
                    >
                      {copied === 'endpoint' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy URL</span>
                    </button>
                  </div>
                  <div className="font-mono font-bold text-slate-800 break-all mt-1 select-all">
                    {putEndpoint}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Recommended Security Rules:</div>
                  <pre className="mt-1 bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px]">
{`{
  "rules": {
    "coldchain": {
      "latest": {
        ".read": true,
        ".write": true
      }
    }
  }
}`}
                  </pre>
                  <p className="mt-1 text-[11px] text-slate-500">
                    If writing requires authentication in production, append an auth token query parameter or implement Firebase App Check.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Database Status: <span className="font-semibold text-emerald-700">Online &amp; Receiving</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
