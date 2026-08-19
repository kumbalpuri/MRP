import React, { useState, useRef, useEffect } from 'react';
import { Lock, ChevronDown, Calendar, AlertCircle, CheckCircle, Info, X, ExternalLink } from 'lucide-react';
import { RMReservationItem } from '../../types';
import { formatAsOnDateDisplay } from '../../utils/dateCalendarUtils';

interface OtherFGReservationDetail {
  fgCode: string;
  fgDescription: string;
  customerName?: string;
  reservedQty: number;
  week: 1 | 2 | 3 | 4;
  reason: string;
  validDateRange: string;
}

interface ReservationBreakdownDropdownProps {
  materialCode: string;
  materialDescription?: string;
  uom: string;
  currentFGCode?: string; // If rendered inside a specific FG context, this is the current FG
  reservedQty: number; // Total quantity reserved for other FGs
  reservations: OtherFGReservationDetail[] | RMReservationItem[];
  asOnDate?: string;
  onManageReservations?: () => void;
}

export const ReservationBreakdownDropdown: React.FC<ReservationBreakdownDropdownProps> = ({
  materialCode,
  materialDescription,
  uom,
  currentFGCode,
  reservedQty,
  reservations,
  asOnDate = '2026-08-19',
  onManageReservations
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (reservedQty <= 0 && (!reservations || reservations.length === 0)) {
    return (
      <span className="text-[11px] text-slate-400 font-mono">
        0 {uom}
      </span>
    );
  }

  // Normalize reservation items for display
  const items: OtherFGReservationDetail[] = reservations.map((r: any) => {
    if ('reservedForFGCode' in r) {
      return {
        fgCode: r.reservedForFGCode,
        fgDescription: r.reservedForFGDescription || r.reservedForFGCode,
        customerName: r.customerName,
        reservedQty: r.reservedQty,
        week: r.week,
        reason: r.reason,
        validDateRange: `${r.validFromDate} to ${r.validToDate}`
      };
    }
    return r;
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold font-mono transition cursor-pointer border ${
          reservedQty > 0
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
            : 'bg-slate-50 text-slate-500 border-slate-200'
        }`}
        title={`Click to view ${items.length} active reservation(s) for other Finished Goods`}
      >
        <Lock className="w-3 h-3 text-amber-700 shrink-0" />
        <span>{reservedQty.toLocaleString()} {uom}</span>
        <ChevronDown className={`w-3 h-3 text-amber-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu / Popover Panel */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 mt-1 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-300 py-2.5 px-3 text-left font-sans text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-amber-100 rounded text-amber-800">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 leading-tight">
                  Reserved for Other FGs
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {materialCode} • {materialDescription || ''}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subheader / As-on-date Rule Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded p-1.5 mb-2 text-[10px] text-amber-900 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>As on Date: {formatAsOnDateDisplay(asOnDate)}</strong>
              <p className="text-amber-800 leading-tight mt-0.5">
                Week strictly Mon–Sat. Only active reservations for current & future weeks are deducted. Expired past-week reservations are excluded.
              </p>
            </div>
          </div>

          {/* List of FGs locking this material */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="text-center py-3 text-slate-500 text-xs">
                No active reservations for other Finished Goods.
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.fgCode}-${item.week}-${idx}`}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded p-2 transition"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {item.fgCode}
                        </span>
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                          Week {item.week}
                        </span>
                      </div>
                      <div className="font-medium text-slate-800 text-[11px] mt-0.5 leading-tight">
                        {item.fgDescription}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-extrabold text-amber-900 text-xs bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                        {item.reservedQty.toLocaleString()} {uom}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 pt-1 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-1">
                    <span>
                      {item.customerName ? `Client: ${item.customerName}` : 'Export / Firm Order'}
                    </span>
                    <span className="font-mono text-slate-600">
                      📅 {item.validDateRange}
                    </span>
                  </div>
                  {item.reason && (
                    <div className="mt-1 text-[10px] text-slate-600 italic bg-white p-1 rounded border border-slate-200">
                      "{item.reason}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Total & Action */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-600">
              Total Reserved: <strong className="text-amber-900 font-mono">{reservedQty.toLocaleString()} {uom}</strong>
            </div>
            {onManageReservations && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onManageReservations();
                }}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Manage Allocations</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
