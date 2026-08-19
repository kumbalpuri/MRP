import React, { useState, useMemo } from 'react';
import {
  BOMItem,
  InventoryItem,
  DemandItem,
  DeliveryScheduleItem,
  SAPInwardItem,
  RMReservationItem,
  RMWeeklyConsolidatedData,
  FGCoverageReportItem,
  FGBottleneckComponent
} from '../../types';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  Download,
  Truck,
  PlusCircle,
  Factory,
  Package,
  Calendar,
  Lock,
  ArrowRight,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronRight,
  Building2,
  RefreshCw
} from 'lucide-react';
import { ReservationBreakdownDropdown } from '../Procurement/ReservationBreakdownDropdown';
import { getMondayToSaturdayWeeks } from '../../utils/dateCalendarUtils';

export interface ProductionCriticalRow {
  componentCode: string;
  componentDescription: string;
  category: 'RM' | 'PM';
  uom: string;
  openingStock: number;
  reservedForOtherFGs: number;
  effectiveAvailableStock: number;
  activeReservations: RMReservationItem[];
  totalMonthDemand: number;
  inwardReceivedSAP: number;
  openETASchedules: number;
  netShortageQty: number;
  earliestShortageWeek: 1 | 2 | 3 | 4 | 'None';
  fgImpactQty: number; // Total FG units blocked by this component
  impactedFGs: {
    fgCode: string;
    fgDescription: string;
    qtyPerFG: number;
    miniFactory?: string;
    line?: string;
    customerName?: string;
    fgDemand: number;
    shortageImpact: number;
  }[];
  primaryVendor: string;
  leadTimeDays: number;
  status: 'CRITICAL' | 'WARNING';
}

interface ProductionCriticalReportProps {
  consolidatedData: RMWeeklyConsolidatedData[];
  fgCoverageReports: FGCoverageReportItem[];
  inventory: InventoryItem[];
  boms: BOMItem[];
  demands: DemandItem[];
  schedules: DeliveryScheduleItem[];
  sapInwards: SAPInwardItem[];
  reservations?: RMReservationItem[];
  asOnDate?: string;
  onAddSchedule?: (schedule: DeliveryScheduleItem) => void;
  onManageReservations?: () => void;
}

export const ProductionCriticalReport: React.FC<ProductionCriticalReportProps> = ({
  consolidatedData,
  fgCoverageReports,
  inventory,
  boms,
  demands,
  schedules,
  sapInwards,
  reservations = [],
  asOnDate = '2026-08-19',
  onAddSchedule,
  onManageReservations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RM' | 'PM'>('ALL');
  const [weekFilter, setWeekFilter] = useState<'ALL' | '1' | '2' | '3' | '4'>('ALL');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Quick Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCompForSchedule, setSelectedCompForSchedule] = useState<ProductionCriticalRow | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    qty: 1000,
    vendor: '',
    week: 1 as 1 | 2 | 3 | 4,
    eta: '2026-08-21',
    poNumber: ''
  });

  const weekCalendar = useMemo(() => getMondayToSaturdayWeeks(asOnDate), [asOnDate]);

  // Aggregate critical component items across consolidated procurement and FG coverage
  const criticalRows: ProductionCriticalRow[] = useMemo(() => {
    const rows: ProductionCriticalRow[] = [];

    // Map through consolidated materials that have shortages or critical bottlenecks
    consolidatedData.forEach((rm) => {
      // Find all weeks with shortage or negative variance
      const hasShortage = rm.overallStatus === 'SHORTAGE' || rm.weeks.some((w) => w.status === 'SHORTAGE' || w.variance < 0);
      
      if (hasShortage) {
        // Find earliest shortage week
        const firstShortWeekObj = rm.weeks.find((w) => w.status === 'SHORTAGE' || w.variance < 0);
        const earliestWeek = (firstShortWeekObj?.week || 1) as 1 | 2 | 3 | 4;

        // Sum net shortage
        const totalNetShortage = rm.weeks.reduce((acc, w) => {
          if (w.variance < 0) return acc + Math.abs(w.variance);
          return acc;
        }, 0) || Math.max(0, rm.totalMonthEffectiveRequirement - (rm.effectiveAvailableStock + rm.totalMonthActualReceipt + rm.totalMonthETASchedule));

        // Find impacted FGs from FG coverage report or BOM mappings
        const impactedFGsList: ProductionCriticalRow['impactedFGs'] = [];
        let totalFGImpactUnits = 0;

        rm.usedInFGs.forEach((fgUsage) => {
          const fgReport = fgCoverageReports.find((f) => f.fgCode === fgUsage.fgCode);
          const fgDemandItem = demands.find((d) => d.fgCode === fgUsage.fgCode);
          
          const qtyPerFG = fgUsage.qtyPerFG || 1;
          const fgDemand = fgDemandItem?.monthlyDemand || fgUsage.totalMonthReq / qtyPerFG || 0;
          
          // Calculate how many FG units are halted by this material's shortage
          const fgImpactUnits = qtyPerFG > 0 ? Math.round(totalNetShortage / qtyPerFG) : 0;
          totalFGImpactUnits += fgImpactUnits;

          impactedFGsList.push({
            fgCode: fgUsage.fgCode,
            fgDescription: fgUsage.fgDescription,
            qtyPerFG: qtyPerFG,
            miniFactory: fgUsage.miniFactory || fgDemandItem?.miniFactory,
            line: fgUsage.line || fgDemandItem?.line,
            customerName: fgUsage.customerName || fgDemandItem?.customerName || 'Standard Production',
            fgDemand: fgDemand,
            shortageImpact: Math.min(fgDemand, fgImpactUnits)
          });
        });

        // Sum open scheduled inbound
        const openETA = schedules
          .filter((s) => s.materialCode === rm.materialCode && s.delivered === 'N')
          .reduce((sum, s) => sum + Number(s.qty), 0);

        // Sum SAP inward actuals
        const totalInward = sapInwards
          .filter((s) => s.materialCode === rm.materialCode)
          .reduce((sum, s) => sum + Number(s.qty), 0);

        rows.push({
          componentCode: rm.materialCode,
          componentDescription: rm.materialDescription,
          category: rm.category,
          uom: rm.uom,
          openingStock: rm.currentWarehouseStock,
          reservedForOtherFGs: rm.totalReservedForOtherFGs,
          effectiveAvailableStock: rm.effectiveAvailableStock,
          activeReservations: rm.activeReservationsList || [],
          totalMonthDemand: rm.totalMonthGrossDemand,
          inwardReceivedSAP: totalInward || rm.totalMonthActualReceipt,
          openETASchedules: openETA || rm.totalMonthETASchedule,
          netShortageQty: totalNetShortage > 0 ? totalNetShortage : Math.abs(rm.weeks[0]?.variance || 100),
          earliestShortageWeek: earliestWeek,
          fgImpactQty: totalFGImpactUnits,
          impactedFGs: impactedFGsList,
          primaryVendor: rm.primaryVendor || 'Vendor Not Assigned',
          leadTimeDays: rm.leadTimeDays || 7,
          status: 'CRITICAL'
        });
      }
    });

    return rows;
  }, [consolidatedData, fgCoverageReports, inventory, demands, schedules, sapInwards]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return criticalRows.filter((row) => {
      if (categoryFilter !== 'ALL' && row.category !== categoryFilter) return false;
      if (weekFilter !== 'ALL' && String(row.earliestShortageWeek) !== weekFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = row.componentCode.toLowerCase().includes(query);
        const matchesDesc = row.componentDescription.toLowerCase().includes(query);
        const matchesVendor = row.primaryVendor.toLowerCase().includes(query);
        const matchesFG = row.impactedFGs.some(
          (fg) =>
            fg.fgCode.toLowerCase().includes(query) ||
            fg.fgDescription.toLowerCase().includes(query) ||
            (fg.customerName && fg.customerName.toLowerCase().includes(query)) ||
            (fg.line && fg.line.toLowerCase().includes(query))
        );
        if (!matchesCode && !matchesDesc && !matchesVendor && !matchesFG) return false;
      }
      return true;
    });
  }, [criticalRows, categoryFilter, weekFilter, searchTerm]);

  // Summary Metrics
  const totalCriticalMaterials = filteredRows.length;
  const totalImpactedFGs = useMemo(() => {
    const fgSet = new Set<string>();
    filteredRows.forEach((r) => r.impactedFGs.forEach((fg) => fgSet.add(fg.fgCode)));
    return fgSet.size;
  }, [filteredRows]);
  
  const totalProductionUnitsBlocked = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + r.fgImpactQty, 0);
  }, [filteredRows]);

  const week1CriticalCount = useMemo(() => {
    return filteredRows.filter((r) => r.earliestShortageWeek === 1).length;
  }, [filteredRows]);

  const toggleRow = (code: string) => {
    setExpandedRows((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const handleOpenScheduleModal = (row: ProductionCriticalRow) => {
    setSelectedCompForSchedule(row);
    setScheduleForm({
      qty: Math.max(500, row.netShortageQty),
      vendor: row.primaryVendor,
      week: row.earliestShortageWeek !== 'None' ? row.earliestShortageWeek : 1,
      eta: '2026-08-21',
      poNumber: `PO-CRIT-${Math.floor(10000 + Math.random() * 90000)}`
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompForSchedule || !onAddSchedule) return;

    const newSchedule: DeliveryScheduleItem = {
      id: `sched-crit-${Date.now()}`,
      materialCode: selectedCompForSchedule.componentCode,
      description: selectedCompForSchedule.componentDescription,
      qty: Number(scheduleForm.qty),
      unit: selectedCompForSchedule.uom,
      vendor: scheduleForm.vendor || selectedCompForSchedule.primaryVendor,
      etd: '2026-08-15',
      eta: scheduleForm.eta,
      week: scheduleForm.week,
      delivered: 'N',
      poNumber: scheduleForm.poNumber,
      lastReason: 'Expedited for Production Critical Bottleneck Shortage',
      lastModified: new Date().toISOString()
    };

    onAddSchedule(newSchedule);
    setIsScheduleModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Component Code',
      'Description',
      'Category',
      'UOM',
      'Opening Warehouse Stock',
      'Reserved for Other FGs',
      'Effective Available Stock',
      'Total Demand',
      'SAP Inward Received',
      'Open ETA Pipeline',
      'Net Shortage Qty',
      'Earliest Shortage Week',
      'FG Impact Units Blocked',
      'Impacted Finished Goods',
      'Primary Vendor'
    ];

    const rows = filteredRows.map((r) => [
      r.componentCode,
      `"${r.componentDescription}"`,
      r.category,
      r.uom,
      r.openingStock,
      r.reservedForOtherFGs,
      r.effectiveAvailableStock,
      r.totalMonthDemand,
      r.inwardReceivedSAP,
      r.openETASchedules,
      r.netShortageQty,
      `Week ${r.earliestShortageWeek}`,
      r.fgImpactQty,
      `"${r.impactedFGs.map((f) => `${f.fgCode} (${f.line || ''})`).join('; ')}"`,
      `"${r.primaryVendor}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Production_Critical_Report_${asOnDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Top Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Production Critical Components Report</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[11px] font-black rounded border border-red-200">
                  {filteredRows.length} Bottlenecks
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tabular audit of materials causing immediate or projected production line stoppages (As-on-Date: {asOnDate}).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onManageReservations && (
            <button
              onClick={onManageReservations}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Material Reservations</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-50/80 border border-red-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Critical RM/PM Items</div>
          <div className="text-2xl font-black text-red-950 mt-0.5">{totalCriticalMaterials}</div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">Materials in direct shortage</div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Impacted Finished Goods</div>
          <div className="text-2xl font-black text-amber-950 mt-0.5">{totalImpactedFGs} FGs</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Affected assembly lines</div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Immediate W1 Shortages</div>
          <div className="text-2xl font-black text-rose-950 mt-0.5">{week1CriticalCount}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">Requires instant expediting</div>
        </div>

        <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Blocked FG Production Units</div>
          <div className="text-2xl font-black text-blue-950 mt-0.5">{totalProductionUnitsBlocked.toLocaleString()}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Total units at risk</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by component code, description, vendor, or finished good..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryFilter('RM')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                categoryFilter === 'RM' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Material (RM)
            </button>
            <button
              onClick={() => setCategoryFilter('PM')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                categoryFilter === 'PM' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Packaging (PM)
            </button>
          </div>

          {/* Week Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-600">Shortage Week:</span>
            <select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Weeks</option>
              <option value="1">Week 1 (Current)</option>
              <option value="2">Week 2</option>
              <option value="3">Week 3</option>
              <option value="4">Week 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tabular Production Critical Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase tracking-wide border-b border-slate-200">
              <tr>
                <th className="p-3 pl-4 w-10 text-center">Drill</th>
                <th className="p-3 w-14 text-center">Cat</th>
                <th className="p-3">Component / Material</th>
                <th className="p-3">Impacted Finished Goods (FGs)</th>
                <th className="p-3 text-right">Physical Stock</th>
                <th className="p-3 text-right bg-amber-50/60 font-semibold text-amber-950">Reserved (Other FGs)</th>
                <th className="p-3 text-right bg-emerald-50/60 font-bold text-emerald-950">Effective Avail</th>
                <th className="p-3 text-right text-blue-800">Inbound Pipeline</th>
                <th className="p-3 text-right bg-red-100/70 font-black text-red-950">Net Shortage</th>
                <th className="p-3 text-center">Shortage Week</th>
                <th className="p-3 text-right">FG Units Blocked</th>
                <th className="p-3">Primary Vendor</th>
                <th className="p-3 text-center pr-4">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center bg-white text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-bold text-slate-800">No Production Critical Bottlenecks Found</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      All material requirements are fully covered by current stock, receipts, or schedules for the selected filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isExpanded = !!expandedRows[row.componentCode];

                  return (
                    <React.Fragment key={row.componentCode}>
                      <tr
                        onClick={() => toggleRow(row.componentCode)}
                        className={`transition cursor-pointer hover:bg-slate-50/80 ${
                          isExpanded ? 'bg-blue-50/40' : 'bg-red-50/20'
                        }`}
                      >
                        {/* Expand Icon */}
                        <td className="p-3 pl-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(row.componentCode);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-blue-600 font-bold" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </td>

                        {/* Category */}
                        <td className="p-3 text-center">
                          <span
                            className={`font-black px-2 py-0.5 rounded text-[11px] inline-block ${
                              row.category === 'RM'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-purple-100 text-purple-900 border border-purple-300'
                            }`}
                          >
                            {row.category}
                          </span>
                        </td>

                        {/* Component Code & Description */}
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900 text-sm">{row.componentCode}</div>
                          <div className="text-xs text-slate-700 font-medium line-clamp-1">{row.componentDescription}</div>
                        </td>

                        {/* Impacted Finished Goods Pill List */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            {row.impactedFGs.map((fg) => (
                              <span
                                key={fg.fgCode}
                                className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[10px] font-extrabold flex items-center gap-1"
                                title={`${fg.fgDescription} • Demand: ${fg.fgDemand.toLocaleString()}`}
                              >
                                <Factory className="w-2.5 h-2.5 text-blue-600" />
                                <span>{fg.fgCode}</span>
                              </span>
                            ))}
                            {row.impactedFGs.length > 2 && (
                              <span className="text-[10px] text-slate-500 font-bold">
                                ({row.impactedFGs.length} FGs)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Opening Stock */}
                        <td className="p-3 text-right font-black text-slate-900">
                          {row.openingStock.toLocaleString()} {row.uom}
                        </td>

                        {/* Reserved for Other FGs */}
                        <td className="p-3 text-right bg-amber-50/30">
                          <div className="flex justify-end">
                            <ReservationBreakdownDropdown
                              materialCode={row.componentCode}
                              uom={row.uom}
                              reservedQty={row.reservedForOtherFGs}
                              reservations={row.activeReservations}
                            />
                          </div>
                        </td>

                        {/* Effective Available Stock */}
                        <td className="p-3 text-right font-black text-emerald-950 bg-emerald-50/30">
                          {row.effectiveAvailableStock.toLocaleString()} {row.uom}
                        </td>

                        {/* Inbound Pipeline */}
                        <td className="p-3 text-right font-bold text-blue-800">
                          +{(row.inwardReceivedSAP + row.openETASchedules).toLocaleString()} {row.uom}
                          <div className="text-[10px] text-slate-500 font-normal">
                            (SAP: {row.inwardReceivedSAP.toLocaleString()} | ETA: {row.openETASchedules.toLocaleString()})
                          </div>
                        </td>

                        {/* Net Shortage */}
                        <td className="p-3 text-right font-black text-red-700 bg-red-100/40 text-sm">
                          -{row.netShortageQty.toLocaleString()} {row.uom}
                        </td>

                        {/* Shortage Week */}
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-red-600 text-white rounded font-black text-xs inline-block">
                            W{row.earliestShortageWeek}
                          </span>
                        </td>

                        {/* FG Units Blocked */}
                        <td className="p-3 text-right font-black text-rose-900 text-sm">
                          {row.fgImpactQty.toLocaleString()} units
                        </td>

                        {/* Vendor */}
                        <td className="p-3">
                          <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]" title={row.primaryVendor}>
                            {row.primaryVendor}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Lead Time: {row.leadTimeDays} days
                          </div>
                        </td>

                        {/* Quick Action Button */}
                        <td className="p-3 text-center pr-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenScheduleModal(row);
                            }}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ ETA Schedule</span>
                          </button>
                        </td>
                      </tr>

                      {/* Drill-down Sub-Row with Detailed FG Impact Matrix */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-slate-200">
                          <td colSpan={13} className="p-3.5 pl-10">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                                  <Factory className="w-4 h-4 text-blue-600" />
                                  <span>Finished Goods (FG) Breakdown for Component {row.componentCode}</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-500">
                                  Total Consuming FGs: {row.impactedFGs.length}
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg">
                                  <thead className="bg-slate-100 text-slate-800 font-extrabold text-[11px] border-b border-slate-200">
                                    <tr>
                                      <th className="p-2 pl-3">FG Code & Description</th>
                                      <th className="p-2">Line / Factory</th>
                                      <th className="p-2">Customer / Order</th>
                                      <th className="p-2 text-right">BOM Qty per FG</th>
                                      <th className="p-2 text-right">FG Monthly Demand</th>
                                      <th className="p-2 text-right text-red-700">Production Units Blocked</th>
                                      <th className="p-2 text-center">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {row.impactedFGs.map((fg) => (
                                      <tr key={fg.fgCode} className="hover:bg-slate-50">
                                        <td className="p-2 pl-3 font-bold text-slate-900">
                                          {fg.fgCode} - {fg.fgDescription}
                                        </td>
                                        <td className="p-2">
                                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-200 rounded text-[10px] font-bold">
                                            {fg.miniFactory ? `${fg.miniFactory} / ` : ''}{fg.line || 'Standard Line'}
                                          </span>
                                        </td>
                                        <td className="p-2 text-slate-700 font-medium">
                                          {fg.customerName || 'General Production'}
                                        </td>
                                        <td className="p-2 text-right font-bold text-slate-800">
                                          {fg.qtyPerFG} {row.uom}
                                        </td>
                                        <td className="p-2 text-right font-black text-slate-900">
                                          {fg.fgDemand.toLocaleString()} units
                                        </td>
                                        <td className="p-2 text-right font-black text-red-700">
                                          -{fg.shortageImpact.toLocaleString()} units
                                        </td>
                                        <td className="p-2 text-center">
                                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-extrabold rounded">
                                            HALTED
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
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

      {/* Quick Add Delivery Schedule Modal */}
      {isScheduleModalOpen && selectedCompForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Expedite Critical Schedule for {selectedCompForSchedule.componentCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity ({selectedCompForSchedule.uom})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={scheduleForm.qty}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, qty: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Week</label>
                  <select
                    value={scheduleForm.week}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, week: Number(e.target.value) as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value={1}>Week 1 (Mon 03 Aug - Sat 08 Aug)</option>
                    <option value={2}>Week 2 (Mon 10 Aug - Sat 15 Aug)</option>
                    <option value={3}>Week 3 (Mon 17 Aug - Sat 22 Aug)</option>
                    <option value={4}>Week 4 (Mon 24 Aug - Sat 29 Aug)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ETA Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.eta}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, eta: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.vendor}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, vendor: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PO / Expedite Tracking Number</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.poNumber}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, poNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Confirm Delivery Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
