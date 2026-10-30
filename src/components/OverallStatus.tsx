import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Thermometer,
  Droplets,
  Box,
  Radio,
  Volume2,
} from 'lucide-react';
import type { IntegrityEvaluation, TelemetryData, ThresholdConfig } from '../types';

interface OverallStatusProps {
  evaluation: IntegrityEvaluation;
  telemetry: TelemetryData | null;
  thresholds: ThresholdConfig;
}

export const OverallStatus: React.FC<OverallStatusProps> = ({
  evaluation,
  telemetry,
  thresholds,
}) => {
  const isSafe = evaluation.overall === 'SAFE';
  const isUnknown = evaluation.overall === 'UNKNOWN';

  return (
    <section className="mb-6">
      {/* Main Status Hero Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-md ${
          isUnknown
            ? 'bg-slate-900 text-white border-slate-700'
            : isSafe
            ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-500 shadow-emerald-900/10'
            : 'bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 text-white border-rose-600 shadow-rose-900/20'
        }`}
      >
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Left Status Badge and Overview */}
            <div className="flex items-start sm:items-center gap-5">
              <div
                className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-inner shrink-0 ${
                  isUnknown
                    ? 'bg-slate-800 text-slate-400'
                    : isSafe
                    ? 'bg-emerald-500/30 text-emerald-100 ring-4 ring-emerald-400/30'
                    : 'bg-rose-500/30 text-rose-100 ring-4 ring-rose-400/40 animate-pulse'
                }`}
              >
                {isUnknown ? (
                  <Radio className="w-10 h-10 animate-pulse" />
                ) : isSafe ? (
                  <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12" />
                ) : (
                  <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-black/20 text-white/90">
                    Prototype Integrity State
                  </span>
                  {!isSafe && !isUnknown && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-rose-800 shadow-xs">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" /> Buzzer Active (GPIO 19)
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans">
                  {isUnknown
                    ? 'AWAITING TELEMETRY'
                    : isSafe
                    ? 'COLD-CHAIN INTEGRITY: SAFE'
                    : 'COLD-CHAIN INTEGRITY: COMPROMISED'}
                </h2>

                <p className="mt-1 text-sm sm:text-base text-white/90 max-w-2xl font-normal leading-relaxed">
                  {isUnknown
                    ? 'Waiting for the ESP32 microcontroller to broadcast the latest sensor telemetry payload to Firebase Realtime Database.'
                    : isSafe
                    ? 'All monitored environmental parameters (temperature, relative humidity, ultrasonic lid seal) satisfy safe transit criteria.'
                    : 'One or more transportation parameters have breached configured safety thresholds. Immediate inspection recommended.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics Summary pill on the right */}
            {telemetry && (
              <div className="shrink-0 flex items-center gap-2 sm:gap-3 bg-black/25 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
                <div className="text-center px-2">
                  <span className="block text-[11px] text-white/70 uppercase tracking-wider">Temp</span>
                  <span className="text-lg font-bold font-mono">{telemetry.temperature.toFixed(1)}°C</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center px-2">
                  <span className="block text-[11px] text-white/70 uppercase tracking-wider">Humidity</span>
                  <span className="text-lg font-bold font-mono">{telemetry.humidity.toFixed(0)}%</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center px-2">
                  <span className="block text-[11px] text-white/70 uppercase tracking-wider">Distance</span>
                  <span className="text-lg font-bold font-mono">
                    {telemetry.distance >= 0 ? `${telemetry.distance.toFixed(1)}cm` : 'ERR'}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center px-2">
                  <span className="block text-[11px] text-white/70 uppercase tracking-wider">Lid</span>
                  <span className={`text-base font-bold uppercase ${evaluation.lidState === 'CLOSED' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {evaluation.lidState}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Condition Evaluation Matrix Grid */}
          <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Condition 1: Temperature */}
            <div className={`p-3 rounded-xl backdrop-blur-xs flex items-center justify-between transition-colors ${
              !evaluation.tempBad ? 'bg-black/20 border border-white/10' : 'bg-rose-950/60 border border-rose-300/40'
            }`}>
              <div className="flex items-center gap-2.5">
                <Thermometer className="w-4 h-4 text-white/80" />
                <div>
                  <div className="text-xs font-semibold text-white/80">Temperature Target</div>
                  <div className="text-xs text-white/90 font-mono">
                    {thresholds.tempMin}°C – {thresholds.tempMax}°C
                  </div>
                </div>
              </div>
              <div>
                {!evaluation.tempBad ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-200 bg-rose-900/60 px-2 py-0.5 rounded animate-pulse">
                    <XCircle className="w-3.5 h-3.5" /> Breach
                  </span>
                )}
              </div>
            </div>

            {/* Condition 2: Humidity */}
            <div className={`p-3 rounded-xl backdrop-blur-xs flex items-center justify-between transition-colors ${
              !evaluation.humBad ? 'bg-black/20 border border-white/10' : 'bg-rose-950/60 border border-rose-300/40'
            }`}>
              <div className="flex items-center gap-2.5">
                <Droplets className="w-4 h-4 text-white/80" />
                <div>
                  <div className="text-xs font-semibold text-white/80">Humidity Limit</div>
                  <div className="text-xs text-white/90 font-mono">
                    ≤ {thresholds.humidityMax}% RH
                  </div>
                </div>
              </div>
              <div>
                {!evaluation.humBad ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-200 bg-rose-900/60 px-2 py-0.5 rounded animate-pulse">
                    <XCircle className="w-3.5 h-3.5" /> Breach
                  </span>
                )}
              </div>
            </div>

            {/* Condition 3: Lid Sealed */}
            <div className={`p-3 rounded-xl backdrop-blur-xs flex items-center justify-between transition-colors ${
              evaluation.lidState === 'CLOSED' ? 'bg-black/20 border border-white/10' : 'bg-rose-950/60 border border-rose-300/40'
            }`}>
              <div className="flex items-center gap-2.5">
                <Box className="w-4 h-4 text-white/80" />
                <div>
                  <div className="text-xs font-semibold text-white/80">Lid Seal Status</div>
                  <div className="text-xs text-white/90 font-mono">
                    ≤ {thresholds.lidThresholdCm} cm (Closed)
                  </div>
                </div>
              </div>
              <div>
                {evaluation.lidState === 'CLOSED' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sealed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded animate-pulse">
                    <XCircle className="w-3.5 h-3.5" /> {evaluation.lidState}
                  </span>
                )}
              </div>
            </div>

            {/* Condition 4: Sensor Hardware Reliability */}
            <div className={`p-3 rounded-xl backdrop-blur-xs flex items-center justify-between transition-colors ${
              evaluation.distanceValid && !evaluation.tempBad && evaluation.tempReason !== 'INVALID'
                ? 'bg-black/20 border border-white/10'
                : 'bg-rose-950/60 border border-rose-300/40'
            }`}>
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-white/80" />
                <div>
                  <div className="text-xs font-semibold text-white/80">Sensor Telemetry</div>
                  <div className="text-xs text-white/90 font-mono">
                    DHT11 &amp; Ultrasonic
                  </div>
                </div>
              </div>
              <div>
                {evaluation.distanceValid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-200 bg-rose-900/60 px-2 py-0.5 rounded animate-pulse">
                    <XCircle className="w-3.5 h-3.5" /> Fault
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Active Violations list if any */}
          {evaluation.violations.length > 0 && !isUnknown && (
            <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/20 text-xs">
              <div className="font-semibold text-amber-200 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                Active Integrity Violations ({evaluation.violations.length}):
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-white/90 pl-1">
                {evaluation.violations.map((v, idx) => (
                  <li key={idx} className="font-mono text-[11px] leading-tight">
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="mt-2.5 px-4 py-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="font-semibold text-amber-950">Prototype Research Notice: </strong>
          This system provides prototype research classification based on demonstration thresholds (2°C–8°C, ≤50% RH, ≤15 cm lid distance) and must not be interpreted as a certified or clinically validated medical-product safety assessment. Vaccine and pharmaceutical handling must always comply with WHO, CDC, and national regulatory cold-chain standards.
        </div>
      </div>
    </section>
  );
};
