import React, { useState, useEffect } from 'react';
import {
  BOMItem,
  InventoryItem,
  DemandItem,
  DeliveryScheduleItem,
  ProductionLogItem,
  SAPInwardItem,
  RMReservationItem,
  UserRole,
  AppPhase,
  MonthlyPlanState,
  MonthlyPlanFlag,
  FlagDiscussionMessage,
  SystemAuditLogItem,
  DailyRollingPlanRow
} from './types';
import {
  INITIAL_BOM,
  INITIAL_INVENTORY,
  INITIAL_DEMAND,
  INITIAL_DELIVERY_SCHEDULE,
  INITIAL_PRODUCTION_LOGS,
  INITIAL_SAP_INWARDS,
  INITIAL_RESERVATIONS
} from './data/initialData';
import {
  INITIAL_MONTHLY_PLAN_STATE,
  INITIAL_MONTHLY_FLAGS,
  INITIAL_SYSTEM_AUDIT_LOGS,
  INITIAL_DAILY_ROLLING_PLAN_ROWS
} from './data/initialThreePhaseData';
import { calculateMRPMatrix } from './utils/mrpEngine';
import { calculateFGCoverageReport } from './utils/fgCoverageEngine';
import { calculateConsolidatedRMRequirements } from './utils/consolidatedRMEngine';
import { Header } from './components/Header';
import { CriticalBottlenecksSummary } from './components/CriticalBottlenecksSummary';
import { MRPMatrix } from './components/Planner/MRPMatrix';
import { FGCoverageReport } from './components/Planner/FGCoverageReport';
import { BOMDependencyTree } from './components/Planner/BOMDependencyTree';
import { DemandManager } from './components/Planner/DemandManager';
import { InventoryManager } from './components/Warehouse/InventoryManager';
import { ProductionLogger } from './components/Production/ProductionLogger';
import { ConsolidatedRMTable } from './components/Procurement/ConsolidatedRMTable';
import { ScheduleDeliveryReport } from './components/Procurement/ScheduleDeliveryReport';
import { SAPInwardManager } from './components/Procurement/SAPInwardManager';
import { RMBOMUsageMapping } from './components/Procurement/RMBOMUsageMapping';
import { ManagementShortageReport } from './components/Management/ManagementShortageReport';
import { ProductionCriticalReport } from './components/Reports/ProductionCriticalReport';
import { MinStockDeficitReport } from './components/Reports/MinStockDeficitReport';
import { ReservationManagerModal } from './components/Procurement/ReservationManagerModal';
import { CSVUploader } from './components/DataImportExport/CSVUploader';
import { MiniFactoryFilterBar } from './components/MiniFactoryFilterBar';

// 3-Phase New Components
import { MonthlyPhaseDashboard } from './components/MonthlyPhase/MonthlyPhaseDashboard';
import { DailyRollingPlanManager } from './components/DailyPhase/DailyRollingPlanManager';
import { ManagementExecutiveCockpit } from './components/Management/ManagementExecutiveCockpit';

import {
  Search,
  RotateCcw,
  LineChart,
  Network,
  CalendarRange,
  ShieldCheck,
  Layers,
  Truck,
  FileSpreadsheet,
  Grid,
  Calendar,
  Clock,
  Briefcase
} from 'lucide-react';

export default function App() {
  // Phase Navigation State
  const [currentPhase, setCurrentPhase] = useState<AppPhase>(() => {
    const saved = localStorage.getItem('mrp_current_phase');
    return (saved as AppPhase) || 'MONTHLY_PHASE';
  });

  // Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('demand_planner');

  // Load datasets from localStorage or initial defaults
  const [boms, setBoms] = useState<BOMItem[]>(() => {
    const saved = localStorage.getItem('mrp_boms');
    return saved ? JSON.parse(saved) : INITIAL_BOM;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('mrp_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [demands, setDemands] = useState<DemandItem[]>(() => {
    const saved = localStorage.getItem('mrp_demands');
    return saved ? JSON.parse(saved) : INITIAL_DEMAND;
  });

  const [deliverySchedules, setDeliverySchedules] = useState<DeliveryScheduleItem[]>(() => {
    const saved = localStorage.getItem('mrp_delivery_schedules');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_SCHEDULE;
  });

  const [sapInwards, setSapInwards] = useState<SAPInwardItem[]>(() => {
    const saved = localStorage.getItem('mrp_sap_inwards');
    return saved ? JSON.parse(saved) : INITIAL_SAP_INWARDS;
  });

  const [productionLogs, setProductionLogs] = useState<ProductionLogItem[]>(() => {
    const saved = localStorage.getItem('mrp_production_logs');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_LOGS;
  });

  const [purchaseComments, setPurchaseComments] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('mrp_purchase_comments');
    return saved ? JSON.parse(saved) : {};
  });

  const [reservations, setReservations] = useState<RMReservationItem[]>(() => {
    const saved = localStorage.getItem('mrp_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  // Phase 1: Monthly S&OP State
  const [monthlyPlanState, setMonthlyPlanState] = useState<MonthlyPlanState>(() => {
    const saved = localStorage.getItem('mrp_monthly_plan_state');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_PLAN_STATE;
  });

  const [monthlyFlags, setMonthlyFlags] = useState<MonthlyPlanFlag[]>(() => {
    const saved = localStorage.getItem('mrp_monthly_flags');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_FLAGS;
  });

  // Phase 3: Daily 3-Day Rolling Plan State
  const [dailyPlanRows, setDailyPlanRows] = useState<DailyRollingPlanRow[]>(() => {
    const saved = localStorage.getItem('mrp_daily_plan_rows');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_ROLLING_PLAN_ROWS;
  });

  // Timestamp-based System Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLogItem[]>(() => {
    const saved = localStorage.getItem('mrp_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_AUDIT_LOGS;
  });

  // As on Date configuration (Defaults to August 19, 2026 - Week 3)
  const [asOnDate, setAsOnDate] = useState<string>('2026-08-19');
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  // Tab views for Weekly Phase (Planner vs Procurement)
  const [activePlannerTab, setActivePlannerTab] = useState<
    'fg_report' | 'production_critical' | 'min_stock_deficit' | 'management_shortage' | 'matrix' | 'tree' | 'demand'
  >('fg_report');

  const [activeProcurementTab, setActiveProcurementTab] = useState<
    'consolidated_rm' | 'production_critical' | 'min_stock_deficit' | 'schedule_report' | 'sap_inward' | 'bom_mapping'
  >('consolidated_rm');

  // Mini Factory & Line filter state
  const [selectedMiniFactory, setSelectedMiniFactory] = useState<string>('ALL');
  const [selectedLine, setSelectedLine] = useState<string>('ALL');

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mrp_current_phase', currentPhase);
  }, [currentPhase]);

  useEffect(() => {
    localStorage.setItem('mrp_boms', JSON.stringify(boms));
  }, [boms]);

  useEffect(() => {
    localStorage.setItem('mrp_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('mrp_demands', JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem('mrp_delivery_schedules', JSON.stringify(deliverySchedules));
  }, [deliverySchedules]);

  useEffect(() => {
    localStorage.setItem('mrp_sap_inwards', JSON.stringify(sapInwards));
  }, [sapInwards]);

  useEffect(() => {
    localStorage.setItem('mrp_production_logs', JSON.stringify(productionLogs));
  }, [productionLogs]);

  useEffect(() => {
    localStorage.setItem('mrp_purchase_comments', JSON.stringify(purchaseComments));
  }, [purchaseComments]);

  useEffect(() => {
    localStorage.setItem('mrp_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('mrp_monthly_plan_state', JSON.stringify(monthlyPlanState));
  }, [monthlyPlanState]);

  useEffect(() => {
    localStorage.setItem('mrp_monthly_flags', JSON.stringify(monthlyFlags));
  }, [monthlyFlags]);

  useEffect(() => {
    localStorage.setItem('mrp_daily_plan_rows', JSON.stringify(dailyPlanRows));
  }, [dailyPlanRows]);

  useEffect(() => {
    localStorage.setItem('mrp_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit Log Helper
  const handleAddAuditLog = (logData: Omit<SystemAuditLogItem, 'id' | 'timestamp'>) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: SystemAuditLogItem = {
      ...logData,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: nowStr
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Monthly Phase Handlers
  const handleAddFlag = (flag: MonthlyPlanFlag) => {
    setMonthlyFlags((prev) => [flag, ...prev]);
  };

  const handleUpdateFlag = (updatedFlag: MonthlyPlanFlag) => {
    setMonthlyFlags((prev) => prev.map((f) => (f.id === updatedFlag.id ? updatedFlag : f)));
  };

  const handleResolveFlag = (
    flagId: string,
    action: 'DEMAND_REDUCED' | 'SUPPLY_EXPEDITED' | 'REALLOCATED' | 'ACCEPTED_AS_IS',
    note: string,
    cutQty?: number
  ) => {
    setMonthlyFlags((prev) =>
      prev.map((f) => {
        if (f.id === flagId) {
          return {
            ...f,
            status: 'RESOLVED',
            resolutionAction: action,
            resolutionNote: note,
            resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            resolvedBy: 'S&OP Alignment Consensus'
          };
        }
        return f;
      })
    );
  };

  const handleAddDiscussionMessage = (flagId: string, message: FlagDiscussionMessage) => {
    setMonthlyFlags((prev) =>
      prev.map((f) => {
        if (f.id === flagId) {
          return {
            ...f,
            status: f.status === 'OPEN' ? 'IN_DISCUSSION' : f.status,
            discussions: [...f.discussions, message]
          };
        }
        return f;
      })
    );
  };

  const handleUpdatePurchaseComment = (key: string, comment: string) => {
    setPurchaseComments((prev) => ({
      ...prev,
      [key]: comment
    }));
  };

  const handleUpdateDemandCustomer = (fgCode: string, customerName: string) => {
    setDemands((prev) =>
      prev.map((d) => (d.fgCode === fgCode ? { ...d, customerName } : d))
    );
  };

  const handleAddReservation = (newRes: RMReservationItem) => {
    setReservations((prev) => [newRes, ...prev]);
    handleAddAuditLog({
      phase: 'WEEKLY_PHASE',
      eventType: 'RESERVATION_ALLOCATED',
      actorRole: currentRole,
      actorName: 'Planner',
      entityKey: newRes.componentCode,
      description: `Reserved ${newRes.reservedQty} units for ${newRes.reservedForFGCode} (${newRes.reason}).`
    });
  };

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  // Reset to initial sample data
  const handleResetData = () => {
    if (window.confirm('Reset all dataset files and 3-phase records to initial sample state?')) {
      setBoms(INITIAL_BOM);
      setInventory(INITIAL_INVENTORY);
      setDemands(INITIAL_DEMAND);
      setDeliverySchedules(INITIAL_DELIVERY_SCHEDULE);
      setSapInwards(INITIAL_SAP_INWARDS);
      setProductionLogs(INITIAL_PRODUCTION_LOGS);
      setReservations(INITIAL_RESERVATIONS);
      setMonthlyPlanState(INITIAL_MONTHLY_PLAN_STATE);
      setMonthlyFlags(INITIAL_MONTHLY_FLAGS);
      setDailyPlanRows(INITIAL_DAILY_ROLLING_PLAN_ROWS);
      setAuditLogs(INITIAL_SYSTEM_AUDIT_LOGS);
      setPurchaseComments({});
      setSelectedMiniFactory('ALL');
      setSelectedLine('ALL');
      localStorage.clear();
    }
  };

  // Filter datasets based on selected Mini Factory and Line
  const filteredBoms = boms.filter((b) => {
    if (selectedMiniFactory !== 'ALL' && b.miniFactory !== selectedMiniFactory) return false;
    if (selectedLine !== 'ALL' && b.line !== selectedLine) return false;
    return true;
  });

  const filteredDemands = demands.filter((d) => {
    if (selectedMiniFactory !== 'ALL' && d.miniFactory !== selectedMiniFactory) return false;
    if (selectedLine !== 'ALL' && d.line !== selectedLine) return false;
    return true;
  });

  const filteredProductionLogs = productionLogs.filter((log) => {
    if (selectedMiniFactory !== 'ALL' && log.miniFactory && log.miniFactory !== selectedMiniFactory) return false;
    if (selectedLine !== 'ALL' && log.line && log.line !== selectedLine) return false;
    return true;
  });

  // Run core calculation engine for Weekly MRP Matrix
  const mrpData = calculateMRPMatrix(
    filteredBoms,
    inventory,
    filteredDemands,
    deliverySchedules,
    filteredProductionLogs
  );

  // Run FG-Centric Coverage & Critical RM/PM Engine with Reservations and As-on-date (Mon-Sat)
  const fgCoverageReports = calculateFGCoverageReport(
    filteredBoms,
    inventory,
    filteredDemands,
    deliverySchedules,
    filteredProductionLogs,
    mrpData,
    reservations,
    asOnDate
  );

  // Run Consolidated RM Requirement Engine for Procurement with Reservations and As-on-date (Mon-Sat)
  const consolidatedRMData = calculateConsolidatedRMRequirements(
    filteredBoms,
    inventory,
    filteredDemands,
    deliverySchedules,
    sapInwards,
    reservations,
    asOnDate
  );

  const criticalCount = mrpData.filter((item) => item.overallStatus === 'CRITICAL').length;
  const procurementShortageCount = consolidatedRMData.filter((item) => item.overallStatus === 'SHORTAGE').length;
  const totalFGCount = demands.length;
  const filteredFGCount = filteredDemands.length;
  const openFlagsCount = monthlyFlags.filter((f) => f.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* App Header with Phase Navigation */}
      <Header
        currentPhase={currentPhase}
        setCurrentPhase={setCurrentPhase}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onResetData={handleResetData}
        onOpenImportExport={() => setIsCSVModalOpen(true)}
        criticalCount={currentRole === 'procurement' || currentRole === 'supply_planner' ? procurementShortageCount : criticalCount}
        openFlagsCount={openFlagsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-none px-3 sm:px-4 lg:px-6 py-3.5 space-y-3.5">
        
        {/* ========================================================================= */}
        {/* PHASE 1: MONTHLY S&OP FEASIBILITY & DEMAND REDUCTION */}
        {/* ========================================================================= */}
        {currentPhase === 'MONTHLY_PHASE' && (
          <MonthlyPhaseDashboard
            monthlyPlanState={monthlyPlanState}
            onUpdateMonthlyPlanState={setMonthlyPlanState}
            monthlyFlags={monthlyFlags}
            onAddFlag={handleAddFlag}
            onUpdateFlag={handleUpdateFlag}
            onResolveFlag={handleResolveFlag}
            onAddDiscussionMessage={handleAddDiscussionMessage}
            auditLogs={auditLogs}
            onAddAuditLog={handleAddAuditLog}
            demands={demands}
            onUpdateDemand={setDemands}
            boms={boms}
            deliverySchedules={deliverySchedules}
            currentRole={currentRole}
          />
        )}

        {/* ========================================================================= */}
        {/* PHASE 3: DAILY 3-DAY ROLLING PLAN (PUMP ASSEMBLY & SHOP FLOOR) */}
        {/* ========================================================================= */}
        {currentPhase === 'DAILY_PHASE' && (
          <DailyRollingPlanManager
            dailyPlanRows={dailyPlanRows}
            onUpdateDailyPlanRows={setDailyPlanRows}
            onAddAuditLog={handleAddAuditLog}
            currentRole={currentRole}
            asOnDate={asOnDate}
          />
        )}

        {/* ========================================================================= */}
        {/* MANAGEMENT EXECUTIVE COCKPIT (W3 & W4 HORIZON & 5-WAY STAKEHOLDER MATRIX) */}
        {/* ========================================================================= */}
        {currentPhase === 'MANAGEMENT' && (
          <ManagementExecutiveCockpit
            monthlyPlanState={monthlyPlanState}
            onUpdateMonthlyPlanState={setMonthlyPlanState}
            monthlyFlags={monthlyFlags}
            onResolveFlag={handleResolveFlag}
            dailyPlanRows={dailyPlanRows}
            demands={demands}
            boms={boms}
            inventory={inventory}
            deliverySchedules={deliverySchedules}
            auditLogs={auditLogs}
            onAddAuditLog={handleAddAuditLog}
            currentRole={currentRole}
          />
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: WEEKLY MRP & CONSOLIDATED PROCUREMENT PHASE */}
        {/* ========================================================================= */}
        {currentPhase === 'WEEKLY_PHASE' && (
          <div className="space-y-3.5">
            {/* Global Search & Quick Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search RM/PM components, finished goods, vendors, or PO numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Role specific sub-views navigation */}
              {(currentRole === 'procurement' || currentRole === 'supply_planner') && (
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold overflow-x-auto">
                  <button
                    onClick={() => setActiveProcurementTab('consolidated_rm')}
                    className={`px-3 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                      activeProcurementTab === 'consolidated_rm'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    📊 1. Consolidated RM Matrix
                  </button>
                  <button
                    onClick={() => setActiveProcurementTab('production_critical')}
                    className={`px-3 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                      activeProcurementTab === 'production_critical'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    🚨 2. Production Critical
                  </button>
                  <button
                    onClick={() => setActiveProcurementTab('min_stock_deficit')}
                    className={`px-3 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                      activeProcurementTab === 'min_stock_deficit'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    📉 3. Stock &lt; Min Stock
                  </button>
                  <button
                    onClick={() => setActiveProcurementTab('schedule_report')}
                    className={`px-3 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                      activeProcurementTab === 'schedule_report'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    🚚 4. Schedule Delivery Report
                  </button>
                  <button
                    onClick={() => setActiveProcurementTab('sap_inward')}
                    className={`px-3 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                      activeProcurementTab === 'sap_inward'
                        ? 'bg-blue-800 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    📋 5. SAP Inwards Ledger
                  </button>
                  <button
                    onClick={() => setActiveProcurementTab('bom_mapping')}
                    className={`px-3 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                      activeProcurementTab === 'bom_mapping'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    🌿 6. RM / FG BOM Mapping
                  </button>
                </div>
              )}

              {(currentRole === 'planner' || currentRole === 'demand_planner' || currentRole === 'management') && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 shrink-0 shadow-2xs">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-600 shrink-0">Planner View:</span>
                  <select
                    value={activePlannerTab}
                    onChange={(e) => setActivePlannerTab(e.target.value as any)}
                    className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="fg_report">🛡️ FG Coverage Report (RM/PM)</option>
                    <option value="production_critical">🚨 Production Critical Shortage Report</option>
                    <option value="min_stock_deficit">📉 Stock &lt; Minimum Stock Deficit Report</option>
                    <option value="management_shortage">📊 Management Shortage & Purchase Comments</option>
                    <option value="matrix">📈 Weekly MRP Matrix</option>
                    <option value="tree">🌿 BOM Hierarchy Tree</option>
                    <option value="demand">📅 Demand Splitter</option>
                  </select>
                </div>
              )}
            </div>

            {/* Mini Factory & Production Line Filter Bar */}
            <MiniFactoryFilterBar
              selectedMiniFactory={selectedMiniFactory}
              setSelectedMiniFactory={setSelectedMiniFactory}
              selectedLine={selectedLine}
              setSelectedLine={setSelectedLine}
              totalFGCount={totalFGCount}
              filteredFGCount={filteredFGCount}
            />

            {/* Procurement Screens */}
            {(currentRole === 'procurement' || currentRole === 'supply_planner') && (
              <div className="space-y-4">
                {activeProcurementTab === 'consolidated_rm' && (
                  <ConsolidatedRMTable
                    consolidatedData={consolidatedRMData}
                    schedules={deliverySchedules}
                    sapInwards={sapInwards}
                    inventory={inventory}
                    boms={filteredBoms}
                    reservations={reservations}
                    asOnDate={asOnDate}
                    onAddSchedule={(newSchedule) => {
                      setDeliverySchedules([newSchedule, ...deliverySchedules]);
                      handleAddAuditLog({
                        phase: 'WEEKLY_PHASE',
                        eventType: 'SUPPLY_SCHEDULE_CHANGED',
                        actorRole: currentRole,
                        actorName: 'Purchase Team',
                        entityKey: newSchedule.componentCode,
                        description: `Added PO Schedule ${newSchedule.poNumber}: ${newSchedule.deliveryQuantity} units for ${newSchedule.componentCode}.`
                      });
                    }}
                    onAddSAPInward={(newInward) => {
                      setSapInwards([newInward, ...sapInwards]);
                      handleAddAuditLog({
                        phase: 'WEEKLY_PHASE',
                        eventType: 'SAP_INWARD_RECORDED',
                        actorRole: currentRole,
                        actorName: 'Inward Clerk',
                        entityKey: newInward.componentCode,
                        description: `Inwarded GRN ${newInward.grnNumber}: ${newInward.quantity} units for ${newInward.componentCode}.`
                      });
                    }}
                    onAddReservation={handleAddReservation}
                    onDeleteReservation={handleDeleteReservation}
                    onOpenScheduleReport={() => setActiveProcurementTab('schedule_report')}
                    onOpenSAPInwardReport={() => setActiveProcurementTab('sap_inward')}
                  />
                )}

                {activeProcurementTab === 'production_critical' && (
                  <ProductionCriticalReport
                    consolidatedData={consolidatedRMData}
                    fgCoverageReports={fgCoverageReports}
                    inventory={inventory}
                    boms={filteredBoms}
                    demands={filteredDemands}
                    schedules={deliverySchedules}
                    sapInwards={sapInwards}
                    reservations={reservations}
                    asOnDate={asOnDate}
                    onAddSchedule={(newSchedule) => setDeliverySchedules([newSchedule, ...deliverySchedules])}
                    onManageReservations={() => setIsReservationModalOpen(true)}
                  />
                )}

                {activeProcurementTab === 'min_stock_deficit' && (
                  <MinStockDeficitReport
                    inventory={inventory}
                    boms={filteredBoms}
                    schedules={deliverySchedules}
                    sapInwards={sapInwards}
                    reservations={reservations}
                    asOnDate={asOnDate}
                    onAddSchedule={(newSchedule) => setDeliverySchedules([newSchedule, ...deliverySchedules])}
                    onUpdateInventory={setInventory}
                    onManageReservations={() => setIsReservationModalOpen(true)}
                  />
                )}

                {activeProcurementTab === 'schedule_report' && (
                  <ScheduleDeliveryReport
                    schedules={deliverySchedules}
                    inventory={inventory}
                    onUpdateSchedules={setDeliverySchedules}
                    onUpdateInventory={setInventory}
                  />
                )}

                {activeProcurementTab === 'sap_inward' && (
                  <SAPInwardManager
                    sapInwards={sapInwards}
                    inventory={inventory}
                    onUpdateSAPInwards={setSapInwards}
                    onUpdateInventory={setInventory}
                    onReturnToMatrix={() => setActiveProcurementTab('consolidated_rm')}
                  />
                )}

                {activeProcurementTab === 'bom_mapping' && (
                  <RMBOMUsageMapping
                    boms={filteredBoms}
                    demands={filteredDemands}
                    inventory={inventory}
                  />
                )}
              </div>
            )}

            {/* Planner Screens */}
            {(currentRole === 'planner' || currentRole === 'demand_planner' || currentRole === 'management') && (
              <div className="space-y-4">
                {activePlannerTab !== 'fg_report' && activePlannerTab !== 'production_critical' && activePlannerTab !== 'min_stock_deficit' && (
                  <CriticalBottlenecksSummary mrpData={mrpData} />
                )}

                {activePlannerTab === 'fg_report' && (
                  <FGCoverageReport
                    fgReports={fgCoverageReports}
                    boms={boms}
                    inventory={inventory}
                    schedules={deliverySchedules}
                    demands={demands}
                    selectedMonth={selectedMonth}
                    isPurchaseRole={currentRole === 'supply_planner' || currentRole === 'procurement'}
                    onAddSchedule={(newSchedule) => setDeliverySchedules([newSchedule, ...deliverySchedules])}
                    onToggleDeliveryStatus={(scheduleId, delivered) =>
                      setDeliverySchedules((prev) =>
                        prev.map((s) => (s.id === scheduleId ? { ...s, delivered } : s))
                      )
                    }
                    onUpdateDemand={(updated) => {
                      setDemands(updated);
                      handleAddAuditLog({
                        phase: 'WEEKLY_PHASE',
                        eventType: 'WEEKLY_PLAN_ADJUSTED',
                        actorRole: 'Planner',
                        actorName: 'Production Planner',
                        entityKey: 'WEEKLY_DEMAND',
                        description: 'Adjusted weekly finished good production targets.'
                      });
                    }}
                  />
                )}

                {activePlannerTab === 'production_critical' && (
                  <ProductionCriticalReport
                    consolidatedData={consolidatedRMData}
                    fgCoverageReports={fgCoverageReports}
                    inventory={inventory}
                    boms={filteredBoms}
                    demands={filteredDemands}
                    schedules={deliverySchedules}
                    sapInwards={sapInwards}
                    reservations={reservations}
                    asOnDate={asOnDate}
                    onAddSchedule={(newSchedule) => setDeliverySchedules([newSchedule, ...deliverySchedules])}
                    onManageReservations={() => setIsReservationModalOpen(true)}
                  />
                )}

                {activePlannerTab === 'min_stock_deficit' && (
                  <MinStockDeficitReport
                    inventory={inventory}
                    boms={filteredBoms}
                    schedules={deliverySchedules}
                    sapInwards={sapInwards}
                    reservations={reservations}
                    asOnDate={asOnDate}
                    onAddSchedule={(newSchedule) => setDeliverySchedules([newSchedule, ...deliverySchedules])}
                    onUpdateInventory={setInventory}
                    onManageReservations={() => setIsReservationModalOpen(true)}
                  />
                )}

                {activePlannerTab === 'management_shortage' && (
                  <ManagementShortageReport
                    mrpData={mrpData}
                    demands={filteredDemands}
                    boms={filteredBoms}
                    deliverySchedules={deliverySchedules}
                    purchaseComments={purchaseComments}
                    onUpdatePurchaseComment={handleUpdatePurchaseComment}
                    onUpdateDemandCustomer={handleUpdateDemandCustomer}
                    selectedMiniFactory={selectedMiniFactory}
                    selectedLine={selectedLine}
                  />
                )}

                {activePlannerTab === 'matrix' && (
                  <MRPMatrix
                    mrpData={mrpData}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                )}

                {activePlannerTab === 'tree' && (
                  <BOMDependencyTree
                    boms={filteredBoms}
                    inventory={inventory}
                    mrpData={mrpData}
                  />
                )}

                {activePlannerTab === 'demand' && (
                  <DemandManager
                    demands={filteredDemands}
                    productionLogs={filteredProductionLogs}
                    onUpdateDemand={setDemands}
                  />
                )}
              </div>
            )}

            {/* Warehouse Screen */}
            {currentRole === 'warehouse_manager' && (
              <InventoryManager
                inventory={inventory}
                onUpdateInventory={setInventory}
              />
            )}

            {/* Production Screen */}
            {currentRole === 'production_supervisor' && (
              <ProductionLogger
                productionLogs={productionLogs}
                boms={boms}
                inventory={inventory}
                onAddProductionLog={(newLog) => setProductionLogs([newLog, ...productionLogs])}
              />
            )}
          </div>
        )}
      </main>

      {/* Reservation Manager Modal */}
      <ReservationManagerModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        reservations={reservations}
        boms={boms}
        inventory={inventory}
        demands={demands}
        asOnDate={asOnDate}
        onAddReservation={handleAddReservation}
        onDeleteReservation={handleDeleteReservation}
      />

      {/* CSV Import/Export Modal */}
      <CSVUploader
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        boms={boms}
        inventory={inventory}
        demands={demands}
        deliverySchedules={deliverySchedules}
        productionLogs={productionLogs}
        sapInwards={sapInwards}
        onImportBOM={setBoms}
        onImportInventory={setInventory}
        onImportDemand={setDemands}
        onImportDelivery={setDeliverySchedules}
        onImportProduction={setProductionLogs}
        onImportSAPInwards={setSapInwards}
      />

      {/* Clean Lean Footer */}
      <footer className="bg-slate-900 text-slate-400 py-2.5 px-6 text-center text-xs border-t border-slate-800 mt-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-semibold text-slate-300">
          3-Phase Planning System: Monthly S&OP • Weekly MRP Execution • Daily 3-Day Rolling Plan • Management Horizon
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Timestamped System Audit Trail • Constraint Overrides • Live ETA Feasibility
        </span>
      </footer>
    </div>
  );
}
