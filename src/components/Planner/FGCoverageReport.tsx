import React, { useState } from 'react';
import {
  FGCoverageReportItem,
  FGBottleneckComponent,
  BOMItem,
  InventoryItem,
  DeliveryScheduleItem,
  DemandItem
} from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Calendar,
  Truck,
  Building2,
  Hash,
  Check,
  X,
  Clock,
  ArrowRight,
  Tag,
  CheckSquare,
  Square,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sidebar,
  Factory,
  GitFork,
  Lock,
  Plus,
  Minus,
  Edit3,
  CalendarRange,
  ShieldAlert
} from 'lucide-react';
import { ReservationBreakdownDropdown } from '../Procurement/ReservationBreakdownDropdown';

interface FGCoverageReportProps {
  fgReports: FGCoverageReportItem[];
  boms: BOMItem[];
  inventory: InventoryItem[];
  schedules: DeliveryScheduleItem[];
  demands?: DemandItem[];
  selectedMonth?: string; // e.g. '2026-07'
  isPurchaseRole?: boolean;
  onAddSchedule: (schedule: DeliveryScheduleItem) => void;
  onToggleDeliveryStatus: (scheduleId: string, delivered: 'Y' | 'N') => void;
  onUpdateDemand?: (demands: DemandItem[]) => void;
}

export const FGCoverageReport: React.FC<FGCoverageReportProps> = ({
  fgReports,
  boms,
  inventory,
  schedules,
  demands,
  selectedMonth = '2026-07',
  isPurchaseRole = false,
  onAddSchedule,
  onToggleDeliveryStatus,
  onUpdateDemand
}) => {
  const [selectedFgCode, setSelectedFgCode] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COVERED' | 'CRITICAL'>('ALL');

  // Currently active FG for drill-down in the collapsible right panel
  const [activeDetailFgCode, setActiveDetailFgCode] = useState<string>('FG-1001');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  // Weekly Plan editing state for Planner
  const [editingWeeklyPlanFg, setEditingWeeklyPlanFg] = useState<DemandItem | null>(null);
  const [weeklyPlanForm, setWeeklyPlanForm] = useState<{
    w1: number;
    w2: number;
    w3: number;
    w4: number;
  }>({ w1: 0, w2: 0, w3: 0, w4: 0 });
  const [weeklyPlanStep, setWeeklyPlanStep] = useState<number>(100);

  // Security / Permission Modal State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const [expandedCompScheduleMap, setExpandedCompScheduleMap] = useState<Record<string, boolean>>({});

  // Track drill-down RM/PM filter per FG code
  const [fgRmpmFilter, setFgRmpmFilter] = useState<Record<string, 'ALL' | 'CRITICAL_ALL' | 'CRITICAL_RM' | 'CRITICAL_PM'>>({});

  // Track selected component codes for bulk actions per FG
  const [selectedCompCodesMap, setSelectedCompCodesMap] = useState<Record<string, string[]>>({});

  const getFgRmpmFilter = (fgCode: string) => fgRmpmFilter[fgCode] || 'CRITICAL_ALL';

  const setFgFilter = (fgCode: string, filter: 'ALL' | 'CRITICAL_ALL' | 'CRITICAL_RM' | 'CRITICAL_PM') => {
    setFgRmpmFilter((prev) => ({ ...prev, [fgCode]: filter }));
  };

  const toggleSelectComp = (fgCode: string, compCode: string) => {
    setSelectedCompCodesMap((prev) => {
      const list = prev[fgCode] || [];
      if (list.includes(compCode)) {
        return { ...prev, [fgCode]: list.filter((c) => c !== compCode) };
      } else {
        return { ...prev, [fgCode]: [...list, compCode] };
      }
    });
  };

  const toggleSelectAllCriticalComp = (fgCode: string, criticalCompCodes: string[]) => {
    setSelectedCompCodesMap((prev) => {
      const list = prev[fgCode] || [];
      const allSelected = criticalCompCodes.every((c) => list.includes(c));
      if (allSelected) {
        return { ...prev, [fgCode]: list.filter((c) => !criticalCompCodes.includes(c)) };
      } else {
        const set = new Set([...list, ...criticalCompCodes]);
        return { ...prev, [fgCode]: Array.from(set) };
      }
    });
  };

  const handleSelectFgRow = (fgCode: string) => {
    setActiveDetailFgCode(fgCode);
    setIsRightPanelOpen(true);
  };

  // Modal State for adding new Purchase Delivery Schedule
  const [activeScheduleModalComp, setActiveScheduleModalComp] = useState<{
    comp: FGBottleneckComponent;
    fgCode: string;
  } | null>(null);

  const [scheduleForm, setScheduleForm] = useState({
    qty: 1000,
    vendor: 'Alpha Chemical & Packaging Ltd',
    eta: '2026-07-15',
    week: 1 as 1 | 2 | 3 | 4,
    poNumber: 'PO-2026-078'
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Helper to get calendar date label for weeks based on selected month (YYYY-MM)
  const getWeekDateRangeLabel = (weekNum: 1 | 2 | 3 | 4): string => {
    const [year, month] = selectedMonth.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(month || '07', 10) - 1;
    const mStr = monthNames[monthIdx] || 'Jul';

    switch (weekNum) {
      case 1:
        return `W1 (${mStr} 01 - ${mStr} 07)`;
      case 2:
        return `W2 (${mStr} 08 - ${mStr} 14)`;
      case 3:
        return `W3 (${mStr} 15 - ${mStr} 21)`;
      case 4:
        return `W4 (${mStr} 22 - ${mStr} 31)`;
      default:
        return `W${weekNum}`;
    }
  };

  const toggleCompScheduleExpand = (compCode: string) => {
    setExpandedCompScheduleMap((prev) => ({ ...prev, [compCode]: !prev[compCode] }));
  };

  // Open Weekly Plan Editor for Finished Good
  const handleOpenWeeklyPlanModal = (fgCode: string) => {
    if (!demands || !onUpdateDemand) return;
    const item = demands.find((d) => d.fgCode === fgCode);
    if (!item) return;

    const w1 = item.week1Demand ?? Math.round(item.monthlyDemand / 4);
    const w2 = item.week2Demand ?? Math.round(item.monthlyDemand / 4);
    const w3 = item.week3Demand ?? Math.round(item.monthlyDemand / 4);
    const w4 = item.week4Demand ?? Math.round(item.monthlyDemand / 4);

    setEditingWeeklyPlanFg(item);
    setWeeklyPlanForm({ w1, w2, w3, w4 });
  };

  const handleStepWeeklyPlan = (week: 1 | 2 | 3 | 4, delta: number) => {
    const key = `w${week}` as 'w1' | 'w2' | 'w3' | 'w4';
    setWeeklyPlanForm((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const handleSaveWeeklyPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeeklyPlanFg || !demands || !onUpdateDemand) return;

    const total = weeklyPlanForm.w1 + weeklyPlanForm.w2 + weeklyPlanForm.w3 + weeklyPlanForm.w4;
    const updated = demands.map((d) => {
      if (d.fgCode === editingWeeklyPlanFg.fgCode) {
        return {
          ...d,
          week1Demand: weeklyPlanForm.w1,
          week2Demand: weeklyPlanForm.w2,
          week3Demand: weeklyPlanForm.w3,
          week4Demand: weeklyPlanForm.w4,
          monthlyDemand: total
        };
      }
      return d;
    });

    onUpdateDemand(updated);
    setNotification(
      `Weekly production schedule updated for ${editingWeeklyPlanFg.fgCode}. Total Monthly Plan: ${total.toLocaleString()} ${editingWeeklyPlanFg.uom}.`
    );
    setEditingWeeklyPlanFg(null);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Open Schedule Modal pre-filled with strict role check
  const handleOpenScheduleModal = (comp: FGBottleneckComponent, fgCode: string) => {
    if (!isPurchaseRole) {
      setIsPermissionModalOpen(true);
      return;
    }

    const suggestedQty = comp.shortageQty > 0 ? comp.shortageQty : 2000;
    const defaultWeek = comp.shortageWeek !== 'None' ? comp.shortageWeek : 1;
    const defaultEta = `${selectedMonth}-${defaultWeek * 7 < 10 ? '0' + defaultWeek * 7 : defaultWeek * 7}`;

    setScheduleForm({
      qty: suggestedQty,
      vendor: comp.category === 'RM' ? 'Global Chemicals & Raw Supplies Ltd' : 'Apex Packaging Solutions Ltd',
      eta: defaultEta,
      week: defaultWeek,
      poNumber: `PO-${Math.floor(10000 + Math.random() * 90000)}`
    });

    setActiveScheduleModalComp({ comp, fgCode });
  };

  // Save Delivery Schedule
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScheduleModalComp) return;

    const { comp } = activeScheduleModalComp;

    const newSchedule: DeliveryScheduleItem = {
      id: `sched-injected-${Date.now()}`,
      materialCode: comp.componentCode,
      description: comp.componentDescription,
      qty: Number(scheduleForm.qty),
      unit: comp.uom,
      vendor: scheduleForm.vendor,
      etd: `${selectedMonth}-01`,
      eta: scheduleForm.eta,
      week: scheduleForm.week,
      delivered: 'N',
      poNumber: scheduleForm.poNumber
    };

    onAddSchedule(newSchedule);

    setNotification(
      `Delivery schedule of +${scheduleForm.qty.toLocaleString()} ${comp.uom} created for ${comp.componentCode} (PO #${scheduleForm.poNumber}).`
    );

    setActiveScheduleModalComp(null);

    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Top KPI Totals
  const totalFGs = fgReports.length;
  const coveredFGs = fgReports.filter((f) => f.overallCoverageStatus === 'COVERED').length;
  const criticalFGs = fgReports.filter((f) => f.overallCoverageStatus !== 'COVERED').length;

  const totalCriticalRM = fgReports.reduce((sum, f) => sum + (f.criticalRMComponents || []).length, 0);
  const totalCriticalPM = fgReports.reduce((sum, f) => sum + (f.criticalPMComponents || []).length, 0);

  // Filtered FG Reports
  const filteredReports = fgReports.filter((fg) => {
    if (selectedFgCode !== 'ALL' && fg.fgCode !== selectedFgCode) return false;
    if (statusFilter === 'COVERED' && fg.overallCoverageStatus !== 'COVERED') return false;
    if (statusFilter === 'CRITICAL' && fg.overallCoverageStatus === 'COVERED') return false;
    return true;
  });

  // Selected FG for Right Panel Detail View
  const selectedFgDetail =
    fgReports.find((fg) => fg.fgCode === activeDetailFgCode) || filteredReports[0] || fgReports[0];

  const selectedFgAllComponents = selectedFgDetail?.allComponents || [];
  const selectedFgCriticalComps = selectedFgAllComponents.filter((c) => c.status === 'CRITICAL');
  const selectedFgCriticalRMComps = selectedFgDetail?.criticalRMComponents || [];
  const selectedFgCriticalPMComps = selectedFgDetail?.criticalPMComponents || [];

  return (
    <div className="space-y-4 w-full">

      {/* Top Header & KPI Summary Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Finished Goods (FG) Production Coverage Report
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate FG demand against weekly production capability. Click any FG row to inspect RM/PM bottlenecks in the right side panel.
          </p>
        </div>

        {/* Compact Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
            Total FGs: <span className="text-blue-700">{totalFGs}</span>
          </div>

          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
            Fully Covered: <span className="text-emerald-700">{coveredFGs}</span>
          </div>

          <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-800">
            Critical/Blocked: <span className="text-red-700">{criticalFGs}</span>
          </div>

          <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
            Critical RM: <span className="text-amber-900">{totalCriticalRM}</span>
          </div>

          <div className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-800">
            Critical PM: <span className="text-purple-900">{totalCriticalPM}</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white hover:text-emerald-200 font-bold text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar & Panel Toggle */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filter Finished Good:</span>
            <select
              value={selectedFgCode}
              onChange={(e) => {
                setSelectedFgCode(e.target.value);
                if (e.target.value !== 'ALL') {
                  setActiveDetailFgCode(e.target.value);
                  setIsRightPanelOpen(true);
                }
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Finished Goods ({fgReports.length})</option>
              {fgReports.map((fg) => (
                <option key={fg.fgCode} value={fg.fgCode}>
                  {fg.fgCode} - {fg.fgDescription}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('COVERED')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                statusFilter === 'COVERED' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Covered Only
            </button>
            <button
              onClick={() => setStatusFilter('CRITICAL')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                statusFilter === 'CRITICAL' ? 'bg-red-600 text-white shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Critical / Blocked Only
            </button>
          </div>
        </div>

        {/* Panel Toggle Buttons (Left & Right) */}
        <div className="flex items-center gap-2">
          {/* Left Panel Toggle */}
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isLeftPanelOpen
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Toggle Finished Goods Summary Left Panel"
          >
            {isLeftPanelOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-white" />
                <span>Left Panel: Open</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
                <span>Open FG Summary Panel</span>
              </>
            )}
          </button>

          {/* Right Panel Toggle */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isRightPanelOpen
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Toggle RM/PM Material Breakdown Right Side Panel"
          >
            {isRightPanelOpen ? (
              <>
                <PanelRightClose className="w-4 h-4 text-white" />
                <span>Right Panel: Open</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4 text-blue-600" />
                <span>Open RM/PM Side Panel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Main Responsive Grid */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
        
        {/* Left Table Container: FG Coverage Overview */}
        {isLeftPanelOpen && (
          <div
            className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-300 ${
              isRightPanelOpen && selectedFgDetail ? 'w-full lg:w-5/12 xl:w-[42%] shrink-0' : 'w-full'
            }`}
          >
            <div className="p-3 bg-slate-100 text-slate-800 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
                  Finished Goods Coverage Summary ({filteredReports.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
                  Click row to inspect RM/PM
                </span>
                <button
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Collapse Left Panel"
                >
                  <PanelLeftClose className="w-3.5 h-3.5 text-blue-600" />
                  <span>Collapse</span>
                </button>
              </div>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-800 font-extrabold text-xs uppercase tracking-wide border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-3">FG Item</th>
                  <th className="p-3 text-right">Net Demand</th>
                  <th className="p-3 text-center">W1-W4 Weekly Status</th>
                  <th className="p-3 text-right">Deficit / Coverage</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center pr-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((fg) => {
                  const isSelected = activeDetailFgCode === fg.fgCode && isRightPanelOpen;
                  const totalMonthDeficit = fg.producibleFGTotal - fg.netMonthlyDemand;
                  const criticalCompsCount = (fg.allComponents || []).filter((c) => c.status === 'CRITICAL').length;

                  return (
                    <tr
                      key={fg.fgCode}
                      onClick={() => handleSelectFgRow(fg.fgCode)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-50/90 border-l-4 border-l-blue-600 font-semibold'
                          : fg.overallCoverageStatus === 'COVERED'
                          ? 'hover:bg-slate-50'
                          : 'bg-red-50/20 hover:bg-red-50/50'
                      }`}
                    >
                      {/* FG Code & Description */}
                      <td className="p-3 pl-3">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{fg.fgCode}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded font-extrabold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 font-medium line-clamp-1">{fg.fgDescription}</div>
                        {(fg.miniFactory || fg.line) && (
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {fg.miniFactory && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded text-[10px] font-extrabold flex items-center gap-1">
                                <Factory className="w-3 h-3 text-blue-600" />
                                <span>{fg.miniFactory}</span>
                              </span>
                            )}
                            {fg.line && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-200 rounded text-[10px] font-extrabold flex items-center gap-1">
                                <GitFork className="w-3 h-3 text-purple-600" />
                                <span>{fg.line}</span>
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mt-1">
                          Critical RM/PM: <strong className={criticalCompsCount > 0 ? 'text-red-700 font-extrabold' : 'text-emerald-700 font-extrabold'}>{criticalCompsCount}</strong>
                        </div>
                      </td>

                      {/* Net Monthly Demand */}
                      <td className="p-3 text-right font-black text-slate-900 text-sm">
                        {fg.netMonthlyDemand.toLocaleString()} {fg.uom}
                      </td>

                      {/* Weekly Status & Figures in Tabular Format */}
                      <td className="p-3">
                        <div className="overflow-x-auto min-w-[340px]">
                          <table className="w-full text-xs border-collapse border border-slate-200 bg-white rounded-lg overflow-hidden">
                            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-xs">
                              <tr>
                                <th className="p-1.5 text-center">Wk</th>
                                <th className="p-1.5 text-right">Base Demand</th>
                                <th className="p-1.5 text-right">Target</th>
                                <th className="p-1.5 text-right">Produced</th>
                                <th className="p-1.5 text-right">Backlog / Surplus</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {(fg.weeklyCoverage || []).map((w) => {
                                const diff = w.maxProducibleFG - w.fgTargetDemand;
                                const isShort = diff < 0;
                                return (
                                  <tr key={w.week} className={isShort ? 'bg-red-50/50' : 'bg-emerald-50/20'}>
                                    <td className="p-1.5 font-bold text-center text-slate-800">W{w.week}</td>
                                    <td className="p-1.5 text-right text-slate-700 font-semibold">{(w.originalWeeklyDemand || 0).toLocaleString()}</td>
                                    <td className="p-1.5 text-right text-slate-800 font-semibold">{w.fgTargetDemand.toLocaleString()}</td>
                                    <td className="p-1.5 text-right text-blue-700 font-black">{w.maxProducibleFG.toLocaleString()}</td>
                                    <td className="p-1.5 text-right font-black">
                                      {diff > 0 ? (
                                        <span className="text-emerald-700">+{diff.toLocaleString()}</span>
                                      ) : diff < 0 ? (
                                        <span className="text-red-700">{diff.toLocaleString()}</span>
                                      ) : (
                                        <span className="text-emerald-700">0</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>

                      {/* Month Net Deficit / Excess */}
                      <td className="p-3 text-right font-black text-sm">
                        {totalMonthDeficit < 0 ? (
                          <span className="text-red-700">
                            {totalMonthDeficit.toLocaleString()} {fg.uom}
                          </span>
                        ) : (
                          <span className="text-emerald-700">
                            +{totalMonthDeficit.toLocaleString()} {fg.uom}
                          </span>
                        )}
                      </td>

                      {/* Status Tag */}
                      <td className="p-3 text-center">
                        {fg.overallCoverageStatus === 'COVERED' ? (
                          <span className="bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded inline-block">
                            COVERED
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded inline-block">
                            CRITICAL
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3 text-center pr-3">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {demands && onUpdateDemand && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWeeklyPlanModal(fg.fgCode);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-extrabold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Edit weekly planned schedule for this FG (+/-)"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>Plan (+/-)</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectFgRow(fg.fgCode);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                              isSelected
                                ? 'bg-blue-700 text-white font-extrabold'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                            }`}
                          >
                            <span>RM/PM</span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Right Collapsible Panel: RM/PM Material Breakdown */}
        {isRightPanelOpen && selectedFgDetail ? (
          <div
            className={`${
              isLeftPanelOpen ? 'w-full lg:w-7/12 xl:w-[58%] shrink-0' : 'w-full'
            } space-y-3 bg-white p-3.5 rounded-xl border-2 border-blue-500/80 shadow-md transition-all duration-300`}
          >
            
            {/* Panel Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/90 border border-blue-200 text-slate-900 p-3.5 rounded-xl shadow-2xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="font-extrabold text-base tracking-tight text-slate-900">
                    RM/PM Material Breakdown for {selectedFgDetail.fgCode}
                  </h3>
                  <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {selectedFgDetail.fgDescription}
                  </span>
                  {selectedFgDetail.miniFactory && (
                    <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Factory className="w-3.5 h-3.5 text-blue-700" />
                      <span>{selectedFgDetail.miniFactory}</span>
                    </span>
                  )}
                  {selectedFgDetail.line && (
                    <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-purple-700" />
                      <span>{selectedFgDetail.line}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Review component availability, expected receipts, shortages, and delivery schedules for {selectedFgDetail.miniFactory || 'this Mini Factory'}.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {demands && onUpdateDemand && (
                  <button
                    onClick={() => handleOpenWeeklyPlanModal(selectedFgDetail.fgCode)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Edit weekly planned schedule for this FG (+/-)"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Weekly Plan</span>
                  </button>
                )}

                <span className="text-xs font-extrabold px-3 py-1.5 rounded-lg border bg-white shadow-2xs">
                  Monthly Coverage:{' '}
                  <strong className={selectedFgDetail.coveragePercent === 100 ? 'text-emerald-700 text-sm font-black' : 'text-red-700 text-sm font-black'}>
                    {selectedFgDetail.coveragePercent}%
                  </strong>
                </span>
                <button
                  onClick={() => setIsRightPanelOpen(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Collapse Right Side Panel"
                >
                  <PanelRightClose className="w-4 h-4 text-blue-600" />
                  <span>Collapse Panel</span>
                </button>
              </div>
            </div>

            {/* Filter Buttons & Selection Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs flex-wrap font-semibold">
                <button
                  onClick={() => setFgFilter(selectedFgDetail.fgCode, 'ALL')}
                  className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                    getFgRmpmFilter(selectedFgDetail.fgCode) === 'ALL'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({selectedFgAllComponents.length})
                </button>

                <button
                  onClick={() => setFgFilter(selectedFgDetail.fgCode, 'CRITICAL_ALL')}
                  className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                    getFgRmpmFilter(selectedFgDetail.fgCode) === 'CRITICAL_ALL'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  Critical RM/PM ({selectedFgCriticalComps.length})
                </button>

                <button
                  onClick={() => setFgFilter(selectedFgDetail.fgCode, 'CRITICAL_RM')}
                  className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                    getFgRmpmFilter(selectedFgDetail.fgCode) === 'CRITICAL_RM'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  Critical RM ({selectedFgCriticalRMComps.length})
                </button>

                <button
                  onClick={() => setFgFilter(selectedFgDetail.fgCode, 'CRITICAL_PM')}
                  className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                    getFgRmpmFilter(selectedFgDetail.fgCode) === 'CRITICAL_PM'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-purple-800 hover:bg-purple-50'
                  }`}
                >
                  Critical PM ({selectedFgCriticalPMComps.length})
                </button>
              </div>

              {selectedFgCriticalComps.length > 0 && (
                <button
                  onClick={() =>
                    toggleSelectAllCriticalComp(
                      selectedFgDetail.fgCode,
                      selectedFgCriticalComps.map((c) => c.componentCode)
                    )
                  }
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-extrabold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                >
                  <CheckSquare className="w-4 h-4 text-red-600" />
                  <span>
                    {selectedFgCriticalComps.every((c) =>
                      (selectedCompCodesMap[selectedFgDetail.fgCode] || []).includes(c.componentCode)
                    )
                      ? 'Deselect All Critical'
                      : 'Select All Critical RM/PM'}
                  </span>
                </button>
              )}
            </div>

            {/* Tabular RM/PM Components Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-extrabold text-xs uppercase tracking-wide border-b border-slate-200">
                    <tr>
                      <th className="p-3 pl-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedFgCriticalComps.length > 0 &&
                            selectedFgCriticalComps.every((c) =>
                              (selectedCompCodesMap[selectedFgDetail.fgCode] || []).includes(c.componentCode)
                            )
                          }
                          onChange={() =>
                            toggleSelectAllCriticalComp(
                              selectedFgDetail.fgCode,
                              selectedFgCriticalComps.map((c) => c.componentCode)
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3 w-12 text-center">Cat</th>
                      <th className="p-3">Component</th>
                      <th className="p-3 text-right">BOM Ratio</th>
                      <th className="p-3 text-right">Opening Stock</th>
                      <th className="p-3 text-right bg-amber-50/60 font-semibold text-amber-900">
                        Reserved for Other FGs
                      </th>
                      <th className="p-3 text-right bg-emerald-50/60 font-semibold text-emerald-900">
                        Effective Stock
                      </th>
                      <th className="p-3 text-right text-blue-700">Expected Receipt</th>
                      <th className="p-3 text-right">Shortage</th>
                      <th className="p-3 text-center">Week</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center pr-3">Schedules & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {selectedFgAllComponents
                      .filter((comp) => {
                        const filter = getFgRmpmFilter(selectedFgDetail.fgCode);
                        if (filter === 'CRITICAL_ALL') return comp.status === 'CRITICAL';
                        if (filter === 'CRITICAL_RM') return comp.status === 'CRITICAL' && comp.category === 'RM';
                        if (filter === 'CRITICAL_PM') return comp.status === 'CRITICAL' && comp.category === 'PM';
                        return true;
                      })
                      .map((comp) => {
                        const isCritical = comp.status === 'CRITICAL';
                        const compSchedules = schedules.filter((s) => s.materialCode === comp.componentCode);
                        const totalInboundExpected = compSchedules
                          .filter((s) => s.delivered === 'N')
                          .reduce((sum, s) => sum + Number(s.qty), 0);

                        const isSelected = (selectedCompCodesMap[selectedFgDetail.fgCode] || []).includes(
                          comp.componentCode
                        );

                        const isSchedulesExpanded = !!expandedCompScheduleMap[comp.componentCode];

                        return (
                          <React.Fragment key={comp.componentCode}>
                            <tr
                              className={`transition ${
                                isSelected
                                  ? 'bg-blue-50/70 font-semibold'
                                  : isCritical
                                  ? 'bg-red-50/30 hover:bg-red-50/60'
                                  : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="p-3 pl-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectComp(selectedFgDetail.fgCode, comp.componentCode)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>

                              {/* Category */}
                              <td className="p-3 text-center">
                                <span
                                  className={`font-black px-2 py-0.5 rounded text-xs inline-block ${
                                    comp.category === 'RM'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-purple-100 text-purple-900 border border-purple-300'
                                  }`}
                                >
                                  {comp.category}
                                </span>
                              </td>

                              {/* Code & Description */}
                              <td className="p-3">
                                <div className="font-extrabold text-slate-900 text-sm">{comp.componentCode}</div>
                                <div className="text-xs text-slate-700 font-medium">{comp.componentDescription}</div>
                              </td>

                              {/* BOM Ratio */}
                              <td className="p-3 text-right font-bold text-slate-800">
                                {comp.qtyPerFG} {comp.uom}
                              </td>

                              {/* Opening Stock */}
                              <td className="p-3 text-right font-black text-slate-900 text-sm">
                                {comp.openingStock.toLocaleString()} {comp.uom}
                              </td>

                              {/* Reserved for other FGs Dropdown */}
                              <td className="p-3 text-right bg-amber-50/30">
                                <div className="flex justify-end">
                                  <ReservationBreakdownDropdown
                                    materialCode={comp.componentCode}
                                    uom={comp.uom}
                                    currentFGCode={selectedFgDetail.fgCode}
                                    reservedQty={comp.reservedForOtherFGs || 0}
                                    reservations={comp.otherFGReservations || []}
                                  />
                                </div>
                              </td>

                              {/* Effective Available Stock */}
                              <td className="p-3 text-right font-black text-emerald-950 text-sm bg-emerald-50/30">
                                {Math.max(0, comp.effectiveAvailableStock ?? (comp.openingStock - (comp.reservedForOtherFGs || 0))).toLocaleString()}{' '}
                                {comp.uom}
                              </td>

                              {/* SEPARATELY MENTION EXPECTED RECEIPT */}
                              <td className="p-3 text-right font-black text-blue-800 text-sm bg-blue-50/60">
                                +{totalInboundExpected.toLocaleString()} {comp.uom}
                              </td>

                              {/* Shortage Qty */}
                              <td className="p-3 text-right font-black text-sm">
                                {comp.shortageQty > 0 ? (
                                  <span className="text-red-700">
                                    -{comp.shortageQty.toLocaleString()} {comp.uom}
                                  </span>
                                ) : (
                                  <span className="text-emerald-700">0 {comp.uom}</span>
                                )}
                              </td>

                              {/* Shortage Week */}
                              <td className="p-3 text-center font-bold text-slate-800">
                                {comp.shortageWeek !== 'None' ? (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-black text-xs">
                                    W{comp.shortageWeek}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">None</span>
                                )}
                              </td>

                              {/* Status Tag */}
                              <td className="p-3 text-center">
                                {isCritical ? (
                                  <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded inline-block">
                                    CRITICAL
                                  </span>
                                ) : (
                                  <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded inline-block">
                                    COVERED
                                  </span>
                                )}
                              </td>

                              {/* Delivery Schedule Actions */}
                              <td className="p-3 text-center pr-3">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => toggleCompScheduleExpand(comp.componentCode)}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                                    title="Toggle View Delivery Schedule Table"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Schedules ({compSchedules.length})</span>
                                    {isSchedulesExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleOpenScheduleModal(comp, selectedFgDetail.fgCode)}
                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>+ Schedule</span>
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Sub-table for Inbound Delivery Schedule */}
                            {isSchedulesExpanded && (
                              <tr>
                                <td colSpan={10} className="p-3 bg-slate-50 border-t border-b border-blue-200 pl-6">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                                        <span>
                                          Inbound Purchase Schedules for {comp.componentCode} ({comp.componentDescription})
                                        </span>
                                      </span>
                                      <span className="text-slate-500 text-[10px]">
                                        Click <strong className="text-emerald-700">Delivered Y/N</strong> to update stock in real-time
                                      </span>
                                    </div>

                                    {compSchedules.length > 0 ? (
                                      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-2xs">
                                        <table className="w-full text-left text-[11px]">
                                          <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                                            <tr>
                                              <th className="p-2 pl-3">PO Ref #</th>
                                              <th className="p-2">Vendor / Supplier</th>
                                              <th className="p-2 text-right">Inbound Dispatch Qty</th>
                                              <th className="p-2 text-center">Week</th>
                                              <th className="p-2 text-center">ETA Date</th>
                                              <th className="p-2 text-center pr-3">Delivery Status (Y / N)</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 font-medium">
                                            {compSchedules.map((sched) => {
                                              const isDelivered = sched.delivered === 'Y';

                                              return (
                                                <tr key={sched.id} className="hover:bg-slate-50">
                                                  <td className="p-2 pl-3 font-bold text-slate-800">
                                                    {sched.poNumber || 'PO-2026-N/A'}
                                                  </td>
                                                  <td className="p-2 text-slate-700">{sched.vendor}</td>
                                                  <td className="p-2 text-right font-extrabold text-blue-700">
                                                    +{sched.qty.toLocaleString()} {sched.unit}
                                                  </td>
                                                  <td className="p-2 text-center font-bold text-slate-600">
                                                    W{sched.week}
                                                  </td>
                                                  <td className="p-2 text-center text-slate-600">
                                                    {sched.eta}
                                                  </td>
                                                  <td className="p-2 text-center pr-3">
                                                    <button
                                                      onClick={() => {
                                                        if (!isPurchaseRole) {
                                                          setIsPermissionModalOpen(true);
                                                          return;
                                                        }
                                                        onToggleDeliveryStatus(sched.id, isDelivered ? 'N' : 'Y');
                                                      }}
                                                      className={`px-3 py-1 rounded-full text-[10px] font-black transition shadow-2xs flex items-center gap-1 mx-auto cursor-pointer ${
                                                        isDelivered
                                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                                                      }`}
                                                      title={isPurchaseRole ? "Click to toggle delivery status" : "View-only: Only Purchase role can toggle status"}
                                                    >
                                                      {isDelivered ? (
                                                        <>
                                                          <CheckSquare className="w-3.5 h-3.5" />
                                                          <span>Delivered (Y)</span>
                                                        </>
                                                      ) : (
                                                        <>
                                                          <Square className="w-3.5 h-3.5" />
                                                          <span>In Transit (N)</span>
                                                        </>
                                                      )}
                                                    </button>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-center text-slate-500 text-[11px]">
                                        No purchase delivery schedules created for {comp.componentCode}.
                                        <button
                                          onClick={() => handleOpenScheduleModal(comp, selectedFgDetail.fgCode)}
                                          className="ml-2 font-bold text-blue-600 hover:underline cursor-pointer"
                                        >
                                          + Add Delivery Schedule
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : null}

        {/* Fallback View when Both Panels are Collapsed */}
        {!isLeftPanelOpen && (!isRightPanelOpen || !selectedFgDetail) && (
          <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3 shadow-2xs">
            <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Both Panels are Currently Collapsed</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Use the buttons below or in the top toolbar to expand the Finished Goods Summary panel or the RM/PM Material Breakdown panel.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsLeftPanelOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <PanelLeftOpen className="w-4 h-4" />
                <span>Open FG Summary Panel</span>
              </button>
              <button
                onClick={() => setIsRightPanelOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <PanelRightOpen className="w-4 h-4" />
                <span>Open RM/PM Side Panel</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Purchase Team Add Delivery Schedule Modal */}
      {activeScheduleModalComp && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  Add Purchase Inbound Schedule for {activeScheduleModalComp.comp.componentCode}
                </h3>
              </div>
              <button
                onClick={() => setActiveScheduleModalComp(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-xs">
              
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                <div className="font-bold text-blue-900">
                  {activeScheduleModalComp.comp.componentCode} - {activeScheduleModalComp.comp.componentDescription}
                </div>
                <div className="text-blue-700 text-[11px]">
                  Impacts Finished Good: <strong>{activeScheduleModalComp.fgCode}</strong> • Category: <strong>{activeScheduleModalComp.comp.category}</strong>
                  {activeScheduleModalComp.comp.shortageQty > 0 && (
                    <span className="block text-red-700 font-extrabold mt-0.5">
                      Current Shortage: -{activeScheduleModalComp.comp.shortageQty.toLocaleString()} {activeScheduleModalComp.comp.uom}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dispatch Quantity ({activeScheduleModalComp.comp.uom})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={scheduleForm.qty}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, qty: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Target Week */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Delivery Week
                  </label>
                  <select
                    value={scheduleForm.week}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, week: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={1}>Week 1 ({getWeekDateRangeLabel(1)})</option>
                    <option value={2}>Week 2 ({getWeekDateRangeLabel(2)})</option>
                    <option value={3}>Week 3 ({getWeekDateRangeLabel(3)})</option>
                    <option value={4}>Week 4 ({getWeekDateRangeLabel(4)})</option>
                  </select>
                </div>
              </div>

              {/* Vendor */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Vendor / Supplier Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={scheduleForm.vendor}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, vendor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* ETA Date */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>ETA Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.eta}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, eta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* PO Number */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>PO Ref Number</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.poNumber}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, poNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveScheduleModalComp(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Delivery Schedule & Recalculate</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PLANNER ONLY: Edit Weekly Plan Modal (+/- Increment/Decrement) */}
      {editingWeeklyPlanFg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-base tracking-tight">
                  Edit Weekly Plan: {editingWeeklyPlanFg.fgCode}
                </h3>
              </div>
              <button
                onClick={() => setEditingWeeklyPlanFg(null)}
                className="text-amber-200 hover:text-white transition p-1 hover:bg-amber-800/40 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveWeeklyPlan} className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>{editingWeeklyPlanFg.fgDescription}</span>
                  <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold text-[11px]">
                    UOM: {editingWeeklyPlanFg.uom}
                  </span>
                </div>
                <div className="text-amber-800 text-[11px]">
                  Planner privilege: Increase or decrease weekly dispatch schedules. The MRP and bottleneck RM/PM coverage will automatically recalculate.
                </div>
              </div>

              {/* Step Size Selector */}
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs">
                <span className="font-bold text-slate-700">Quick Increment / Decrement Step:</span>
                <div className="flex items-center gap-1.5">
                  {[50, 100, 250, 500].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setWeeklyPlanStep(step)}
                      className={`px-2.5 py-1 rounded-md font-extrabold text-xs transition cursor-pointer ${
                        weeklyPlanStep === step
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      ±{step}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Weekly Columns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {([1, 2, 3, 4] as const).map((wNum) => {
                  const val = weeklyPlanForm[`w${wNum}` as 'w1' | 'w2' | 'w3' | 'w4'];
                  return (
                    <div key={wNum} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-2">
                      <div className="font-extrabold text-slate-700 text-[11px]">
                        {getWeekDateRangeLabel(wNum)}
                      </div>

                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepWeeklyPlan(wNum, -weeklyPlanStep)}
                          className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center justify-center font-black cursor-pointer shadow-2xs"
                          title={`Subtract ${weeklyPlanStep}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => {
                            const n = Math.max(0, parseInt(e.target.value, 10) || 0);
                            const key = `w${wNum}` as 'w1' | 'w2' | 'w3' | 'w4';
                            setWeeklyPlanForm((prev) => ({ ...prev, [key]: n }));
                          }}
                          className="w-20 text-center font-black text-slate-900 bg-white border border-slate-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />

                        <button
                          type="button"
                          onClick={() => handleStepWeeklyPlan(wNum, weeklyPlanStep)}
                          className="w-7 h-7 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center font-black cursor-pointer shadow-2xs"
                          title={`Add ${weeklyPlanStep}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary of Total Monthly Demand */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">New Total Monthly Finished Good Demand:</span>
                  <span className="text-amber-400 font-black text-lg">
                    {(
                      weeklyPlanForm.w1 +
                      weeklyPlanForm.w2 +
                      weeklyPlanForm.w3 +
                      weeklyPlanForm.w4
                    ).toLocaleString()}{' '}
                    {editingWeeklyPlanFg.uom}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Previous: <strong className="text-white">{editingWeeklyPlanFg.monthlyDemand.toLocaleString()}</strong>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWeeklyPlanFg(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Weekly Plan & Recalculate MRP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY / PERMISSION MODAL: Restriction for Non-Purchase Users */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-200" />
                <h3 className="font-extrabold text-base tracking-tight">
                  Purchase Role Required
                </h3>
              </div>
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="text-red-200 hover:text-white transition p-1 hover:bg-red-800/40 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-2">
                <p className="font-extrabold text-red-900 flex items-center gap-1.5 text-sm">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>Delivery Schedule Restriction Active</span>
                </p>
                <p className="text-red-800 text-[11px] leading-relaxed">
                  Per manufacturing governance policy, <strong>no user other than Purchase</strong> can add, edit, or toggle vendor delivery schedules.
                </p>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  As a <strong>Planner</strong>, you have full authorization to edit the weekly production plan (W1–W4) using the <strong>Plan (+/-)</strong> tool.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
