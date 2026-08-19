import React, { useState } from 'react';
import { DeliveryScheduleItem, InventoryItem } from '../../types';
import { Truck, Plus, CheckCircle2, XCircle, Calendar, Building, Edit3, Save, X, Info } from 'lucide-react';

interface DeliveryScheduleManagerProps {
  schedules: DeliveryScheduleItem[];
  inventory: InventoryItem[];
  onUpdateSchedules: (updated: DeliveryScheduleItem[]) => void;
  onUpdateInventory: (updated: InventoryItem[]) => void;
  onOpenManagementReport?: () => void;
}

export const DeliveryScheduleManager: React.FC<DeliveryScheduleManagerProps> = ({
  schedules,
  inventory,
  onUpdateSchedules,
  onUpdateInventory,
  onOpenManagementReport
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DeliveryScheduleItem | null>(null);

  const [newItem, setNewItem] = useState<Partial<DeliveryScheduleItem>>({
    materialCode: 'PM-803',
    description: 'Mango 500ml Shrink Label',
    qty: 5000,
    unit: 'PC',
    vendor: 'Avery Label Corp Ltd',
    etd: '2026-07-10',
    eta: '2026-07-15',
    week: 2,
    delivered: 'N',
    poNumber: 'PO-' + Math.floor(10000 + Math.random() * 90000)
  });

  const toggleDelivered = (item: DeliveryScheduleItem) => {
    const newStatus = item.delivered === 'Y' ? 'N' : 'Y';

    // 1. Update delivery schedule flag
    const updatedSchedules = schedules.map((s) =>
      s.id === item.id ? { ...s, delivered: newStatus } : s
    );
    onUpdateSchedules(updatedSchedules);

    // 2. If changing from 'N' to 'Y', automatically increment unrestricted inventory
    if (newStatus === 'Y') {
      const updatedInventory = inventory.map((inv) => {
        if (inv.materialNumber === item.materialCode) {
          return {
            ...inv,
            unrestricted: inv.unrestricted + item.qty,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return inv;
      });
      onUpdateInventory(updatedInventory);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.materialCode || !newItem.qty) return;

    const schedule: DeliveryScheduleItem = {
      id: `del-${Date.now()}`,
      materialCode: newItem.materialCode!,
      description: newItem.description || newItem.materialCode!,
      qty: Number(newItem.qty) || 0,
      unit: newItem.unit || 'PC',
      vendor: newItem.vendor || 'Supplier Inc',
      etd: newItem.etd || '2026-07-10',
      eta: newItem.eta || '2026-07-15',
      week: (newItem.week as 1 | 2 | 3 | 4) || 1,
      delivered: newItem.delivered || 'N',
      poNumber: newItem.poNumber || 'PO-9000'
    };

    onUpdateSchedules([...schedules, schedule]);
    setIsAddingNew(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-purple-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6" />
          <div>
            <h2 className="text-base font-bold">RMPM Delivery & In-Transit Schedule</h2>
            <p className="text-xs text-purple-100">
              Vendor dispatches in pipeline. Delivered items (Delivered='Y') are excluded from transit calculation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenManagementReport && (
            <button
              type="button"
              onClick={onOpenManagementReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/80 hover:bg-purple-950 text-white font-bold text-xs rounded-lg transition border border-purple-400/40 cursor-pointer shrink-0"
            >
              📊 Executive Shortage & Action Plan
            </button>
          )}

          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white font-medium text-xs rounded-lg transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor Dispatch Schedule</span>
          </button>
        </div>
      </div>

      {/* Instruction Note */}
      <div className="p-3 bg-purple-50 border-b border-purple-200 flex items-center gap-2 text-xs text-purple-900">
        <Info className="w-4 h-4 text-purple-700 shrink-0" />
        <span>
          <strong>MRP Logic:</strong> Materials marked as <strong>Delivered = Y</strong> are already in physical warehouse inventory and are excluded from scheduled inbound calculations to prevent double-counting.
        </span>
      </div>

      {/* Add New Schedule Modal / Inline Form */}
      {isAddingNew && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-purple-50 border-b border-purple-200 text-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-purple-900 text-sm">Create New Inbound Schedule Entry</h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-purple-800 hover:text-purple-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Material Code *</label>
              <input
                type="text"
                required
                value={newItem.materialCode}
                onChange={(e) => setNewItem({ ...newItem, materialCode: e.target.value })}
                className="w-full p-1.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full p-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                value={newItem.qty}
                onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit (UoM)</label>
              <input
                type="text"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full p-1.5 border border-slate-300 rounded uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor Name</label>
              <input
                type="text"
                value={newItem.vendor}
                onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
                className="w-full p-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Week (ETA)</label>
              <select
                value={newItem.week}
                onChange={(e) => setNewItem({ ...newItem, week: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                className="w-full p-1.5 border border-slate-300 rounded font-bold"
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
                value={newItem.eta}
                onChange={(e) => setNewItem({ ...newItem, eta: e.target.value })}
                className="w-full p-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivered Status</label>
              <select
                value={newItem.delivered}
                onChange={(e) => setNewItem({ ...newItem, delivered: e.target.value as 'Y' | 'N' })}
                className="w-full p-1.5 border border-slate-300 rounded font-bold"
              >
                <option value="N">N - In Transit</option>
                <option value="Y">Y - Delivered to Warehouse</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 bg-slate-200 font-bold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-700 text-white font-bold rounded hover:bg-purple-800 cursor-pointer"
              >
                Save Dispatch Schedule
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Schedule Table Matching Screenshot 4 Exactly */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <th className="py-3 px-3">Material</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-2 text-center">Unit</th>
              <th className="py-3 px-3">Vendor</th>
              <th className="py-3 px-3 text-center">ETD</th>
              <th className="py-3 px-3 text-center">ETA (Week)</th>
              <th className="py-3 px-3 text-center bg-purple-100 text-purple-900 border-l border-slate-200">
                Delivered Y/N
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {schedules.map((item) => {
              const isDelivered = item.delivered === 'Y';

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition ${
                    isDelivered ? 'bg-slate-50/70 text-slate-500' : 'bg-white text-slate-900'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-blue-700">{item.materialCode}</td>
                  <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                    {item.description}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {item.qty.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center uppercase text-slate-500">{item.unit}</td>
                  <td className="py-3 px-3 font-sans text-slate-700">{item.vendor}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{item.etd}</td>
                  <td className="py-3 px-3 text-center font-bold">
                    <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                      W{item.week} ({item.eta})
                    </span>
                  </td>

                  {/* Delivered Y/N Toggle Button */}
                  <td className="py-3 px-3 text-center font-sans bg-purple-50/30">
                    <button
                      onClick={() => toggleDelivered(item)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-sm ${
                        isDelivered
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                      title={
                        isDelivered
                          ? 'Click to set back to In-Transit (N)'
                          : 'Click to mark Delivered (Y) & add to stock'
                      }
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered (Y)</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5" />
                          <span>In-Transit (N)</span>
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
    </div>
  );
};
