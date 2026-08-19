import React, { useState, useMemo } from 'react';
import { BOMItem, DemandItem, InventoryItem } from '../../types';
import { Search, Layers, Factory, Building, ArrowRight } from 'lucide-react';

interface RMBOMUsageMappingProps {
  boms: BOMItem[];
  demands: DemandItem[];
  inventory: InventoryItem[];
}

export const RMBOMUsageMapping: React.FC<RMBOMUsageMappingProps> = ({
  boms,
  demands,
  inventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RM' | 'PM'>('ALL');

  const demandMap = useMemo(() => {
    const map = new Map<string, DemandItem>();
    demands.forEach((d) => map.set(d.fgCode, d));
    return map;
  }, [demands]);

  const inventoryMap = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    inventory.forEach((inv) => map.set(inv.materialNumber, inv));
    return map;
  }, [inventory]);

  const mappedData = useMemo(() => {
    return boms.map((b) => {
      const fgDemand = demandMap.get(b.fgCode);
      const inv = inventoryMap.get(b.componentCode);
      const monthlyDemand = fgDemand ? fgDemand.monthlyDemand : 0;
      const totalComponentMonthReq = Number((monthlyDemand * b.qty).toFixed(2));
      const category: 'RM' | 'PM' = b.category || (b.componentCode.startsWith('RM') ? 'RM' : 'PM');

      return {
        ...b,
        category,
        customerName: fgDemand?.customerName,
        fgMonthlyDemand: monthlyDemand,
        totalComponentMonthReq,
        currentStock: inv?.unrestricted ?? 0
      };
    }).filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesComp = item.componentCode.toLowerCase().includes(term);
        const matchesCompDesc = item.componentDescription.toLowerCase().includes(term);
        const matchesFG = item.fgCode.toLowerCase().includes(term);
        const matchesFGDesc = item.fgDescription.toLowerCase().includes(term);
        const matchesCust = item.customerName?.toLowerCase().includes(term);
        if (!matchesComp && !matchesCompDesc && !matchesFG && !matchesFGDesc && !matchesCust) return false;
      }
      return true;
    });
  }, [boms, demandMap, inventoryMap, categoryFilter, searchTerm]);

  return (
    <div className="space-y-3 font-sans">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>RM / PM to Finished Goods BOM Cross-Reference</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabular view mapping raw and packaging materials to each finished good formula and monthly volume.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search RM, FG, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === 'ALL' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('RM')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === 'RM' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                RM
              </button>
              <button
                onClick={() => setCategoryFilter('PM')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === 'PM' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 min-w-[100px]">Component Code</th>
                <th className="py-2.5 px-3 min-w-[200px]">Component Description</th>
                <th className="py-2.5 px-2 text-center w-12">Cat</th>
                <th className="py-2.5 px-3 min-w-[100px]">Consuming FG</th>
                <th className="py-2.5 px-3 min-w-[200px]">Finished Product Description</th>
                <th className="py-2.5 px-3 min-w-[140px]">Customer / Line</th>
                <th className="py-2.5 px-3 text-right min-w-[90px]">Qty per FG Unit</th>
                <th className="py-2.5 px-2 text-center w-12">UoM</th>
                <th className="py-2.5 px-3 text-right min-w-[100px]">FG Monthly Demand</th>
                <th className="py-2.5 px-3 text-right min-w-[110px] bg-blue-900/50">Month RM Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {mappedData.map((item, idx) => (
                <tr key={`${item.id}-${idx}`} className={`hover:bg-blue-50/30 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{item.componentCode}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{item.componentDescription}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${item.category === 'RM' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.fgCode}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">{item.fgDescription}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                    {item.customerName || 'Standard'} • {item.miniFactory || ''} {item.line || ''}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.qty}</td>
                  <td className="py-2.5 px-2 text-center uppercase text-slate-500 text-[11px]">{item.uom}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{item.fgMonthlyDemand.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-900 bg-blue-50/40">
                    {item.totalComponentMonthReq.toLocaleString()} {item.uom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
