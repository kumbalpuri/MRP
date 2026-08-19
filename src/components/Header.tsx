import React from 'react';
import { UserRole } from '../types';
import {
  Factory,
  Warehouse,
  LineChart,
  Truck,
  RotateCcw,
  FileSpreadsheet,
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onResetData: () => void;
  onOpenImportExport: () => void;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  selectedMonth,
  setSelectedMonth,
  onResetData,
  onOpenImportExport,
  criticalCount
}) => {
  return (
    <header className="bg-blue-950 text-slate-100 border-b border-blue-900 sticky top-0 z-40 shadow-sm">
      <div className="w-full max-w-none px-3 sm:px-4 py-2">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
          
          {/* Brand Logo & Compact Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Factory className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-white whitespace-nowrap">
                MRP & Critical Component Planner
              </h1>
              <span className="hidden sm:inline-block bg-blue-900/80 border border-blue-700 text-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                2026.07
              </span>
            </div>
          </div>

          {/* Role Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-blue-950 p-1 rounded-lg border border-blue-900/90 shrink-0">
            <button
              onClick={() => setCurrentRole('planner')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentRole === 'planner'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Planner View</span>
              {criticalCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentRole('warehouse_manager')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentRole === 'warehouse_manager'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Warehouse</span>
            </button>

            <button
              onClick={() => setCurrentRole('production_supervisor')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentRole === 'production_supervisor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Production</span>
            </button>

            <button
              onClick={() => setCurrentRole('procurement')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentRole === 'procurement'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Procurement</span>
            </button>
          </div>

          {/* Action Controls & Planning Period */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Month Picker */}
            <div className="flex items-center gap-1.5 bg-blue-900/60 border border-blue-800 px-2.5 py-1 rounded-md text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="2026-07" className="bg-blue-950">July 2026</option>
                <option value="2026-08" className="bg-blue-950">August 2026</option>
                <option value="2026-09" className="bg-blue-950">September 2026</option>
              </select>
            </div>

            {/* Import / Export Data */}
            <button
              onClick={onOpenImportExport}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-900/80 hover:bg-blue-800 text-slate-100 border border-blue-800 text-xs font-medium rounded-md transition cursor-pointer"
              title="Import/Export CSV Files"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Files / CSV</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-900/80 hover:bg-blue-800 text-slate-100 border border-blue-800 text-xs font-medium rounded-md transition cursor-pointer"
              title="Reset to Original Sample Data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
