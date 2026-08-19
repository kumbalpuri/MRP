import React, { useState, useMemo } from 'react';
import { SAPInwardItem, InventoryItem } from '../../types';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Calendar,
  Package,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  Building,
  ArrowRight,
  Info
} from 'lucide-react';
import Papa from 'papaparse';

interface SAPInwardManagerProps {
  sapInwards: SAPInwardItem[];
  inventory: InventoryItem[];
  onUpdateSAPInwards: (inwards: SAPInwardItem[]) => void;
  onUpdateInventory: (inventory: InventoryItem[]) => void;
  onReturnToMatrix?: () => void;
}

export const SAPInwardManager: React.FC<SAPInwardManagerProps> = ({
  sapInwards,
  inventory,
  onUpdateSAPInwards,
  onUpdateInventory,
  onReturnToMatrix
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [weekFilter, setWeekFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const [newItem, setNewItem] = useState<Partial<SAPInwardItem>>({
    matDoc: `5000${Math.floor(2000 + Math.random() * 8000)}`,
    postingDate: '2026-07-08',
    week: 1,
    materialCode: 'RM-501',
    materialDescription: 'Puree Concentrate - Alphonso Mango',
    qty: 500,
    uom: 'KG',
    sloc: 'SL01-Raw',
    vendor: 'SunRipe Fruits Exim',
    poNumber: 'PO-90001',
    headerText: 'SAP Inward GR'
  });

  const filteredInwards = useMemo(() => {
    return sapInwards.filter((item) => {
      if (weekFilter !== 'ALL' && item.week !== weekFilter) return false;

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesDoc = item.matDoc.toLowerCase().includes(term);
        const matchesCode = item.materialCode.toLowerCase().includes(term);
        const matchesDesc = item.materialDescription.toLowerCase().includes(term);
        const matchesVendor = item.vendor?.toLowerCase().includes(term);
        const matchesPO = item.poNumber?.toLowerCase().includes(term);
        if (!matchesDoc && !matchesCode && !matchesDesc && !matchesVendor && !matchesPO) return false;
      }

      return true;
    });
  }, [sapInwards, weekFilter, searchTerm]);

  // Handle Add New Inward
  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.materialCode || !newItem.qty) return;

    const newInward: SAPInwardItem = {
      id: `sap-${Date.now()}`,
      matDoc: newItem.matDoc || `5000${Math.floor(2000 + Math.random() * 8000)}`,
      postingDate: newItem.postingDate || new Date().toISOString().split('T')[0],
      week: (newItem.week as 1 | 2 | 3 | 4) || 1,
      materialCode: newItem.materialCode,
      materialDescription: newItem.materialDescription || newItem.materialCode,
      qty: Number(newItem.qty) || 0,
      uom: newItem.uom || 'KG',
      sloc: newItem.sloc || 'SL01-Raw',
      vendor: newItem.vendor,
      poNumber: newItem.poNumber,
      headerText: newItem.headerText
    };

    onUpdateSAPInwards([newInward, ...sapInwards]);

    // Automatically update unrestricted warehouse inventory
    const updatedInv = inventory.map((inv) => {
      if (inv.materialNumber === newInward.materialCode) {
        return {
          ...inv,
          unrestricted: inv.unrestricted + newInward.qty,
          lastUpdated: newInward.postingDate
        };
      }
      return inv;
    });
    onUpdateInventory(updatedInv);

    setIsAddingNew(false);
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (window.confirm('Delete this SAP Goods Receipt entry?')) {
      onUpdateSAPInwards(sapInwards.filter((s) => s.id !== id));
    }
  };

  // Handle CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[];
        const parsed: SAPInwardItem[] = rawData.map((row, idx) => ({
          id: `sap-imp-${Date.now()}-${idx}`,
          matDoc: row['MatDoc'] || row['Material Document'] || row['matDoc'] || `5000${9000 + idx}`,
          postingDate: row['Posting Date'] || row['postingDate'] || '2026-07-05',
          week: (parseInt(row['Week'] || row['week'] || '1', 10) as 1 | 2 | 3 | 4) || 1,
          materialCode: row['Material'] || row['materialCode'] || 'RM-101',
          materialDescription: row['Description'] || row['materialDescription'] || 'Material',
          qty: parseFloat(row['Qty'] || row['quantity'] || row['qty'] || '0'),
          uom: row['UoM'] || row['uom'] || 'KG',
          sloc: row['SLoc'] || row['sloc'] || 'SL01-Raw',
          vendor: row['Vendor'] || row['vendor'] || 'Supplier Inc',
          poNumber: row['PO'] || row['poNumber'] || 'PO-90000',
          headerText: row['Header Text'] || row['headerText'] || 'SAP Inward'
        }));

        if (parsed.length > 0) {
          onUpdateSAPInwards([...parsed, ...sapInwards]);
          alert(`Successfully imported ${parsed.length} SAP Inward records!`);
        }
      }
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(sapInwards);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SAP_Inward_Receipts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate weekly sums
  const w1Total = sapInwards.filter((s) => s.week === 1).reduce((acc, s) => acc + s.qty, 0);
  const w2Total = sapInwards.filter((s) => s.week === 2).reduce((acc, s) => acc + s.qty, 0);
  const w3Total = sapInwards.filter((s) => s.week === 3).reduce((acc, s) => acc + s.qty, 0);
  const w4Total = sapInwards.filter((s) => s.week === 4).reduce((acc, s) => acc + s.qty, 0);

  return (
    <div className="space-y-3 font-sans">
      {/* Header Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-700 text-white rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  SAP Goods Receipt / Inward Ledger
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  {sapInwards.length} Inward Transactions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Actual material receipts recorded from SAP ERP (MIGO / MB51 file input). Feeds actual receipts into weekly procurement matrix and clears backlog.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onReturnToMatrix && (
              <button
                onClick={onReturnToMatrix}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300 cursor-pointer"
              >
                <span>← Back to RM Matrix</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
              title="Export SAP Inwards to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Import SAP CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log SAP Goods Receipt</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search MatDoc #, Material Code, Vendor, or PO#..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Week Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setWeekFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  weekFilter === 'ALL' ? 'bg-white text-blue-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Weeks
              </button>
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeekFilter(w as 1 | 2 | 3 | 4)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    weekFilter === w ? 'bg-white text-blue-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Week {w}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Inward Volume Indicators */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
            <span>W1: <strong className="text-blue-700 font-bold">{w1Total.toLocaleString()}</strong></span>
            <span>W2: <strong className="text-blue-700 font-bold">{w2Total.toLocaleString()}</strong></span>
            <span>W3: <strong className="text-blue-700 font-bold">{w3Total.toLocaleString()}</strong></span>
            <span>W4: <strong className="text-blue-700 font-bold">{w4Total.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Tabular Inward Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 min-w-[110px]">SAP MatDoc #</th>
                <th className="py-2.5 px-3 min-w-[95px]">Posting Date</th>
                <th className="py-2.5 px-2 text-center bg-blue-900/50 min-w-[70px]">Week</th>
                <th className="py-2.5 px-3 min-w-[100px]">Material Code</th>
                <th className="py-2.5 px-3 min-w-[200px]">Description</th>
                <th className="py-2.5 px-3 text-right min-w-[100px]">Received Qty</th>
                <th className="py-2.5 px-2 text-center w-12">UoM</th>
                <th className="py-2.5 px-3 min-w-[90px]">Storage Loc</th>
                <th className="py-2.5 px-3 min-w-[150px]">Vendor & PO Ref</th>
                <th className="py-2.5 px-3 min-w-[140px]">Header Text / Note</th>
                <th className="py-2.5 px-2 text-center w-14">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredInwards.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-sans">
                    <p className="text-sm font-semibold">No SAP inward receipts found matching the filter.</p>
                  </td>
                </tr>
              ) : (
                filteredInwards.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/30 transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    {/* SAP MatDoc */}
                    <td className="py-2.5 px-3 font-bold text-blue-700">
                      {item.matDoc}
                    </td>

                    {/* Posting Date */}
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.postingDate}
                    </td>

                    {/* Assigned Week */}
                    <td className="py-2.5 px-2 text-center font-bold">
                      <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                        W{item.week}
                      </span>
                    </td>

                    {/* Material Code */}
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.materialCode}
                    </td>

                    {/* Description */}
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                      {item.materialDescription}
                    </td>

                    {/* Received Quantity */}
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      +{item.qty.toLocaleString()}
                    </td>

                    {/* UoM */}
                    <td className="py-2.5 px-2 text-center uppercase text-slate-500 text-[11px]">
                      {item.uom}
                    </td>

                    {/* Storage Location */}
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                      {item.sloc}
                    </td>

                    {/* Vendor & PO */}
                    <td className="py-2.5 px-3 font-sans text-slate-700">
                      <div>{item.vendor || 'Supplier'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.poNumber || 'N/A'}</div>
                    </td>

                    {/* Header Note */}
                    <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">
                      {item.headerText || '-'}
                    </td>

                    {/* Delete Action */}
                    <td className="py-2.5 px-2 text-center font-sans">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                        title="Delete receipt record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New SAP Inward Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-800 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Log SAP Goods Receipt / Inward</h3>
                  <p className="text-[11px] text-blue-200">
                    Registers physical delivery receipt from SAP MIGO/MB51 document into MRP.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-blue-200 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SAP MatDoc # *</label>
                  <input
                    type="text"
                    required
                    value={newItem.matDoc}
                    onChange={(e) => setNewItem({ ...newItem, matDoc: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Posting Date *</label>
                  <input
                    type="date"
                    required
                    value={newItem.postingDate}
                    onChange={(e) => setNewItem({ ...newItem, postingDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material Code *</label>
                  <input
                    type="text"
                    required
                    value={newItem.materialCode}
                    onChange={(e) => setNewItem({ ...newItem, materialCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Received Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newItem.qty}
                    onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Material Description</label>
                  <input
                    type="text"
                    value={newItem.materialDescription}
                    onChange={(e) => setNewItem({ ...newItem, materialDescription: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned MRP Week *</label>
                  <select
                    value={newItem.week}
                    onChange={(e) => setNewItem({ ...newItem, week: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={newItem.uom}
                    onChange={(e) => setNewItem({ ...newItem, uom: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Location (SLoc)</label>
                  <input
                    type="text"
                    value={newItem.sloc}
                    onChange={(e) => setNewItem({ ...newItem, sloc: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PO Reference</label>
                  <input
                    type="text"
                    value={newItem.poNumber}
                    onChange={(e) => setNewItem({ ...newItem, poNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Supplier</label>
                  <input
                    type="text"
                    value={newItem.vendor}
                    onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Header Text / Remarks</label>
                  <input
                    type="text"
                    value={newItem.headerText}
                    onChange={(e) => setNewItem({ ...newItem, headerText: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
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
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded cursor-pointer shadow-sm"
                >
                  Post Goods Receipt to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
