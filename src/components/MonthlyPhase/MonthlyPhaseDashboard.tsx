import React, { useState } from 'react';
import {
  MonthlyPlanState,
  MonthlyPlanFlag,
  MonthlyPlanFlagCategory,
  FLAG_CATEGORY_LABELS,
  FlagDiscussionMessage,
  SystemAuditLogItem,
  DemandItem,
  BOMItem,
  DeliveryScheduleItem,
  UserRole
} from '../../types';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  MessageSquare,
  TrendingDown,
  Truck,
  Building2,
  Clock,
  Send,
  Plus,
  Filter,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Check,
  ChevronDown,
  Layers,
  History,
  FileText
} from 'lucide-react';

interface MonthlyPhaseDashboardProps {
  monthlyPlanState: MonthlyPlanState;
  onUpdateMonthlyPlanState: (newState: MonthlyPlanState) => void;
  monthlyFlags: MonthlyPlanFlag[];
  onAddFlag: (flag: MonthlyPlanFlag) => void;
  onUpdateFlag: (flag: MonthlyPlanFlag) => void;
  onResolveFlag: (flagId: string, action: 'DEMAND_REDUCED' | 'SUPPLY_EXPEDITED' | 'REALLOCATED' | 'ACCEPTED_AS_IS', note: string, cutQty?: number) => void;
  onAddDiscussionMessage: (flagId: string, message: FlagDiscussionMessage) => void;
  auditLogs: SystemAuditLogItem[];
  onAddAuditLog: (log: Omit<SystemAuditLogItem, 'id' | 'timestamp'>) => void;
  demands: DemandItem[];
  onUpdateDemand: (updatedDemands: DemandItem[]) => void;
  boms: BOMItem[];
  deliverySchedules: DeliveryScheduleItem[];
  currentRole: UserRole;
}

export const MonthlyPhaseDashboard: React.FC<MonthlyPhaseDashboardProps> = ({
  monthlyPlanState,
  onUpdateMonthlyPlanState,
  monthlyFlags,
  onAddFlag,
  onUpdateFlag,
  onResolveFlag,
  onAddDiscussionMessage,
  auditLogs,
  onAddAuditLog,
  demands,
  onUpdateDemand,
  boms,
  deliverySchedules,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'plan_release' | 'feasibility_flags' | 'discussion_hub' | 'audit_log'>('feasibility_flags');

  // Flag creation form modal
  const [isRaiseFlagModalOpen, setIsRaiseFlagModalOpen] = useState(false);
  const [newFlagForm, setNewFlagForm] = useState<{
    fgCode: string;
    componentCode: string;
    category: MonthlyPlanFlagCategory;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    title: string;
    description: string;
    supplierName: string;
    supplierCapacityLimit: number;
    recommendedDemandCut: number;
  }>({
    fgCode: demands[0]?.fgCode || 'FG-1001',
    componentCode: 'RM-501',
    category: 'SUPPLIER_CAPACITY',
    severity: 'CRITICAL',
    title: '',
    description: '',
    supplierName: 'AgroPur Concentrates Ltd.',
    supplierCapacityLimit: 1800,
    recommendedDemandCut: 2000
  });

  // Selected Flag for discussion panel
  const [selectedFlagId, setSelectedFlagId] = useState<string>(monthlyFlags[0]?.id || '');
  const selectedFlag = monthlyFlags.find((f) => f.id === selectedFlagId) || monthlyFlags[0];

  // Discussion reply message draft
  const [replyMessage, setReplyMessage] = useState('');
  const [replyProposedAction, setReplyProposedAction] = useState('');
  const [replyAuthorRole, setReplyAuthorRole] = useState<'demand_planner' | 'supply_planner' | 'procurement' | 'logistics' | 'production_supervisor' | 'management'>(
    currentRole === 'demand_planner' || currentRole === 'planner'
      ? 'demand_planner'
      : currentRole === 'procurement' || currentRole === 'supply_planner'
      ? 'supply_planner'
      : currentRole === 'management'
      ? 'management'
      : 'procurement'
  );

  // Demand reduction resolution modal state
  const [isReduceDemandModalOpen, setIsReduceDemandModalOpen] = useState(false);
  const [demandCutQty, setDemandCutQty] = useState<number>(selectedFlag?.recommendedDemandCut || 2000);
  const [demandCutReason, setDemandCutReason] = useState<string>('Supplier capacity limitation resolved via S&OP demand balancing');

  // Filter for audit logs
  const [auditFilterPhase, setAuditFilterPhase] = useState<string>('ALL');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');

  // Handle Plan Release / Status Change by Demand Planner
  const handleReleasePlan = () => {
    const nextStatus = monthlyPlanState.status === 'DRAFT' ? 'RELEASED_FOR_VALIDATION' : 'CONSENSUS_REACHED';
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    onUpdateMonthlyPlanState({
      ...monthlyPlanState,
      status: nextStatus,
      releasedAt: nowStr,
      releasedBy: 'Demand Planning Lead',
      version: monthlyPlanState.version + 1
    });

    onAddAuditLog({
      phase: 'MONTHLY_PHASE',
      eventType: 'PLAN_RELEASED',
      actorRole: 'Demand Planner',
      actorName: 'Lead Demand Planner',
      entityKey: `PLAN-${monthlyPlanState.month}`,
      description: `Monthly S&OP plan released for Supply Feasibility Validation (Version ${monthlyPlanState.version + 1}).`,
      oldValue: monthlyPlanState.status,
      newValue: nextStatus,
      reason: 'Released for multi-stakeholder supply chain feasibility review.'
    });
  };

  // Handle Raise Flag Submit
  const handleRaiseFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fg = demands.find((d) => d.fgCode === newFlagForm.fgCode);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newFlag: MonthlyPlanFlag = {
      id: `FLAG-${Date.now().toString().slice(-4)}`,
      fgCode: newFlagForm.fgCode,
      fgDescription: fg?.fgDescription || newFlagForm.fgCode,
      componentCode: newFlagForm.componentCode,
      componentDescription: newFlagForm.componentCode,
      category: newFlagForm.category,
      severity: newFlagForm.severity,
      raisedByRole: 'supply_planner',
      raisedByName: 'Supply Planning / Purchase Team',
      raisedAt: nowStr,
      title: newFlagForm.title || `${FLAG_CATEGORY_LABELS[newFlagForm.category]} on ${newFlagForm.fgCode}`,
      description: newFlagForm.description,
      supplierName: newFlagForm.supplierName,
      supplierCapacityLimit: newFlagForm.supplierCapacityLimit,
      currentDemandQty: fg?.monthlyDemand || 10000,
      recommendedDemandCut: newFlagForm.recommendedDemandCut,
      status: 'OPEN',
      discussions: [
        {
          id: `DISC-${Date.now()}-1`,
          authorRole: 'supply_planner',
          authorName: 'Supply Planner',
          timestamp: nowStr,
          message: newFlagForm.description,
          proposedAction: `Recommended demand cut: ${newFlagForm.recommendedDemandCut.toLocaleString()} units or expedite alternate supplier.`
        }
      ]
    };

    onAddFlag(newFlag);
    setSelectedFlagId(newFlag.id);
    setIsRaiseFlagModalOpen(false);

    onAddAuditLog({
      phase: 'MONTHLY_PHASE',
      eventType: 'FLAG_RAISED',
      actorRole: 'Supply Planner',
      actorName: 'Supply & Purchase Team',
      entityKey: newFlag.fgCode,
      description: `Raised feasibility flag: [${FLAG_CATEGORY_LABELS[newFlag.category]}] on ${newFlag.fgCode}.`,
      oldValue: 'NO_FLAG',
      newValue: `${newFlag.category} (${newFlag.severity})`,
      reason: newFlag.description
    });
  };

  // Handle Post Discussion Message
  const handlePostDiscussionMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedFlag) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const roleLabels: Record<string, string> = {
      demand_planner: 'Demand Planner',
      supply_planner: 'Supply Planner',
      procurement: 'Procurement Lead',
      logistics: 'Logistics Manager',
      production_supervisor: 'Plant Operations',
      management: 'Executive Management'
    };

    const newMsg: FlagDiscussionMessage = {
      id: `DISC-${Date.now()}`,
      authorRole: replyAuthorRole,
      authorName: roleLabels[replyAuthorRole] || replyAuthorRole,
      timestamp: nowStr,
      message: replyMessage.trim(),
      proposedAction: replyProposedAction.trim() || undefined
    };

    onAddDiscussionMessage(selectedFlag.id, newMsg);
    setReplyMessage('');
    setReplyProposedAction('');

    onAddAuditLog({
      phase: 'MONTHLY_PHASE',
      eventType: 'DISCUSSION_POSTED',
      actorRole: roleLabels[replyAuthorRole] || replyAuthorRole,
      actorName: roleLabels[replyAuthorRole] || replyAuthorRole,
      entityKey: selectedFlag.fgCode,
      description: `Posted S&OP discussion reply on Flag ${selectedFlag.id}: "${newMsg.message.substring(0, 60)}..."`,
      reason: newMsg.proposedAction || 'S&OP Alignment'
    });
  };

  // Handle Demand Cut Resolution Execution
  const handleExecuteDemandCut = () => {
    if (!selectedFlag) return;

    const targetFg = demands.find((d) => d.fgCode === selectedFlag.fgCode);
    if (!targetFg) return;

    const oldDemand = targetFg.monthlyDemand;
    const newMonthlyDemand = Math.max(0, oldDemand - demandCutQty);
    
    // Distribute demand reduction evenly across weeks
    const cutPerWeek = Math.round(demandCutQty / 4);
    const updatedDemands = demands.map((d) => {
      if (d.fgCode === selectedFlag.fgCode) {
        return {
          ...d,
          monthlyDemand: newMonthlyDemand,
          week1Demand: Math.max(0, (d.week1Demand || Math.round(d.monthlyDemand / 4)) - cutPerWeek),
          week2Demand: Math.max(0, (d.week2Demand || Math.round(d.monthlyDemand / 4)) - cutPerWeek),
          week3Demand: Math.max(0, (d.week3Demand || Math.round(d.monthlyDemand / 4)) - cutPerWeek),
          week4Demand: Math.max(0, (d.week4Demand || Math.round(d.monthlyDemand / 4)) - (demandCutQty - cutPerWeek * 3))
        };
      }
      return d;
    });

    onUpdateDemand(updatedDemands);
    onResolveFlag(
      selectedFlag.id,
      'DEMAND_REDUCED',
      `Demand reduced by ${demandCutQty.toLocaleString()} units (${oldDemand.toLocaleString()} -> ${newMonthlyDemand.toLocaleString()}). ${demandCutReason}`,
      demandCutQty
    );

    setIsReduceDemandModalOpen(false);

    onAddAuditLog({
      phase: 'MONTHLY_PHASE',
      eventType: 'DEMAND_REDUCED',
      actorRole: 'Demand Planner',
      actorName: 'Demand & Supply S&OP Consensus',
      entityKey: selectedFlag.fgCode,
      description: `Reduced monthly demand for ${selectedFlag.fgCode} by ${demandCutQty.toLocaleString()} units.`,
      oldValue: `${oldDemand.toLocaleString()} ${targetFg.uom}`,
      newValue: `${newMonthlyDemand.toLocaleString()} ${targetFg.uom}`,
      reason: demandCutReason
    });
  };

  // Status styling helpers
  const getStatusBadge = (status: MonthlyPlanState['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full text-xs font-black">Draft</span>;
      case 'RELEASED_FOR_VALIDATION':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-full text-xs font-black animate-pulse">Released for Validation</span>;
      case 'FLAGS_RAISED':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-black">Concerns Flagged ({monthlyFlags.filter(f => f.status !== 'RESOLVED').length})</span>;
      case 'CONSENSUS_REACHED':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded-full text-xs font-black">Consensus Reached</span>;
      case 'APPROVED_LOCKED':
        return <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1"><Lock className="w-3 h-3" /> Approved & Locked</span>;
    }
  };

  const getCategoryBadge = (category: MonthlyPlanFlagCategory) => {
    switch (category) {
      case 'SUPPLIER_CAPACITY':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[10px] font-black">Supplier Capacity</span>;
      case 'RM_SHORTAGE':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-black">RM Shortage</span>;
      case 'PM_LEAD_TIME':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-black">PM Lead Time</span>;
      case 'LOGISTICS_CUSTOMS':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-black">Logistics / Port</span>;
      case 'MOQ_BATCH_SIZE':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-black">MOQ Constraint</span>;
      case 'QUALITY_HOLD':
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-black">Quality Hold</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-black">Operational</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Monthly Phase Header & Summary Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Phase 1: Monthly S&OP Feasibility & Consensus
              </span>
              {getStatusBadge(monthlyPlanState.status)}
              <span className="text-xs text-blue-200 font-mono">v{monthlyPlanState.version}.0</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {monthlyPlanState.title}
            </h2>
            <p className="text-xs text-blue-200/90 leading-relaxed max-w-3xl">
              Demand Planner releases the monthly target plan. Supply Planner & Logistics teams validate feasibility against supplier capacity and flag category bottlenecks for collaborative resolution.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsRaiseFlagModalOpen(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Raise Supply Flag</span>
            </button>

            <button
              onClick={handleReleasePlan}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {monthlyPlanState.status === 'DRAFT' ? 'Release Monthly Plan' : 'Publish Consensus Plan'}
              </span>
            </button>
          </div>
        </div>

        {/* Mini KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-blue-800/80 text-xs">
          <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800">
            <span className="text-blue-300 font-semibold block text-[11px]">Total Monthly Demand Target</span>
            <span className="text-base font-black text-white">
              {demands.reduce((acc, d) => acc + d.monthlyDemand, 0).toLocaleString()} <span className="text-[10px] text-blue-300">Units</span>
            </span>
          </div>
          <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800">
            <span className="text-blue-300 font-semibold block text-[11px]">Supply Feasibility Flags</span>
            <span className="text-base font-black text-amber-400">
              {monthlyFlags.filter(f => f.status !== 'RESOLVED').length} Active / {monthlyFlags.length} Total
            </span>
          </div>
          <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800">
            <span className="text-blue-300 font-semibold block text-[11px]">Last Release Timestamp</span>
            <span className="text-xs font-bold text-white font-mono">
              {monthlyPlanState.releasedAt || 'Not yet released'}
            </span>
          </div>
          <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800">
            <span className="text-blue-300 font-semibold block text-[11px]">System Audit Trail</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {auditLogs.filter(a => a.phase === 'MONTHLY_PHASE').length} Log Entries
            </span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('feasibility_flags')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'feasibility_flags'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          <span>1. Supply Feasibility Flags ({monthlyFlags.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('discussion_hub')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'discussion_hub'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>2. S&OP Discussion & Demand Cut Hub</span>
        </button>

        <button
          onClick={() => setActiveSubTab('plan_release')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'plan_release'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Demand Plan Release Breakdown</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit_log')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'audit_log'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5 text-emerald-500" />
          <span>4. System Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: SUPPLY FEASIBILITY FLAGS TABLE */}
      {activeSubTab === 'feasibility_flags' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Supply Planner / Logistics Raised Concern Flags</span>
              </h3>
              <p className="text-slate-600 text-xs mt-0.5">
                Categorized supply constraints raised against released Finished Goods and raw material components.
              </p>
            </div>
            <button
              onClick={() => setIsRaiseFlagModalOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise New Flag</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 pl-4">Flag ID & Category</th>
                  <th className="p-2.5">Finished Good / Customer</th>
                  <th className="p-2.5">Bottleneck Component</th>
                  <th className="p-2.5">Supplier & Capacity Limit</th>
                  <th className="p-2.5 text-right">Current Demand</th>
                  <th className="p-2.5 text-right">Recommended Cut</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlyFlags.map((flag) => {
                  const isSelected = flag.id === selectedFlagId;
                  return (
                    <tr
                      key={flag.id}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                      }`}
                      onClick={() => {
                        setSelectedFlagId(flag.id);
                        setActiveSubTab('discussion_hub');
                      }}
                    >
                      <td className="p-2.5 pl-4 space-y-1">
                        <div className="font-mono font-bold text-slate-800">{flag.id}</div>
                        <div>{getCategoryBadge(flag.category)}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{flag.fgCode}</div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[180px]">{flag.fgDescription}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-blue-700">{flag.componentCode}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{flag.componentDescription}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{flag.supplierName || 'Primary Vendor'}</div>
                        <div className="text-[11px] text-red-600 font-semibold">
                          Cap: {flag.supplierCapacityLimit ? `${flag.supplierCapacityLimit.toLocaleString()} units/mo` : 'Lead Time Lag'}
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {flag.currentDemandQty.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-black text-red-600">
                        -{flag.recommendedDemandCut?.toLocaleString() || 0}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          flag.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : flag.status === 'IN_DISCUSSION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {flag.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 text-center pr-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFlagId(flag.id);
                            setActiveSubTab('discussion_hub');
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-extrabold flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Discuss ({flag.discussions.length})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: S&OP DISCUSSION & DEMAND CUT HUB */}
      {activeSubTab === 'discussion_hub' && selectedFlag && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Flag Detail & Direct Actions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedFlag.id}
                </span>
                {getCategoryBadge(selectedFlag.category)}
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{selectedFlag.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedFlag.description}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Finished Good:</span>
                  <strong className="text-slate-900">{selectedFlag.fgCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Component:</span>
                  <strong className="text-blue-700">{selectedFlag.componentCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier:</span>
                  <strong className="text-slate-900">{selectedFlag.supplierName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier Capacity:</span>
                  <strong className="text-red-700">{selectedFlag.supplierCapacityLimit?.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current FG Demand:</span>
                  <strong className="text-slate-900">{selectedFlag.currentDemandQty.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recommended Cut:</span>
                  <strong className="text-red-600 font-extrabold">-{selectedFlag.recommendedDemandCut?.toLocaleString()}</strong>
                </div>
              </div>

              {/* S&OP Action Center */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="font-extrabold text-xs text-slate-800 block">S&OP Consensus Actions:</span>
                
                <button
                  onClick={() => {
                    setDemandCutQty(selectedFlag.recommendedDemandCut || 2000);
                    setIsReduceDemandModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Execute Demand Cut ({selectedFlag.fgCode})</span>
                </button>

                <button
                  onClick={() => {
                    onResolveFlag(selectedFlag.id, 'SUPPLY_EXPEDITED', 'Expedited alternate supplier commitment authorized by S&OP team.');
                    onAddAuditLog({
                      phase: 'MONTHLY_PHASE',
                      eventType: 'SUPPLY_SCHEDULE_CHANGED',
                      actorRole: 'Procurement',
                      actorName: 'Procurement Lead',
                      entityKey: selectedFlag.componentCode || selectedFlag.fgCode,
                      description: `Authorized expedited backup supply for ${selectedFlag.componentCode}.`,
                      reason: 'S&OP Sourcing Resolution'
                    });
                  }}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Authorize Expedited Supply</span>
                </button>

                <button
                  onClick={() => {
                    onResolveFlag(selectedFlag.id, 'ACCEPTED_AS_IS', 'Management accepted supplier risk with buffer run.');
                    onAddAuditLog({
                      phase: 'MONTHLY_PHASE',
                      eventType: 'PLAN_APPROVED',
                      actorRole: 'Management',
                      actorName: 'Executive Management',
                      entityKey: selectedFlag.fgCode,
                      description: `Management authorized production with buffer for ${selectedFlag.fgCode}.`,
                      reason: 'Risk Accepted'
                    });
                  }}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Sign Off & Resolve Flag</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Stakeholder Discussion Thread */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[560px]">
            {/* Thread Header */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-xs text-slate-800">
                  S&OP Collaborative Alignment Log ({selectedFlag.discussions.length} entries)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Flag: {selectedFlag.id} • {selectedFlag.fgCode}
              </span>
            </div>

            {/* Messages Scrollable List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {selectedFlag.discussions.map((msg) => {
                const isDemandPlanner = msg.authorRole === 'demand_planner';
                const isSupplyPlanner = msg.authorRole === 'supply_planner' || msg.authorRole === 'procurement';
                const isManagement = msg.authorRole === 'management';

                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      isManagement
                        ? 'bg-purple-50 border-purple-200'
                        : isDemandPlanner
                        ? 'bg-blue-50 border-blue-200'
                        : isSupplyPlanner
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-extrabold ${
                          isManagement ? 'text-purple-900' : isDemandPlanner ? 'text-blue-900' : 'text-amber-900'
                        }`}>
                          {msg.authorName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">({msg.timestamp})</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/80 border text-slate-700">
                        {msg.authorRole.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed font-medium">{msg.message}</p>

                    {msg.proposedAction && (
                      <div className="mt-1.5 p-2 bg-white/90 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 font-semibold flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-amber-800 font-bold block">Proposed S&OP Action:</span>
                          <span>{msg.proposedAction}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Discussion Reply Composer */}
            <form onSubmit={handlePostDiscussionMessage} className="p-3 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-[11px]">Post reply as:</span>
                  <select
                    value={replyAuthorRole}
                    onChange={(e) => setReplyAuthorRole(e.target.value as any)}
                    className="bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-slate-800"
                  >
                    <option value="demand_planner">Demand Planner</option>
                    <option value="supply_planner">Supply Planner</option>
                    <option value="procurement">Procurement</option>
                    <option value="logistics">Logistics</option>
                    <option value="management">Management</option>
                  </select>
                </div>
                <span className="text-[11px] text-slate-500">Timestamp logged automatically</span>
              </div>

              <textarea
                required
                rows={2}
                placeholder="Write stakeholder viewpoint, supplier update, or proposal..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Proposed Action (Optional e.g., Cut demand by 10% / Expedite PO)"
                  value={replyProposedAction}
                  onChange={(e) => setReplyProposedAction(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                />

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Viewpoint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DEMAND PLAN RELEASE BREAKDOWN */}
      {activeSubTab === 'plan_release' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Monthly Finished Good Commitment Plan (July 2026)
              </h3>
              <p className="text-slate-600 text-xs">
                Breakdown of released finished good demand targets across weeks W1–W4.
              </p>
            </div>
            <button
              onClick={handleReleasePlan}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Update S&OP Release</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 pl-4">FG Code</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5 text-right font-extrabold">W1</th>
                  <th className="p-2.5 text-right font-extrabold">W2</th>
                  <th className="p-2.5 text-right font-extrabold">W3</th>
                  <th className="p-2.5 text-right font-extrabold">W4</th>
                  <th className="p-2.5 text-right font-black">Total Month</th>
                  <th className="p-2.5 text-center pr-4">Feasibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {demands.map((d) => {
                  const hasFlag = monthlyFlags.some((f) => f.fgCode === d.fgCode && f.status !== 'RESOLVED');
                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-2.5 pl-4 font-mono font-bold text-blue-700">{d.fgCode}</td>
                      <td className="p-2.5 font-medium text-slate-900">{d.fgDescription}</td>
                      <td className="p-2.5 text-slate-600 font-semibold">{d.customerName || 'General Sales'}</td>
                      <td className="p-2.5 text-right font-medium">{(d.week1Demand || Math.round(d.monthlyDemand / 4)).toLocaleString()}</td>
                      <td className="p-2.5 text-right font-medium">{(d.week2Demand || Math.round(d.monthlyDemand / 4)).toLocaleString()}</td>
                      <td className="p-2.5 text-right font-medium">{(d.week3Demand || Math.round(d.monthlyDemand / 4)).toLocaleString()}</td>
                      <td className="p-2.5 text-right font-medium">{(d.week4Demand || Math.round(d.monthlyDemand / 4)).toLocaleString()}</td>
                      <td className="p-2.5 text-right font-black text-slate-900 bg-slate-50">
                        {d.monthlyDemand.toLocaleString()} {d.uom}
                      </td>
                      <td className="p-2.5 text-center pr-4">
                        {hasFlag ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-black text-[10px]">
                            Constraint Flagged
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                            100% Feasible
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
      )}

      {/* SUB-TAB 4: SYSTEM AUDIT LOG */}
      {activeSubTab === 'audit_log' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Timestamp-Based System Audit Log</span>
              </h3>
              <p className="text-slate-600 text-xs">
                Comprehensive tamper-proof audit trail for all S&OP plan releases, supply flags, demand adjustments, and approvals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditFilterPhase}
                onChange={(e) => setAuditFilterPhase(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700"
              >
                <option value="ALL">All Phases</option>
                <option value="MONTHLY_PHASE">Monthly S&OP Phase</option>
                <option value="WEEKLY_PHASE">Weekly MRP Phase</option>
                <option value="DAILY_PHASE">Daily 3-Day Phase</option>
              </select>

              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 pl-4">Timestamp (YYYY-MM-DD HH:MM:SS)</th>
                  <th className="p-2.5">Phase</th>
                  <th className="p-2.5">Event Type</th>
                  <th className="p-2.5">Actor / Role</th>
                  <th className="p-2.5">Entity</th>
                  <th className="p-2.5">Audit Description & Changes</th>
                  <th className="p-2.5 pr-4">Reason / Business Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs
                  .filter((log) => auditFilterPhase === 'ALL' || log.phase === auditFilterPhase)
                  .filter((log) => {
                    if (!auditSearchTerm) return true;
                    const term = auditSearchTerm.toLowerCase();
                    return (
                      log.description.toLowerCase().includes(term) ||
                      log.actorName.toLowerCase().includes(term) ||
                      log.entityKey.toLowerCase().includes(term) ||
                      (log.reason && log.reason.toLowerCase().includes(term))
                    );
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="p-2.5 pl-4 font-bold text-slate-800 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {log.phase.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-blue-700">{log.eventType}</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-900">{log.actorName} ({log.actorRole})</td>
                      <td className="p-2.5 font-bold text-slate-800">{log.entityKey}</td>
                      <td className="p-2.5 font-sans font-medium text-slate-800 max-w-md">
                        {log.description}
                        {log.oldValue && log.newValue && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {log.oldValue} ➔ <strong className="text-slate-800">{log.newValue}</strong>
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 pr-4 font-sans text-slate-600 italic max-w-xs">{log.reason || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: RAISE SUPPLY FLAG */}
      {isRaiseFlagModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-200" />
                <h3 className="font-extrabold text-base">Raise Monthly Supply Feasibility Flag</h3>
              </div>
              <button
                onClick={() => setIsRaiseFlagModalOpen(false)}
                className="text-red-200 hover:text-white text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseFlagSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Finished Good (FG)</label>
                  <select
                    value={newFlagForm.fgCode}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, fgCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    {demands.map((d) => (
                      <option key={d.fgCode} value={d.fgCode}>
                        {d.fgCode} - {d.fgDescription}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Concern Category</label>
                  <select
                    value={newFlagForm.category}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, category: e.target.value as MonthlyPlanFlagCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    {Object.entries(FLAG_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                      <option key={catKey} value={catKey}>
                        {catLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bottleneck Component Code</label>
                  <input
                    type="text"
                    required
                    value={newFlagForm.componentCode}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, componentCode: e.target.value })}
                    placeholder="e.g. RM-501 or PM-805"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={newFlagForm.supplierName}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, supplierName: e.target.value })}
                    placeholder="e.g. AgroPur Concentrates"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier Monthly Capacity Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={newFlagForm.supplierCapacityLimit}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, supplierCapacityLimit: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recommended Demand Cut (Units)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFlagForm.recommendedDemandCut}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, recommendedDemandCut: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Flag Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supplier Monthly Capacity Limit Reached"
                  value={newFlagForm.title}
                  onChange={(e) => setNewFlagForm({ ...newFlagForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Concern / Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain supplier bottleneck, lead times, port hold, or capacity constraint..."
                  value={newFlagForm.description}
                  onChange={(e) => setNewFlagForm({ ...newFlagForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRaiseFlagModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Raise Supply Flag</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXECUTE DEMAND CUT (S&OP RESOLUTION) */}
      {isReduceDemandModalOpen && selectedFlag && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-base">S&OP Consensus Demand Reduction</h3>
              </div>
              <button
                onClick={() => setIsReduceDemandModalOpen(false)}
                className="text-amber-200 hover:text-white text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
                <div className="font-bold text-amber-900 flex justify-between">
                  <span>Finished Good: {selectedFlag.fgCode}</span>
                  <span>{selectedFlag.fgDescription}</span>
                </div>
                <div className="text-amber-800 text-[11px]">
                  Reducing this demand will automatically recalculate MRP net requirements, eliminate component shortage warnings, and log an official S&OP audit entry.
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Demand Reduction Quantity (Units to Cut)
                </label>
                <input
                  type="number"
                  min="100"
                  max={selectedFlag.currentDemandQty}
                  value={demandCutQty}
                  onChange={(e) => setDemandCutQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-base font-black text-red-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                  <span>Current: {selectedFlag.currentDemandQty.toLocaleString()} units</span>
                  <span>New Target: <strong className="text-emerald-700">{(selectedFlag.currentDemandQty - demandCutQty).toLocaleString()} units</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resolution Reason / Joint Consensus Note
                </label>
                <textarea
                  rows={2}
                  value={demandCutReason}
                  onChange={(e) => setDemandCutReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReduceDemandModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDemandCut}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Execute Demand Cut & Recalculate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
