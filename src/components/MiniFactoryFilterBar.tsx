import React from 'react';
import { MiniFactory, MINI_FACTORIES, MINI_FACTORY_LINES } from '../types';
import { Factory, GitFork, Filter, X, Check, Layers } from 'lucide-react';

interface MiniFactoryFilterBarProps {
  selectedMiniFactory: string; // 'ALL' | MiniFactory
  setSelectedMiniFactory: (mf: string) => void;
  selectedLine: string; // 'ALL' | string
  setSelectedLine: (line: string) => void;
  totalFGCount?: number;
  filteredFGCount?: number;
}

export const MiniFactoryFilterBar: React.FC<MiniFactoryFilterBarProps> = ({
  selectedMiniFactory,
  setSelectedMiniFactory,
  selectedLine,
  setSelectedLine,
  totalFGCount,
  filteredFGCount
}) => {
  // Available lines based on selected Mini Factory
  const availableLines =
    selectedMiniFactory !== 'ALL' && selectedMiniFactory in MINI_FACTORY_LINES
      ? MINI_FACTORY_LINES[selectedMiniFactory as MiniFactory]
      : Array.from(new Set(Object.values(MINI_FACTORY_LINES).flat()));

  const handleMiniFactoryChange = (mf: string) => {
    setSelectedMiniFactory(mf);
    // If current selected line is not available in new MF, reset to ALL
    if (mf !== 'ALL' && mf in MINI_FACTORY_LINES) {
      const linesForMF = MINI_FACTORY_LINES[mf as MiniFactory];
      if (selectedLine !== 'ALL' && !linesForMF.includes(selectedLine)) {
        setSelectedLine('ALL');
      }
    }
  };

  const isFilterActive = selectedMiniFactory !== 'ALL' || selectedLine !== 'ALL';

  const clearFilters = () => {
    setSelectedMiniFactory('ALL');
    setSelectedLine('ALL');
  };

  // Badge styling per Mini Factory
  const getMFBadgeStyle = (mf: MiniFactory) => {
    switch (mf) {
      case 'Pumps_Division':
        return 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900';
      case 'Valves_Division':
        return 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900';
      case 'Throttle_ETB':
        return 'border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900';
      case 'Machining':
        return 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900';
      default:
        return 'border-slate-300 bg-slate-50 text-slate-800';
    }
  };

  const getMFActiveStyle = (mf: MiniFactory) => {
    switch (mf) {
      case 'Pumps_Division':
        return 'bg-blue-600 text-white border-blue-700 shadow-xs font-black';
      case 'Valves_Division':
        return 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-black';
      case 'Throttle_ETB':
        return 'bg-purple-600 text-white border-purple-700 shadow-xs font-black';
      case 'Machining':
        return 'bg-amber-600 text-white border-amber-700 shadow-xs font-black';
      default:
        return 'bg-slate-800 text-white border-slate-900';
    }
  };

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Title & Description */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 shrink-0">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Mini Factory & Production Line Filter
              </h3>
              {isFilterActive && (
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  FILTERED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a Mini Factory (MF1, MF2, MF3, Machining) and specific production line to filter MRP requirements, FG coverage, demand, and production logs.
            </p>
          </div>
        </div>

        {/* Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Mini Factory Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 shadow-2xs">
            <Factory className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 shrink-0">Mini Factory:</span>
            <select
              value={selectedMiniFactory}
              onChange={(e) => handleMiniFactoryChange(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Mini Factories (4)</option>
              {MINI_FACTORIES.map((mf) => (
                <option key={mf} value={mf}>
                  {mf} ({MINI_FACTORY_LINES[mf].length} Lines)
                </option>
              ))}
            </select>
          </div>

          {/* Production Line Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 shadow-2xs">
            <GitFork className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 shrink-0">Line:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">
                {selectedMiniFactory === 'ALL' ? 'All Lines Across MFs' : `All Lines in ${selectedMiniFactory}`}
              </option>
              {availableLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filter Button */}
          {isFilterActive && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
              title="Reset Mini Factory & Line filters"
            >
              <X className="w-3.5 h-3.5 text-red-600" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Quick-Select Mini Factory Pills */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider shrink-0 mr-1">
            Quick Select:
          </span>

          <button
            onClick={() => handleMiniFactoryChange('ALL')}
            className={`px-3 py-1 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              selectedMiniFactory === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-extrabold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {selectedMiniFactory === 'ALL' && <Check className="w-3.5 h-3.5" />}
            <span>All Mini Factories</span>
          </button>

          {MINI_FACTORIES.map((mf) => {
            const isSelected = selectedMiniFactory === mf;
            const lines = MINI_FACTORY_LINES[mf];

            return (
              <button
                key={mf}
                onClick={() => handleMiniFactoryChange(mf)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected ? getMFActiveStyle(mf) : getMFBadgeStyle(mf)
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{mf}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/30 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {lines.length} Lines
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Filter Summary Badge */}
        {filteredFGCount !== undefined && totalFGCount !== undefined && (
          <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Showing <strong className="text-blue-700">{filteredFGCount}</strong> of <strong className="text-slate-900">{totalFGCount}</strong> Finished Goods
            </span>
          </div>
        )}
      </div>

      {/* Sub-Line Quick Selector if a specific Mini Factory is selected */}
      {selectedMiniFactory !== 'ALL' && availableLines.length > 0 && (
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 text-[11px] shrink-0">
            {selectedMiniFactory} Lines:
          </span>
          <button
            onClick={() => setSelectedLine('ALL')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
              selectedLine === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            All Lines ({availableLines.length})
          </button>

          {availableLines.map((line) => (
            <button
              key={line}
              onClick={() => setSelectedLine(line)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                selectedLine === line ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {line}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
