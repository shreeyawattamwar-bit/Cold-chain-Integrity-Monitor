import React from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import type { SystemAlert } from '../types';
import { formatTimestamp } from '../utils/evaluator';

interface AlertSectionProps {
  alerts: SystemAlert[];
  latestAlert: SystemAlert | null;
  onClearAlerts: () => void;
}

export const AlertSection: React.FC<AlertSectionProps> = ({
  alerts,
  latestAlert,
  onClearAlerts,
}) => {
  const getSeverityIcon = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const getSeverityBadge = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              Alerts &amp; Incident Log
            </h3>
            <p className="text-xs text-slate-500">
              Real-time violation events detected during monitoring
            </p>
          </div>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={onClearAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Latest Alert Banner */}
      {latestAlert ? (
        <div className={`mb-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          latestAlert.severity === 'critical'
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : latestAlert.severity === 'warning'
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-blue-50/70 border-blue-200 text-blue-950'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2 rounded-lg ${getSeverityBadge(latestAlert.severity)}`}>
              {getSeverityIcon(latestAlert.severity)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide">
                  Latest Active Alert
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${getSeverityBadge(latestAlert.severity)}`}>
                  {latestAlert.severity}
                </span>
              </div>
              <h4 className="text-sm font-semibold mt-0.5">{latestAlert.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{latestAlert.message}</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 text-xs font-mono opacity-80 pl-11 sm:pl-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimestamp(latestAlert.timestamp)}</span>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold">No Active Critical Violations.</span> System is operating within normal environmental limits.
          </div>
        </div>
      )}

      {/* Alert Log List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Session Incident History ({alerts.length})
        </h4>

        {alerts.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            No incident events recorded yet.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="pt-2 first:pt-0 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5">{getSeverityIcon(alert.severity)}</span>
                  <div>
                    <span className="font-semibold text-slate-900">{alert.title}</span>
                    <p className="text-slate-600 mt-0.5 font-mono text-[11px]">{alert.message}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {formatTimestamp(alert.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
