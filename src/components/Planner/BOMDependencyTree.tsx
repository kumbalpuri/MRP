import React, { useState } from 'react';
import { BOMItem, InventoryItem, ComponentWeeklyMRP } from '../../types';
import { Network, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Box, ArrowDownRight, Factory, GitFork } from 'lucide-react';

interface BOMDependencyTreeProps {
  boms: BOMItem[];
  inventory: InventoryItem[];
  mrpData: ComponentWeeklyMRP[];
}

export const BOMDependencyTree: React.FC<BOMDependencyTreeProps> = ({ boms, inventory, mrpData }) => {
  // Group BOM by Finished Goods (FG)
  const fgMap = new Map<string, { fgDescription: string; components: BOMItem[] }>();

  boms.forEach((bom) => {
    if (!fgMap.has(bom.fgCode)) {
      fgMap.set(bom.fgCode, { fgDescription: bom.fgDescription, components: [] });
    }
    fgMap.get(bom.fgCode)!.components.push(bom);
  });

  const [expandedFGs, setExpandedFGs] = useState<Record<string, boolean>>({
    'FG-1001': true,
    'FG-1002': true,
    'FG-1003': true
  });

  const toggleFG = (code: string) => {
    setExpandedFGs((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-600" />
            <span>BOM Dependency & Component Hierarchy</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exploded Bill of Materials mapping FG parent assemblies down to Raw Material and Packaging Material child dependencies.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              const all: Record<string, boolean> = {};
              fgMap.forEach((_, key) => (all[key] = true));
              setExpandedFGs(all);
            }}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 font-medium cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedFGs({})}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 font-medium cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {Array.from(fgMap.entries()).map(([fgCode, fgData]) => {
          const isExpanded = expandedFGs[fgCode] || false;

          // Check if any component for this FG has a critical shortage in MRP
          const componentShortages = (fgData.components || []).map((bom) => {
            const mrpInfo = mrpData.find((m) => m.componentCode === bom.componentCode);
            return {
              bom,
              mrpInfo,
              isCritical: mrpInfo?.overallStatus === 'CRITICAL'
            };
          });

          const hasCriticalShortage = componentShortages.some((c) => c.isCritical);

          return (
            <div
              key={fgCode}
              className={`rounded-xl border transition overflow-hidden ${
                hasCriticalShortage
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* FG Parent Node Header */}
              <div
                onClick={() => toggleFG(fgCode)}
                className={`p-4 flex items-center justify-between cursor-pointer select-none transition ${
                  hasCriticalShortage
                    ? 'bg-red-100/50 hover:bg-red-100/80 text-red-950'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white border border-slate-300 rounded shadow-sm text-slate-600">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold font-mono text-sm text-blue-700">
                        {fgCode}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {fgData.fgDescription}
                      </span>
                      {fgData.components[0]?.miniFactory && (
                        <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Factory className="w-3.5 h-3.5 text-blue-700" />
                          <span>{fgData.components[0].miniFactory}</span>
                        </span>
                      )}
                      {fgData.components[0]?.line && (
                        <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5 text-purple-700" />
                          <span>{fgData.components[0].line}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      Parent Finished Good Assembly • {fgData.components.length} Dependent Component Items
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasCriticalShortage ? (
                    <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <AlertTriangle className="w-4 h-4" /> BOTTLENECK BLOCKED
                    </span>
                  ) : (
                    <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> BOM FULLY COVERED
                    </span>
                  )}
                </div>
              </div>

              {/* Children Dependencies Tree List */}
              {isExpanded && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-blue-400">
                    {componentShortages.map(({ bom, mrpInfo, isCritical }) => {
                      const isRM = bom.componentCode.startsWith('RM');

                      return (
                        <div
                          key={bom.id}
                          className={`p-3.5 rounded-lg border text-xs shadow-sm flex flex-col justify-between ${
                            isCritical
                              ? 'bg-red-100/80 border-red-300 text-red-950'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <ArrowDownRight className="w-4 h-4 text-blue-600 shrink-0" />
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isRM ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {isRM ? 'Raw Material' : 'Packaging'}
                                </span>
                                <span className="font-mono font-bold text-slate-900">
                                  {bom.componentCode}
                                </span>
                              </div>
                              <span className="font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                {bom.qty} {bom.uom} / unit FG
                              </span>
                            </div>

                            <p className="font-semibold text-slate-800 mt-1.5 ml-5">
                              {bom.componentDescription}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono">
                            <div>
                              <span className="text-slate-500">Unrestricted Stock: </span>
                              <strong className="text-slate-900">
                                {mrpInfo?.openingUnrestrictedStock.toLocaleString()} {bom.uom}
                              </strong>
                            </div>

                            {isCritical ? (
                              <span className="text-red-700 font-bold bg-red-200/80 px-2 py-0.5 rounded">
                                Shortage: -{mrpInfo?.totalMonthShortage} {bom.uom}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                                Stock OK
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
