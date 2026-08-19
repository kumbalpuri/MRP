import React, { useState, useMemo } from 'react';
import {
  RMWeeklyConsolidatedData,
  DeliveryScheduleItem,
  SAPInwardItem,
  InventoryItem,
  BOMItem,
  RMReservationItem
} from '../../types';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Truck,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  Plus,
  Building,
  Info,
  Calendar,
  Sparkles,
  Lock,
  CalendarDays,
  ShieldCheck
} from 'lucide-react';
import { ReservationBreakdownDropdown } from './ReservationBreakdownDropdown';
import { ReservationManagerModal } from './ReservationManagerModal';
import {
  getMondayToSaturdayWeeks,
  getCurrentWeekNumber,
  formatAsOnDateDisplay
} from '../../utils/dateCalendarUtils';

interface ConsolidatedRMTableProps {
  consolidatedData: RMWeeklyConsolidatedData[];
  schedules: DeliveryScheduleItem[];
  sapInwards: SAPInwardItem[];
  inventory: InventoryItem[];
  boms: BOMItem[];
  reservations?: RMReservationItem[];
  asOnDate?: string;
  onAddSchedule: (schedule: DeliveryScheduleItem) => void;
  onAddSAPInward: (inward: SAPInwardItem) => void;
  onAddReservation?: (res: RMReservationItem) => void;
  onDeleteReservation?: (id: string) => void;
  onOpenScheduleReport: () => void;
  onOpenSAPInwardReport: () => void;
  onOpenReservationManager?: () => void;
}

export const ConsolidatedRMTable: React.FC<ConsolidatedRMTableProps> = ({
  consolidatedData,
  schedules,
  sapInwards,
  inventory,
  boms,
  reservations = [],
  asOnDate = '2026-08-19',
  onAddSchedule,
  onAddSAPInward,
  onAddReservation,
  onDeleteReservation,
  onOpenScheduleReport,
  onOpenSAPInwardReport,
  onOpenReservationManager
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RM' | 'PM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SHORTAGE' | 'WARNING' | 'OK'>('ALL');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [activeTabPerComponent, setActiveTabPerComponent] = useState<
    Record<string, 'fgs' | 'inward' | 'schedules' | 'reservations' | 'vendor'>
  >({});

  // Reservation Manager Modal State
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [resModalMaterial, setResModalMaterial] = useState<string | undefined>(undefined);
  const [resModalFG, setResModalFG] = useState<string | undefined>(undefined);

  // Quick Inline Add Schedule Modal State
  const [scheduleModalComp, setScheduleModalComp] = useState<RMWeeklyConsolidatedData | null>(null);
  const [newScheduleForm, setNewScheduleForm] = useState({
    poNumber: '',
    week: 1 as 1 | 2 | 3 | 4,
    qty: 0,
    etaDate: '2026-08-20',
    vendor: '',
    reason: 'Initial schedule allocation based on MRP net requirement'
  });

  const weeksCalendar = getMondayToSaturdayWeeks(asOnDate);
  const currentWeekNumber = getCurrentWeekNumber(asOnDate);

  // Toggle row expansion
  const toggleRow = (code: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    consolidatedData.forEach((c) => (next[c.materialCode] = true));
    setExpandedRows(next);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return consolidatedData.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && item.overallStatus !== statusFilter) return false;

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesCode = item.materialCode.toLowerCase().includes(term);
        const matchesDesc = item.materialDescription.toLowerCase().includes(term);
        const matchesVendor = item.primaryVendor.toLowerCase().includes(term);
        const matchesFG = item.usedInFGs.some(
          (fg) =>
            fg.fgCode.toLowerCase().includes(term) ||
            fg.fgDescription.toLowerCase().includes(term) ||
            (fg.customerName && fg.customerName.toLowerCase().includes(term))
        );
        if (!matchesCode && !matchesDesc && !matchesVendor && !matchesFG) return false;
      }

      return true;
    });
  }, [consolidatedData, categoryFilter, statusFilter, searchTerm]);

  // Overall KPI Counters
  const totalRMs = consolidatedData.filter((c) => c.category === 'RM').length;
  const totalPMs = consolidatedData.filter((c) => c.category === 'PM').length;
  const shortageCount = consolidatedData.filter((c) => c.overallStatus === 'SHORTAGE').length;
  const totalBacklogMonth = consolidatedData.reduce((acc, c) => acc + c.totalMonthBacklog, 0);
  const totalActiveReservationsCount = consolidatedData.reduce(
    (acc, c) => acc + (c.activeReservationsList?.length || 0),
    0
  );

  const handleOpenAddSchedule = (comp: RMWeeklyConsolidatedData) => {
    setScheduleModalComp(comp);
    setNewScheduleForm({
      poNumber: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
      week: currentWeekNumber,
      qty: Math.max(100, Math.round(comp.totalMonthGrossDemand / 4)),
      etaDate: '2026-08-20',
      vendor: comp.primaryVendor,
      reason: 'Procurement schedule action to cover weekly effective requirement gap'
    });
  };

  const handleOpenReserveModal = (matCode?: string, fgCode?: string) => {
    setResModalMaterial(matCode);
    setResModalFG(fgCode);
    setIsResModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalComp) return;

    const newSchedule: DeliveryScheduleItem = {
      id: `del-${Date.now()}`,
      materialCode: scheduleModalComp.materialCode,
      description: scheduleModalComp.materialDescription,
      qty: Number(newScheduleForm.qty) || 0,
      unit: scheduleModalComp.uom,
      vendor: newScheduleForm.vendor || scheduleModalComp.primaryVendor,
      etd: '2026-08-14',
      eta: newScheduleForm.etaDate,
      week: newScheduleForm.week,
      delivered: 'N',
      poNumber: newScheduleForm.poNumber,
      lastReason: newScheduleForm.reason,
      lastModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
      changedBy: 'Buyer_Procurement',
      revisionCount: 0,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          scheduleId: `del-${Date.now()}`,
          poNumber: newScheduleForm.poNumber,
          materialCode: scheduleModalComp.materialCode,
          materialDescription: scheduleModalComp.materialDescription,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          changedBy: 'Buyer_Procurement',
          changeField: 'Initial Creation',
          oldValue: '-',
          newValue: `${Number(newScheduleForm.qty).toLocaleString()} ${scheduleModalComp.uom} (Week ${newScheduleForm.week})`,
          reason: newScheduleForm.reason
        }
      ]
    };

    onAddSchedule(newSchedule);
    setScheduleModalComp(null);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Monday-to-Saturday Planning Calendar & As-on-Date Strip */}
      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/30 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                As on Date Running:
              </span>
              <span className="font-bold text-white text-sm">
                {formatAsOnDateDisplay(asOnDate)}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Active Week {currentWeekNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Working weeks run strictly <strong>Monday to Saturday</strong>. Past-week reservations (W1/W2) are automatically expired and excluded from effective stock calculations.
            </p>
          </div>
        </div>

        {/* Monday to Saturday Week Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {weeksCalendar.map((wk) => {
            const isCurrent = wk.status === 'CURRENT';
            const isPast = wk.status === 'PAST';

            return (
              <div
                key={wk.week}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-2xs'
                    : isPast
                    ? 'bg-slate-800/80 text-slate-400 border-slate-700'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
                title={`${wk.label} • ${isPast ? 'Past Week (Expired)' : isCurrent ? 'Current Active Week' : 'Future Week'}`}
              >
                <div className="text-[10px] font-sans font-semibold flex items-center gap-1">
                  <span>W{wk.week}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <div className="text-[9px] opacity-80 whitespace-nowrap">
                  {wk.startDate.slice(5)} to {wk.endDate.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Lean Summary Header & Fast Action Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title & Key Highlights */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Consolidated RM/PM Procurement Matrix
              </h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded">
                {consolidatedData.length} Materials Total ({totalRMs} RM, {totalPMs} PM)
              </span>
              {shortageCount > 0 ? (
                <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  {shortageCount} Materials with Shortage / Backlog
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  All Materials Covered
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Consolidates common raw & packaging material requirements across multiple Finished Goods with weekly SAP inward receipts, backlog carryovers, and purchase ETA schedules.
            </p>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenReserveModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs"
              title="Allocate or lock material specifically for a Finished Good"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Material Allocations / Reservations ({totalActiveReservationsCount})</span>
            </button>

            <button
              onClick={onOpenSAPInwardReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>SAP Inwards Ledger</span>
            </button>

            <button
              onClick={onOpenScheduleReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-purple-200" />
              <span>Delivery Schedules & Change Logs</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search RM code, description, vendor, or FG code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === 'ALL' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setCategoryFilter('RM')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === 'RM' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Raw Materials (RM)
              </button>
              <button
                onClick={() => setCategoryFilter('PM')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === 'PM' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Packaging (PM)
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SHORTAGE">⚠️ Shortages / Backlog Only</option>
              <option value="WARNING">⚡ Warning / Low Stock</option>
              <option value="OK">✅ Covered / Stable</option>
            </select>
          </div>

          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={expandAll}
              className="text-xs text-slate-600 hover:text-blue-700 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
            >
              Expand All Drilldowns
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-slate-600 hover:text-blue-700 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Tabular Matrix Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-800 text-white font-semibold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[120px]">RM / PM Code</th>
                <th className="py-2.5 px-3 min-w-[200px]">Description & Consuming FGs</th>
                <th className="py-2.5 px-2 text-center w-12">UoM</th>
                <th className="py-2.5 px-3 text-right bg-slate-900/80 min-w-[125px]">
                  <div>Warehouse Stock</div>
                  <div className="text-[9px] font-normal text-amber-300 capitalize tracking-normal">
                    Physical • Reserved • Effective
                  </div>
                </th>

                {/* Week 1 */}
                <th className="py-2.5 px-2 text-center bg-blue-900/40 border-l border-slate-700 min-w-[140px]">
                  <div>Week 1 (03–08 Aug)</div>
                  <div className="text-[9px] font-normal text-blue-200 capitalize tracking-normal">
                    Req • Inward • Backlog • ETA
                  </div>
                </th>

                {/* Week 2 */}
                <th className="py-2.5 px-2 text-center bg-blue-900/60 border-l border-slate-700 min-w-[140px]">
                  <div>Week 2 (10–15 Aug)</div>
                  <div className="text-[9px] font-normal text-blue-200 capitalize tracking-normal">
                    Req • Inward • Backlog • ETA
                  </div>
                </th>

                {/* Week 3 */}
                <th className="py-2.5 px-2 text-center bg-blue-900/40 border-l border-slate-700 min-w-[140px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Week 3 (17–22 Aug)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[9px] font-normal text-blue-200 capitalize tracking-normal">
                    Req • Inward • Backlog • ETA
                  </div>
                </th>

                {/* Week 4 */}
                <th className="py-2.5 px-2 text-center bg-blue-900/60 border-l border-slate-700 min-w-[140px]">
                  <div>Week 4 (24–29 Aug)</div>
                  <div className="text-[9px] font-normal text-blue-200 capitalize tracking-normal">
                    Req • Inward • Backlog • ETA
                  </div>
                </th>

                {/* Month Summary & Status */}
                <th className="py-2.5 px-3 text-center bg-slate-900 border-l border-slate-700 min-w-[130px]">
                  Month Summary
                </th>
                <th className="py-2.5 px-3 text-center bg-slate-900 min-w-[80px]">Status</th>
                <th className="py-2.5 px-3 text-center bg-slate-900 w-24">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No materials matched your filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search or category filters.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const isExpanded = !!expandedRows[item.materialCode];
                  const isRM = item.category === 'RM';
                  const activeSubTab = activeTabPerComponent[item.materialCode] || 'fgs';

                  const itemSchedules = schedules.filter((s) => s.materialCode === item.materialCode);
                  const itemInwards = sapInwards.filter((sap) => sap.materialCode === item.materialCode);
                  const itemReservations = item.activeReservationsList || [];

                  return (
                    <React.Fragment key={item.materialCode}>
                      {/* Main Material Row */}
                      <tr
                        className={`transition hover:bg-blue-50/40 cursor-pointer ${
                          isExpanded ? 'bg-blue-50/50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                        onClick={() => toggleRow(item.materialCode)}
                      >
                        {/* Expand / Collapse Icon */}
                        <td className="py-2.5 px-3 text-center text-slate-400">
                          <button
                            type="button"
                            className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(item.materialCode);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>
                        </td>

                        {/* Material Code & Badge */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                isRM
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              }`}
                            >
                              {item.category}
                            </span>
                            <span className="font-mono font-bold text-blue-700">
                              {item.materialCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[130px]" title={item.primaryVendor}>
                            {item.primaryVendor}
                          </div>
                        </td>

                        {/* Description & FG Usage Chips */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800 text-xs">
                            {item.materialDescription}
                          </div>
                          {/* Common material FG tags */}
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] font-bold text-slate-500">
                              Used in {item.usedInFGs.length} FG{item.usedInFGs.length > 1 ? 's' : ''}:
                            </span>
                            {item.usedInFGs.map((fg) => (
                              <span
                                key={fg.fgCode}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-medium px-1.5 py-0.2 rounded cursor-pointer"
                                title={`${fg.fgDescription} (Ratio: ${fg.qtyPerFG} ${item.uom}/FG • Reserved: ${fg.reservedForOtherFGs} for others)`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReserveModal(item.materialCode, fg.fgCode);
                                }}
                              >
                                {fg.fgCode} ({fg.qtyPerFG} {item.uom})
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* UoM */}
                        <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-600 uppercase text-[11px]">
                          {item.uom}
                        </td>

                        {/* Warehouse Stock + Active Reservations + Effective Available Stock */}
                        <td className="py-2.5 px-3 text-right bg-slate-50/70 font-mono border-r border-slate-200">
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-[9px] font-sans text-slate-400">Stock:</span>
                            <span className="font-bold text-slate-800">
                              {item.currentWarehouseStock.toLocaleString()}
                            </span>
                          </div>

                          {/* Reserved for other FGs Dropdown */}
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="text-[9px] font-sans text-amber-700">Reserved:</span>
                            <ReservationBreakdownDropdown
                              materialCode={item.materialCode}
                              materialDescription={item.materialDescription}
                              uom={item.uom}
                              reservedQty={item.totalReservedForOtherFGs}
                              reservations={item.activeReservationsList}
                              asOnDate={asOnDate}
                              onManageReservations={() => handleOpenReserveModal(item.materialCode)}
                            />
                          </div>

                          {/* Effective Available Stock (Stock - Reserved) */}
                          <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-slate-200 text-xs">
                            <span className="text-[9px] font-sans font-bold text-slate-600">Effective:</span>
                            <span
                              className={`font-mono font-extrabold px-1 rounded ${
                                item.effectiveAvailableStock < item.safetyStock
                                  ? 'text-red-700 bg-red-100/70'
                                  : 'text-emerald-700 bg-emerald-50'
                              }`}
                              title={`Effective Available Stock as on date = Warehouse Stock (${item.currentWarehouseStock}) - Reserved (${item.totalReservedForOtherFGs})`}
                            >
                              {item.effectiveAvailableStock.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Week 1 to 4 Consolidated Columns */}
                        {item.weeks.map((w) => {
                          const hasShortage = w.status === 'SHORTAGE';
                          const hasBacklog = w.backlogCarryToNext > 0;

                          return (
                            <td
                              key={w.week}
                              className={`py-2 px-2 border-l border-slate-200 font-mono text-[11px] ${
                                hasShortage ? 'bg-red-50/60' : w.status === 'WARNING' ? 'bg-amber-50/40' : 'bg-slate-50/20'
                              }`}
                            >
                              <div className="space-y-0.5">
                                {/* Consolidated Gross + Backlog Requirement */}
                                <div className="flex justify-between items-center text-slate-700">
                                  <span className="text-[9px] font-sans text-slate-500 uppercase">Req:</span>
                                  <span className="font-bold text-slate-900">
                                    {w.totalRequirement.toLocaleString()}
                                  </span>
                                </div>

                                {/* Actual Inward Receipt (SAP) */}
                                <div className="flex justify-between items-center text-blue-700">
                                  <span className="text-[9px] font-sans text-blue-600">Inward:</span>
                                  <span className={`font-semibold ${w.actualReceiptSAP > 0 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                                    {w.actualReceiptSAP > 0 ? `+${w.actualReceiptSAP.toLocaleString()}` : '0'}
                                  </span>
                                </div>

                                {/* Backlog Carried to Next Week */}
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-sans text-slate-500">Backlog:</span>
                                  <span
                                    className={`text-[10px] font-extrabold ${
                                      hasBacklog ? 'text-red-600 bg-red-100/80 px-1 rounded' : 'text-slate-400'
                                    }`}
                                  >
                                    {hasBacklog ? `-${w.backlogCarryToNext.toLocaleString()}` : '0'}
                                  </span>
                                </div>

                                {/* Purchase ETA Schedule */}
                                <div className="flex justify-between items-center text-purple-700">
                                  <span className="text-[9px] font-sans text-purple-600">ETA:</span>
                                  <span className={`font-semibold ${w.purchaseETASchedule > 0 ? 'text-purple-800 font-bold' : 'text-slate-400'}`}>
                                    {w.purchaseETASchedule > 0 ? `+${w.purchaseETASchedule.toLocaleString()}` : '0'}
                                  </span>
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        {/* Month Summary */}
                        <td className="py-2.5 px-3 text-right bg-slate-50/80 border-l border-slate-200 font-mono">
                          <div className="text-[11px] text-slate-600">
                            Gross: <span className="font-bold text-slate-900">{item.totalMonthGrossDemand.toLocaleString()}</span>
                          </div>
                          <div className="text-[11px] text-blue-700">
                            Inward: <span className="font-bold">{item.totalMonthActualReceipt.toLocaleString()}</span>
                          </div>
                          <div className="text-[11px] text-purple-700">
                            ETA: <span className="font-bold">{item.totalMonthETASchedule.toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Overall Status Badge */}
                        <td className="py-2.5 px-3 text-center">
                          {item.overallStatus === 'SHORTAGE' && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Shortage
                            </span>
                          )}
                          {item.overallStatus === 'WARNING' && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Warning
                            </span>
                          )}
                          {item.overallStatus === 'OK' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Covered
                            </span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSchedule(item)}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-[11px] font-bold rounded transition cursor-pointer shadow-2xs mx-auto"
                            title="Add Purchase ETA Dispatch Schedule"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ ETA</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Drill Down Section */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b-2 border-blue-200">
                          <td colSpan={11} className="p-3.5">
                            <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-3.5 space-y-3">
                              {/* Sub-Tab Navigation Header */}
                              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    onClick={() =>
                                      setActiveTabPerComponent((prev) => ({
                                        ...prev,
                                        [item.materialCode]: 'fgs'
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                      activeSubTab === 'fgs'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    🏭 Consuming Finished Goods ({item.usedInFGs.length})
                                  </button>

                                  <button
                                    onClick={() =>
                                      setActiveTabPerComponent((prev) => ({
                                        ...prev,
                                        [item.materialCode]: 'reservations'
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                      activeSubTab === 'reservations'
                                        ? 'bg-amber-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    🔒 FG Material Allocations ({itemReservations.length})
                                  </button>

                                  <button
                                    onClick={() =>
                                      setActiveTabPerComponent((prev) => ({
                                        ...prev,
                                        [item.materialCode]: 'inward'
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                      activeSubTab === 'inward'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    📋 SAP Inward Receipts ({itemInwards.length})
                                  </button>

                                  <button
                                    onClick={() =>
                                      setActiveTabPerComponent((prev) => ({
                                        ...prev,
                                        [item.materialCode]: 'schedules'
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                      activeSubTab === 'schedules'
                                        ? 'bg-purple-700 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    🚚 Purchase Delivery Schedules ({itemSchedules.length})
                                  </button>

                                  <button
                                    onClick={() =>
                                      setActiveTabPerComponent((prev) => ({
                                        ...prev,
                                        [item.materialCode]: 'vendor'
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                      activeSubTab === 'vendor'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    🏢 Vendor Profile & Lead Time
                                  </button>
                                </div>

                                <div className="text-xs text-slate-500 font-medium">
                                  Material: <strong className="text-slate-900 font-mono">{item.materialCode}</strong> — {item.materialDescription}
                                </div>
                              </div>

                              {/* 1. Finished Goods Consumption Sub-Table with RESERVATION BREAKDOWN & EFFECTIVE REQUIREMENT */}
                              {activeSubTab === 'fgs' && (
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                      <span>Finished goods sharing this component with Effective Requirement & Reservations:</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReserveModal(item.materialCode)}
                                      className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                                    >
                                      <Lock className="w-3 h-3 text-amber-700" />
                                      <span>+ Allocate / Reserve for an FG</span>
                                    </button>
                                  </div>

                                  <table className="w-full text-left border border-slate-200 rounded-md overflow-hidden text-xs">
                                    <thead className="bg-slate-100 font-semibold text-slate-700">
                                      <tr>
                                        <th className="py-2 px-3">FG Code</th>
                                        <th className="py-2 px-3">Finished Product Description</th>
                                        <th className="py-2 px-3">Customer / Line</th>
                                        <th className="py-2 px-2 text-right">Qty / FG</th>
                                        <th className="py-2 px-2 text-right font-mono">Gross Req</th>
                                        <th className="py-2 px-2 text-right bg-amber-50/60 font-mono">
                                          Reserved for Other FGs
                                        </th>
                                        <th className="py-2 px-2 text-right bg-emerald-50/60 font-mono">
                                          Effective Available
                                        </th>
                                        <th className="py-2 px-2 text-right bg-blue-50/60 font-mono font-bold">
                                          Effective Net Req
                                        </th>
                                        <th className="py-2 px-2 text-right">W1 Req</th>
                                        <th className="py-2 px-2 text-right">W2 Req</th>
                                        <th className="py-2 px-2 text-right">W3 Req</th>
                                        <th className="py-2 px-2 text-right">W4 Req</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-mono">
                                      {item.usedInFGs.map((fg) => (
                                        <tr key={fg.fgCode} className="hover:bg-slate-50">
                                          <td className="py-2 px-3 font-bold text-blue-700">
                                            {fg.fgCode}
                                          </td>
                                          <td className="py-2 px-3 font-sans font-medium text-slate-800">
                                            {fg.fgDescription}
                                          </td>
                                          <td className="py-2 px-3 font-sans text-slate-600 text-[11px]">
                                            {fg.customerName || 'General Production'} • {fg.miniFactory || ''} {fg.line || ''}
                                          </td>
                                          <td className="py-2 px-2 text-right font-bold text-slate-900">
                                            {fg.qtyPerFG} {item.uom}
                                          </td>
                                          <td className="py-2 px-2 text-right text-slate-700">
                                            {fg.totalMonthReq.toLocaleString()} {item.uom}
                                          </td>

                                          {/* Dropdown Menu for Reserved for Other FGs */}
                                          <td className="py-2 px-2 text-right bg-amber-50/40">
                                            <ReservationBreakdownDropdown
                                              materialCode={item.materialCode}
                                              materialDescription={item.materialDescription}
                                              uom={item.uom}
                                              currentFGCode={fg.fgCode}
                                              reservedQty={fg.reservedForOtherFGs}
                                              reservations={fg.otherFGReservations}
                                              asOnDate={asOnDate}
                                              onManageReservations={() => handleOpenReserveModal(item.materialCode, fg.fgCode)}
                                            />
                                          </td>

                                          {/* Effective Available Stock (Stock - Reserved for Others) */}
                                          <td className="py-2 px-2 text-right font-bold text-emerald-800 bg-emerald-50/40">
                                            {fg.effectiveAvailableStock.toLocaleString()} {item.uom}
                                          </td>

                                          {/* Effective Net Requirement */}
                                          <td className="py-2 px-2 text-right font-extrabold text-blue-900 bg-blue-50/50">
                                            {fg.effectiveNetRequirement.toLocaleString()} {item.uom}
                                          </td>

                                          <td className="py-2 px-2 text-right text-slate-600">
                                            {fg.weeklyReq.find((r) => r.week === 1)?.componentReq.toLocaleString()}
                                          </td>
                                          <td className="py-2 px-2 text-right text-slate-600">
                                            {fg.weeklyReq.find((r) => r.week === 2)?.componentReq.toLocaleString()}
                                          </td>
                                          <td className="py-2 px-2 text-right text-slate-600">
                                            {fg.weeklyReq.find((r) => r.week === 3)?.componentReq.toLocaleString()}
                                          </td>
                                          <td className="py-2 px-2 text-right text-slate-600">
                                            {fg.weeklyReq.find((r) => r.week === 4)?.componentReq.toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* 2. Reservations Sub-Tab */}
                              {activeSubTab === 'reservations' && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700">
                                      Active Material Allocations & Reservations for {item.materialCode}:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReserveModal(item.materialCode)}
                                      className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Add New Reservation</span>
                                    </button>
                                  </div>

                                  {itemReservations.length === 0 ? (
                                    <div className="p-4 bg-slate-50 text-center text-slate-500 rounded border border-slate-200 text-xs">
                                      No active reservations logged for this material. Unrestricted stock is 100% available across all FGs.
                                    </div>
                                  ) : (
                                    <table className="w-full text-left border border-slate-200 rounded-md overflow-hidden text-xs font-mono">
                                      <thead className="bg-slate-100 font-semibold text-slate-700 font-sans">
                                        <tr>
                                          <th className="py-2 px-3">Reserved For FG</th>
                                          <th className="py-2 px-3">Customer</th>
                                          <th className="py-2 px-2 text-center">Week (Mon–Sat)</th>
                                          <th className="py-2 px-3 text-right">Reserved Quantity</th>
                                          <th className="py-2 px-3">Reason / Order Ref</th>
                                          <th className="py-2 px-3 text-center">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200">
                                        {itemReservations.map((res) => (
                                          <tr key={res.id} className="hover:bg-slate-50">
                                            <td className="py-2 px-3 font-bold text-blue-700">
                                              {res.reservedForFGCode} — {res.reservedForFGDescription}
                                            </td>
                                            <td className="py-2 px-3 text-slate-700">{res.customerName || 'General Export'}</td>
                                            <td className="py-2 px-2 text-center font-bold">
                                              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[10px]">
                                                W{res.week} ({res.validFromDate} to {res.validToDate})
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-right font-bold text-amber-900 bg-amber-50/50">
                                              {res.reservedQty.toLocaleString()} {res.uom}
                                            </td>
                                            <td className="py-2 px-3 font-sans text-slate-600 text-[11px] italic">
                                              "{res.reason}"
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                                Active (Deducted)
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}

                              {/* 3. SAP Inwards Sub-Table */}
                              {activeSubTab === 'inward' && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700">
                                      Actual SAP Goods Receipts / Inward Filings for {item.materialCode}:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={onOpenSAPInwardReport}
                                      className="text-xs text-blue-700 font-bold hover:underline"
                                    >
                                      Open Full SAP Inwards Ledger →
                                    </button>
                                  </div>

                                  {itemInwards.length === 0 ? (
                                    <div className="p-4 bg-slate-50 text-center text-slate-500 rounded border border-slate-200 text-xs">
                                      No SAP goods receipts logged yet for this material.
                                    </div>
                                  ) : (
                                    <table className="w-full text-left border border-slate-200 rounded-md overflow-hidden text-xs font-mono">
                                      <thead className="bg-slate-100 font-semibold text-slate-700 font-sans">
                                        <tr>
                                          <th className="py-2 px-3">SAP MatDoc #</th>
                                          <th className="py-2 px-3">Posting Date</th>
                                          <th className="py-2 px-2 text-center">Week</th>
                                          <th className="py-2 px-3 text-right">Received Quantity</th>
                                          <th className="py-2 px-3">Storage Location</th>
                                          <th className="py-2 px-3">Supplier / PO</th>
                                          <th className="py-2 px-3">Header Text</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200">
                                        {itemInwards.map((sap) => (
                                          <tr key={sap.id} className="hover:bg-slate-50">
                                            <td className="py-2 px-3 font-bold text-blue-700">{sap.matDoc}</td>
                                            <td className="py-2 px-3 text-slate-600">{sap.postingDate}</td>
                                            <td className="py-2 px-2 text-center font-bold">
                                              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[10px]">
                                                W{sap.week}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-right font-bold text-emerald-700">
                                              +{sap.qty.toLocaleString()} {sap.uom}
                                            </td>
                                            <td className="py-2 px-3 font-sans text-slate-600">{sap.sloc}</td>
                                            <td className="py-2 px-3 font-sans text-slate-700">
                                              {sap.vendor} ({sap.poNumber || 'N/A'})
                                            </td>
                                            <td className="py-2 px-3 font-sans text-slate-500 text-[11px]">
                                              {sap.headerText || '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}

                              {/* 4. Purchase Delivery Schedules Sub-Table */}
                              {activeSubTab === 'schedules' && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700">
                                      Purchase ETA Delivery Commitments & ETA Adjustments:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAddSchedule(item)}
                                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Add Delivery Schedule</span>
                                    </button>
                                  </div>

                                  {itemSchedules.length === 0 ? (
                                    <div className="p-4 bg-slate-50 text-center text-slate-500 rounded border border-slate-200 text-xs">
                                      No delivery schedules logged for this material yet. Click "+ ETA" to log supplier dispatch dates.
                                    </div>
                                  ) : (
                                    <table className="w-full text-left border border-slate-200 rounded-md overflow-hidden text-xs font-mono">
                                      <thead className="bg-slate-100 font-semibold text-slate-700 font-sans">
                                        <tr>
                                          <th className="py-2 px-3">PO Number</th>
                                          <th className="py-2 px-3">Supplier / Vendor</th>
                                          <th className="py-2 px-2 text-center">Week</th>
                                          <th className="py-2 px-3">Promised ETA</th>
                                          <th className="py-2 px-3 text-right">Schedule Qty</th>
                                          <th className="py-2 px-2 text-center">Status</th>
                                          <th className="py-2 px-3">Last Reason / Revision</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200">
                                        {itemSchedules.map((sch) => (
                                          <tr key={sch.id} className="hover:bg-slate-50">
                                            <td className="py-2 px-3 font-bold text-purple-700">{sch.poNumber || 'PO-OPEN'}</td>
                                            <td className="py-2 px-3 font-sans text-slate-800">{sch.vendor}</td>
                                            <td className="py-2 px-2 text-center font-bold">
                                              <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded text-[10px]">
                                                W{sch.week}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-slate-700">{sch.eta}</td>
                                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                                              {sch.qty.toLocaleString()} {sch.unit}
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                              {sch.delivered === 'Y' ? (
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                  Delivered
                                                </span>
                                              ) : (
                                                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                  In Transit
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3 font-sans text-slate-600 text-[11px] truncate max-w-[200px]" title={sch.lastReason}>
                                              {sch.lastReason || 'Initial ETA Commitment'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}

                              {/* 5. Vendor Profile & Lead Time */}
                              {activeSubTab === 'vendor' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                                  <div>
                                    <span className="text-slate-500 block text-[11px]">Primary Approved Vendor:</span>
                                    <strong className="text-slate-900 text-sm">{item.primaryVendor}</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block text-[11px]">Contracted Lead Time:</span>
                                    <strong className="text-blue-700 text-sm">{item.leadTimeDays} Calendar Days</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block text-[11px]">Recommended Reorder Buffer:</span>
                                    <strong className="text-slate-800 text-sm">
                                      {item.safetyStock.toLocaleString()} {item.uom} (Safety Target)
                                    </strong>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Quick Schedule Modal */}
      {scheduleModalComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-300" />
                <h3 className="font-bold text-sm">
                  Add Delivery ETA Schedule — {scheduleModalComp.materialCode}
                </h3>
              </div>
              <button
                onClick={() => setScheduleModalComp(null)}
                className="text-purple-300 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Material Description
                </label>
                <div className="p-2 bg-slate-100 rounded text-slate-800 font-medium">
                  {scheduleModalComp.materialDescription} ({scheduleModalComp.uom})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PO Number</label>
                  <input
                    type="text"
                    required
                    value={newScheduleForm.poNumber}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, poNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Week</label>
                  <select
                    value={newScheduleForm.week}
                    onChange={(e) =>
                      setNewScheduleForm({ ...newScheduleForm, week: Number(e.target.value) as 1 | 2 | 3 | 4 })
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={1}>Week 1 (03–08 Aug)</option>
                    <option value={2}>Week 2 (10–15 Aug)</option>
                    <option value={3}>Week 3 (17–22 Aug)</option>
                    <option value={4}>Week 4 (24–29 Aug)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Committed Quantity ({scheduleModalComp.uom})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newScheduleForm.qty}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expected Arrival (ETA)
                  </label>
                  <input
                    type="date"
                    required
                    value={newScheduleForm.etaDate}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, etaDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  required
                  value={newScheduleForm.vendor}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, vendor: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Commitment / MRP Note
                </label>
                <textarea
                  rows={2}
                  required
                  value={newScheduleForm.reason}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setScheduleModalComp(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Save Schedule Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Manager Modal */}
      {isResModalOpen && onAddReservation && onDeleteReservation && (
        <ReservationManagerModal
          isOpen={isResModalOpen}
          onClose={() => setIsResModalOpen(false)}
          reservations={reservations}
          boms={boms}
          inventory={inventory}
          demands={consolidatedData.flatMap((c) =>
            c.usedInFGs.map((fg) => ({
              id: fg.fgCode,
              fgCode: fg.fgCode,
              fgDescription: fg.fgDescription,
              monthlyDemand: fg.totalMonthReq,
              uom: 'PC',
              customerName: fg.customerName
            }))
          )}
          asOnDate={asOnDate}
          onAddReservation={(res) => {
            onAddReservation(res);
            setIsResModalOpen(false);
          }}
          onDeleteReservation={onDeleteReservation}
          initialMaterialCode={resModalMaterial}
          initialFGCode={resModalFG}
        />
      )}
    </div>
  );
};
