export interface TelemetryData {
  temperature: number;
  humidity: number;
  distance: number;
  lid: string;
  timestamp: number;
}

export interface HistoryPoint {
  id: string;
  timestamp: number;
  timeStr: string;
  temperature: number;
  humidity: number;
  distance: number;
  lid: string;
  isSafe: boolean;
}

export type LidState = 'OPEN' | 'CLOSED' | 'ERROR';

export interface IntegrityEvaluation {
  overall: 'SAFE' | 'COMPROMISED' | 'UNKNOWN';
  isSafe: boolean;
  tempBad: boolean;
  tempReason: 'TOO_LOW' | 'TOO_HIGH' | 'INVALID' | 'OK';
  humBad: boolean;
  humReason: 'TOO_HIGH' | 'INVALID' | 'OK';
  lidState: LidState;
  lidBad: boolean;
  distanceValid: boolean;
  violations: string[];
}

export interface SystemAlert {
  id: string;
  type: 'TEMP_HIGH' | 'TEMP_LOW' | 'HUMIDITY_HIGH' | 'LID_OPEN' | 'SENSOR_ERROR' | 'CONNECTION_LOST' | 'SYSTEM_NORMAL';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface ThresholdConfig {
  tempMin: number;
  tempMax: number;
  humidityMax: number;
  lidThresholdCm: number;
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  tempMin: 2.0,
  tempMax: 8.0,
  humidityMax: 50.0,
  lidThresholdCm: 15.0,
};
