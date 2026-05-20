import React from 'react';
import clsx from 'clsx';

const StatusBadge = ({ status }) => {
  const getStyles = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Needs Clarification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Reopened':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide shadow-sm transition-all',
        getStyles(status)
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
