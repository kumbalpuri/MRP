import React, { useState } from 'react';
import { ComponentWeeklyMRP } from '../../types';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  AlertCircle,
  CheckCircle,
  Truck,
  Box,
  Layers,
  ArrowRight,
  Factory,
  GitFork
} from 'lucide-react';

interface MRPMatrixProps {
  mrpData: ComponentWeeklyMRP[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

export const MRPMatrix: React.FC<MRPMatrixProps> = ({ mrpData, searchTerm, setSearchTerm }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'OK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RM' | 'PM'>('ALL');

  const toggleRow = (code: string) => {
    setExpandedRows((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Filter logic
  const filteredData = mrpData.filter((item) => {
    const matchesSearch =
      item.componentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.componentDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.overallStatus === statusFilter;

    const isRM = item.componentCode.startsWith('RM');
    const isPM = item.componentCode.startsWith('PM');
    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'RM' && isRM) ||
      (categoryFilter === 'PM' && isPM);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Weekly Net Requirements Matrix (MRP Engine)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            4-Week stock projection accounting for current stock, active BOM requirements, and vendor dispatches (in-transit).
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2 py-1 rounded cursor-pointer font-medium transition ${
                categoryFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('RM')}
              className={`px-2 py-1 rounded cursor-pointer font-medium transition ${
                categoryFilter === 'RM' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Raw Material (RM)
            </button>
            <button
              onClick={() => setCategoryFilter('PM')}
              className={`px-2 py-1 rounded cursor-pointer font-medium transition ${
                categoryFilter === 'PM' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Packaging (PM)
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 rounded cursor-pointer font-medium transition ${
                statusFilter === 'ALL' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('CRITICAL')}
              className={`px-2 py-1 rounded cursor-pointer font-medium transition ${
                statusFilter === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Critical Shortage
            </button>
            <button
              onClick={() => setStatusFilter('WARNING')}
              className={`px-2 py-1 rounded cursor-pointer font-medium transition ${
                statusFilter === 'WARNING' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Low Buffer
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <th className="py-3 px-3 w-10"></th>
              <th className="py-3 px-3">Component Code & Description</th>
              <th className="py-3 px-2 text-right">Opening Stock</th>
              <th className="py-3 px-2 text-center bg-blue-50/70 border-x border-slate-200">
                Week 1 Status
              </th>
              <th className="py-3 px-2 text-center bg-blue-50/70 border-r border-slate-200">
                Week 2 Status
              </th>
              <th className="py-3 px-2 text-center bg-blue-50/70 border-r border-slate-200">
                Week 3 Status
              </th>
              <th className="py-3 px-2 text-center bg-blue-50/70 border-r border-slate-200">
                Week 4 Status
              </th>
              <th className="py-3 px-3 text-right">Total Month Shortage</th>
              <th className="py-3 px-3 text-center">Status Tag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No component records match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isExpanded = expandedRows[item.componentCode] || false;
                const isRM = item.componentCode.startsWith('RM');

                return (
                  <React.Fragment key={item.componentCode}>
                    <tr
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        item.overallStatus === 'CRITICAL'
                          ? 'bg-red-50/30'
                          : item.overallStatus === 'WARNING'
                          ? 'bg-amber-50/30'
                          : ''
                      }`}
                      onClick={() => toggleRow(item.componentCode)}
                    >
                      <td className="py-3 px-3 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isRM ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {isRM ? 'RM' : 'PM'}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 font-mono">
                              {item.componentCode}
                            </span>
                            <div className="text-slate-600 font-medium">
                              {item.componentDescription}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Opening Stock */}
                      <td className="py-3 px-2 text-right font-mono font-semibold text-slate-800">
                        {item.openingUnrestrictedStock.toLocaleString()} {item.uom}
                      </td>

                      {/* Week 1 -> Week 4 status cells */}
                      {(item.weeks || []).map((w) => {
                        const isShort = w.netRequirement > 0;
                        return (
                          <td
                            key={w.week}
                            className={`py-2 px-2 border-r border-slate-200 text-center font-mono ${
                              isShort
                                ? 'bg-red-100 text-red-900 font-bold border-l-2 border-l-red-600'
                                : w.status === 'WARNING'
                                ? 'bg-amber-50 text-amber-900 font-semibold'
                                : 'bg-emerald-50/40 text-slate-700'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-slate-500 uppercase font-sans">
                                W{w.week} Req: {w.grossRequirement}
                              </span>
                              {w.scheduledInbound > 0 && (
                                <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-0.5">
                                  <Truck className="w-3 h-3" />+{w.scheduledInbound}
                                </span>
                              )}
                              {isShort ? (
                                <span className="mt-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                  SHORTAGE: -{w.netRequirement}
                                </span>
                              ) : (
                                <span className="text-slate-800 font-semibold text-xs mt-0.5">
                                  Closing: {w.closingStock}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Shortage */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {item.totalMonthShortage > 0 ? (
                          <span className="text-red-600 bg-red-100 px-2 py-1 rounded">
                            -{item.totalMonthShortage.toLocaleString()} {item.uom}
                          </span>
                        ) : (
                          <span className="text-emerald-600">0 {item.uom}</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        {item.overallStatus === 'CRITICAL' ? (
                          <span className="bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            <AlertCircle className="w-3 h-3" /> Critical
                          </span>
                        ) : item.overallStatus === 'WARNING' ? (
                          <span className="bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                            Low Buffer
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Covered
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail View (BOM Usage & Breakdown) */}
                    {isExpanded && (
                      <tr className="bg-slate-50 border-b border-slate-300">
                        <td colSpan={9} className="p-4 pl-12">
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-inner space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <Box className="w-4 h-4 text-blue-600" />
                                <span>Component Allocation & BOM Usage Hierarchy</span>
                              </span>
                              <div className="flex items-center gap-4 text-xs font-mono">
                                <span>Unrestricted Stock: <strong className="text-slate-900">{item.openingUnrestrictedStock} {item.uom}</strong></span>
                                <span>In QC: <strong className="text-amber-700">{item.inQualityInspStock} {item.uom}</strong></span>
                                <span>Blocked: <strong className="text-red-700">{item.blockedStock} {item.uom}</strong></span>
                              </div>
                            </div>

                            {/* Used in Finished Goods */}
                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                                Used In Finished Goods (FG BOM Mapping):
                              </span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {(item.usedInFGs || []).map((fg) => (
                                  <div
                                    key={fg.fgCode}
                                    className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-xs flex items-center gap-1.5 flex-wrap"
                                  >
                                    <span className="font-bold text-blue-700 font-mono">{fg.fgCode}</span>
                                    <span className="text-slate-700">{fg.fgDescription}</span>
                                    {fg.miniFactory && (
                                      <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                        <Factory className="w-3 h-3 text-blue-600" />
                                        <span>{fg.miniFactory}</span>
                                      </span>
                                    )}
                                    {fg.line && (
                                      <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                        <GitFork className="w-3 h-3 text-purple-600" />
                                        <span>{fg.line}</span>
                                      </span>
                                    )}
                                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                      {fg.qtyPerFG} {item.uom}/unit
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 4-Week Granular Table */}
                            <div className="mt-2 overflow-x-auto">
                              <table className="w-full text-[11px] border text-center">
                                <thead>
                                  <tr className="bg-slate-200 text-slate-700 font-semibold">
                                    <th className="py-1 px-2 text-left">Week Period</th>
                                    <th className="py-1 px-2">Opening Stock</th>
                                    <th className="py-1 px-2">Gross Requirement</th>
                                    <th className="py-1 px-2 text-purple-700">Scheduled Inbound (Delivered='N')</th>
                                    <th className="py-1 px-2">Total Available</th>
                                    <th className="py-1 px-2">Net Req (Shortage)</th>
                                    <th className="py-1 px-2">Closing Stock</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(item.weeks || []).map((w) => (
                                    <tr key={w.week} className="border-t">
                                      <td className="py-1 px-2 text-left font-bold text-slate-700">
                                        Week {w.week}
                                      </td>
                                      <td className="py-1 px-2 font-mono">{w.openingStock}</td>
                                      <td className="py-1 px-2 font-mono font-semibold text-slate-900">{w.grossRequirement}</td>
                                      <td className="py-1 px-2 font-mono text-purple-700 font-semibold">
                                        {w.scheduledInbound > 0 ? `+${w.scheduledInbound}` : '0'}
                                      </td>
                                      <td className="py-1 px-2 font-mono">{w.totalAvailable}</td>
                                      <td className="py-1 px-2 font-mono font-bold">
                                        {w.netRequirement > 0 ? (
                                          <span className="text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                            -{w.netRequirement}
                                          </span>
                                        ) : (
                                          <span className="text-emerald-600">0</span>
                                        )}
                                      </td>
                                      <td className="py-1 px-2 font-mono font-semibold">{w.closingStock}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
