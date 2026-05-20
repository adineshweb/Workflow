import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Table = ({
  columns,
  data = [],
  loading = false,
  pagination = null,
  onPageChange = null,
  emptyMessage = 'No records found',
}) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-500">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className="px-6 py-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 border-t border-slate-100">
            {loading ? (
              // Loading Skeleton state
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4.5">
                      <div className="h-4 rounded bg-slate-200 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center">
                  <div className="text-slate-400 font-medium">{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, rIdx) => (
                <tr
                  key={row._id || rIdx}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 text-slate-650 font-normal">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {pagination && pagination.pages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-transparent px-2 py-4 sm:px-3">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page === pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Showing page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
                <span className="font-semibold text-slate-800">{pagination.pages}</span> pages (
                <span className="font-medium">{pagination.total}</span> items total)
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm bg-white border border-slate-200"
                aria-label="Pagination"
              >
                <button
                  disabled={pagination.page === 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                  className="relative inline-flex items-center rounded-l-md px-2.5 py-1.5 text-slate-400 ring-1 ring-inset ring-transparent hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pagination.pages }).map((_, idx) => {
                  const pNum = idx + 1;
                  // Show pages around current page if there are too many (simple slice)
                  const isCurrent = pagination.page === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => onPageChange(pNum)}
                      className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold focus:z-20 ${
                        isCurrent
                          ? 'z-10 bg-brand-800 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
                          : 'text-slate-600 hover:bg-slate-50 focus:outline-offset-0'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => onPageChange(pagination.page + 1)}
                  className="relative inline-flex items-center rounded-r-md px-2.5 py-1.5 text-slate-400 ring-1 ring-inset ring-transparent hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
