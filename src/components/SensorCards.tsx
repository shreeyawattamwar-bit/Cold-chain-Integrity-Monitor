import React from 'react';
import {
  Thermometer,
  Droplets,
  Ruler,
  Box,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
} from 'lucide-react';
import type { TelemetryData, IntegrityEvaluation, ThresholdConfig } from '../types';

interface SensorCardsProps {
  telemetry: TelemetryData | null;
  evaluation: IntegrityEvaluation;
  thresholds: ThresholdConfig;
}

export const SensorCards: React.FC<SensorCardsProps> = ({
  telemetry,
  evaluation,
  thresholds,
}) => {
  const temp = telemetry ? telemetry.temperature : null;
  const hum = telemetry ? telemetry.humidity : null;
  const dist = telemetry ? telemetry.distance : null;

  // Temperature range visual percentage (clamp between 0 and 100 for display, spanning -5°C to 45°C)
  const tempRangeDisplay = temp !== null ? Math.min(Math.max(((temp - (-5)) / (45 - (-5))) * 100, 0), 100) : 50;

  // Humidity percentage (0-100)
  const humDisplay = hum !== null ? Math.min(Math.max(hum, 0), 100) : 0;

  // Distance clamp for progress visual (0 to 100 cm)
  const distDisplay = dist !== null && dist >= 0 ? Math.min(Math.max((dist / 60) * 100, 0), 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* CARD 1: TEMPERATURE MONITORING */}
      <div className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
        evaluation.tempBad
          ? 'border-rose-300 ring-2 ring-rose-100'
          : 'border-slate-200 hover:border-teal-300'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              evaluation.tempBad ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-700'
            }`}>
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Temperature
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">DHT11 (GPIO 4)</span>
            </div>
          </div>

          {/* Status Badge */}
          {temp === null ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              Waiting...
            </span>
          ) : !evaluation.tempBad ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Safe Range
            </span>
          ) : evaluation.tempReason === 'TOO_HIGH' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <TrendingUp className="w-3 h-3 text-rose-600" /> High Temp
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <TrendingDown className="w-3 h-3 text-rose-600" /> Low Temp
            </span>
          )}
        </div>

        {/* Primary Reading */}
        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
              {temp !== null ? temp.toFixed(1) : '--.-'}
            </span>
            <span className="text-lg font-semibold text-slate-500">°C</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Safe Window: <span className="font-semibold text-slate-700 font-mono">{thresholds.tempMin}°C – {thresholds.tempMax}°C</span>
          </p>
        </div>

        {/* Visual Target Range Bar */}
        <div className="mt-3">
          <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            {/* Safe zone highlight bar from 2C to 8C */}
            <div
              className="absolute h-full bg-emerald-200"
              style={{
                left: `${((thresholds.tempMin - (-5)) / 50) * 100}%`,
                width: `${((thresholds.tempMax - thresholds.tempMin) / 50) * 100}%`,
              }}
              title="Safe Window: 2.0°C to 8.0°C"
            />
            {/* Indicator Marker */}
            {temp !== null && (
              <div
                className={`absolute top-0 bottom-0 w-2 rounded-full -translate-x-1/2 transition-all duration-300 ${
                  evaluation.tempBad ? 'bg-rose-600 ring-2 ring-rose-300' : 'bg-emerald-600 ring-2 ring-emerald-300'
                }`}
                style={{ left: `${tempRangeDisplay}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>-5°C</span>
            <span className="text-emerald-700 font-bold">{thresholds.tempMin}°C Min</span>
            <span className="text-emerald-700 font-bold">{thresholds.tempMax}°C Max</span>
            <span>45°C</span>
          </div>
        </div>

        {/* Status Callout footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
          {temp === null ? (
            <span className="text-slate-400">Awaiting sensor data...</span>
          ) : !evaluation.tempBad ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              ✓ Optimal cold-chain temperature maintained.
            </span>
          ) : (
            <span className="text-rose-700 font-medium flex items-center gap-1">
              ⚠ Critical! {temp > thresholds.tempMax ? 'Thermal degradation risk' : 'Freezing risk'}
            </span>
          )}
        </div>
      </div>

      {/* CARD 2: HUMIDITY MONITORING */}
      <div className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
        evaluation.humBad
          ? 'border-rose-300 ring-2 ring-rose-100'
          : 'border-slate-200 hover:border-blue-300'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              evaluation.humBad ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'
            }`}>
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Humidity
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">DHT11 (GPIO 4)</span>
            </div>
          </div>

          {/* Status Badge */}
          {hum === null ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              Waiting...
            </span>
          ) : !evaluation.humBad ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Optimal
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> High Humidity
            </span>
          )}
        </div>

        {/* Primary Reading */}
        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
              {hum !== null ? hum.toFixed(1) : '--.-'}
            </span>
            <span className="text-lg font-semibold text-slate-500">% RH</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Threshold Limit: <span className="font-semibold text-slate-700 font-mono">≤ {thresholds.humidityMax}% RH</span>
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                evaluation.humBad ? 'bg-rose-500' : 'bg-blue-500'
              }`}
              style={{ width: `${humDisplay}%` }}
            />
            {/* 50% Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
              style={{ left: `${thresholds.humidityMax}%` }}
              title="50% Threshold"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0%</span>
            <span className="text-rose-600 font-bold">50% Max</span>
            <span>100%</span>
          </div>
        </div>

        {/* Status Callout footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
          {hum === null ? (
            <span className="text-slate-400">Awaiting sensor data...</span>
          ) : !evaluation.humBad ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              ✓ Moisture level safely below condensation limit.
            </span>
          ) : (
            <span className="text-rose-700 font-medium flex items-center gap-1">
              ⚠ Exceeds {thresholds.humidityMax}%. Moisture/packaging risk.
            </span>
          )}
        </div>
      </div>

      {/* CARD 3: DISTANCE MONITORING */}
      <div className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
        !evaluation.distanceValid
          ? 'border-rose-300 ring-2 ring-rose-100'
          : 'border-slate-200 hover:border-cyan-300'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              !evaluation.distanceValid ? 'bg-rose-100 text-rose-700' : 'bg-cyan-50 text-cyan-700'
            }`}>
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ultrasonic Distance
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">TRIG 5 | ECHO 18</span>
            </div>
          </div>

          {/* Status Badge */}
          {dist === null ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              Waiting...
            </span>
          ) : evaluation.distanceValid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid Echo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <XCircle className="w-3 h-3 text-rose-600" /> Sensor Fault
            </span>
          )}
        </div>

        {/* Primary Reading */}
        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
              {dist !== null && dist >= 0 ? dist.toFixed(1) : 'ERROR'}
            </span>
            <span className="text-lg font-semibold text-slate-500">
              {dist !== null && dist >= 0 ? 'cm' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lid Threshold: <span className="font-semibold text-slate-700 font-mono">≤ {thresholds.lidThresholdCm} cm = Closed</span>
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                !evaluation.distanceValid
                  ? 'bg-rose-500'
                  : dist !== null && dist <= thresholds.lidThresholdCm
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${distDisplay}%` }}
            />
            {/* 15 cm threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
              style={{ left: `${(thresholds.lidThresholdCm / 60) * 100}%` }}
              title="15 cm Lid Trigger Line"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0 cm</span>
            <span className="text-slate-700 font-bold">15 cm (Trigger)</span>
            <span>60+ cm</span>
          </div>
        </div>

        {/* Status Callout footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
          {dist === null ? (
            <span className="text-slate-400">Awaiting sensor data...</span>
          ) : !evaluation.distanceValid ? (
            <span className="text-rose-700 font-medium flex items-center gap-1">
              ⚠ Echo timeout (-1). Check HC-SR04 / sensor wiring.
            </span>
          ) : dist <= thresholds.lidThresholdCm ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              ✓ Proximity indicates lid firmly seated ({dist.toFixed(1)} cm).
            </span>
          ) : (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              ⚠ Measured distance {dist.toFixed(1)} cm exceeds lid boundary.
            </span>
          )}
        </div>
      </div>

      {/* CARD 4: LID STATUS */}
      <div className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
        evaluation.lidBad
          ? 'border-amber-300 ring-2 ring-amber-100'
          : 'border-slate-200 hover:border-emerald-300'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              evaluation.lidState === 'CLOSED'
                ? 'bg-emerald-50 text-emerald-700'
                : evaluation.lidState === 'OPEN'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-rose-50 text-rose-700'
            }`}>
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lid Closure State
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Container Seal</span>
            </div>
          </div>

          {/* Status Badge */}
          {telemetry === null ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              Waiting...
            </span>
          ) : evaluation.lidState === 'CLOSED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" /> Sealed
            </span>
          ) : evaluation.lidState === 'OPEN' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <Unlock className="w-3 h-3 text-amber-600" /> Open Lid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <HelpCircle className="w-3 h-3 text-rose-600" /> Error
            </span>
          )}
        </div>

        {/* Primary State Display */}
        <div className="my-2">
          <div className="flex items-center gap-2">
            <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-sans ${
              evaluation.lidState === 'CLOSED'
                ? 'text-emerald-700'
                : evaluation.lidState === 'OPEN'
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {evaluation.lidState}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Classification rule: <span className="font-semibold text-slate-700">&gt; 15 cm = OPEN, ≤ 15 cm = CLOSED</span>
          </p>
        </div>

        {/* Graphic Representation */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600">Local Alarm Trigger:</span>
          <span className={`font-semibold font-mono px-2 py-0.5 rounded ${
            evaluation.lidBad ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
          }`}>
            {evaluation.lidBad ? 'BUZZER HIGH' : 'BUZZER LOW'}
          </span>
        </div>

        {/* Status Callout footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
          {telemetry === null ? (
            <span className="text-slate-400">Awaiting sensor data...</span>
          ) : evaluation.lidState === 'CLOSED' ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              ✓ Container lid securely sealed. Thermal insulation maintained.
            </span>
          ) : evaluation.lidState === 'OPEN' ? (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              ⚠ Container opened! Thermal leakage in progress.
            </span>
          ) : (
            <span className="text-rose-700 font-medium flex items-center gap-1">
              ⚠ Ultrasonic sensor returned error. Cannot confirm seal.
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
