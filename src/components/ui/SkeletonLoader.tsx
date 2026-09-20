import React from 'react';
import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 backdrop-blur-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-full mb-2"></div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ cols?: number; rows?: number }> = ({ cols = 6, rows = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 animate-pulse">
      <div className="flex gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3.5 border-b border-slate-100 dark:border-slate-800/40">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const ErrorBanner: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Telemetry Connection Error', message, onRetry }) => {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-800 dark:text-rose-200 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300/90">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-medium text-white transition shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-1.5 text-xs font-medium transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
