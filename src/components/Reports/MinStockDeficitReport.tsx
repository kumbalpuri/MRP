import React, { useState, useMemo } from 'react';
import {
  InventoryItem,
  DeliveryScheduleItem,
  RMReservationItem,
  BOMItem,
  SAPInwardItem
} from '../../types';
import {
  AlertTriangle,
  ShieldCheck,
  Search,
  Download,
  Truck,
  PlusCircle,
  Package,
  Layers,
  Building2,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { ReservationBreakdownDropdown } from '../Procurement/ReservationBreakdownDropdown';

export interface MinStockDeficitRow {
  id: string;
  materialNumber: string;
  materialDescription: string;
  plant: string;
  sloc: string;
  category: 'RM' | 'PM' | 'FG';
  bun: string;
  unrestrictedStock: number;
  reservedForOtherFGs: number;
  effectiveAvailableStock: number;
  activeReservations: RMReservationItem[];
  safetyStock: number;
  stockDeficit: number; // Safety Stock - Effective Stock (positive number when below min)
  stockHealthPercent: number; // (Effective / Safety Stock) * 100
  inQualityInsp: number;
  blockedStock: number;
  inboundPipeline: number;
  projectedPosition: number; // (Effective Stock + Inbound) - Safety Stock
  recommendedReorderQty: number;
  primaryVendor: string;
  leadTimeDays: number;
  severity: 'STOCKOUT' | 'SEVERE' | 'MODERATE' | 'HEALTHY';
}

interface MinStockDeficitReportProps {
  inventory: InventoryItem[];
  boms: BOMItem[];
  schedules: DeliveryScheduleItem[];
  sapInwards?: SAPInwardItem[];
  reservations?: RMReservationItem[];
  asOnDate?: string;
  onAddSchedule?: (schedule: DeliveryScheduleItem) => void;
  onUpdateInventory?: (inventory: InventoryItem[]) => void;
  onManageReservations?: () => void;
}

export const MinStockDeficitReport: React.FC<MinStockDeficitReportProps> = ({
  inventory,
  boms,
  schedules,
  sapInwards = [],
  reservations = [],
  asOnDate = '2026-08-19',
  onAddSchedule,
  onUpdateInventory,
  onManageReservations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RM' | 'PM' | 'FG'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'BELOW_MIN' | 'STOCKOUT' | 'SEVERE' | 'MODERATE'>('BELOW_MIN');
  const [editingSafetyStockId, setEditingSafetyStockId] = useState<string | null>(null);
  const [newSafetyStockVal, setNewSafetyStockVal] = useState<number>(0);

  // Quick Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedItemForSchedule, setSelectedItemForSchedule] = useState<MinStockDeficitRow | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    qty: 1000,
    vendor: '',
    week: 1 as 1 | 2 | 3 | 4,
    eta: '2026-08-21',
    poNumber: ''
  });

  // Calculate stock less than minimum stock records
  const deficitRows: MinStockDeficitRow[] = useMemo(() => {
    return inventory.map((inv) => {
      // Find category from BOM or material code prefix
      let category: 'RM' | 'PM' | 'FG' = 'RM';
      const bomComp = boms.find((b) => b.componentCode === inv.materialNumber);
      if (bomComp?.category) {
        category = bomComp.category;
      } else if (inv.materialNumber.startsWith('PM-') || inv.sloc.toLowerCase().includes('pack')) {
        category = 'PM';
      } else if (inv.materialNumber.startsWith('FG-') || inv.sloc.toLowerCase().includes('fg')) {
        category = 'FG';
      }

      // Active reservations for this material (As on date onwards)
      const activeRes = reservations.filter(
        (r) => r.componentCode === inv.materialNumber && r.status === 'ACTIVE'
      );
      const totalReserved = activeRes.reduce((sum, r) => sum + r.reservedQty, 0);

      // Effective Available Stock
      const effectiveStock = Math.max(0, inv.unrestricted - totalReserved);
      const safetyStock = inv.safetyStock ?? 0;

      // Deficit below minimum stock
      const stockDeficit = Math.max(0, safetyStock - effectiveStock);
      const stockHealthPercent = safetyStock > 0 ? Math.round((effectiveStock / safetyStock) * 100) : 100;

      // Inbound open schedules
      const inbound = schedules
        .filter((s) => s.materialCode === inv.materialNumber && s.delivered === 'N')
        .reduce((sum, s) => sum + Number(s.qty), 0);

      // Net Projected Position
      const projectedPosition = effectiveStock + inbound - safetyStock;

      // Recommended Reorder Qty (Replenish back to 1.5x safety stock buffer)
      const recommendedReorderQty = stockDeficit > 0 ? Math.max(stockDeficit, Math.round(safetyStock * 1.25) - (effectiveStock + inbound)) : 0;

      // Determine Severity
      let severity: MinStockDeficitRow['severity'] = 'HEALTHY';
      if (effectiveStock === 0 && safetyStock > 0) {
        severity = 'STOCKOUT';
      } else if (stockHealthPercent < 50 && stockDeficit > 0) {
        severity = 'SEVERE';
      } else if (stockDeficit > 0) {
        severity = 'MODERATE';
      }

      // Infer Vendor
      const scheduleVendor = schedules.find((s) => s.materialCode === inv.materialNumber)?.vendor;
      const defaultVendor = category === 'RM' ? 'Global Chemicals & Raw Supplies Ltd' : category === 'PM' ? 'Apex Packaging Solutions Ltd' : 'Internal Manufacturing';

      return {
        id: inv.id,
        materialNumber: inv.materialNumber,
        materialDescription: inv.materialDescription,
        plant: inv.plant,
        sloc: inv.sloc,
        category,
        bun: inv.bun,
        unrestrictedStock: inv.unrestricted,
        reservedForOtherFGs: totalReserved,
        effectiveAvailableStock: effectiveStock,
        activeReservations: activeRes,
        safetyStock,
        stockDeficit,
        stockHealthPercent,
        inQualityInsp: inv.inQualityInsp || 0,
        blockedStock: inv.blocked || 0,
        inboundPipeline: inbound,
        projectedPosition,
        recommendedReorderQty: Math.max(0, recommendedReorderQty),
        primaryVendor: scheduleVendor || defaultVendor,
        leadTimeDays: category === 'RM' ? 10 : 7,
        severity
      };
    });
  }, [inventory, boms, schedules, reservations]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return deficitRows.filter((row) => {
      // Default or custom severity filter
      if (severityFilter === 'BELOW_MIN' && row.stockDeficit <= 0) return false;
      if (severityFilter === 'STOCKOUT' && row.severity !== 'STOCKOUT') return false;
      if (severityFilter === 'SEVERE' && row.severity !== 'SEVERE') return false;
      if (severityFilter === 'MODERATE' && row.severity !== 'MODERATE') return false;

      // Category filter
      if (categoryFilter !== 'ALL' && row.category !== categoryFilter) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesCode = row.materialNumber.toLowerCase().includes(q);
        const matchesDesc = row.materialDescription.toLowerCase().includes(q);
        const matchesSloc = row.sloc.toLowerCase().includes(q);
        const matchesVendor = row.primaryVendor.toLowerCase().includes(q);
        if (!matchesCode && !matchesDesc && !matchesSloc && !matchesVendor) return false;
      }

      return true;
    });
  }, [deficitRows, severityFilter, categoryFilter, searchTerm]);

  // Metrics
  const totalItemsBelowMin = useMemo(() => deficitRows.filter((r) => r.stockDeficit > 0).length, [deficitRows]);
  const stockoutItemsCount = useMemo(() => deficitRows.filter((r) => r.severity === 'STOCKOUT').length, [deficitRows]);
  const severeItemsCount = useMemo(() => deficitRows.filter((r) => r.severity === 'SEVERE').length, [deficitRows]);
  const totalDeficitUnits = useMemo(() => deficitRows.reduce((sum, r) => sum + r.stockDeficit, 0), [deficitRows]);

  // Handle Safety Stock Save
  const handleSaveSafetyStock = (item: MinStockDeficitRow) => {
    if (!onUpdateInventory) return;
    const updated = inventory.map((inv) => (inv.id === item.id ? { ...inv, safetyStock: newSafetyStockVal } : inv));
    onUpdateInventory(updated);
    setEditingSafetyStockId(null);
  };

  const handleOpenScheduleModal = (item: MinStockDeficitRow) => {
    setSelectedItemForSchedule(item);
    setScheduleForm({
      qty: item.recommendedReorderQty > 0 ? item.recommendedReorderQty : Math.max(500, item.safetyStock),
      vendor: item.primaryVendor,
      week: 1,
      eta: '2026-08-21',
      poNumber: `PO-MIN-${Math.floor(10000 + Math.random() * 90000)}`
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForSchedule || !onAddSchedule) return;

    const newSchedule: DeliveryScheduleItem = {
      id: `sched-min-${Date.now()}`,
      materialCode: selectedItemForSchedule.materialNumber,
      description: selectedItemForSchedule.materialDescription,
      qty: Number(scheduleForm.qty),
      unit: selectedItemForSchedule.bun,
      vendor: scheduleForm.vendor || selectedItemForSchedule.primaryVendor,
      etd: '2026-08-15',
      eta: scheduleForm.eta,
      week: scheduleForm.week,
      delivered: 'N',
      poNumber: scheduleForm.poNumber,
      lastReason: 'Replenishment for Stock Less Than Minimum Safety Stock Threshold',
      lastModified: new Date().toISOString()
    };

    onAddSchedule(newSchedule);
    setIsScheduleModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Material Number',
      'Description',
      'Plant',
      'Storage Location',
      'Category',
      'UOM',
      'Unrestricted Warehouse Stock',
      'Reserved for Other FGs',
      'Effective Available Stock',
      'Minimum Safety Stock',
      'Deficit Below Minimum',
      'Coverage %',
      'Quality Inspection Stock',
      'Inbound Pipeline (PO Schedules)',
      'Net Projected Position',
      'Recommended Reorder Qty',
      'Primary Vendor'
    ];

    const rows = filteredRows.map((r) => [
      r.materialNumber,
      `"${r.materialDescription}"`,
      r.plant,
      r.sloc,
      r.category,
      r.bun,
      r.unrestrictedStock,
      r.reservedForOtherFGs,
      r.effectiveAvailableStock,
      r.safetyStock,
      r.stockDeficit,
      `${r.stockHealthPercent}%`,
      r.inQualityInsp,
      r.inboundPipeline,
      r.projectedPosition,
      r.recommendedReorderQty,
      `"${r.primaryVendor}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Less_Than_Minimum_Stock_Report_${asOnDate}.csv`);
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
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Stock Less Than Minimum Stock (Safety Stock Deficit)</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-black rounded border border-amber-300">
                  {filteredRows.length} Items Below Min
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lean tabular inventory audit of materials where effective usable stock has breached the required minimum buffer.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
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
        <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Total Below Min Stock</div>
          <div className="text-2xl font-black text-amber-950 mt-0.5">{totalItemsBelowMin}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Materials needing replenishment</div>
        </div>

        <div className="bg-red-50/80 border border-red-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Zero Stock (Stockouts)</div>
          <div className="text-2xl font-black text-red-950 mt-0.5">{stockoutItemsCount}</div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">Critical 0 usable stock</div>
        </div>

        <div className="bg-orange-50/80 border border-orange-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Severe Deficits (&lt;50%)</div>
          <div className="text-2xl font-black text-orange-950 mt-0.5">{severeItemsCount}</div>
          <div className="text-[11px] text-orange-700 font-medium mt-0.5">Less than half safety buffer</div>
        </div>

        <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl shadow-2xs">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Total Deficit Shortfall</div>
          <div className="text-2xl font-black text-blue-950 mt-0.5">{totalDeficitUnits.toLocaleString()}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Cumulative units below safety stock</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search material number, description, storage location, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity View Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSeverityFilter('BELOW_MIN')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                severityFilter === 'BELOW_MIN'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Below Min ({totalItemsBelowMin})
            </button>
            <button
              onClick={() => setSeverityFilter('STOCKOUT')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                severityFilter === 'STOCKOUT'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stockouts ({stockoutItemsCount})
            </button>
            <button
              onClick={() => setSeverityFilter('SEVERE')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                severityFilter === 'SEVERE'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Severe &lt;50% ({severeItemsCount})
            </button>
            <button
              onClick={() => setSeverityFilter('ALL')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                severityFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Show All Inventory
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
            <span className="font-bold text-slate-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Categories</option>
              <option value="RM">Raw Materials (RM)</option>
              <option value="PM">Packaging (PM)</option>
              <option value="FG">Finished Goods (FG)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tabular Min Stock Deficit Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase tracking-wide border-b border-slate-200">
              <tr>
                <th className="p-3 pl-4 w-12 text-center">Cat</th>
                <th className="p-3">Material Number & Description</th>
                <th className="p-3">Plant / Sloc</th>
                <th className="p-3 text-right">Physical Stock</th>
                <th className="p-3 text-right bg-amber-50/60 font-semibold text-amber-950">Reserved (FGs)</th>
                <th className="p-3 text-right bg-emerald-50/60 font-bold text-emerald-950">Effective Stock</th>
                <th className="p-3 text-right bg-slate-200/80 font-black text-slate-900">Minimum Stock</th>
                <th className="p-3 text-right bg-red-100/80 font-black text-red-950">Deficit Below Min</th>
                <th className="p-3 text-center">Min Stock Health</th>
                <th className="p-3 text-right text-blue-800">Inbound Pipeline</th>
                <th className="p-3 text-right">Projected Position</th>
                <th className="p-3 text-right bg-blue-50/60 font-bold text-blue-900">Reorder Suggested</th>
                <th className="p-3 text-center pr-4">Quick PO Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center bg-white text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-bold text-slate-800">All Materials Above Minimum Stock</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      No materials are below their designated safety stock threshold for the active filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isBelowMin = row.stockDeficit > 0;
                  const isStockout = row.severity === 'STOCKOUT';
                  const isSevere = row.severity === 'SEVERE';

                  return (
                    <tr
                      key={row.id}
                      className={`transition hover:bg-slate-50 ${
                        isStockout
                          ? 'bg-red-50/50'
                          : isSevere
                          ? 'bg-orange-50/30'
                          : isBelowMin
                          ? 'bg-amber-50/20'
                          : 'bg-white'
                      }`}
                    >
                      {/* Category Badge */}
                      <td className="p-3 pl-4 text-center">
                        <span
                          className={`font-black px-2 py-0.5 rounded text-[11px] inline-block ${
                            row.category === 'RM'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : row.category === 'PM'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {row.category}
                        </span>
                      </td>

                      {/* Material Number & Description */}
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 text-sm">{row.materialNumber}</div>
                        <div className="text-xs text-slate-700 font-medium line-clamp-1">{row.materialDescription}</div>
                      </td>

                      {/* Plant / Sloc */}
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{row.plant}</div>
                        <div className="text-[11px] text-slate-500">{row.sloc}</div>
                      </td>

                      {/* Physical Stock */}
                      <td className="p-3 text-right font-black text-slate-900">
                        {row.unrestrictedStock.toLocaleString()} {row.bun}
                      </td>

                      {/* Reserved for other FGs */}
                      <td className="p-3 text-right bg-amber-50/30">
                        <div className="flex justify-end">
                          <ReservationBreakdownDropdown
                            materialCode={row.materialNumber}
                            uom={row.bun}
                            reservedQty={row.reservedForOtherFGs}
                            reservations={row.activeReservations}
                          />
                        </div>
                      </td>

                      {/* Effective Available Stock */}
                      <td className="p-3 text-right font-black text-emerald-950 bg-emerald-50/30 text-sm">
                        {row.effectiveAvailableStock.toLocaleString()} {row.bun}
                      </td>

                      {/* Safety Stock / Minimum Stock */}
                      <td className="p-3 text-right font-black text-slate-900 bg-slate-100/70">
                        {editingSafetyStockId === row.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              value={newSafetyStockVal}
                              onChange={(e) => setNewSafetyStockVal(Number(e.target.value))}
                              className="w-20 p-1 border border-blue-500 rounded text-xs text-right font-bold"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSafetyStock(row)}
                              className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingSafetyStockId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingSafetyStockId(row.id);
                              setNewSafetyStockVal(row.safetyStock);
                            }}
                            className="cursor-pointer hover:underline flex items-center justify-end gap-1"
                            title="Click to edit minimum stock threshold"
                          >
                            <span>{row.safetyStock.toLocaleString()} {row.bun}</span>
                          </div>
                        )}
                      </td>

                      {/* Deficit Below Min Stock */}
                      <td className="p-3 text-right font-black text-sm bg-red-100/40">
                        {row.stockDeficit > 0 ? (
                          <span className="text-red-700">
                            -{row.stockDeficit.toLocaleString()} {row.bun}
                          </span>
                        ) : (
                          <span className="text-emerald-700">OK (+{(row.effectiveAvailableStock - row.safetyStock).toLocaleString()})</span>
                        )}
                      </td>

                      {/* Min Stock Health Bar & Badge */}
                      <td className="p-3 text-center">
                        <div className="w-24 mx-auto space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-extrabold">
                            <span
                              className={
                                isStockout
                                  ? 'text-red-700'
                                  : isSevere
                                  ? 'text-orange-700'
                                  : isBelowMin
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }
                            >
                              {row.stockHealthPercent}%
                            </span>
                            <span className="text-slate-400">
                              {isStockout ? 'OUT' : isSevere ? 'CRIT' : isBelowMin ? 'LOW' : 'SAFE'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isStockout
                                  ? 'bg-red-600 w-1'
                                  : isSevere
                                  ? 'bg-orange-600'
                                  : isBelowMin
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, row.stockHealthPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Inbound Pipeline */}
                      <td className="p-3 text-right font-bold text-blue-800">
                        {row.inboundPipeline > 0 ? (
                          <span>+{row.inboundPipeline.toLocaleString()} {row.bun}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                        {row.inQualityInsp > 0 && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            (+{row.inQualityInsp.toLocaleString()} in QA)
                          </div>
                        )}
                      </td>

                      {/* Projected Position */}
                      <td className="p-3 text-right font-black">
                        {row.projectedPosition < 0 ? (
                          <span className="text-red-700">
                            {row.projectedPosition.toLocaleString()} {row.bun}
                          </span>
                        ) : (
                          <span className="text-emerald-700">
                            +{row.projectedPosition.toLocaleString()} {row.bun}
                          </span>
                        )}
                      </td>

                      {/* Recommended Reorder Quantity */}
                      <td className="p-3 text-right font-black text-blue-900 bg-blue-50/40 text-sm">
                        {row.recommendedReorderQty > 0 ? (
                          <span>{row.recommendedReorderQty.toLocaleString()} {row.bun}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">None</span>
                        )}
                      </td>

                      {/* Quick PO Action */}
                      <td className="p-3 text-center pr-4">
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(row)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ PO Schedule</span>
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

      {/* Quick Add PO Schedule Modal */}
      {isScheduleModalOpen && selectedItemForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Create Replenishment PO for {selectedItemForSchedule.materialNumber}
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
                  Quantity to Reorder ({selectedItemForSchedule.bun})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={scheduleForm.qty}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, qty: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  Safety Stock Minimum: {selectedItemForSchedule.safetyStock.toLocaleString()} • Deficit: {selectedItemForSchedule.stockDeficit.toLocaleString()} {selectedItemForSchedule.bun}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Delivery Week</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.vendor}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, vendor: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PO / Purchase Reference</label>
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
                  <span>Create Delivery Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
