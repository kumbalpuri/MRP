import React, { useState, useRef } from 'react';
import {
  DailyRollingPlanRow,
  SystemAuditLogItem,
  UserRole
} from '../../types';
import {
  Calendar,
  Clock,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Check,
  Edit2,
  Lock,
  Unlock,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Info,
  ShieldAlert,
  Flame,
  X
} from 'lucide-react';

interface DailyRollingPlanManagerProps {
  dailyPlanRows: DailyRollingPlanRow[];
  onUpdateDailyPlanRows: (newRows: DailyRollingPlanRow[]) => void;
  onAddAuditLog: (log: Omit<SystemAuditLogItem, 'id' | 'timestamp'>) => void;
  currentRole: UserRole;
  asOnDate?: string;
}

export const DailyRollingPlanManager: React.FC<DailyRollingPlanManagerProps> = ({
  dailyPlanRows,
  onUpdateDailyPlanRows,
  onAddAuditLog,
  currentRole,
  asOnDate = '2026-08-19'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('ALL');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Authorized by Lead Planner: Afternoon in-transit ETA covers night shifts B & C.');

  // Editing cell modal
  const [editingRow, setEditingRow] = useState<DailyRollingPlanRow | null>(null);
  const [editingDay, setEditingDay] = useState<'day1' | 'day2' | 'day3'>('day1');
  const [editForm, setEditForm] = useState<{
    shiftAPlanned: number;
    shiftAStatus: 'RUNNING' | 'HALTED_SHORTAGE' | 'IE' | 'IDLE';
    shiftBPlanned: number;
    shiftBStatus: 'RUNNING' | 'HALTED_SHORTAGE' | 'IE' | 'IDLE';
    shiftCPlanned: number;
    shiftCStatus: 'RUNNING' | 'HALTED_SHORTAGE' | 'IE' | 'IDLE';
    materialRemarks: string;
  }>({
    shiftAPlanned: 0,
    shiftAStatus: 'IDLE',
    shiftBPlanned: 0,
    shiftBStatus: 'IDLE',
    shiftCPlanned: 0,
    shiftCStatus: 'IDLE',
    materialRemarks: ''
  });

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Group rows by line name to recreate the merged row grouping
  const uniqueLines = Array.from(new Set(dailyPlanRows.map((r) => r.lineName)));

  const filteredRows = dailyPlanRows.filter((r) => {
    if (selectedLineFilter !== 'ALL' && r.lineName !== selectedLineFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.lineName.toLowerCase().includes(term) ||
        r.productNumber.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term) ||
        r.materialStatusRemarks.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Calculate live summary metrics
  const totalPlannedQty = dailyPlanRows.reduce((acc, r) => acc + r.total3DayPlannedQty, 0);
  const criticalShortageRows = dailyPlanRows.filter((r) => !r.isFeasibleStockOnly);
  const feasibleWithETARows = dailyPlanRows.filter((r) => r.isFeasibleWithETA);

  // Open Cell Edit
  const handleOpenEdit = (row: DailyRollingPlanRow, dayKey: 'day1' | 'day2' | 'day3') => {
    const dayData = row[dayKey];
    setEditingRow(row);
    setEditingDay(dayKey);
    setEditForm({
      shiftAPlanned: dayData.shiftA.plannedQty,
      shiftAStatus: dayData.shiftA.status as any,
      shiftBPlanned: dayData.shiftB.plannedQty,
      shiftBStatus: dayData.shiftB.status as any,
      shiftCPlanned: dayData.shiftC.plannedQty,
      shiftCStatus: dayData.shiftC.status as any,
      materialRemarks: row.materialStatusRemarks
    });
  };

  // Save Cell Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const updated = dailyPlanRows.map((r) => {
      if (r.id === editingRow.id) {
        const updatedDay = {
          ...r[editingDay],
          shiftA: { ...r[editingDay].shiftA, plannedQty: editForm.shiftAPlanned, status: editForm.shiftAStatus },
          shiftB: { ...r[editingDay].shiftB, plannedQty: editForm.shiftBPlanned, status: editForm.shiftBStatus },
          shiftC: { ...r[editingDay].shiftC, plannedQty: editForm.shiftCPlanned, status: editForm.shiftCStatus }
        };

        const otherDaysTotal =
          (editingDay === 'day1' ? 0 : r.day1.shiftA.plannedQty + r.day1.shiftB.plannedQty + r.day1.shiftC.plannedQty) +
          (editingDay === 'day2' ? 0 : r.day2.shiftA.plannedQty + r.day2.shiftB.plannedQty + r.day2.shiftC.plannedQty) +
          (editingDay === 'day3' ? 0 : r.day3.shiftA.plannedQty + r.day3.shiftB.plannedQty + r.day3.shiftC.plannedQty);

        const newTotal3Day = otherDaysTotal + editForm.shiftAPlanned + editForm.shiftBPlanned + editForm.shiftCPlanned;

        return {
          ...r,
          [editingDay]: updatedDay,
          materialStatusRemarks: editForm.materialRemarks,
          total3DayPlannedQty: newTotal3Day,
          isFeasibleStockOnly: newTotal3Day <= r.maxProducibleFromStock,
          isFeasibleWithETA: newTotal3Day <= r.maxProducibleWithETA
        };
      }
      return r;
    });

    onUpdateDailyPlanRows(updated);
    setEditingRow(null);

    onAddAuditLog({
      phase: 'DAILY_PHASE',
      eventType: 'DAILY_PRODUCTION_LOGGED',
      actorRole: 'Demand Planner',
      actorName: 'Planner',
      entityKey: editingRow.productNumber,
      description: `Updated 3-day shift allocation for ${editingRow.productName} (${editingDay.toUpperCase()}).`,
      newValue: `Total 3-Day Plan: ${editForm.shiftAPlanned + editForm.shiftBPlanned + editForm.shiftCPlanned} units.`,
      reason: editForm.materialRemarks || 'Shift optimization'
    });
  };

  // Planner Force Release with Constraint Override
  const handleForceRelease = () => {
    const updated = dailyPlanRows.map((r) => ({
      ...r,
      isReleased: true,
      hasConstraintOverride: !r.isFeasibleStockOnly,
      overrideReason: !r.isFeasibleStockOnly ? overrideReason : undefined
    }));

    onUpdateDailyPlanRows(updated);
    setIsOverrideModalOpen(false);

    onAddAuditLog({
      phase: 'DAILY_PHASE',
      eventType: 'CONSTRAINT_OVERRIDDEN',
      actorRole: 'Demand Planner',
      actorName: 'Lead Planner',
      entityKey: '3DAY-ROLLING-PLAN',
      description: `Planner released 3-Day Operational Rolling Plan (19-Aug to 21-Aug) with constraint override.`,
      reason: overrideReason
    });
  };

  // Handle Native Print / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Phase 3: Daily 3-Day Operational Rolling Plan
            </span>
            <span className="bg-blue-900/80 text-blue-200 border border-blue-700 text-xs font-bold px-2 py-0.5 rounded font-mono">
              Cut-off: 2.30 PM - Every working day
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Daily Rolling Schedule: 19-Aug-26 (Wed) • 20-Aug-26 (Thu) • 21-Aug-26 (Fri)</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            3-Day shift plan (Shift A, B, C) based on real-time stock availability and vendor ETA dispatches. Red highlights denote material halted shifts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setIsOverrideModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Planner can still release the plan in spite of constraints"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Release Plan (Override Constraints)</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Sheet</span>
          </button>
        </div>
      </div>

      {/* Filter and Quick KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-semibold block text-[11px]">Total 3-Day Scheduled Demand</span>
          <span className="text-lg font-black text-slate-900">{totalPlannedQty.toLocaleString()} <span className="text-xs text-slate-500 font-normal">PCs</span></span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-semibold block text-[11px]">Covered with Warehouse Stock Only</span>
          <span className="text-lg font-black text-blue-700">
            {dailyPlanRows.filter(r => r.isFeasibleStockOnly).length} / {dailyPlanRows.length} <span className="text-xs text-slate-500 font-normal">Products</span>
          </span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-semibold block text-[11px]">Covered with In-Transit ETA Dispatches</span>
          <span className="text-lg font-black text-emerald-600">
            {feasibleWithETARows.length} / {dailyPlanRows.length} <span className="text-xs text-slate-500 font-normal">Feasible</span>
          </span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-semibold block text-[11px]">Critical Stockout Shifts (Red Halted)</span>
          <span className="text-lg font-black text-red-600">
            {criticalShortageRows.length} Lines Affected
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search line name, product number, product name, or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600 text-[11px] whitespace-nowrap">Filter Line:</span>
          <select
            value={selectedLineFilter}
            onChange={(e) => setSelectedLineFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
          >
            <option value="ALL">All Lines</option>
            {uniqueLines.map((line) => (
              <option key={line} value={line}>{line}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-DAY ROLLING PLAN MAIN TABLE - EXACT REPLICA OF ATTACHED IMAGE */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            {/* Super Header Row 1 */}
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300 text-center">
                <th colSpan={2} className="border-r border-slate-300 p-2 bg-slate-200 text-xs">
                  Plan Time
                </th>
                <th className="border-r border-slate-300 p-2 bg-slate-200 text-xs">
                  Date
                </th>
                <th className="border-r border-slate-300 p-1.5 bg-blue-100 text-blue-950 font-bold text-[11px]">
                  STD routing
                </th>
                <th className="border-r border-slate-300 p-1.5 bg-blue-100 text-blue-950 font-bold text-[11px]">
                  Alternate routing
                </th>
                <th className="border-r border-slate-300 p-1.5 bg-blue-100 text-blue-950 font-bold text-[11px]">
                  Std Pack size
                </th>
                {/* 19-Aug-26 */}
                <th colSpan={3} className="border-r border-slate-300 p-2 bg-slate-100 text-slate-900 font-extrabold border-l-2 border-l-slate-400">
                  19-Aug-26
                </th>
                {/* 20-Aug-26 */}
                <th colSpan={3} className="border-r border-slate-300 p-2 bg-slate-100 text-slate-900 font-extrabold border-l-2 border-l-slate-400">
                  20-Aug-26
                </th>
                {/* 21-Aug-26 */}
                <th colSpan={3} className="border-r border-slate-300 p-2 bg-slate-100 text-slate-900 font-extrabold border-l-2 border-l-slate-400">
                  21-Aug-26
                </th>
                <th rowSpan={2} className="p-2 bg-slate-200 text-slate-900 font-black text-sm text-center min-w-[280px]">
                  Material Status & Remarks
                </th>
                <th rowSpan={2} className="p-2 bg-slate-100 text-slate-800 font-bold text-center text-[11px] min-w-[90px]">
                  Feasibility & Actions
                </th>
              </tr>

              {/* Super Header Row 2 */}
              <tr className="bg-slate-50 text-slate-800 font-extrabold border-b-2 border-slate-400 text-center text-[11px]">
                <th className="border-r border-slate-300 p-1.5 bg-slate-100 text-[10px]">
                  Line Name
                </th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-100 text-[10px]">
                  Product Number
                </th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-100 text-[10px]">
                  Product Name / Shifts
                </th>
                <th className="border-r border-slate-300 p-1 bg-blue-50 text-blue-900 text-[10px]">
                  per hr
                </th>
                <th className="border-r border-slate-300 p-1 bg-blue-50 text-blue-900 text-[10px]">
                  per hr
                </th>
                <th className="border-r border-slate-300 p-1 bg-blue-50 text-blue-900 text-[10px]">
                  Qty
                </th>

                {/* Shifts for 19-Aug (Wed) */}
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold border-l-2 border-l-slate-400 w-12">A</th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold w-12">B</th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold w-12">C</th>

                {/* Shifts for 20-Aug (Thu) */}
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold border-l-2 border-l-slate-400 w-12">A</th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold w-12">B</th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold w-12">C</th>

                {/* Shifts for 21-Aug (Fri) */}
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold border-l-2 border-l-slate-400 w-12">A</th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold w-12">B</th>
                <th className="border-r border-slate-300 p-1.5 bg-slate-200 text-slate-900 font-bold w-12">C</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-300">
              {filteredRows.map((row, idx) => {
                // Check if this is the first row for this line name to simulate merged rowspan
                const isFirstOfLine = idx === 0 || filteredRows[idx - 1].lineName !== row.lineName;
                const lineRowCount = filteredRows.filter((r) => r.lineName === row.lineName).length;

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition border-b border-slate-300">
                    {/* Line Name */}
                    {isFirstOfLine ? (
                      <td
                        rowSpan={lineRowCount}
                        className="border-r border-slate-300 p-2 font-black text-slate-900 bg-white align-middle text-center text-xs font-mono"
                      >
                        {row.lineName}
                      </td>
                    ) : null}

                    {/* Product Number */}
                    <td className="border-r border-slate-300 p-2 font-mono font-bold text-slate-800 text-xs">
                      {row.productNumber}
                    </td>

                    {/* Product Name */}
                    <td className="border-r border-slate-300 p-2 font-medium text-slate-900 text-xs">
                      {row.productName}
                    </td>

                    {/* STD routing per hr */}
                    <td className="border-r border-slate-300 p-2 text-center font-bold text-blue-950 bg-blue-50/50">
                      {row.stdRoutingPerHour || '-'}
                    </td>

                    {/* Alternate routing per hr */}
                    <td className="border-r border-slate-300 p-2 text-center font-bold text-blue-950 bg-blue-50/50">
                      {row.alternateRoutingPerHour || '-'}
                    </td>

                    {/* Std Pack size */}
                    <td className="border-r border-slate-300 p-2 text-center font-bold text-blue-950 bg-blue-50/50">
                      {row.stdPackSize || '-'}
                    </td>

                    {/* DAY 1: Shift A */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day1')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer border-l-2 border-l-slate-400 ${
                        row.day1.shiftA.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white font-black'
                          : row.day1.shiftA.status === 'IE'
                          ? 'bg-blue-600 text-white font-bold'
                          : row.day1.shiftA.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                      title={row.day1.shiftA.note || (row.day1.shiftA.status === 'HALTED_SHORTAGE' ? 'Line Halted: Component shortage' : 'Click to edit shift quantity')}
                    >
                      {row.day1.shiftA.status === 'IE' ? 'IE' : row.day1.shiftA.plannedQty || ''}
                    </td>

                    {/* DAY 1: Shift B */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day1')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer ${
                        row.day1.shiftB.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day1.shiftB.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day1.shiftB.plannedQty || ''}
                    </td>

                    {/* DAY 1: Shift C */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day1')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer ${
                        row.day1.shiftC.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day1.shiftC.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day1.shiftC.plannedQty || ''}
                    </td>

                    {/* DAY 2: Shift A */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day2')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer border-l-2 border-l-slate-400 ${
                        row.day2.shiftA.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day2.shiftA.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day2.shiftA.plannedQty || ''}
                    </td>

                    {/* DAY 2: Shift B */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day2')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer ${
                        row.day2.shiftB.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day2.shiftB.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day2.shiftB.plannedQty || ''}
                    </td>

                    {/* DAY 2: Shift C */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day2')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer ${
                        row.day2.shiftC.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day2.shiftC.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day2.shiftC.plannedQty || ''}
                    </td>

                    {/* DAY 3: Shift A */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day3')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer border-l-2 border-l-slate-400 ${
                        row.day3.shiftA.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day3.shiftA.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day3.shiftA.plannedQty || ''}
                    </td>

                    {/* DAY 3: Shift B */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day3')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer ${
                        row.day3.shiftB.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day3.shiftB.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day3.shiftB.plannedQty || ''}
                    </td>

                    {/* DAY 3: Shift C */}
                    <td
                      onClick={() => handleOpenEdit(row, 'day3')}
                      className={`border-r border-slate-300 p-1.5 text-center font-black cursor-pointer ${
                        row.day3.shiftC.status === 'HALTED_SHORTAGE'
                          ? 'bg-red-600 text-white'
                          : row.day3.shiftC.plannedQty > 0
                          ? 'text-slate-900 hover:bg-amber-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.day3.shiftC.plannedQty || ''}
                    </td>

                    {/* Material Status & Remarks */}
                    <td className="p-2 text-slate-800 text-xs font-semibold leading-relaxed border-r border-slate-300">
                      {row.materialStatusRemarks}
                      {row.hasConstraintOverride && (
                        <span className="block text-[10px] text-amber-700 font-bold mt-0.5">
                          ⚠️ Override: {row.overrideReason}
                        </span>
                      )}
                    </td>

                    {/* Feasibility & Action */}
                    <td className="p-2 text-center">
                      {row.isFeasibleStockOnly ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black text-[10px] block">
                          Stock OK
                        </span>
                      ) : row.isFeasibleWithETA ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black text-[10px] block">
                          ETA Covered
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-black text-[10px] block">
                          Critical Gap
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: EDIT SHIFT QUANTITIES */}
      {editingRow && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">{editingRow.productName} ({editingRow.productNumber})</h3>
                <span className="text-xs text-blue-200">
                  Line: {editingRow.lineName} • Editing {editingDay.toUpperCase()} Allocation
                </span>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="text-blue-200 hover:text-white text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                {/* Shift A */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-black text-slate-800 text-center">Shift A</div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Planned Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.shiftAPlanned}
                      onChange={(e) => setEditForm({ ...editForm, shiftAPlanned: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-black text-center text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Status</label>
                    <select
                      value={editForm.shiftAStatus}
                      onChange={(e) => setEditForm({ ...editForm, shiftAStatus: e.target.value as any })}
                      className="w-full p-1 bg-white border border-slate-300 rounded text-[11px] font-bold"
                    >
                      <option value="RUNNING">Running</option>
                      <option value="HALTED_SHORTAGE">Red Halted (Shortage)</option>
                      <option value="IE">IE (Tooling/Trial)</option>
                      <option value="IDLE">Idle / No Plan</option>
                    </select>
                  </div>
                </div>

                {/* Shift B */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-black text-slate-800 text-center">Shift B</div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Planned Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.shiftBPlanned}
                      onChange={(e) => setEditForm({ ...editForm, shiftBPlanned: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-black text-center text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Status</label>
                    <select
                      value={editForm.shiftBStatus}
                      onChange={(e) => setEditForm({ ...editForm, shiftBStatus: e.target.value as any })}
                      className="w-full p-1 bg-white border border-slate-300 rounded text-[11px] font-bold"
                    >
                      <option value="RUNNING">Running</option>
                      <option value="HALTED_SHORTAGE">Red Halted (Shortage)</option>
                      <option value="IE">IE (Tooling/Trial)</option>
                      <option value="IDLE">Idle / No Plan</option>
                    </select>
                  </div>
                </div>

                {/* Shift C */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-black text-slate-800 text-center">Shift C</div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Planned Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.shiftCPlanned}
                      onChange={(e) => setEditForm({ ...editForm, shiftCPlanned: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-black text-center text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Status</label>
                    <select
                      value={editForm.shiftCStatus}
                      onChange={(e) => setEditForm({ ...editForm, shiftCStatus: e.target.value as any })}
                      className="w-full p-1 bg-white border border-slate-300 rounded text-[11px] font-bold"
                    >
                      <option value="RUNNING">Running</option>
                      <option value="HALTED_SHORTAGE">Red Halted (Shortage)</option>
                      <option value="IE">IE (Tooling/Trial)</option>
                      <option value="IDLE">Idle / No Plan</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Material Status & Remarks</label>
                <textarea
                  rows={2}
                  value={editForm.materialRemarks}
                  onChange={(e) => setEditForm({ ...editForm, materialRemarks: e.target.value })}
                  placeholder="e.g. Rotor_850 pcs_ETA_19.08 - 07:00 PM."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Shift Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PLANNER CONSTRAINT OVERRIDE RELEASE */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-300 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-base">Planner Release: Constraint Override</h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-amber-200 hover:text-white text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1.5">
                <span className="font-extrabold text-amber-900 text-sm block">
                  Planner Authorization Privilege
                </span>
                <p className="text-amber-800 leading-relaxed">
                  As requested, the <strong>Planner can still release the 3-day operational plan in spite of raw material constraints</strong>.
                  This ensures shop-floor dispatch is unblocked while suppliers expedite afternoon in-transit shipments.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mandatory Planner Override Rationale
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Afternoon vendor arrival at 2:00 PM covers Night Shift B & C..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForceRelease}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Release 3-Day Plan with Override</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PDF / SHOP-FLOOR PRINTABLE SHEET */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header Actions */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Shop-Floor 3-Day Shift Production Sheet (Print Ready)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Trigger Browser Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-black px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-6 overflow-y-auto bg-white text-slate-900 print:p-0" ref={printAreaRef}>
              <div className="border border-slate-900 p-4 rounded-lg space-y-3">
                {/* Formal Title Block */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                  <div>
                    <h1 className="text-xl font-black tracking-tight uppercase">
                      Pump Assembly • 3-Day Shift Production Schedule
                    </h1>
                    <div className="text-xs font-bold text-slate-700">
                      Release Cut-off: 2.30 PM - Every working day • Horizon: 19-Aug-26 (Wed) to 21-Aug-26 (Fri)
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="font-black text-sm">PLANT OPS 2026</div>
                    <div className="text-slate-500">Printed: {new Date().toLocaleString()}</div>
                  </div>
                </div>

                {/* Printable Table */}
                <table className="w-full text-xs text-left border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-black border-b border-slate-900 text-center">
                      <th className="border border-slate-900 p-1.5">Line</th>
                      <th className="border border-slate-900 p-1.5">Product No</th>
                      <th className="border border-slate-900 p-1.5">Product Name</th>
                      <th className="border border-slate-900 p-1">STD</th>
                      <th className="border border-slate-900 p-1">ALT</th>
                      <th className="border border-slate-900 p-1">Pack</th>
                      <th colSpan={3} className="border border-slate-900 p-1.5 bg-slate-300 font-black">19-Aug (Wed)</th>
                      <th colSpan={3} className="border border-slate-900 p-1.5 bg-slate-300 font-black">20-Aug (Thu)</th>
                      <th colSpan={3} className="border border-slate-900 p-1.5 bg-slate-300 font-black">21-Aug (Fri)</th>
                      <th className="border border-slate-900 p-1.5">Material Status & Remarks</th>
                    </tr>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-900 text-center text-[10px]">
                      <th className="border border-slate-900"></th>
                      <th className="border border-slate-900"></th>
                      <th className="border border-slate-900"></th>
                      <th className="border border-slate-900">/hr</th>
                      <th className="border border-slate-900">/hr</th>
                      <th className="border border-slate-900">Size</th>
                      <th className="border border-slate-900 w-8">A</th>
                      <th className="border border-slate-900 w-8">B</th>
                      <th className="border border-slate-900 w-8">C</th>
                      <th className="border border-slate-900 w-8">A</th>
                      <th className="border border-slate-900 w-8">B</th>
                      <th className="border border-slate-900 w-8">C</th>
                      <th className="border border-slate-900 w-8">A</th>
                      <th className="border border-slate-900 w-8">B</th>
                      <th className="border border-slate-900 w-8">C</th>
                      <th className="border border-slate-900"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyPlanRows.map((r) => (
                      <tr key={r.id} className="border-b border-slate-800 text-[11px]">
                        <td className="border border-slate-900 p-1 font-bold font-mono text-center">{r.lineName}</td>
                        <td className="border border-slate-900 p-1 font-mono font-bold">{r.productNumber}</td>
                        <td className="border border-slate-900 p-1 font-semibold">{r.productName}</td>
                        <td className="border border-slate-900 p-1 text-center font-bold">{r.stdRoutingPerHour}</td>
                        <td className="border border-slate-900 p-1 text-center font-bold">{r.alternateRoutingPerHour}</td>
                        <td className="border border-slate-900 p-1 text-center font-bold">{r.stdPackSize}</td>

                        {/* 19-Aug */}
                        <td className={`border border-slate-900 p-1 text-center font-black ${r.day1.shiftA.status === 'HALTED_SHORTAGE' ? 'bg-red-600 text-white' : r.day1.shiftA.status === 'IE' ? 'bg-blue-600 text-white' : ''}`}>
                          {r.day1.shiftA.status === 'IE' ? 'IE' : r.day1.shiftA.plannedQty || ''}
                        </td>
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day1.shiftB.plannedQty || ''}</td>
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day1.shiftC.plannedQty || ''}</td>

                        {/* 20-Aug */}
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day2.shiftA.plannedQty || ''}</td>
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day2.shiftB.plannedQty || ''}</td>
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day2.shiftC.plannedQty || ''}</td>

                        {/* 21-Aug */}
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day3.shiftA.plannedQty || ''}</td>
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day3.shiftB.plannedQty || ''}</td>
                        <td className="border border-slate-900 p-1 text-center font-black">{r.day3.shiftC.plannedQty || ''}</td>

                        <td className="border border-slate-900 p-1 text-[10px] font-medium leading-tight">
                          {r.materialStatusRemarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Sign-off footer */}
                <div className="grid grid-cols-4 gap-4 pt-4 text-center text-xs font-bold text-slate-800">
                  <div className="border-t border-slate-900 pt-1">Prepared by: Demand Planner</div>
                  <div className="border-t border-slate-900 pt-1">Validated by: Supply Planner</div>
                  <div className="border-t border-slate-900 pt-1">Verified: Plant Head</div>
                  <div className="border-t border-slate-900 pt-1">Approved: VP Operations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
