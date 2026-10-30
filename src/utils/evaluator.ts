import type { TelemetryData, IntegrityEvaluation, LidState, ThresholdConfig } from '../types';
import { DEFAULT_THRESHOLDS } from '../types';

export function evaluateIntegrity(
  data: TelemetryData | null,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): IntegrityEvaluation {
  if (!data) {
    return {
      overall: 'UNKNOWN',
      isSafe: false,
      tempBad: false,
      tempReason: 'INVALID',
      humBad: false,
      humReason: 'INVALID',
      lidState: 'ERROR',
      lidBad: true,
      distanceValid: false,
      violations: ['No telemetry data received yet.'],
    };
  }

  const violations: string[] = [];

  // 1. Temperature Evaluation (2.0°C - 8.0°C)
  let tempBad = false;
  let tempReason: 'TOO_LOW' | 'TOO_HIGH' | 'INVALID' | 'OK' = 'OK';
  if (data.temperature === undefined || data.temperature === null || isNaN(data.temperature)) {
    tempBad = true;
    tempReason = 'INVALID';
    violations.push('Temperature sensor reading is invalid or NaN.');
  } else if (data.temperature < thresholds.tempMin) {
    tempBad = true;
    tempReason = 'TOO_LOW';
    violations.push(`Temperature ${data.temperature.toFixed(1)}°C is below critical minimum (${thresholds.tempMin}°C). Risk of freezing.`);
  } else if (data.temperature > thresholds.tempMax) {
    tempBad = true;
    tempReason = 'TOO_HIGH';
    violations.push(`Temperature ${data.temperature.toFixed(1)}°C exceeds critical maximum (${thresholds.tempMax}°C). Cold chain breached.`);
  }

  // 2. Humidity Evaluation (<= 50%)
  let humBad = false;
  let humReason: 'TOO_HIGH' | 'INVALID' | 'OK' = 'OK';
  if (data.humidity === undefined || data.humidity === null || isNaN(data.humidity)) {
    humBad = true;
    humReason = 'INVALID';
    violations.push('Humidity sensor reading is invalid or NaN.');
  } else if (data.humidity > thresholds.humidityMax) {
    humBad = true;
    humReason = 'TOO_HIGH';
    violations.push(`Relative humidity ${data.humidity.toFixed(1)}% exceeds threshold limit (${thresholds.humidityMax}%). Condensation hazard.`);
  }

  // 3. Ultrasonic Distance & Lid State
  // Valid distance is >= 0 and not NaN
  const distanceValid = data.distance !== undefined && data.distance !== null && !isNaN(data.distance) && data.distance >= 0;

  let lidState: LidState = 'ERROR';
  if (!distanceValid) {
    lidState = 'ERROR';
    violations.push('Ultrasonic distance sensor returned invalid measurement (echo timeout or disconnected).');
  } else if (data.distance <= thresholds.lidThresholdCm) {
    lidState = 'CLOSED';
  } else {
    lidState = 'OPEN';
    violations.push(`Container lid is OPEN (measured distance ${data.distance.toFixed(1)} cm exceeds ${thresholds.lidThresholdCm} cm threshold).`);
  }

  // Check if payload specified lid state explicitly when distance isn't available or confirms it
  if (data.lid === 'open' && lidState !== 'OPEN') {
    lidState = 'OPEN';
  } else if (data.lid === 'error' && lidState !== 'ERROR') {
    lidState = 'ERROR';
  }

  const lidBad = (lidState === 'OPEN' || lidState === 'ERROR');

  // Overall is COMPROMISED if any threshold breached or invalid sensor
  const isCompromised = tempBad || humBad || lidBad || !distanceValid;

  return {
    overall: isCompromised ? 'COMPROMISED' : 'SAFE',
    isSafe: !isCompromised,
    tempBad,
    tempReason,
    humBad,
    humReason,
    lidState,
    lidBad,
    distanceValid,
    violations,
  };
}

export function formatTimestamp(ts: number | null | undefined): string {
  if (!ts) return 'Never';
  const millis = ts < 1e11 ? ts * 1000 : ts;
  const date = new Date(millis);
  if (isNaN(date.getTime())) return 'Invalid timestamp';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatFullDateTime(ts: number | null | undefined): string {
  if (!ts) return 'Never';
  const millis = ts < 1e11 ? ts * 1000 : ts;
  const date = new Date(millis);
  if (isNaN(date.getTime())) return 'Invalid timestamp';
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getRelativeTime(ts: number | null | undefined): string {
  if (!ts) return 'Unknown';
  const millis = ts < 1e11 ? ts * 1000 : ts;
  const diffSec = Math.floor((Date.now() - millis) / 1000);

  if (diffSec < 0) return 'Just now';
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
