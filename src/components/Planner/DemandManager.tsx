import React, { useState } from 'react';
import { DemandItem, ProductionLogItem } from '../../types';
import { getFGProductionCompleted } from '../../utils/mrpEngine';
import {
  CalendarRange,
  Edit3,
  Save,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle,
  Factory,
  GitFork,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface DemandManagerProps {
  demands: DemandItem[];
  productionLogs: ProductionLogItem[];
  onUpdateDemand: (updatedDemands: DemandItem[]) => void;
}

export const DemandManager: React.FC<DemandManagerProps> = ({
  demands,
  productionLogs,
  onUpdateDemand
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DemandItem | null>(null);
  const [stepSize, setStepSize] = useState<number>(100);

  const startEdit = (item: DemandItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  // Quick adjust week demand on the fly (+/- step)
  const handleQuickAdjust = (itemId: string, week: 1 | 2 | 3 | 4, delta: number) => {
    const updated = demands.map((d) => {
      if (d.id !== itemId) return d;
      const key = `week${week}Demand` as 'week1Demand' | 'week2Demand' | 'week3Demand' | 'week4Demand';
      const currentVal = d[key] ?? Math.round(d.monthlyDemand / 4);
      const newVal = Math.max(0, currentVal + delta);

      const w1 = week === 1 ? newVal : (d.week1Demand ?? Math.round(d.monthlyDemand / 4));
      const w2 = week === 2 ? newVal : (d.week2Demand ?? Math.round(d.monthlyDemand / 4));
      const w3 = week === 3 ? newVal : (d.week3Demand ?? Math.round(d.monthlyDemand / 4));
      const w4 = week === 4 ? newVal : (d.week4Demand ?? Math.round(d.monthlyDemand / 4));

      return {
        ...d,
        [key]: newVal,
        monthlyDemand: w1 + w2 + w3 + w4
      };
    });

    onUpdateDemand(updated);
  };

  const handleWeeklyInputChange = (week: 1 | 2 | 3 | 4, val: number) => {
    if (!editForm) return;
    const key = `week${week}Demand` as 'week1Demand' | 'week2Demand' | 'week3Demand' | 'week4Demand';
    const updatedForm = {
      ...editForm,
      [key]: Math.max(0, val)
    };

    const w1 = week === 1 ? Math.max(0, val) : (updatedForm.week1Demand ?? 0);
    const w2 = week === 2 ? Math.max(0, val) : (updatedForm.week2Demand ?? 0);
    const w3 = week === 3 ? Math.max(0, val) : (updatedForm.week3Demand ?? 0);
    const w4 = week === 4 ? Math.max(0, val) : (updatedForm.week4Demand ?? 0);

    updatedForm.monthlyDemand = w1 + w2 + w3 + w4;
    setEditForm(updatedForm);
  };

  const handleMonthlyChange = (newVal: number) => {
    if (!editForm) return;
    const equalWeekly = Math.round(newVal / 4);
    setEditForm({
      ...editForm,
      monthlyDemand: newVal,
      week1Demand: equalWeekly,
      week2Demand: equalWeekly,
      week3Demand: equalWeekly,
      week4Demand: equalWeekly
    });
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = demands.map((d) => (d.id === editForm.id ? editForm : d));
    onUpdateDemand(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const autoDivideAll = () => {
    const updated = demands.map((d) => {
      const eq = Math.round(d.monthlyDemand / 4);
      return {
        ...d,
        week1Demand: eq,
        week2Demand: eq,
        week3Demand: eq,
        week4Demand: eq
      };
    });
    onUpdateDemand(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-blue-600" />
            <span>Planner Weekly Production Schedule & Demand Editor</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Planner control center: Increase or decrease weekly production schedules for each Finished Good. Total monthly demand automatically syncs with MRP calculations.
          </p>
        </div>

        {/* Quick Tools & Step Size Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold text-slate-700 shadow-2xs">
            <span className="text-[11px] text-slate-500 px-1">Step:</span>
            {[50, 100, 250, 500].map((step) => (
              <button
                key={step}
                onClick={() => setStepSize(step)}
                className={`px-2 py-0.5 rounded transition cursor-pointer text-xs ${
                  stepSize === step ? 'bg-blue-600 text-white font-extrabold shadow-2xs' : 'hover:bg-slate-100'
                }`}
              >
                ±{step}
              </button>
            ))}
          </div>

          <button
            onClick={autoDivideAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Equalize All Weeks (25% each)</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200 uppercase tracking-wider">
              <th className="py-3 px-4">Finished Good (FG)</th>
              <th className="py-3 px-3 text-right">Total Planned Demand</th>
              <th className="py-3 px-3 text-right text-blue-700 bg-blue-50/50">
                Production Done
              </th>
              <th className="py-3 px-3 text-right text-emerald-800 bg-emerald-50/50">
                Net Remaining
              </th>
              <th className="py-3 px-3 text-center bg-slate-200/50">Week 1 Schedule</th>
              <th className="py-3 px-3 text-center bg-slate-200/50">Week 2 Schedule</th>
              <th className="py-3 px-3 text-center bg-slate-200/50">Week 3 Schedule</th>
              <th className="py-3 px-3 text-center bg-slate-200/50">Week 4 Schedule</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {demands.map((item) => {
              const isEditing = editingId === item.id;
              const producedSoFar = getFGProductionCompleted(item.fgCode, productionLogs);
              const netRemaining = Math.max(0, item.monthlyDemand - producedSoFar);

              const w1 = item.week1Demand ?? Math.round(item.monthlyDemand / 4);
              const w2 = item.week2Demand ?? Math.round(item.monthlyDemand / 4);
              const w3 = item.week3Demand ?? Math.round(item.monthlyDemand / 4);
              const w4 = item.week4Demand ?? Math.round(item.monthlyDemand / 4);

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-extrabold text-blue-700 text-sm">{item.fgCode}</div>
                    <div className="font-semibold text-slate-800 text-xs">{item.fgDescription}</div>
                    {(item.miniFactory || item.line) && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {item.miniFactory && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded text-[10px] font-extrabold flex items-center gap-1">
                            <Factory className="w-3 h-3 text-blue-600" />
                            <span>{item.miniFactory}</span>
                          </span>
                        )}
                        {item.line && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-200 rounded text-[10px] font-extrabold flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-purple-600" />
                            <span>{item.line}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Total Planned Demand */}
                  <td className="py-3.5 px-3 text-right font-black text-slate-900 text-sm">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm?.monthlyDemand || 0}
                        onChange={(e) => handleMonthlyChange(Number(e.target.value))}
                        className="w-24 p-1 border border-blue-500 rounded text-right font-mono text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      `${item.monthlyDemand.toLocaleString()} ${item.uom}`
                    )}
                  </td>

                  {/* Produced So Far */}
                  <td className="py-3.5 px-3 text-right bg-blue-50/30 font-black text-blue-800">
                    {producedSoFar.toLocaleString()} {item.uom}
                  </td>

                  {/* Net Remaining */}
                  <td className="py-3.5 px-3 text-right bg-emerald-50/30 font-black text-emerald-800">
                    {netRemaining.toLocaleString()} {item.uom}
                  </td>

                  {/* Week 1 Schedule with +/- Controls */}
                  <td className="py-3 px-2 text-center bg-slate-50/70">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm?.week1Demand ?? 0}
                        onChange={(e) => handleWeeklyInputChange(1, Number(e.target.value))}
                        className="w-20 p-1 border border-blue-500 rounded text-center text-xs font-bold"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 1, -stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Decrease W1 schedule by ${stepSize}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-slate-900 px-1 min-w-[54px] text-center">
                          {w1.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 1, stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Increase W1 schedule by ${stepSize}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Week 2 Schedule with +/- Controls */}
                  <td className="py-3 px-2 text-center bg-slate-50/70">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm?.week2Demand ?? 0}
                        onChange={(e) => handleWeeklyInputChange(2, Number(e.target.value))}
                        className="w-20 p-1 border border-blue-500 rounded text-center text-xs font-bold"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 2, -stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Decrease W2 schedule by ${stepSize}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-slate-900 px-1 min-w-[54px] text-center">
                          {w2.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 2, stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Increase W2 schedule by ${stepSize}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Week 3 Schedule with +/- Controls */}
                  <td className="py-3 px-2 text-center bg-slate-50/70">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm?.week3Demand ?? 0}
                        onChange={(e) => handleWeeklyInputChange(3, Number(e.target.value))}
                        className="w-20 p-1 border border-blue-500 rounded text-center text-xs font-bold"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 3, -stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Decrease W3 schedule by ${stepSize}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-slate-900 px-1 min-w-[54px] text-center">
                          {w3.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 3, stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Increase W3 schedule by ${stepSize}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Week 4 Schedule with +/- Controls */}
                  <td className="py-3 px-2 text-center bg-slate-50/70">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm?.week4Demand ?? 0}
                        onChange={(e) => handleWeeklyInputChange(4, Number(e.target.value))}
                        className="w-20 p-1 border border-blue-500 rounded text-center text-xs font-bold"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 4, -stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Decrease W4 schedule by ${stepSize}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-slate-900 px-1 min-w-[54px] text-center">
                          {w4.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.id, 4, stepSize)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 flex items-center justify-center font-black transition cursor-pointer"
                          title={`Increase W4 schedule by ${stepSize}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    {isEditing ? (
                      <button
                        onClick={saveEdit}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg transition cursor-pointer flex items-center gap-1 mx-auto font-bold"
                        title="Edit Full Numbers"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
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
