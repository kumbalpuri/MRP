import React, { useState } from 'react';
import {
  Lock,
  X,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Building,
  Layers,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { RMReservationItem, BOMItem, InventoryItem, DemandItem } from '../../types';
import {
  getCurrentWeekNumber,
  isReservationActiveAsOnDate,
  formatAsOnDateDisplay,
  getMondayToSaturdayWeeks
} from '../../utils/dateCalendarUtils';

interface ReservationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: RMReservationItem[];
  boms: BOMItem[];
  inventory: InventoryItem[];
  demands: DemandItem[];
  asOnDate: string;
  onAddReservation: (res: RMReservationItem) => void;
  onDeleteReservation: (id: string) => void;
  initialMaterialCode?: string;
  initialFGCode?: string;
}

export const ReservationManagerModal: React.FC<ReservationManagerModalProps> = ({
  isOpen,
  onClose,
  reservations,
  boms,
  inventory,
  demands,
  asOnDate,
  onAddReservation,
  onDeleteReservation,
  initialMaterialCode,
  initialFGCode
}) => {
  const currentWeek = getCurrentWeekNumber(asOnDate);
  const weeksList = getMondayToSaturdayWeeks(asOnDate);

  // Extract unique materials & unique FGs
  const materialList = Array.from(
    new Set([
      ...boms.map((b) => b.componentCode),
      ...inventory.map((i) => i.materialNumber)
    ])
  ).map((code) => {
    const bom = boms.find((b) => b.componentCode === code);
    const inv = inventory.find((i) => i.materialNumber === code);
    return {
      code,
      description: bom?.componentDescription || inv?.materialDescription || code,
      uom: bom?.uom || inv?.bun || 'KG',
      stock: inv?.unrestricted || 0
    };
  });

  const fgList = Array.from(
    new Set([
      ...demands.map((d) => d.fgCode),
      ...boms.map((b) => b.fgCode)
    ])
  ).map((fgCode) => {
    const dem = demands.find((d) => d.fgCode === fgCode);
    const bom = boms.find((b) => b.fgCode === fgCode);
    return {
      fgCode,
      description: dem?.fgDescription || bom?.fgDescription || fgCode,
      customer: dem?.customerName
    };
  });

  const [selectedMat, setSelectedMat] = useState<string>(
    initialMaterialCode || materialList[0]?.code || 'RM-502'
  );
  const [selectedFG, setSelectedFG] = useState<string>(
    initialFGCode || fgList[0]?.fgCode || 'FG-1002'
  );
  const [reservedQty, setReservedQty] = useState<number>(1000);
  const [week, setWeek] = useState<1 | 2 | 3 | 4>(currentWeek);
  const [reason, setReason] = useState<string>('Firm Institutional Order Batch Allocation');
  const [customerName, setCustomerName] = useState<string>('Reliance Retail');

  if (!isOpen) return null;

  const currentMatMeta = materialList.find((m) => m.code === selectedMat);
  const currentFGMeta = fgList.find((f) => f.fgCode === selectedFG);

  const selectedWeekInfo = weeksList.find((w) => w.week === week) || weeksList[0];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMat || !selectedFG || reservedQty <= 0) return;

    const newRes: RMReservationItem = {
      id: `res-${Date.now()}`,
      componentCode: selectedMat,
      componentDescription: currentMatMeta?.description || selectedMat,
      reservedForFGCode: selectedFG,
      reservedForFGDescription: currentFGMeta?.description || selectedFG,
      customerName: customerName || currentFGMeta?.customer || 'Strategic Allocation',
      reservedQty: Number(reservedQty),
      uom: currentMatMeta?.uom || 'KG',
      week,
      validFromDate: selectedWeekInfo.startDate,
      validToDate: selectedWeekInfo.endDate,
      reason,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    onAddReservation(newRes);
    setReservedQty(1000);
    setReason('Batch Run Specific Allocation');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                RMPM Material Reservation & Allocation Ledger
              </h2>
              <p className="text-xs text-slate-300">
                Lock common raw & packing material for specific Finished Goods to calculate effective requirement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* As on Date Rule Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>As on Date: {formatAsOnDateDisplay(asOnDate)} (Current: Week {currentWeek})</strong> — 
              Weeks strictly run Monday to Saturday. Reservations in past weeks (W1/W2) are automatically expired and ignored.
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* New Reservation Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Plus className="w-4 h-4 text-blue-700 font-bold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Create New Material Reservation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Component Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Shared Material (RM/PM)
                </label>
                <select
                  value={selectedMat}
                  onChange={(e) => setSelectedMat(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {materialList.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.code} - {m.description} ({m.uom})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Available Stock: <strong>{currentMatMeta?.stock.toLocaleString()} {currentMatMeta?.uom}</strong>
                </div>
              </div>

              {/* Finished Good Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reserve For Finished Good (FG)
                </label>
                <select
                  value={selectedFG}
                  onChange={(e) => setSelectedFG(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {fgList.map((f) => (
                    <option key={f.fgCode} value={f.fgCode}>
                      {f.fgCode} - {f.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reserved Quantity */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Quantity to Reserve ({currentMatMeta?.uom || 'KG'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={reservedQty}
                  onChange={(e) => setReservedQty(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Planning Week */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Planning Week (Mon–Sat)
                </label>
                <select
                  value={week}
                  onChange={(e) => setWeek(Number(e.target.value) as 1 | 2 | 3 | 4)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {weeksList.map((w) => (
                    <option key={w.week} value={w.week}>
                      Week {w.week} ({w.startDate} to {w.endDate}) {w.week < currentWeek ? '⚠️ Past' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer / Buyer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Reliance Fresh, Walmart, Amazon"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reservation Reason / Order Reference
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Firm Export Batch Allocation Line 2A"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Save Material Reservation</span>
              </button>
            </div>
          </form>

          {/* Active Reservations Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Existing Material Reservations ({reservations.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Active reservations directly reduce effective available stock for other FGs
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Material Code</th>
                    <th className="py-2.5 px-3">Reserved For FG</th>
                    <th className="py-2.5 px-3 text-right">Reserved Qty</th>
                    <th className="py-2.5 px-3 text-center">Week (Mon–Sat)</th>
                    <th className="py-2.5 px-3">Customer & Reason</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No material reservations found.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((res) => {
                      const isActive = isReservationActiveAsOnDate(res, asOnDate);
                      const isPastWeek = res.week < currentWeek;

                      return (
                        <tr
                          key={res.id}
                          className={`hover:bg-slate-50 transition ${
                            !isActive ? 'bg-slate-50/50 opacity-60' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-blue-700">
                              {res.componentCode}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {res.componentDescription || ''}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">
                              {res.reservedForFGCode}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              {res.reservedForFGDescription}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/40">
                            {res.reservedQty.toLocaleString()} {res.uom}
                          </td>

                          <td className="py-2.5 px-3 text-center font-mono">
                            <span className="font-bold text-slate-800">Week {res.week}</span>
                            <div className="text-[10px] text-slate-500">
                              {res.validFromDate} to {res.validToDate}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-800">
                              {res.customerName || 'General Export'}
                            </div>
                            <div className="text-[11px] text-slate-500 italic">
                              "{res.reason}"
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                <CheckCircle className="w-3 h-3" />
                                Active (Deducted)
                              </span>
                            ) : isPastWeek ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full border border-slate-300" title="Past week reservation - excluded per Mon-Sat rule">
                                <Clock className="w-3 h-3" />
                                Expired (Past W{res.week})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {res.status}
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onDeleteReservation(res.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Release / Delete Reservation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total Active Deductions: <strong className="text-slate-800 font-mono">
              {reservations.filter((r) => isReservationActiveAsOnDate(r, asOnDate)).length} active allocations
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
