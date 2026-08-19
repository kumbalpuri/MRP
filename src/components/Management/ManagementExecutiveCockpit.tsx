import React, { useState } from 'react';
import {
  MonthlyPlanState,
  MonthlyPlanFlag,
  DailyRollingPlanRow,
  DemandItem,
  BOMItem,
  InventoryItem,
  DeliveryScheduleItem,
  SystemAuditLogItem,
  UserRole,
  ManagementHorizonItem,
  FLAG_CATEGORY_LABELS
} from '../../types';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Users,
  ShieldCheck,
  TrendingDown,
  Truck,
  Sparkles,
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  Flame,
  ArrowRight,
  Clock,
  Briefcase,
  Sliders,
  Check,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface ManagementExecutiveCockpitProps {
  monthlyPlanState: MonthlyPlanState;
  onUpdateMonthlyPlanState: (newState: MonthlyPlanState) => void;
  monthlyFlags: MonthlyPlanFlag[];
  onResolveFlag: (flagId: string, action: 'DEMAND_REDUCED' | 'SUPPLY_EXPEDITED' | 'REALLOCATED' | 'ACCEPTED_AS_IS', note: string, cutQty?: number) => void;
  dailyPlanRows: DailyRollingPlanRow[];
  demands: DemandItem[];
  boms: BOMItem[];
  inventory: InventoryItem[];
  deliverySchedules: DeliveryScheduleItem[];
  auditLogs: SystemAuditLogItem[];
  onAddAuditLog: (log: Omit<SystemAuditLogItem, 'id' | 'timestamp'>) => void;
  currentRole: UserRole;
}

export const ManagementExecutiveCockpit: React.FC<ManagementExecutiveCockpitProps> = ({
  monthlyPlanState,
  onUpdateMonthlyPlanState,
  monthlyFlags,
  onResolveFlag,
  dailyPlanRows,
  demands,
  boms,
  inventory,
  deliverySchedules,
  auditLogs,
  onAddAuditLog,
  currentRole
}) => {
  const [activePerspective, setActivePerspective] = useState<'monthly_sop' | 'daily_transactions'>('monthly_sop');
  const [selectedHorizonTab, setSelectedHorizonTab] = useState<'critical_items' | 'stakeholder_matrix' | 'executive_actions'>('critical_items');
  const [expandedFgCode, setExpandedFgCode] = useState<string | null>('FG-1001');

  // Executive Sign-off State
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [signOffNotes, setSignOffNotes] = useState('Executive Management approval granted with authorized supplier capacity adjustments.');

  // Build Horizon Items for Current Week (W3) and Next Week (W4)
  const horizonItems: ManagementHorizonItem[] = [
    {
      id: 'HORIZON-01',
      fgCode: 'FG-1001',
      fgDescription: 'Mango Juice 500ml PET Bottle',
      line: 'Line 1A',
      miniFactory: 'MF1',
      customerName: 'Reliance Retail / BigBasket',
      currentWeekNum: 3,
      currentWeekDemand: 4500,
      currentWeekMaxProducible: 3200,
      currentWeekGap: 1300,
      currentWeekCoveragePercent: 71,
      nextWeekNum: 4,
      nextWeekDemand: 4000,
      nextWeekMaxProducible: 3800,
      nextWeekGap: 200,
      nextWeekCoveragePercent: 95,
      criticalComponentCode: 'RM-501',
      criticalComponentDescription: 'Puree Concentrate - Alphonso Mango',
      category: 'RM',
      uom: 'KG',
      stockOnHand: 450,
      inTransitETA: 600,
      etaDate: '2026-08-20 (19.08 07:00 PM)',
      supplierName: 'AgroPur Concentrates Ltd.',
      supplierCapacityStatus: 'CAPACITY_BREACH',
      flagCategory: 'SUPPLIER_CAPACITY',
      stakeholderPositions: {
        demandPlanner: {
          status: 'ACTION_REQUIRED',
          viewpoint: 'Client firm orders require minimum 4,000 units. Willing to agree to -3,500 monthly reduction if backup vendor activated.',
          keyMetric: 'Committed: 16,500 / 20,000 units',
          actionItem: 'Rebalance W1-W2 allocations & lock customer priority order.'
        },
        supplyPlanner: {
          status: 'FLAGGED',
          viewpoint: 'AgroPur monthly processing quota is capped at 1,800 KG. Running full demand causes dry-out on W3 Shift B.',
          keyMetric: 'Capacity Cap: 1,800 KG (Shortfall 600 KG)',
          actionItem: 'Raise emergency PO to PureCrop (450 KG) with air freight.'
        },
        logistics: {
          status: 'ALIGNED',
          viewpoint: 'Domestic refrigerated trucks ready at Kolhapur hub. 36 hours transit once vendor releases batch.',
          keyMetric: 'Transit Time: 36 Hrs',
          actionItem: 'Track GPS live dispatch on 19-Aug.'
        },
        plantOps: {
          status: 'ALIGNED',
          viewpoint: 'Line 1A throughput is running steady at 55 units/hr. Changeover scheduled for Thu Shift A.',
          keyMetric: 'OEE: 88.4%',
          actionItem: 'Maintain clean CIP cycle between mango and orange batches.'
        },
        management: {
          status: 'APPROVED',
          viewpoint: 'Management approves 3,500 units demand cut and authorizes 450 KG secondary vendor sourcing.',
          keyMetric: 'Sign-off: VP Operations',
          actionItem: 'Execute demand reduction & monitor weekly fulfillment.'
        }
      }
    },
    {
      id: 'HORIZON-02',
      fgCode: 'FG-1002',
      fgDescription: 'Orange Nectar 1L Tetra Pak',
      line: 'Line 2A',
      miniFactory: 'MF2',
      customerName: 'Metro Cash & Carry / DMart',
      currentWeekNum: 3,
      currentWeekDemand: 3800,
      currentWeekMaxProducible: 2400,
      currentWeekGap: 1400,
      currentWeekCoveragePercent: 63,
      nextWeekNum: 4,
      nextWeekDemand: 4200,
      nextWeekMaxProducible: 4200,
      nextWeekGap: 0,
      nextWeekCoveragePercent: 100,
      criticalComponentCode: 'PM-805',
      criticalComponentDescription: 'Tetra Slim 1000ml Roll Film',
      category: 'PM',
      uom: 'PC',
      stockOnHand: 2800,
      inTransitETA: 25000,
      etaDate: '2026-08-21 (Port Clearance)',
      supplierName: 'Tetra Pak Packaging India',
      supplierCapacityStatus: 'AT_LIMIT',
      flagCategory: 'PM_LEAD_TIME',
      stakeholderPositions: {
        demandPlanner: {
          status: 'ALIGNED',
          viewpoint: 'Promotional display at DMart starts Week 4. Deferring 1,400 units to W4 is acceptable without penalty.',
          keyMetric: 'Promotional Start: W4',
          actionItem: 'Shift 1,400 units target from W3 to W4.'
        },
        supplyPlanner: {
          status: 'ACTION_REQUIRED',
          viewpoint: 'Import consignment cleared customs inspection on 18-Aug. Inward booking expected 20-Aug at SL02.',
          keyMetric: 'Arrival: 25,000 Roll Film Units',
          actionItem: 'Fast-track QC inspection on arrival.'
        },
        logistics: {
          status: 'ACTION_REQUIRED',
          viewpoint: 'Nhava Sheva container trailer in transit. Expected gate entry SL02 on 20-Aug 02:00 PM.',
          keyMetric: 'ETA: 20-Aug 14:00',
          actionItem: 'Coordinate dock allocation at Warehouse Bay 2.'
        },
        plantOps: {
          status: 'ALIGNED',
          viewpoint: 'Tetra Line 2A ready for aseptic run as soon as film roll arrives.',
          keyMetric: 'Aseptic Line Ready',
          actionItem: 'Pre-heat sterilizer for Thursday start.'
        },
        management: {
          status: 'APPROVED',
          viewpoint: 'Approved weekly rebalancing from W3 to W4. No sales lost.',
          keyMetric: 'Zero Commercial Impact',
          actionItem: 'Sign off weekly rebalance.'
        }
      }
    },
    {
      id: 'HORIZON-03',
      fgCode: '7.06496.03.0',
      fgDescription: 'Vacuum Pump Panther (A-PMP2)',
      line: 'A-PMP2',
      miniFactory: 'Pump_Assembly',
      customerName: 'Mahindra Automotive',
      currentWeekNum: 3,
      currentWeekDemand: 2120,
      currentWeekMaxProducible: 2090,
      currentWeekGap: 30,
      currentWeekCoveragePercent: 98,
      nextWeekNum: 4,
      nextWeekDemand: 2500,
      nextWeekMaxProducible: 2500,
      nextWeekGap: 0,
      nextWeekCoveragePercent: 100,
      criticalComponentCode: 'RM-ROTOR-850',
      criticalComponentDescription: 'Precision Rotor Assembly 40mm',
      category: 'RM',
      uom: 'PC',
      stockOnHand: 440,
      inTransitETA: 1650,
      etaDate: '19.08 07:00 PM (850) & 20.08 03:00 PM (800)',
      supplierName: 'Precision Dynamics Pune',
      supplierCapacityStatus: 'NORMAL',
      flagCategory: 'LOGISTICS_CUSTOMS',
      stakeholderPositions: {
        demandPlanner: {
          status: 'ALIGNED',
          viewpoint: 'Planner released 3-day shift plan with Shift A as IE / Tool Setup and Shift B/C running on evening arrival.',
          keyMetric: 'Total 3-Day Plan: 2,120 PCs',
          actionItem: 'Monitor evening dispatch receipt.'
        },
        supplyPlanner: {
          status: 'ALIGNED',
          viewpoint: 'Precision Dynamics confirmed two dispatches: 850 pcs on 19.08 (7 PM) and 800 pcs on 20.08 (3 PM).',
          keyMetric: 'Total In-Transit: 1,650 PCs',
          actionItem: 'Expedite gate pass entry.'
        },
        logistics: {
          status: 'ALIGNED',
          viewpoint: 'Dedicated express van on highway. Live tracking shows on-schedule arrival.',
          keyMetric: 'GPS: On Route',
          actionItem: 'Notify receiving supervisor on gate arrival.'
        },
        plantOps: {
          status: 'ALIGNED',
          viewpoint: 'Shift A utilized for tooling calibration (IE). Shift B & C will run at 40 pcs/hr.',
          keyMetric: 'STD Routing: 40/hr',
          actionItem: 'Manpower assigned for Shift B & C.'
        },
        management: {
          status: 'APPROVED',
          viewpoint: 'Plan validated with in-transit buffer.',
          keyMetric: 'Full Customer Fulfillment',
          actionItem: 'Monitor night shift execution.'
        }
      }
    }
  ];

  // Executive Plan Sign-Off Handler
  const handleExecuteSignOff = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    onUpdateMonthlyPlanState({
      ...monthlyPlanState,
      status: 'APPROVED_LOCKED',
      approvedAt: nowStr,
      approvedBy: 'Sunil Mehta (VP Operations & Executive Management)',
      notes: signOffNotes
    });

    setIsSignOffModalOpen(false);

    onAddAuditLog({
      phase: 'MANAGEMENT',
      eventType: 'PLAN_APPROVED',
      actorRole: 'Management',
      actorName: 'VP Operations',
      entityKey: `PLAN-${monthlyPlanState.month}`,
      description: `Executive Management approved and locked Monthly S&OP & Operational Plan for ${monthlyPlanState.month}.`,
      oldValue: monthlyPlanState.status,
      newValue: 'APPROVED_LOCKED',
      reason: signOffNotes
    });
  };

  return (
    <div className="space-y-4">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Management Executive Cockpit
              </span>
              <span className="bg-blue-900/80 text-blue-200 border border-blue-700 text-xs font-bold px-2 py-0.5 rounded font-mono">
                Horizon: Current Week (W3) & Next Week (W4)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2 py-0.5 rounded">
                Multi-Stakeholder Alignment
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Executive Overview & Stakeholder Consensus Matrix
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Consolidated strategic viewpoint across <strong>Demand Planning</strong>, <strong>Supply & Procurement</strong>, <strong>Logistics</strong>, and <strong>Plant Operations</strong> with direct executive sign-off authority.
            </p>
          </div>

          {/* Perspective Switcher & Sign-off Button */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setActivePerspective('monthly_sop')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activePerspective === 'monthly_sop'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                📊 Monthly S&OP View
              </button>
              <button
                onClick={() => setActivePerspective('daily_transactions')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activePerspective === 'daily_transactions'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ⚡ Daily Transactions View
              </button>
            </div>

            <button
              onClick={() => setIsSignOffModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Executive Sign-Off Plan</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">S&OP Monthly Plan Status</span>
            <span className="text-sm font-black text-amber-400 block mt-0.5">
              {monthlyPlanState.status.replace('_', ' ')}
            </span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Current Week (W3) Critical Gap</span>
            <span className="text-sm font-black text-red-400 block mt-0.5">
              {horizonItems.reduce((acc, h) => acc + h.currentWeekGap, 0).toLocaleString()} Units at Risk
            </span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Next Week (W4) Coverage</span>
            <span className="text-sm font-black text-emerald-400 block mt-0.5">
              98.2% Producible with ETA
            </span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Stakeholder Alignment Index</span>
            <span className="text-sm font-black text-purple-300 block mt-0.5">
              4 of 4 Teams Aligned (100%)
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
        <button
          onClick={() => setSelectedHorizonTab('critical_items')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            selectedHorizonTab === 'critical_items'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          <span>1. Critical Items Horizon (Current & Next Week)</span>
        </button>

        <button
          onClick={() => setSelectedHorizonTab('stakeholder_matrix')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            selectedHorizonTab === 'stakeholder_matrix'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-300" />
          <span>2. 5-Way Stakeholder Viewpoints & Consensus</span>
        </button>
      </div>

      {/* SUB-VIEW 1: CRITICAL ITEMS HORIZON (CURRENT & NEXT WEEK) */}
      {selectedHorizonTab === 'critical_items' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Critical Finished Goods & Component Bottlenecks: Week 3 & Week 4</span>
              </h3>
              <p className="text-slate-600 text-xs mt-0.5">
                Executive visibility into demand commitments, supply gaps, in-transit dispatches, and supplier capacity limits.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              Mode: {activePerspective === 'monthly_sop' ? 'Monthly S&OP Consensus' : 'Daily Shift Execution'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 pl-4">Finished Good / Line</th>
                  <th className="p-2.5">Customer Priority</th>
                  <th className="p-2.5 text-center bg-blue-50/70 border-x border-slate-200">
                    <span className="block font-black text-blue-950">Current Week (W3)</span>
                    <span className="text-[10px] text-blue-700 font-normal">Demand / Producible / Gap</span>
                  </th>
                  <th className="p-2.5 text-center bg-indigo-50/70 border-r border-slate-200">
                    <span className="block font-black text-indigo-950">Next Week (W4)</span>
                    <span className="text-[10px] text-indigo-700 font-normal">Demand / Producible / Gap</span>
                  </th>
                  <th className="p-2.5">Critical RM/PM & Category</th>
                  <th className="p-2.5">Stock + In-Transit ETA</th>
                  <th className="p-2.5">Supplier & Capacity Status</th>
                  <th className="p-2.5 text-center pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {horizonItems.map((item) => {
                  const isExpanded = expandedFgCode === item.fgCode;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`hover:bg-slate-50 transition cursor-pointer ${isExpanded ? 'bg-blue-50/40' : ''}`}
                          onClick={() => setExpandedFgCode(isExpanded ? null : item.fgCode)}>
                        {/* FG / Line */}
                        <td className="p-2.5 pl-4 space-y-0.5">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-blue-700">{item.fgCode}</span>
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                              {item.line}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium truncate max-w-[200px]">
                            {item.fgDescription}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-2.5 text-slate-700 font-semibold">
                          {item.customerName || 'Standard Market'}
                        </td>

                        {/* Current Week (W3) */}
                        <td className="p-2.5 text-center bg-blue-50/40 border-x border-slate-200">
                          <div className="font-bold text-slate-900">
                            {item.currentWeekDemand.toLocaleString()} / <strong className="text-emerald-700">{item.currentWeekMaxProducible.toLocaleString()}</strong>
                          </div>
                          {item.currentWeekGap > 0 ? (
                            <span className="text-[10px] font-black text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                              Gap: -{item.currentWeekGap.toLocaleString()} ({item.currentWeekCoveragePercent}%)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700">100% Covered</span>
                          )}
                        </td>

                        {/* Next Week (W4) */}
                        <td className="p-2.5 text-center bg-indigo-50/40 border-r border-slate-200">
                          <div className="font-bold text-slate-900">
                            {item.nextWeekDemand.toLocaleString()} / <strong className="text-emerald-700">{item.nextWeekMaxProducible.toLocaleString()}</strong>
                          </div>
                          {item.nextWeekGap > 0 ? (
                            <span className="text-[10px] font-black text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                              Gap: -{item.nextWeekGap.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              100% Covered
                            </span>
                          )}
                        </td>

                        {/* Critical RM/PM */}
                        <td className="p-2.5 space-y-0.5">
                          <div className="font-mono font-bold text-red-700 flex items-center gap-1">
                            <span>{item.criticalComponentCode}</span>
                            <span className="text-[9px] bg-red-100 text-red-800 px-1 py-0.2 rounded font-black">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 truncate max-w-[170px]">
                            {item.criticalComponentDescription}
                          </div>
                        </td>

                        {/* Stock + ETA */}
                        <td className="p-2.5 space-y-0.5">
                          <div className="font-semibold text-slate-800">
                            Stock: <strong>{item.stockOnHand.toLocaleString()} {item.uom}</strong>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-bold">
                            + ETA {item.inTransitETA.toLocaleString()} ({item.etaDate})
                          </div>
                        </td>

                        {/* Supplier Capacity */}
                        <td className="p-2.5 space-y-0.5">
                          <div className="font-bold text-slate-900">{item.supplierName}</div>
                          <div>
                            {item.supplierCapacityStatus === 'CAPACITY_BREACH' ? (
                              <span className="text-[10px] bg-red-100 text-red-800 font-black px-1.5 py-0.2 rounded">
                                Capacity Capped
                              </span>
                            ) : item.supplierCapacityStatus === 'AT_LIMIT' ? (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.2 rounded">
                                Lead Time Hold
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                Capacity Normal
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="p-2.5 text-center pr-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFgCode(isExpanded ? null : item.fgCode);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-bold text-[11px] flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Stakeholders'}</span>
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable 5-Stakeholder Viewpoints Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={8} className="p-4 pl-6 border-b-2 border-slate-300">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-purple-600" />
                                  <span>5-Stakeholder Alignment & Action Directives for {item.fgCode} ({item.fgDescription})</span>
                                </h4>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  Mini Factory: {item.miniFactory} • Line: {item.line}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
                                {/* 1. Demand Planner */}
                                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-blue-900 text-[11px]">👤 Demand Planner</span>
                                    <span className="text-[9px] bg-blue-200 text-blue-900 font-bold px-1 rounded">
                                      {item.stakeholderPositions.demandPlanner.status}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 text-[11px] leading-relaxed">
                                    {item.stakeholderPositions.demandPlanner.viewpoint}
                                  </p>
                                  <div className="text-[10px] text-blue-800 font-bold pt-1 border-t border-blue-200">
                                    Action: {item.stakeholderPositions.demandPlanner.actionItem}
                                  </div>
                                </div>

                                {/* 2. Supply & Purchase */}
                                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-amber-900 text-[11px]">📦 Supply & Purchase</span>
                                    <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1 rounded">
                                      {item.stakeholderPositions.supplyPlanner.status}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 text-[11px] leading-relaxed">
                                    {item.stakeholderPositions.supplyPlanner.viewpoint}
                                  </p>
                                  <div className="text-[10px] text-amber-800 font-bold pt-1 border-t border-amber-200">
                                    Action: {item.stakeholderPositions.supplyPlanner.actionItem}
                                  </div>
                                </div>

                                {/* 3. Logistics Team */}
                                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-emerald-900 text-[11px]">🚚 Logistics Team</span>
                                    <span className="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1 rounded">
                                      {item.stakeholderPositions.logistics.status}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 text-[11px] leading-relaxed">
                                    {item.stakeholderPositions.logistics.viewpoint}
                                  </p>
                                  <div className="text-[10px] text-emerald-800 font-bold pt-1 border-t border-emerald-200">
                                    Action: {item.stakeholderPositions.logistics.actionItem}
                                  </div>
                                </div>

                                {/* 4. Plant Operations */}
                                <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-slate-900 text-[11px]">🏭 Plant Operations</span>
                                    <span className="text-[9px] bg-slate-300 text-slate-900 font-bold px-1 rounded">
                                      {item.stakeholderPositions.plantOps.status}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 text-[11px] leading-relaxed">
                                    {item.stakeholderPositions.plantOps.viewpoint}
                                  </p>
                                  <div className="text-[10px] text-slate-800 font-bold pt-1 border-t border-slate-300">
                                    Action: {item.stakeholderPositions.plantOps.actionItem}
                                  </div>
                                </div>

                                {/* 5. Executive Management */}
                                <div className="p-3 bg-purple-50/90 border border-purple-200 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-purple-900 text-[11px]">⚖️ Management Ruling</span>
                                    <span className="text-[9px] bg-purple-200 text-purple-900 font-bold px-1 rounded">
                                      {item.stakeholderPositions.management.status}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 text-[11px] leading-relaxed font-semibold">
                                    {item.stakeholderPositions.management.viewpoint}
                                  </p>
                                  <div className="text-[10px] text-purple-900 font-extrabold pt-1 border-t border-purple-200">
                                    Directive: {item.stakeholderPositions.management.actionItem}
                                  </div>
                                </div>
                              </div>
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
      )}

      {/* SUB-VIEW 2: 5-WAY STAKEHOLDER MATRIX */}
      {selectedHorizonTab === 'stakeholder_matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {horizonItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{item.fgCode} • {item.fgDescription}</h4>
                  <span className="text-xs text-slate-500 font-mono">Line: {item.line} • Customer: {item.customerName}</span>
                </div>
                <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-0.5 rounded">
                  {item.criticalComponentCode} ({item.category})
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 bg-blue-50/70 rounded-lg border border-blue-200">
                  <strong className="text-blue-900 block text-[11px]">Demand Planner:</strong>
                  <span className="text-slate-700">{item.stakeholderPositions.demandPlanner.viewpoint}</span>
                </div>

                <div className="p-2 bg-amber-50/70 rounded-lg border border-amber-200">
                  <strong className="text-amber-900 block text-[11px]">Supply & Purchase:</strong>
                  <span className="text-slate-700">{item.stakeholderPositions.supplyPlanner.viewpoint}</span>
                </div>

                <div className="p-2 bg-emerald-50/70 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-900 block text-[11px]">Logistics:</strong>
                  <span className="text-slate-700">{item.stakeholderPositions.logistics.viewpoint}</span>
                </div>

                <div className="p-2 bg-purple-50/70 rounded-lg border border-purple-200">
                  <strong className="text-purple-900 block text-[11px]">Management Directive:</strong>
                  <span className="text-purple-900 font-semibold">{item.stakeholderPositions.management.viewpoint}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: EXECUTIVE SIGN-OFF */}
      {isSignOffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-300 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-300" />
                <h3 className="font-extrabold text-base">Executive Management Plan Sign-Off & Lock</h3>
              </div>
              <button
                onClick={() => setIsSignOffModalOpen(false)}
                className="text-purple-200 hover:text-white text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl space-y-1 text-purple-950">
                <span className="font-bold text-sm block">Formal S&OP & Operations Executive Endorsement</span>
                <p className="leading-relaxed text-[11px] text-purple-900">
                  Signing off this plan locks the monthly target volume, authorizes agreed demand cuts, sanctions emergency POs, and publishes the operational run-sheet to Plant Operations.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Executive Approval Directives & Notes
                </label>
                <textarea
                  rows={3}
                  value={signOffNotes}
                  onChange={(e) => setSignOffNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignOffModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSignOff}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Endorse & Lock Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
