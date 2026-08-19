import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import {
  Warehouse,
  Plus,
  Search,
  Edit3,
  Save,
  X,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Send,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onUpdateInventory: (updated: InventoryItem[]) => void;
}

interface RequisitionTicket {
  id: string;
  materialNumber: string;
  materialDescription: string;
  currentStock: number;
  safetyStock: number;
  deficit: number;
  requestedQty: number;
  unit: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  notes: string;
  requestedAt: string;
  status: 'PENDING' | 'DISPATCHED';
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  onUpdateInventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [slocFilter, setSlocFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'BELOW_SAFETY' | 'HAS_QC' | 'HEALTHY'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InventoryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Quick Requisition Modal State
  const [requisitionItem, setRequisitionItem] = useState<InventoryItem | null>(null);
  const [requisitionQty, setRequisitionQty] = useState<number>(0);
  const [requisitionPriority, setRequisitionPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [requisitionNotes, setRequisitionNotes] = useState<string>('');
  const [requisitionSuccessMessage, setRequisitionSuccessMessage] = useState<string | null>(null);

  // Requisition Tickets History (persisted in session)
  const [requisitionTickets, setRequisitionTickets] = useState<RequisitionTicket[]>(() => {
    const saved = localStorage.getItem('mrp_requisition_tickets');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTicketsModal, setShowTicketsModal] = useState(false);

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    materialNumber: '',
    materialDescription: '',
    plant: 'P101',
    sloc: 'SL01-Raw',
    bun: 'KG',
    unrestricted: 0,
    inQualityInsp: 0,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1000
  });

  // Calculate items stats
  const itemsWithSafety = inventory.map((item) => {
    const safetyStock = item.safetyStock ?? 0;
    const isBelowSafety = safetyStock > 0 && item.unrestricted < safetyStock;
    const deficit = isBelowSafety ? safetyStock - item.unrestricted : 0;
    const ratio = safetyStock > 0 ? Math.min(Math.round((item.unrestricted / safetyStock) * 100), 200) : 100;
    const qcCanResolve = isBelowSafety && (item.unrestricted + item.inQualityInsp >= safetyStock);
    return {
      ...item,
      safetyStock,
      isBelowSafety,
      deficit,
      ratio,
      qcCanResolve
    };
  });

  const belowSafetyCount = itemsWithSafety.filter((i) => i.isBelowSafety).length;
  const qcReliefCount = itemsWithSafety.filter((i) => i.isBelowSafety && i.inQualityInsp > 0).length;
  const healthyCount = itemsWithSafety.filter((i) => !i.isBelowSafety).length;
  const totalDeficitQty = itemsWithSafety.reduce((sum, i) => sum + i.deficit, 0);

  // Filter items
  const filteredInventory = itemsWithSafety.filter((item) => {
    const matchesSearch =
      item.materialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materialDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSloc = slocFilter === 'ALL' || item.sloc === slocFilter;

    let matchesHealth = true;
    if (healthFilter === 'BELOW_SAFETY') {
      matchesHealth = item.isBelowSafety;
    } else if (healthFilter === 'HAS_QC') {
      matchesHealth = item.inQualityInsp > 0;
    } else if (healthFilter === 'HEALTHY') {
      matchesHealth = !item.isBelowSafety;
    }

    return matchesSearch && matchesSloc && matchesHealth;
  });

  const handleQCRelease = (itemId: string) => {
    const updated = inventory.map((inv) => {
      if (inv.id === itemId && inv.inQualityInsp > 0) {
        return {
          ...inv,
          unrestricted: inv.unrestricted + inv.inQualityInsp,
          inQualityInsp: 0,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    });
    onUpdateInventory(updated);
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm({ ...item, safetyStock: item.safetyStock ?? 0 });
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = inventory.map((inv) => (inv.id === editForm.id ? editForm : inv));
    onUpdateInventory(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.materialNumber || !newItem.materialDescription) return;

    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      materialNumber: newItem.materialNumber!,
      materialDescription: newItem.materialDescription!,
      plant: newItem.plant || 'P101',
      sloc: newItem.sloc || 'SL01-Raw',
      bun: newItem.bun || 'KG',
      unrestricted: Number(newItem.unrestricted) || 0,
      inQualityInsp: Number(newItem.inQualityInsp) || 0,
      restrictedUse: Number(newItem.restrictedUse) || 0,
      blocked: Number(newItem.blocked) || 0,
      safetyStock: Number(newItem.safetyStock) || 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdateInventory([...inventory, item]);
    setIsAddingNew(false);
  };

  // Open Requisition Modal
  const openRequisitionModal = (item: InventoryItem) => {
    const safetyStock = item.safetyStock ?? 0;
    const deficit = Math.max(0, safetyStock - item.unrestricted);
    // Suggest ordering deficit + 20% buffer rounded up
    const suggested = Math.ceil(deficit * 1.2) || 1000;
    setRequisitionItem(item);
    setRequisitionQty(suggested);
    setRequisitionPriority('CRITICAL');
    setRequisitionNotes(
      `URGENT: Stock level (${item.unrestricted} ${item.bun}) fell below safety threshold (${safetyStock} ${item.bun}). Deficit: ${deficit} ${item.bun}. Requesting priority replenishment.`
    );
  };

  const submitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requisitionItem) return;

    const safetyStock = requisitionItem.safetyStock ?? 0;
    const deficit = Math.max(0, safetyStock - requisitionItem.unrestricted);

    const newTicket: RequisitionTicket = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      materialNumber: requisitionItem.materialNumber,
      materialDescription: requisitionItem.materialDescription,
      currentStock: requisitionItem.unrestricted,
      safetyStock,
      deficit,
      requestedQty: requisitionQty,
      unit: requisitionItem.bun,
      priority: requisitionPriority,
      notes: requisitionNotes,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      status: 'PENDING'
    };

    const updatedTickets = [newTicket, ...requisitionTickets];
    setRequisitionTickets(updatedTickets);
    localStorage.setItem('mrp_requisition_tickets', JSON.stringify(updatedTickets));

    setRequisitionSuccessMessage(
      `Requisition ${newTicket.id} for ${requisitionQty.toLocaleString()} ${newTicket.unit} of ${requisitionItem.materialNumber} submitted to Procurement team.`
    );
    setRequisitionItem(null);

    setTimeout(() => {
      setRequisitionSuccessMessage(null);
    }, 5000);
  };

  // Export Safety Deficit CSV Report
  const exportSafetyDeficitCSV = () => {
    const deficitItems = itemsWithSafety.filter((i) => i.isBelowSafety);
    const headers = [
      'Material Number',
      'Material Description',
      'Plant',
      'SLoc',
      'Unit',
      'Current Unrestricted Stock',
      'Safety Stock Threshold',
      'Deficit Quantity',
      'In Quality Inspection (Relief Stock)',
      'Recommended Order Qty (Deficit + 20%)',
      'Action Status'
    ];

    const rows = deficitItems.map((i) => [
      `"${i.materialNumber}"`,
      `"${i.materialDescription.replace(/"/g, '""')}"`,
      `"${i.plant}"`,
      `"${i.sloc}"`,
      `"${i.bun}"`,
      i.unrestricted,
      i.safetyStock,
      i.deficit,
      i.inQualityInsp,
      Math.ceil(i.deficit * 1.2),
      i.qcCanResolve ? 'QC Release Can Resolve Deficit' : 'Urgent Purchase Requisition Required'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Safety_Stock_Deficit_Action_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification for Requisition */}
      {requisitionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{requisitionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setRequisitionSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Warehouse Safety Stock Executive Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-amber-600/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 bg-amber-500/30 border border-amber-300/30 rounded-xl text-amber-200">
                <Warehouse className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Warehouse Stock Register & Safety Threshold Manager (MB52)
              </h2>
              {belowSafetyCount > 0 && (
                <span className="bg-red-500/30 border border-red-400/50 text-red-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
                  <span>{belowSafetyCount} Items Below Safety Stock</span>
                </span>
              )}
            </div>
            <p className="text-xs text-amber-100/90 font-medium max-w-3xl">
              Live inventory tracking across plants and storage locations. Real-time safety stock threshold monitoring, instant QC inspection releases, and one-click purchase requisitions for warehouse managers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {requisitionTickets.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTicketsModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-900/80 hover:bg-amber-950 text-amber-100 border border-amber-500/40 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Active Requisitions ({requisitionTickets.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={exportSafetyDeficitCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Export Deficit Action List</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Line</span>
            </button>
          </div>
        </div>

        {/* High-Level Safety Stock KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-amber-600/30">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-300" />
              <span>Total Material SKUs</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{inventory.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Raw & Packaging Materials</div>
          </div>

          <div
            onClick={() => setHealthFilter('BELOW_SAFETY')}
            className={`p-3 rounded-xl border transition cursor-pointer ${
              belowSafetyCount > 0
                ? 'bg-red-950/50 border-red-500/50 hover:bg-red-900/60'
                : 'bg-slate-900/60 border-slate-800/80'
            }`}
          >
            <div className="text-[11px] font-bold text-red-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Below Safety Stock</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400 mt-1">{belowSafetyCount}</div>
            <div className="text-[10px] text-red-200/80 mt-0.5">Requires immediate replenishment</div>
          </div>

          <div
            onClick={() => setHealthFilter('HAS_QC')}
            className="bg-slate-900/60 hover:bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 transition cursor-pointer"
          >
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>QC Relief Stock</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{qcReliefCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Items with QC stock to unlock</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Deficit Volume</span>
            </div>
            <div className="text-2xl font-black text-blue-300 mt-1">
              {totalDeficitQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">Units</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cumulated stock shortfall</div>
          </div>
        </div>
      </div>

      {/* Controls & Quick Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search material number, description, plant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 overflow-x-auto">
            <button
              onClick={() => setHealthFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                healthFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              All Items ({inventory.length})
            </button>
            <button
              onClick={() => setHealthFilter('BELOW_SAFETY')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 flex items-center gap-1 ${
                healthFilter === 'BELOW_SAFETY'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Below Safety ({belowSafetyCount})</span>
            </button>
            <button
              onClick={() => setHealthFilter('HAS_QC')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 flex items-center gap-1 ${
                healthFilter === 'HAS_QC'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Has QC Stock ({qcReliefCount})</span>
            </button>
            <button
              onClick={() => setHealthFilter('HEALTHY')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                healthFilter === 'HEALTHY'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Healthy ({healthyCount})
            </button>
          </div>

          {/* Storage Location Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-bold text-slate-600 shrink-0">SLoc:</span>
            <select
              value={slocFilter}
              onChange={(e) => setSlocFilter(e.target.value)}
              className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All SLocs</option>
              <option value="SL01-Raw">SL01-Raw (Raw Materials)</option>
              <option value="SL02-Pack">SL02-Pack (Packaging Materials)</option>
              <option value="SL03-FG">SL03-FG (Finished Goods)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modal / Form to Add Stock */}
      {isAddingNew && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl text-xs shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-amber-950 text-sm">Add New Material Stock Line</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-amber-800 hover:text-amber-950 p-1 rounded hover:bg-amber-200/50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Material Number *</label>
              <input
                type="text"
                required
                value={newItem.materialNumber}
                onChange={(e) => setNewItem({ ...newItem, materialNumber: e.target.value })}
                className="w-full p-1.5 border border-slate-300 bg-white rounded font-mono font-bold"
                placeholder="RM-501 or PM-801"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Material Description *</label>
              <input
                type="text"
                required
                value={newItem.materialDescription}
                onChange={(e) => setNewItem({ ...newItem, materialDescription: e.target.value })}
                className="w-full p-1.5 border border-slate-300 bg-white rounded font-medium"
                placeholder="Puree Concentrate - Mango"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">SLoc</label>
              <select
                value={newItem.sloc}
                onChange={(e) => setNewItem({ ...newItem, sloc: e.target.value })}
                className="w-full p-1.5 border border-slate-300 bg-white rounded font-semibold"
              >
                <option value="SL01-Raw">SL01-Raw</option>
                <option value="SL02-Pack">SL02-Pack</option>
                <option value="SL03-FG">SL03-FG</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Base Unit (BUn)</label>
              <input
                type="text"
                value={newItem.bun}
                onChange={(e) => setNewItem({ ...newItem, bun: e.target.value })}
                className="w-full p-1.5 border border-slate-300 bg-white rounded uppercase font-bold"
                placeholder="KG / PC"
              />
            </div>
            <div>
              <label className="block font-bold text-emerald-800 mb-1">Unrestricted Qty</label>
              <input
                type="number"
                value={newItem.unrestricted}
                onChange={(e) => setNewItem({ ...newItem, unrestricted: Number(e.target.value) })}
                className="w-full p-1.5 border border-emerald-400 bg-white rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-red-800 mb-1">Safety Stock (Min)</label>
              <input
                type="number"
                value={newItem.safetyStock}
                onChange={(e) => setNewItem({ ...newItem, safetyStock: Number(e.target.value) })}
                className="w-full p-1.5 border border-red-400 bg-white rounded font-mono font-bold"
                placeholder="e.g. 2000"
              />
            </div>
            <div>
              <label className="block font-bold text-amber-800 mb-1">In Quality Insp.</label>
              <input
                type="number"
                value={newItem.inQualityInsp}
                onChange={(e) => setNewItem({ ...newItem, inQualityInsp: Number(e.target.value) })}
                className="w-full p-1.5 border border-slate-300 bg-white rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-red-700 mb-1">Blocked Stock</label>
              <input
                type="number"
                value={newItem.blocked}
                onChange={(e) => setNewItem({ ...newItem, blocked: Number(e.target.value) })}
                className="w-full p-1.5 border border-slate-300 bg-white rounded font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded cursor-pointer shadow-xs transition"
              >
                Save Stock Line
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Inventory Table with Safety Stock Highlighting & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Live Storage Location Stock & Threshold Compliance
            </h3>
            <span className="bg-slate-200 text-slate-800 text-xs font-black px-2 py-0.5 rounded-full">
              {filteredInventory.length} Items Listed
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span>Below Safety Stock</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Healthy Stock</span>
            </span>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Inventory Lines Found</h4>
            <p className="text-xs text-slate-500">Try clearing the search or switching the health filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Material Number</th>
                  <th className="py-3 px-3">Material Description</th>
                  <th className="py-3 px-2 text-center">SLoc</th>
                  <th className="py-3 px-3 text-right bg-emerald-50 text-emerald-950 border-l border-slate-200">
                    Current Unrestricted
                  </th>
                  <th className="py-3 px-3 text-right bg-amber-50/80 text-amber-950 border-l border-slate-200">
                    Safety Stock (Min)
                  </th>
                  <th className="py-3 px-3 text-center bg-slate-50 border-l border-slate-200 min-w-[150px]">
                    Stock Health & Deficit
                  </th>
                  <th className="py-3 px-3 text-right bg-blue-50/60 text-blue-950 border-l border-slate-200">
                    In Quality Insp.
                  </th>
                  <th className="py-3 px-2 text-right text-slate-500">Restricted</th>
                  <th className="py-3 px-2 text-right text-red-700">Blocked</th>
                  <th className="py-3 px-3 text-center bg-slate-50 border-l border-slate-200 min-w-[200px]">
                    Warehouse Manager Immediate Action
                  </th>
                  <th className="py-3 px-2 text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {filteredInventory.map((item) => {
                  const isEditing = editingId === item.id;
                  const { isBelowSafety, deficit, ratio, qcCanResolve, safetyStock } = item;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isBelowSafety
                          ? 'bg-red-50/30 hover:bg-red-50/50 border-l-4 border-l-red-500'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Material Number */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {isBelowSafety && (
                            <span title="Stock Below Safety Threshold!">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            </span>
                          )}
                          <span className={isBelowSafety ? 'text-red-700 font-extrabold' : 'text-slate-900'}>
                            {item.materialNumber}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3 font-sans font-semibold text-slate-800 max-w-[200px]">
                        <div className="line-clamp-2">{item.materialDescription}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Plant: {item.plant} | Unit: {item.bun}
                        </div>
                      </td>

                      {/* SLoc */}
                      <td className="py-3 px-2 text-center font-sans font-semibold text-slate-700">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">
                          {item.sloc}
                        </span>
                      </td>

                      {/* Unrestricted Stock */}
                      <td className="py-3 px-3 text-right font-bold text-emerald-900 bg-emerald-50/30 border-l border-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm?.unrestricted || 0}
                            onChange={(e) =>
                              setEditForm({ ...editForm!, unrestricted: Number(e.target.value) })
                            }
                            className="w-20 p-1 border border-emerald-500 rounded text-right bg-white"
                          />
                        ) : (
                          <span className={isBelowSafety ? 'text-red-700 font-black' : 'text-emerald-900'}>
                            {item.unrestricted.toLocaleString()} {item.bun}
                          </span>
                        )}
                      </td>

                      {/* Safety Stock Threshold */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 bg-amber-50/20 border-l border-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm?.safetyStock || 0}
                            onChange={(e) =>
                              setEditForm({ ...editForm!, safetyStock: Number(e.target.value) })
                            }
                            className="w-20 p-1 border border-red-500 rounded text-right bg-white"
                          />
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-extrabold text-slate-800">
                              {safetyStock > 0 ? `${safetyStock.toLocaleString()} ${item.bun}` : '—'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Health & Deficit Bar */}
                      <td className="py-3 px-3 align-middle font-sans border-l border-slate-200">
                        {safetyStock > 0 ? (
                          <div className="space-y-1.5">
                            {isBelowSafety ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold text-red-700 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Deficit: -{deficit.toLocaleString()} {item.bun}</span>
                                  </span>
                                  <span className="text-[10px] font-black text-red-600 bg-red-100 px-1 rounded">
                                    {ratio}% of Min
                                  </span>
                                </div>
                                <div className="w-full bg-red-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(ratio, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Adequate (+{(item.unrestricted - safetyStock).toLocaleString()})</span>
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700">
                                    {ratio}%
                                  </span>
                                </div>
                                <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-1.5 rounded-full"
                                    style={{ width: `${Math.min(ratio, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium text-center block">No Threshold Set</span>
                        )}
                      </td>

                      {/* In Quality Inspection */}
                      <td className="py-3 px-3 text-right font-bold text-blue-900 bg-blue-50/20 border-l border-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm?.inQualityInsp || 0}
                            onChange={(e) =>
                              setEditForm({ ...editForm!, inQualityInsp: Number(e.target.value) })
                            }
                            className="w-20 p-1 border border-blue-500 rounded text-right bg-white"
                          />
                        ) : (
                          item.inQualityInsp > 0 ? (
                            <span className="font-black text-amber-700">
                              {item.inQualityInsp.toLocaleString()} {item.bun}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )
                        )}
                      </td>

                      {/* Restricted */}
                      <td className="py-3 px-2 text-right text-slate-500">
                        {item.restrictedUse > 0 ? item.restrictedUse.toLocaleString() : '0'}
                      </td>

                      {/* Blocked */}
                      <td className="py-3 px-2 text-right text-red-600 font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm?.blocked || 0}
                            onChange={(e) =>
                              setEditForm({ ...editForm!, blocked: Number(e.target.value) })
                            }
                            className="w-16 p-1 border border-red-500 rounded text-right bg-white"
                          />
                        ) : (
                          item.blocked > 0 ? `${item.blocked.toLocaleString()}` : '0'
                        )}
                      </td>

                      {/* Immediate Warehouse Manager Actions Column */}
                      <td className="py-3 px-3 font-sans border-l border-slate-200">
                        <div className="flex flex-col gap-1.5">
                          {/* If Below Safety Stock -> Show Quick Requisition Trigger */}
                          {isBelowSafety && (
                            <button
                              type="button"
                              onClick={() => openRequisitionModal(item)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                              title="Send Urgent Purchase / Reorder Requisition"
                            >
                              <Send className="w-3 h-3 text-red-200" />
                              <span>Expedite Reorder ({deficit.toLocaleString()} {item.bun})</span>
                            </button>
                          )}

                          {/* QC Release Action (Enhanced with Safety Restoration Insights) */}
                          {item.inQualityInsp > 0 && (
                            <button
                              type="button"
                              onClick={() => handleQCRelease(item.id)}
                              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer ${
                                qcCanResolve
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                              title={
                                qcCanResolve
                                  ? `Releasing this QC stock will restore unrestricted stock above the safety threshold!`
                                  : 'Release QC Inspection Stock to Unrestricted'
                              }
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>
                                {qcCanResolve
                                  ? `⚡ Release QC (+${item.inQualityInsp.toLocaleString()} Restores Safety)`
                                  : `Release QC (+${item.inQualityInsp.toLocaleString()} ${item.bun})`}
                              </span>
                            </button>
                          )}

                          {!isBelowSafety && item.inQualityInsp === 0 && (
                            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-center border border-emerald-200">
                              ✓ Stock Level Secure
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Edit Actions */}
                      <td className="py-3 px-2 text-center font-sans">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition cursor-pointer shadow-2xs"
                            title="Save Changes"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition cursor-pointer"
                            title="Edit Stock & Safety Threshold"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Expedited Requisition Modal */}
      {requisitionItem && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-red-600 to-red-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    Expedited Replenishment Requisition
                  </h3>
                  <p className="text-[11px] text-red-100 font-medium">
                    Immediate action for warehouse safety stock deficit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRequisitionItem(null)}
                className="text-red-100 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={submitRequisition} className="p-5 space-y-4 text-xs">
              {/* Item Info Summary Card */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-red-900 text-sm">
                    {requisitionItem.materialNumber}
                  </span>
                  <span className="px-2 py-0.5 bg-red-200 text-red-900 font-extrabold text-[10px] rounded uppercase">
                    Deficit: -{Math.max(0, (requisitionItem.safetyStock || 0) - requisitionItem.unrestricted).toLocaleString()} {requisitionItem.bun}
                  </span>
                </div>
                <div className="font-bold text-slate-800 text-xs">
                  {requisitionItem.materialDescription}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] border-t border-red-200 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Stock:</span>
                    <strong className="text-red-700">{requisitionItem.unrestricted.toLocaleString()} {requisitionItem.bun}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Safety Threshold:</span>
                    <strong>{(requisitionItem.safetyStock || 0).toLocaleString()} {requisitionItem.bun}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pending in QC:</span>
                    <strong>{requisitionItem.inQualityInsp.toLocaleString()} {requisitionItem.bun}</strong>
                  </div>
                </div>
              </div>

              {/* Order Quantity Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1">
                    Requested Replenish Qty ({requisitionItem.bun}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={requisitionQty}
                    onChange={(e) => setRequisitionQty(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-black text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Suggested: Deficit + 20% safety buffer
                  </span>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-800 mb-1">
                    Urgency Priority *
                  </label>
                  <select
                    value={requisitionPriority}
                    onChange={(e) => setRequisitionPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Breached Safety)</option>
                    <option value="HIGH">🟠 HIGH (Immediate Stockout Risk)</option>
                    <option value="MEDIUM">🟡 MEDIUM (Buffer Replenishment)</option>
                  </select>
                </div>
              </div>

              {/* Notes / Reason */}
              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Procurement Reason / Expedite Notes
                </label>
                <textarea
                  rows={3}
                  value={requisitionNotes}
                  onChange={(e) => setRequisitionNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white"
                  placeholder="State reason for rush PO / dispatch request..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRequisitionItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Expedite Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Requisitions Tray Modal */}
      {showTicketsModal && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">
                  Active Expedited Requisition Tickets ({requisitionTickets.length})
                </h3>
              </div>
              <button
                onClick={() => setShowTicketsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
              {requisitionTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No active requisition tickets.</div>
              ) : (
                requisitionTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-blue-700">{ticket.id}</span>
                        <span className="font-mono font-bold text-slate-900">{ticket.materialNumber}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                          ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{ticket.requestedAt}</span>
                    </div>
                    <div className="font-medium text-slate-800 text-xs">{ticket.materialDescription}</div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                      <span>
                        Requested Qty: <strong className="text-slate-900 font-mono">{ticket.requestedQty.toLocaleString()} {ticket.unit}</strong>
                      </span>
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                        Status: PENDING PROCUREMENT
                      </span>
                    </div>
                    {ticket.notes && (
                      <p className="text-[10px] text-slate-500 bg-white p-1.5 rounded border border-slate-100 italic">
                        "{ticket.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  if (window.confirm('Clear all requisition tickets?')) {
                    setRequisitionTickets([]);
                    localStorage.removeItem('mrp_requisition_tickets');
                  }
                }}
                className="text-red-600 hover:text-red-800 font-bold cursor-pointer"
              >
                Clear History
              </button>
              <button
                onClick={() => setShowTicketsModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg cursor-pointer hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
