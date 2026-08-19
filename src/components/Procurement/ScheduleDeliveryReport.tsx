import React, { useState, useMemo } from 'react';
import { DeliveryScheduleItem, ScheduleAuditLog, InventoryItem } from '../../types';
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  History,
  Edit3,
  Search,
  Filter,
  Clock,
  User,
  Calendar,
  X,
  FileText,
  Building,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface ScheduleDeliveryReportProps {
  schedules: DeliveryScheduleItem[];
  inventory: InventoryItem[];
  isPurchaseRole?: boolean;
  onUpdateSchedules: (updated: DeliveryScheduleItem[]) => void;
  onUpdateInventory: (updated: InventoryItem[]) => void;
}

const COMMON_REASONS = [
  'Supplier delayed production / shipment dispatch',
  'Customs clearance / port congestion delay',
  'Advanced shipment to prevent production line stoppage',
  'Partial shipment dispatched by vendor due to capacity constraint',
  'QC batch inspection / testing re-run required',
  'Transporter / logistics road transit delay',
  'PO quantity amendment per updated customer demand',
  'Warehouse receiving dock rescheduled',
  'Other custom supplier constraint'
];

export const ScheduleDeliveryReport: React.FC<ScheduleDeliveryReportProps> = ({
  schedules,
  inventory,
  isPurchaseRole = true,
  onUpdateSchedules,
  onUpdateInventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [weekFilter, setWeekFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Y' | 'N'>('ALL');
  const [showOnlyModified, setShowOnlyModified] = useState(false);

  // Edit Schedule Modal
  const [editingItem, setEditingItem] = useState<DeliveryScheduleItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    qty: 0,
    week: 1 as 1 | 2 | 3 | 4,
    eta: '',
    etd: '',
    vendor: '',
    delivered: 'N' as 'Y' | 'N',
    reasonCategory: COMMON_REASONS[0],
    customReason: '',
    changedBy: 'Buyer_Procurement'
  });

  // History / Audit Trail Modal for a single item or master view
  const [viewHistoryItem, setViewHistoryItem] = useState<DeliveryScheduleItem | null>(null);
  const [isMasterAuditOpen, setIsMasterAuditOpen] = useState(false);

  // Add New Schedule Modal
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemData, setNewItemData] = useState({
    poNumber: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
    materialCode: 'RM-501',
    description: 'Puree Concentrate - Alphonso Mango',
    qty: 1500,
    unit: 'KG',
    vendor: 'SunRipe Fruits Exim',
    etd: '2026-07-10',
    eta: '2026-07-16',
    week: 2 as 1 | 2 | 3 | 4,
    delivered: 'N' as 'Y' | 'N',
    reason: 'Initial confirmed vendor dispatch booking'
  });

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      if (weekFilter !== 'ALL' && item.week !== weekFilter) return false;
      if (statusFilter !== 'ALL' && item.delivered !== statusFilter) return false;
      if (showOnlyModified && (!item.revisionCount || item.revisionCount === 0)) return false;

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesPO = item.poNumber?.toLowerCase().includes(term);
        const matchesCode = item.materialCode.toLowerCase().includes(term);
        const matchesDesc = item.description.toLowerCase().includes(term);
        const matchesVendor = item.vendor.toLowerCase().includes(term);
        const matchesReason = item.lastReason?.toLowerCase().includes(term);
        if (!matchesPO && !matchesCode && !matchesDesc && !matchesVendor && !matchesReason) return false;
      }
      return true;
    });
  }, [schedules, weekFilter, statusFilter, showOnlyModified, searchTerm]);

  // Aggregate Master Audit Logs across all schedules
  const allAuditLogs = useMemo(() => {
    const logs: (ScheduleAuditLog & { currentDesc?: string })[] = [];
    schedules.forEach((sch) => {
      if (sch.auditLogs && sch.auditLogs.length > 0) {
        sch.auditLogs.forEach((log) => {
          logs.push({
            ...log,
            currentDesc: sch.description
          });
        });
      }
    });
    // Sort newest timestamp first
    return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [schedules]);

  // Handle opening edit modal
  const handleOpenEdit = (item: DeliveryScheduleItem) => {
    setEditingItem(item);
    setEditFormData({
      qty: item.qty,
      week: item.week,
      eta: item.eta,
      etd: item.etd,
      vendor: item.vendor,
      delivered: item.delivered,
      reasonCategory: COMMON_REASONS[0],
      customReason: '',
      changedBy: item.changedBy || 'Buyer_Procurement'
    });
  };

  // Submit Schedule Change with Audit Logging
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const finalReason =
      editFormData.customReason.trim() !== ''
        ? editFormData.customReason.trim()
        : editFormData.reasonCategory;

    if (!finalReason) {
      alert('You must provide a mandatory reason for changing the delivery schedule.');
      return;
    }

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Identify what changed
    const changes: string[] = [];
    if (editingItem.week !== editFormData.week) {
      changes.push(`Week changed: W${editingItem.week} -> W${editFormData.week}`);
    }
    if (editingItem.eta !== editFormData.eta) {
      changes.push(`ETA Date: ${editingItem.eta} -> ${editFormData.eta}`);
    }
    if (editingItem.qty !== editFormData.qty) {
      changes.push(`Qty: ${editingItem.qty.toLocaleString()} -> ${editFormData.qty.toLocaleString()} ${editingItem.unit}`);
    }
    if (editingItem.delivered !== editFormData.delivered) {
      changes.push(`Status: ${editingItem.delivered === 'Y' ? 'Delivered' : 'In-Transit'} -> ${editFormData.delivered === 'Y' ? 'Delivered' : 'In-Transit'}`);
    }
    if (editingItem.vendor !== editFormData.vendor) {
      changes.push(`Vendor: ${editingItem.vendor} -> ${editFormData.vendor}`);
    }

    const changeSummary = changes.length > 0 ? changes.join('; ') : 'Details Updated';

    const newAuditLog: ScheduleAuditLog = {
      id: `log-${Date.now()}`,
      scheduleId: editingItem.id,
      poNumber: editingItem.poNumber || 'N/A',
      materialCode: editingItem.materialCode,
      materialDescription: editingItem.description,
      timestamp: currentTimestamp,
      changedBy: editFormData.changedBy,
      changeField: changeSummary,
      oldValue: `W${editingItem.week} (${editingItem.eta}) - ${editingItem.qty.toLocaleString()} ${editingItem.unit} [${editingItem.delivered}]`,
      newValue: `W${editFormData.week} (${editFormData.eta}) - ${Number(editFormData.qty).toLocaleString()} ${editingItem.unit} [${editFormData.delivered}]`,
      reason: finalReason
    };

    const updatedSchedules = schedules.map((s) => {
      if (s.id === editingItem.id) {
        return {
          ...s,
          qty: Number(editFormData.qty),
          week: editFormData.week,
          eta: editFormData.eta,
          etd: editFormData.etd,
          vendor: editFormData.vendor,
          delivered: editFormData.delivered,
          lastReason: finalReason,
          lastModified: currentTimestamp,
          changedBy: editFormData.changedBy,
          revisionCount: (s.revisionCount || 0) + 1,
          auditLogs: [newAuditLog, ...(s.auditLogs || [])]
        };
      }
      return s;
    });

    onUpdateSchedules(updatedSchedules);

    // If delivered flag turned from N to Y, increment warehouse inventory
    if (editingItem.delivered === 'N' && editFormData.delivered === 'Y') {
      const updatedInv = inventory.map((inv) => {
        if (inv.materialNumber === editingItem.materialCode) {
          return {
            ...inv,
            unrestricted: inv.unrestricted + Number(editFormData.qty),
            lastUpdated: currentTimestamp.split(' ')[0]
          };
        }
        return inv;
      });
      onUpdateInventory(updatedInv);
    }

    setEditingItem(null);
  };

  // Direct toggle delivered with audit
  const handleToggleDelivered = (item: DeliveryScheduleItem) => {
    const newStatus = item.delivered === 'Y' ? 'N' : 'Y';
    const reason =
      newStatus === 'Y'
        ? 'Confirmed physical receipt at warehouse & GR verification'
        : 'Reverted back to In-Transit';
    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newAuditLog: ScheduleAuditLog = {
      id: `log-${Date.now()}`,
      scheduleId: item.id,
      poNumber: item.poNumber || 'N/A',
      materialCode: item.materialCode,
      materialDescription: item.description,
      timestamp: currentTimestamp,
      changedBy: 'Dock_Supervisor',
      changeField: 'Status Toggle',
      oldValue: item.delivered === 'Y' ? 'Delivered (Y)' : 'In-Transit (N)',
      newValue: newStatus === 'Y' ? 'Delivered (Y)' : 'In-Transit (N)',
      reason
    };

    const updatedSchedules = schedules.map((s) => {
      if (s.id === item.id) {
        return {
          ...s,
          delivered: newStatus,
          lastReason: reason,
          lastModified: currentTimestamp,
          changedBy: 'Dock_Supervisor',
          revisionCount: (s.revisionCount || 0) + 1,
          auditLogs: [newAuditLog, ...(s.auditLogs || [])]
        };
      }
      return s;
    });

    onUpdateSchedules(updatedSchedules);

    if (newStatus === 'Y') {
      const updatedInv = inventory.map((inv) => {
        if (inv.materialNumber === item.materialCode) {
          return {
            ...inv,
            unrestricted: inv.unrestricted + item.qty,
            lastUpdated: currentTimestamp.split(' ')[0]
          };
        }
        return inv;
      });
      onUpdateInventory(updatedInv);
    }
  };

  // Handle Add New
  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newSchedule: DeliveryScheduleItem = {
      id: `del-${Date.now()}`,
      materialCode: newItemData.materialCode,
      description: newItemData.description,
      qty: Number(newItemData.qty),
      unit: newItemData.unit,
      vendor: newItemData.vendor,
      etd: newItemData.etd,
      eta: newItemData.eta,
      week: newItemData.week,
      delivered: newItemData.delivered,
      poNumber: newItemData.poNumber,
      lastReason: newItemData.reason || 'Initial confirmed vendor dispatch booking',
      lastModified: currentTimestamp,
      changedBy: 'Buyer_Procurement',
      revisionCount: 0,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          scheduleId: `del-${Date.now()}`,
          poNumber: newItemData.poNumber,
          materialCode: newItemData.materialCode,
          materialDescription: newItemData.description,
          timestamp: currentTimestamp,
          changedBy: 'Buyer_Procurement',
          changeField: 'Initial Creation',
          oldValue: '-',
          newValue: `${newItemData.qty.toLocaleString()} ${newItemData.unit} (W${newItemData.week})`,
          reason: newItemData.reason || 'Initial confirmed vendor dispatch booking'
        }
      ]
    };

    onUpdateSchedules([newSchedule, ...schedules]);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Role Restriction Banner if Non-Purchase */}
      {!isPurchaseRole && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Read-Only Schedule Mode:</strong> Logged in as non-purchase role. Only the <strong>Purchase / Procurement</strong> team is authorized to add, reschedule, or modify vendor delivery dispatches.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded font-mono font-bold text-[10px] uppercase">
            Access Restricted
          </span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-700 text-white rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Vendor Delivery Schedule & Change Control Report
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                  {schedules.length} Total Dispatches
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  {allAuditLogs.length} Audit Events Logged
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every schedule modification requires a verified reason and is automatically logged with exact timestamps and user audit records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMasterAuditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Audit Trail ({allAuditLogs.length})</span>
            </button>

            {isPurchaseRole ? (
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dispatch Schedule</span>
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold rounded-lg cursor-not-allowed"
                title="Restricted: Only Purchase team can add new delivery schedules"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Add Dispatch (Purchase Only)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search PO#, Material, Vendor, or Reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* Week Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setWeekFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  weekFilter === 'ALL' ? 'bg-white text-purple-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Weeks
              </button>
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeekFilter(w as 1 | 2 | 3 | 4)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    weekFilter === w ? 'bg-white text-purple-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Week {w}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Delivery Statuses</option>
              <option value="N">🚚 In-Transit (N) Only</option>
              <option value="Y">✅ Delivered (Y) Only</option>
            </select>

            {/* Show only modified */}
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={showOnlyModified}
                onChange={(e) => setShowOnlyModified(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Modified Entries Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Tabular Schedule Report */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 min-w-[90px]">PO Number</th>
                <th className="py-2.5 px-3 min-w-[100px]">Material Code</th>
                <th className="py-2.5 px-3 min-w-[180px]">Material Description</th>
                <th className="py-2.5 px-3 min-w-[140px]">Vendor Name</th>
                <th className="py-2.5 px-3 text-right min-w-[90px]">Quantity</th>
                <th className="py-2.5 px-2 text-center w-12">Unit</th>
                <th className="py-2.5 px-2 text-center bg-purple-900/40 min-w-[70px]">Week</th>
                <th className="py-2.5 px-3 text-center min-w-[90px]">ETA Date</th>
                <th className="py-2.5 px-3 text-center min-w-[110px]">Status</th>
                <th className="py-2.5 px-3 min-w-[200px]">Last Reason for Change</th>
                <th className="py-2.5 px-3 min-w-[140px]">Last Timestamp & User</th>
                <th className="py-2.5 px-3 text-center min-w-[100px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 font-sans">
                    <p className="text-sm font-semibold">No delivery schedules found matching the filter.</p>
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((item, idx) => {
                  const isDelivered = item.delivered === 'Y';
                  const revisionCount = item.revisionCount || 0;
                  const hasAudits = (item.auditLogs && item.auditLogs.length > 0);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-purple-50/30 transition ${
                        isDelivered ? 'bg-slate-50/50 text-slate-500' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* PO Number */}
                      <td className="py-2.5 px-3 font-bold text-purple-950">
                        {item.poNumber || 'PO-N/A'}
                      </td>

                      {/* Material Code */}
                      <td className="py-2.5 px-3 font-bold text-blue-700">
                        {item.materialCode}
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                        {item.description}
                      </td>

                      {/* Vendor */}
                      <td className="py-2.5 px-3 font-sans text-slate-700">
                        {item.vendor}
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.qty.toLocaleString()}
                      </td>

                      {/* Unit */}
                      <td className="py-2.5 px-2 text-center uppercase text-slate-500 text-[11px]">
                        {item.unit}
                      </td>

                      {/* Assigned Week */}
                      <td className="py-2.5 px-2 text-center font-bold">
                        <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[11px]">
                          W{item.week}
                        </span>
                      </td>

                      {/* ETA Date */}
                      <td className="py-2.5 px-3 text-center text-slate-700">
                        {item.eta}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-2.5 px-3 text-center font-sans">
                        <button
                          onClick={() => {
                            if (!isPurchaseRole) {
                              alert('Permission Denied: Only the Purchase (Procurement) team can update delivery receipt status.');
                              return;
                            }
                            handleToggleDelivered(item);
                          }}
                          disabled={!isPurchaseRole}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 mx-auto shadow-2xs ${
                            !isPurchaseRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                          } ${
                            isDelivered
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-amber-500 text-white hover:bg-amber-600'
                          }`}
                          title={isPurchaseRole ? "Click to toggle Delivered status with audit log" : "View-only: Purchase role required to toggle delivery status"}
                        >
                          {isDelivered ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Delivered (Y)</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3 h-3" />
                              <span>In-Transit (N)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Last Reason & Revision Badge */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          {revisionCount > 0 && (
                            <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-extrabold px-1.5 py-0.2 rounded shrink-0">
                              Rev {revisionCount}
                            </span>
                          )}
                          <span
                            className="text-xs text-slate-700 truncate max-w-[220px] block"
                            title={item.lastReason}
                          >
                            {item.lastReason || 'Initial baseline schedule'}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp & User */}
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 font-sans">
                        <div className="font-mono text-slate-700">{item.lastModified || '2026-07-01'}</div>
                        <div className="text-[10px] text-slate-400">{item.changedBy || 'Procurement'}</div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPurchaseRole ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded transition cursor-pointer"
                              title="Edit Schedule (Mandatory reason required)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded cursor-not-allowed"
                              title="Restricted: Only Purchase role can edit delivery schedules"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewHistoryItem(item)}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              hasAudits
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                            title="View chronological change audit log"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Schedule Modal with Mandatory Reason */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Modify Delivery Schedule & Log Reason</h3>
                  <p className="text-[11px] text-purple-200">
                    PO: {editingItem.poNumber} • {editingItem.materialCode} ({editingItem.description})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-purple-200 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Quantity */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dispatch Quantity ({editingItem.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.qty}
                    onChange={(e) => setEditFormData({ ...editFormData, qty: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                {/* Week */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned MRP Week *</label>
                  <select
                    value={editFormData.week}
                    onChange={(e) => setEditFormData({ ...editFormData, week: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                </div>

                {/* ETA Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ETA Arrival Date *</label>
                  <input
                    type="date"
                    required
                    value={editFormData.eta}
                    onChange={(e) => setEditFormData({ ...editFormData, eta: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivered Status *</label>
                  <select
                    value={editFormData.delivered}
                    onChange={(e) => setEditFormData({ ...editFormData, delivered: e.target.value as 'Y' | 'N' })}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  >
                    <option value="N">🚚 In-Transit (N)</option>
                    <option value="Y">✅ Delivered to Warehouse (Y)</option>
                  </select>
                </div>

                {/* Vendor */}
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Carrier Name</label>
                  <input
                    type="text"
                    value={editFormData.vendor}
                    onChange={(e) => setEditFormData({ ...editFormData, vendor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                {/* Buyer / User */}
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Modified By (User / Officer) *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.changedBy}
                    onChange={(e) => setEditFormData({ ...editFormData, changedBy: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                {/* Reason Category Dropdown */}
                <div className="col-span-2">
                  <label className="block font-bold text-purple-900 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                    Mandatory Reason for Schedule Change *
                  </label>
                  <select
                    value={editFormData.reasonCategory}
                    onChange={(e) => setEditFormData({ ...editFormData, reasonCategory: e.target.value })}
                    className="w-full p-2 border border-purple-300 bg-purple-50/50 rounded font-medium text-slate-800"
                  >
                    {COMMON_REASONS.map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Custom Reason Details */}
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Detailed Notes / Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.customReason}
                    onChange={(e) => setEditFormData({ ...editFormData, customReason: e.target.value })}
                    placeholder="Enter additional specifics (e.g., container #, truck vehicle breakdown, revised invoice #)..."
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Commit Change & Log Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Audit Trail Modal */}
      {viewHistoryItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="font-bold text-sm">Chronological Schedule Change Log</h3>
                  <p className="text-[11px] text-blue-200">
                    PO: {viewHistoryItem.poNumber} • {viewHistoryItem.materialCode} ({viewHistoryItem.description})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewHistoryItem(null)}
                className="text-blue-200 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {(!viewHistoryItem.auditLogs || viewHistoryItem.auditLogs.length === 0) ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No revision history found. This entry is still at its original baseline state.
                </div>
              ) : (
                <div className="space-y-3 font-sans">
                  {viewHistoryItem.auditLogs.map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {log.timestamp}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          <User className="w-3 h-3 text-slate-500" />
                          {log.changedBy}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
                          {log.changeField}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded border border-slate-200 font-mono">
                        <div>
                          <span className="text-slate-400 font-sans block">Old Value:</span>
                          <span className="text-slate-600">{log.oldValue}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block">New Value:</span>
                          <span className="text-purple-900 font-bold">{log.newValue}</span>
                        </div>
                      </div>

                      <div className="bg-amber-50/80 p-2 rounded border border-amber-200 text-[11px] text-amber-900">
                        <strong>Reason:</strong> {log.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewHistoryItem(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-xs cursor-pointer"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Organization-wide Audit Trail Modal */}
      {isMasterAuditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Master Schedule Change Audit Trail (All Records)</h3>
                  <p className="text-[11px] text-slate-300">
                    Comprehensive chronological ledger of all delivery schedule amendments with user and reason logs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMasterAuditOpen(false)}
                className="text-slate-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-[75vh] overflow-y-auto">
              {allAuditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No schedule change audit logs recorded yet.
                </div>
              ) : (
                <table className="w-full text-left border border-slate-200 rounded-md overflow-hidden text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 min-w-[130px]">Timestamp</th>
                      <th className="py-2.5 px-3 min-w-[80px]">PO #</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Material & Description</th>
                      <th className="py-2.5 px-3 min-w-[90px]">User</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Field Modified</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Change Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {allAuditLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-700">{log.timestamp}</td>
                        <td className="py-2.5 px-3 font-bold text-purple-900">{log.poNumber}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="font-mono font-bold text-blue-700">{log.materialCode}</span>
                          <span className="block text-[10px] text-slate-500">{log.materialDescription || log.currentDesc}</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{log.changedBy}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-sans font-medium">
                            {log.changeField}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-amber-900 bg-amber-50/40">
                          {log.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMasterAuditOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Schedule Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Create New Vendor Dispatch Schedule</h3>
                  <p className="text-[11px] text-purple-200">
                    Registers a planned inbound shipment into weekly MRP and procurement pipeline.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-purple-200 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PO Number *</label>
                  <input
                    type="text"
                    required
                    value={newItemData.poNumber}
                    onChange={(e) => setNewItemData({ ...newItemData, poNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material Code *</label>
                  <input
                    type="text"
                    required
                    value={newItemData.materialCode}
                    onChange={(e) => setNewItemData({ ...newItemData, materialCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Material Description</label>
                  <input
                    type="text"
                    value={newItemData.description}
                    onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispatch Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newItemData.qty}
                    onChange={(e) => setNewItemData({ ...newItemData, qty: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure (UoM)</label>
                  <input
                    type="text"
                    value={newItemData.unit}
                    onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned MRP Week *</label>
                  <select
                    value={newItemData.week}
                    onChange={(e) => setNewItemData({ ...newItemData, week: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ETA Date</label>
                  <input
                    type="date"
                    value={newItemData.eta}
                    onChange={(e) => setNewItemData({ ...newItemData, eta: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={newItemData.vendor}
                    onChange={(e) => setNewItemData({ ...newItemData, vendor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Initial Planning Reason / Note</label>
                  <textarea
                    rows={2}
                    value={newItemData.reason}
                    onChange={(e) => setNewItemData({ ...newItemData, reason: e.target.value })}
                    placeholder="Provide reason for creating this delivery schedule entry..."
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded cursor-pointer shadow-sm"
                >
                  Save Dispatch Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
