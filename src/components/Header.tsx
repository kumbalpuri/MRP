import React from 'react';
import { UserRole, AppPhase } from '../types';
import {
  Factory,
  RotateCcw,
  FileSpreadsheet,
  Calendar,
  Clock,
  Briefcase
} from 'lucide-react';

interface HeaderProps {
  currentPhase: AppPhase;
  setCurrentPhase: (phase: AppPhase) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onResetData: () => void;
  onOpenImportExport: () => void;
  criticalCount: number;
  openFlagsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  setCurrentPhase,
  currentRole,
  setCurrentRole,
  selectedMonth,
  setSelectedMonth,
  onResetData,
  onOpenImportExport,
  criticalCount,
  openFlagsCount = 0
}) => {
  return (
    <header className="bg-slate-950 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="w-full max-w-none px-3 py-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Brand Logo & Compact Automotive Ancillaries Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Factory className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-white whitespace-nowrap">
                Auto Ancillaries MRP & S&OP Hub
              </h1>
              <span className="hidden md:inline-block bg-blue-900/70 border border-blue-700/80 text-blue-200 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                VP • Oil Pump • EGR • BPV • ETB
              </span>
            </div>
          </div>

          {/* Compact 3-Phase + Management Navigation Bar */}
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0 overflow-x-auto">
            {/* Phase 1: Monthly S&OP */}
            <button
              onClick={() => setCurrentPhase('MONTHLY_PHASE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                currentPhase === 'MONTHLY_PHASE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Phase 1: Monthly S&OP</span>
              {openFlagsCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {openFlagsCount}
                </span>
              )}
            </button>

            {/* Phase 2: Weekly MRP */}
            <button
              onClick={() => setCurrentPhase('WEEKLY_PHASE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                currentPhase === 'WEEKLY_PHASE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarRangeIcon className="w-3 h-3" />
              <span>Phase 2: Weekly MRP</span>
              {criticalCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {criticalCount}
                </span>
              )}
            </button>

            {/* Phase 3: Daily 3-Day Plan */}
            <button
              onClick={() => setCurrentPhase('DAILY_PHASE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                currentPhase === 'DAILY_PHASE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Phase 3: Daily 3-Day</span>
            </button>

            {/* Management Cockpit */}
            <button
              onClick={() => setCurrentPhase('MANAGEMENT')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                currentPhase === 'MANAGEMENT'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>👔 Management (W3 & W4)</span>
            </button>
          </div>

          {/* Role Switcher & Utilities */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Role Selector */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-xs">
              <span className="text-[9px] text-slate-400 font-semibold hidden md:inline">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-[11px]"
              >
                <option value="demand_planner" className="bg-slate-900 text-white">Demand Planner</option>
                <option value="supply_planner" className="bg-slate-900 text-white">Supply Planner / Purchase</option>
                <option value="planner" className="bg-slate-900 text-white">Production Planner</option>
                <option value="procurement" className="bg-slate-900 text-white">Procurement Lead</option>
                <option value="management" className="bg-slate-900 text-white">Executive Management</option>
                <option value="warehouse_manager" className="bg-slate-900 text-white">Warehouse Manager</option>
                <option value="production_supervisor" className="bg-slate-900 text-white">Plant Operations</option>
              </select>
            </div>

            {/* Import / Export Data */}
            <button
              onClick={onOpenImportExport}
              className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold rounded-md transition cursor-pointer"
              title="Import/Export CSV Files"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold rounded-md transition cursor-pointer"
              title="Reset to Original Sample Data"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

// Helper internal icon component for CalendarRange
function CalendarRangeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M17 14h-6" />
      <path d="M13 18H7" />
      <path d="M7 14h.01" />
      <path d="M17 18h.01" />
    </svg>
  );
}
