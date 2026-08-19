import React, { useState } from 'react';
import { ProductionLogItem, BOMItem, InventoryItem } from '../../types';
import { checkProductionFeasibility } from '../../utils/mrpEngine';
import { Factory, Plus, CheckCircle2, AlertTriangle, Play, FileText, Check, ShieldAlert, GitFork } from 'lucide-react';

interface ProductionLoggerProps {
  productionLogs: ProductionLogItem[];
  boms: BOMItem[];
  inventory: InventoryItem[];
  onAddProductionLog: (log: ProductionLogItem) => void;
}

export const ProductionLogger: React.FC<ProductionLoggerProps> = ({
  productionLogs,
  boms,
  inventory,
  onAddProductionLog
}) => {
  const [selectedFG, setSelectedFG] = useState('FG-1001');
  const [targetBatchQty, setTargetBatchQty] = useState(5000);
  const [isLoggingModalOpen, setIsLoggingModalOpen] = useState(false);

  // New log form state
  const [newLog, setNewLog] = useState<Partial<ProductionLogItem>>({
    materialCode: 'FG-1001',
    description: 'Production Run Goods Receipt',
    reference: 'PROD-ORD-' + Math.floor(1000 + Math.random() * 9000),
    mvt: '101',
    supplier: 'Internal Line 1',
    documentHeaderText: 'Goods Receipt Production',
    po: 'PO-' + Math.floor(1000 + Math.random() * 9000),
    plant: 'P101',
    userName: 'SUPERVISOR_ACTIVE',
    cocd: 'C100',
    item: '001',
    matDoc: '5000' + Math.floor(10000 + Math.random() * 90000),
    entryDate: new Date().toISOString().split('T')[0],
    quantity: 2500,
    eun: 'PC'
  });

  // Calculate live feasibility for selected FG and Target Quantity
  const feasibilityResult = checkProductionFeasibility(
    selectedFG,
    targetBatchQty,
    boms,
    inventory
  );

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.materialCode || !newLog.quantity) return;

    const fgBom = boms.find((b) => b.fgCode === newLog.materialCode);

    const log: ProductionLogItem = {
      id: `prod-${Date.now()}`,
      materialCode: newLog.materialCode!,
      description: fgBom?.fgDescription || newLog.description || 'Production Goods Receipt',
      reference: newLog.reference || 'PROD-ORD-4001',
      mvt: newLog.mvt || '101',
      supplier: newLog.supplier || 'Line 1',
      documentHeaderText: newLog.documentHeaderText || 'GR Production',
      po: newLog.po || 'PO-1001',
      plant: newLog.plant || 'P101',
      userName: newLog.userName || 'SUPERVISOR',
      cocd: newLog.cocd || 'C100',
      item: newLog.item || '001',
      matDoc: newLog.matDoc || '50009999',
      entryDate: newLog.entryDate || new Date().toISOString().split('T')[0],
      quantity: Number(newLog.quantity) || 0,
      eun: newLog.eun || 'PC'
    };

    onAddProductionLog(log);
    setIsLoggingModalOpen(false);
  };

  // Get unique FGs from BOM
  const safeBoms = boms || [];
  const uniqueFGs = Array.from(new Set(safeBoms.map((b) => b.fgCode))).map((code) => {
    const desc = safeBoms.find((b) => b.fgCode === code)?.fgDescription || code;
    return { code, desc };
  });

  return (
    <div className="space-y-6">
      {/* 1. Interactive Production Line Feasibility Checker */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-600 fill-emerald-600" />
              <span>Production Batch Run Feasibility Checker</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify if current raw material & packaging material stock can support a planned batch run right now.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Select FG</label>
              <select
                value={selectedFG}
                onChange={(e) => setSelectedFG(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-bold rounded px-2 py-1"
              >
                {uniqueFGs.map((fg) => (
                  <option key={fg.code} value={fg.code}>
                    {fg.code} - {fg.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Target Qty</label>
              <input
                type="number"
                value={targetBatchQty}
                onChange={(e) => setTargetBatchQty(Number(e.target.value))}
                className="w-24 bg-white border border-slate-300 text-xs font-bold font-mono rounded px-2 py-1"
              />
            </div>
          </div>
        </div>

        {/* Feasibility Result Card */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              feasibilityResult.isFeasible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Feasibility Status
              </span>
              <div className="mt-2 flex items-center gap-2">
                {feasibilityResult.isFeasible ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span className="text-lg font-extrabold text-emerald-700">FEASIBLE TO RUN</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 animate-bounce" />
                    <span className="text-lg font-extrabold text-red-600">INSUFFICIENT STOCK</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs pt-2 border-t border-slate-200 font-medium">
              Max Producible Right Now:{' '}
              <strong className="font-mono text-sm">{feasibilityResult.maxProducible.toLocaleString()} units</strong>
            </div>
          </div>

          {/* Component Requirement Checklist */}
          <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              BOM Component Readiness Checklist ({selectedFG})
            </span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {(feasibilityResult?.componentCheck || []).map((comp) => (
                <div
                  key={comp.componentCode}
                  className={`p-2 rounded text-xs flex items-center justify-between font-mono ${
                    comp.isSufficient ? 'bg-white text-slate-800' : 'bg-red-100 text-red-900 border border-red-300 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {comp.isSufficient ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{comp.componentCode} ({comp.componentDescription})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Req: {comp.requiredQty}</span>
                    <span>Stock: {comp.availableStock}</span>
                    {!comp.isSufficient && (
                      <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[10px]">
                        Short: {comp.shortage}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Production Logged So Far Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-emerald-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6" />
            <div>
              <h2 className="text-base font-bold">Production Logged So Far (Goods Receipt MvT 101)</h2>
              <p className="text-xs text-emerald-100">
                Actual production completed in current month. Completed FG quantities offset remaining demand.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLoggingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-lg transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Production Batch (MvT 101)</span>
          </button>
        </div>

        {/* Modal to Log New Production */}
        {isLoggingModalOpen && (
          <form onSubmit={handleLogSubmit} className="p-4 bg-emerald-50 border-b border-emerald-200 text-xs">
            <h3 className="font-bold text-emerald-900 text-sm mb-3">Log New Finished Goods Production (GR 101)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Finished Good (FG)</label>
                <select
                  value={newLog.materialCode}
                  onChange={(e) => setNewLog({ ...newLog, materialCode: e.target.value })}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                >
                  {uniqueFGs.map((fg) => (
                    <option key={fg.code} value={fg.code}>
                      {fg.code} - {fg.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity Produced *</label>
                <input
                  type="number"
                  required
                  value={newLog.quantity}
                  onChange={(e) => setNewLog({ ...newLog, quantity: Number(e.target.value) })}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Production Order Ref</label>
                <input
                  type="text"
                  value={newLog.reference}
                  onChange={(e) => setNewLog({ ...newLog, reference: e.target.value })}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supervisor Name</label>
                <input
                  type="text"
                  value={newLog.userName}
                  onChange={(e) => setNewLog({ ...newLog, userName: e.target.value })}
                  className="w-full p-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="md:col-span-4 flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsLoggingModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 cursor-pointer"
                >
                  Post Goods Receipt (MvT 101)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Table Matching Screenshot 5 Exactly */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider font-sans">
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Material (FG)</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-2 text-center">MvT</th>
                <th className="py-3 px-3">Supplier / Line</th>
                <th className="py-3 px-3">Mat. Doc.</th>
                <th className="py-3 px-3">PO</th>
                <th className="py-3 px-2 text-center">Plnt</th>
                <th className="py-3 px-3">User Name</th>
                <th className="py-3 px-3 text-center">Entry Date</th>
                <th className="py-3 px-3 text-right bg-emerald-50 text-emerald-900 font-bold">Quantity</th>
                <th className="py-3 px-2 text-center">EUn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                    <div>{log.description}</div>
                    {(log.miniFactory || log.line) && (
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {log.miniFactory && (
                          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 border border-blue-200 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                            <Factory className="w-2.5 h-2.5 text-blue-600" />
                            <span>{log.miniFactory}</span>
                          </span>
                        )}
                        {log.line && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 border border-purple-200 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                            <GitFork className="w-2.5 h-2.5 text-purple-600" />
                            <span>{log.line}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-blue-700">{log.materialCode}</td>
                  <td className="py-3 px-3 text-slate-600">{log.reference}</td>
                  <td className="py-3 px-2 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      {log.mvt}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-600">{log.supplier}</td>
                  <td className="py-3 px-3 text-slate-600">{log.matDoc}</td>
                  <td className="py-3 px-3 text-slate-600">{log.po}</td>
                  <td className="py-3 px-2 text-center text-slate-500">{log.plant}</td>
                  <td className="py-3 px-3 font-sans text-slate-700">{log.userName}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{log.entryDate}</td>
                  <td className="py-3 px-3 text-right font-extrabold text-emerald-700 bg-emerald-50/40">
                    {Number(log.quantity).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center uppercase text-slate-500">{log.eun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
