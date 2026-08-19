import React from 'react';
import { ComponentWeeklyMRP } from '../types';
import { AlertOctagon, CheckCircle2, AlertTriangle, Truck, Layers, ShieldAlert } from 'lucide-react';

interface CriticalBottlenecksSummaryProps {
  mrpData: ComponentWeeklyMRP[];
  onSelectComponentFilter?: (compCode: string) => void;
}

export const CriticalBottlenecksSummary: React.FC<CriticalBottlenecksSummaryProps> = ({
  mrpData = []
}) => {
  const safeMrpData = mrpData || [];
  const criticalItems = safeMrpData.filter((item) => item.overallStatus === 'CRITICAL');
  const warningItems = safeMrpData.filter((item) => item.overallStatus === 'WARNING');
  const okItems = safeMrpData.filter((item) => item.overallStatus === 'OK');

  // Identify affected FGs
  const affectedFGSet = new Set<string>();
  criticalItems.forEach((item) => {
    (item.usedInFGs || []).forEach((fg) => affectedFGSet.add(fg.fgDescription));
  });

  return (
    <div className="space-y-4 mb-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Critical Shortages */}
        <div className={`p-4 rounded-xl border transition ${
          criticalItems.length > 0
            ? 'bg-red-50/80 border-red-200 text-red-950 shadow-sm'
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Critical Shortages
            </span>
            <AlertOctagon className={`w-5 h-5 ${criticalItems.length > 0 ? 'text-red-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">
              {criticalItems.length}
            </span>
            <span className="text-xs text-red-700 font-medium">Components Short</span>
          </div>
          <p className="mt-1 text-xs text-red-600/90 font-medium">
            {criticalItems.length > 0
              ? `${affectedFGSet.size} Finished Goods lines at risk`
              : 'All components fully covered'}
          </p>
        </div>

        {/* Card 2: Low Stock Warnings */}
        <div className="p-4 rounded-xl border bg-amber-50/80 border-amber-200 text-amber-950 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Low Stock Warnings
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">
              {warningItems.length}
            </span>
            <span className="text-xs text-amber-800 font-medium">Items Buffer &lt; 20%</span>
          </div>
          <p className="mt-1 text-xs text-amber-700 font-medium">
            Monitor incoming dispatches closely
          </p>
        </div>

        {/* Card 3: Healthy Stock Items */}
        <div className="p-4 rounded-xl border bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Fully Covered
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {okItems.length}
            </span>
            <span className="text-xs text-emerald-800 font-medium">Safe Items</span>
          </div>
          <p className="mt-1 text-xs text-emerald-700 font-medium">
            Sufficient stock for all 4 weeks
          </p>
        </div>

        {/* Card 4: Total Components */}
        <div className="p-4 rounded-xl border bg-white border-slate-200 text-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total BOM Items
            </span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {mrpData.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">RMPM Components</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Mapped across active FG demands
          </p>
        </div>
      </div>

      {/* Critical Component Emergency Banner */}
      {criticalItems.length > 0 && (
        <div className="bg-red-900/90 text-white p-4 rounded-xl shadow-md border border-red-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-800 rounded-lg text-red-200 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-red-100 flex items-center gap-2">
                CRITICAL PRODUCTION BOTTLENECK DETECTED
              </h3>
              <p className="text-xs text-red-200 mt-0.5">
                The following raw/packaging materials will run out before end of month:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {criticalItems.map((ci) => {
                  const firstShortWeek = (ci.weeks || []).find((w) => w.netRequirement > 0);
                  return (
                    <span
                      key={ci.componentCode}
                      className="bg-red-950/80 border border-red-500 text-red-200 text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5"
                    >
                      <span className="font-bold">{ci.componentCode}</span>
                      <span className="text-red-300">({ci.componentDescription})</span>
                      <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-sans font-bold">
                        W{firstShortWeek?.week}: -{firstShortWeek?.netRequirement} {ci.uom}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
