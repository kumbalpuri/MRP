import React, { useState } from 'react';
import {
  ComponentWeeklyMRP,
  DemandItem,
  BOMItem,
  DeliveryScheduleItem,
  MiniFactory
} from '../../types';
import {
  Building2,
  AlertTriangle,
  Calendar,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Factory,
  GitFork,
  Sparkles,
  TrendingDown,
  Layers,
  Edit2
} from 'lucide-react';

interface ManagementShortageReportProps {
  mrpData: ComponentWeeklyMRP[];
  demands: DemandItem[];
  boms: BOMItem[];
  deliverySchedules: DeliveryScheduleItem[];
  purchaseComments: Record<string, string>;
  onUpdatePurchaseComment: (key: string, comment: string) => void;
  onUpdateDemandCustomer?: (fgCode: string, customerName: string) => void;
  selectedMiniFactory?: string;
  selectedLine?: string;
}

export const ManagementShortageReport: React.FC<ManagementShortageReportProps> = ({
  mrpData,
  demands,
  boms,
  deliverySchedules,
  purchaseComments,
  onUpdatePurchaseComment,
  onUpdateDemandCustomer,
  selectedMiniFactory = 'ALL',
  selectedLine = 'ALL'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('ALL'); // 'ALL' | '1' | '2' | '3' | '4'
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL'); // 'ALL' | 'RM' | 'PM'
  const [onlyShortages, setOnlyShortages] = useState<boolean>(true);

  // Inline Customer Name Edit
  const [editingCustomerFgCode, setEditingCustomerFgCode] = useState<string | null>(null);
  const [tempCustomerName, setTempCustomerName] = useState('');

  // Local draft comments map for smooth typing before click save
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Map demand and FG info by FG Code
  const demandMap = new Map<string, DemandItem>();
  demands.forEach((d) => demandMap.set(d.fgCode, d));

  // Map vendors by component code from Delivery Schedule
  const vendorMap = new Map<string, string>();
  deliverySchedules.forEach((ds) => {
    if (ds.vendor && !vendorMap.has(ds.materialCode)) {
      vendorMap.set(ds.materialCode, ds.vendor);
    }
  });

  // Default sample comments generator
  const getDefaultComment = (componentCode: string, week: number): string => {
    if (componentCode === 'RM-101') {
      return `PO-9012 AgroPur. Customs clearance hold; ETA July ${10 + week * 2}. Expediting air shipment.`;
    }
    if (componentCode === 'PM-801') {
      return `PO-8819 PlasticPack. Line trial passed. Vendor dispatch 20k units July ${8 + week * 3}.`;
    }
    if (componentCode === 'RM-201') {
      return `PO-9104 CitrusCrop. Partial delivery in; balance 5k KG expected Week ${week}.`;
    }
    if (componentCode === 'RM-505') {
      return `PO-7721 Hindalco. Raw billet forging in progress. Purchase following up daily.`;
    }
    return `Purchase team coordinating priority dispatch with supplier for W${week}.`;
  };

  // Build Matrix Rows: Each row is a unique (Customer, FG, Component) combination
  interface WeekShortageDetail {
    week: 1 | 2 | 3 | 4;
    shortageQty: number;
    fgImpactQty: number;
    commentKey: string;
    comment: string;
  }

  interface ManagementMatrixRow {
    rowId: string; // fgCode_componentCode
    fgCode: string;
    fgDescription: string;
    customerName: string;
    miniFactory?: MiniFactory;
    line?: string;
    componentCode: string;
    componentDescription: string;
    category: 'RM' | 'PM';
    uom: string;
    qtyPerFG: number;
    vendor: string;
    weeks: {
      1: WeekShortageDetail;
      2: WeekShortageDetail;
      3: WeekShortageDetail;
      4: WeekShortageDetail;
    };
    totalShortageQty: number;
    totalFGImpactUnits: number;
    hasAnyShortage: boolean;
  }

  const matrixMap = new Map<string, ManagementMatrixRow>();

  mrpData.forEach((comp) => {
    const category: 'RM' | 'PM' = comp.componentCode.startsWith('RM') ? 'RM' : 'PM';
    const vendor = vendorMap.get(comp.componentCode) || 'Primary Contracted Supplier';

    comp.usedInFGs.forEach((fg) => {
      // Check mini factory and line filter
      if (selectedMiniFactory !== 'ALL' && fg.miniFactory && fg.miniFactory !== selectedMiniFactory) {
        return;
      }
      if (selectedLine !== 'ALL' && fg.line && fg.line !== selectedLine) {
        return;
      }

      const rowId = `${fg.fgCode}_${comp.componentCode}`;
      const demandEntry = demandMap.get(fg.fgCode);
      const customerName = demandEntry?.customerName || 'Key Account Client';
      const qtyPerFG = fg.qtyPerFG || 1;

      if (!matrixMap.has(rowId)) {
        matrixMap.set(rowId, {
          rowId,
          fgCode: fg.fgCode,
          fgDescription: fg.fgDescription,
          customerName,
          miniFactory: fg.miniFactory || demandEntry?.miniFactory,
          line: fg.line || demandEntry?.line,
          componentCode: comp.componentCode,
          componentDescription: comp.componentDescription,
          category,
          uom: comp.uom,
          qtyPerFG,
          vendor,
          weeks: {
            1: { week: 1, shortageQty: 0, fgImpactQty: 0, commentKey: `${rowId}_W1`, comment: '' },
            2: { week: 2, shortageQty: 0, fgImpactQty: 0, commentKey: `${rowId}_W2`, comment: '' },
            3: { week: 3, shortageQty: 0, fgImpactQty: 0, commentKey: `${rowId}_W3`, comment: '' },
            4: { week: 4, shortageQty: 0, fgImpactQty: 0, commentKey: `${rowId}_W4`, comment: '' }
          },
          totalShortageQty: 0,
          totalFGImpactUnits: 0,
          hasAnyShortage: false
        });
      }

      const row = matrixMap.get(rowId)!;

      comp.weeks.forEach((w) => {
        const weekNum = w.week as 1 | 2 | 3 | 4;
        const commentKey = `${rowId}_W${weekNum}`;
        const shortageQty = w.netRequirement > 0 ? w.netRequirement : 0;
        const fgImpactQty = shortageQty > 0 ? Math.ceil(shortageQty / qtyPerFG) : 0;

        const storedComment = purchaseComments[commentKey];
        const comment =
          storedComment !== undefined
            ? storedComment
            : shortageQty > 0
            ? getDefaultComment(comp.componentCode, weekNum)
            : '';

        row.weeks[weekNum] = {
          week: weekNum,
          shortageQty,
          fgImpactQty,
          commentKey,
          comment
        };

        if (shortageQty > 0) {
          row.hasAnyShortage = true;
          row.totalShortageQty += shortageQty;
          row.totalFGImpactUnits += fgImpactQty;
        }
      });
    });
  });

  const matrixRows = Array.from(matrixMap.values());

  // Filter matrix rows based on search and filters
  const filteredRows = matrixRows.filter((row) => {
    // Only show rows with shortages if checked
    if (onlyShortages && !row.hasAnyShortage) return false;

    // Category filter
    if (selectedCategory !== 'ALL' && row.category !== selectedCategory) return false;

    // Week filter (must have shortage in specific week)
    if (selectedWeekFilter !== 'ALL') {
      const targetWeek = parseInt(selectedWeekFilter) as 1 | 2 | 3 | 4;
      if (row.weeks[targetWeek].shortageQty <= 0) return false;
    }

    // Search term filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchesFG = row.fgCode.toLowerCase().includes(term) || row.fgDescription.toLowerCase().includes(term);
      const matchesComp =
        row.componentCode.toLowerCase().includes(term) || row.componentDescription.toLowerCase().includes(term);
      const matchesCustomer = row.customerName.toLowerCase().includes(term);
      const matchesVendor = row.vendor.toLowerCase().includes(term);

      // Check comments across all 4 weeks
      const matchesAnyComment = [1, 2, 3, 4].some((wNum) => {
        const key = row.weeks[wNum as 1 | 2 | 3 | 4].commentKey;
        const currentComm = draftComments[key] !== undefined ? draftComments[key] : row.weeks[wNum as 1 | 2 | 3 | 4].comment;
        return currentComm.toLowerCase().includes(term);
      });

      if (!matchesFG && !matchesComp && !matchesCustomer && !matchesVendor && !matchesAnyComment) {
        return false;
      }
    }

    return true;
  });

  // Calculate executive KPI metrics
  const totalRowsWithShortage = filteredRows.filter((r) => r.hasAnyShortage).length;
  const uniqueFGCount = new Set(filteredRows.map((r) => r.fgCode)).size;
  const uniqueCustomerList = Array.from(new Set(filteredRows.map((r) => r.customerName)));
  const totalFGImpactUnitsAll = filteredRows.reduce((sum, r) => sum + r.totalFGImpactUnits, 0);

  // Comment Handlers
  const handleSaveComment = (commentKey: string) => {
    const text = draftComments[commentKey];
    if (text !== undefined) {
      onUpdatePurchaseComment(commentKey, text);
      setSavedKey(commentKey);
      setTimeout(() => setSavedKey(null), 2000);
    }
  };

  const handleCommentChange = (commentKey: string, text: string) => {
    setDraftComments((prev) => ({ ...prev, [commentKey]: text }));
  };

  const applyPreset = (commentKey: string, presetText: string) => {
    setDraftComments((prev) => ({ ...prev, [commentKey]: presetText }));
    onUpdatePurchaseComment(commentKey, presetText);
    setSavedKey(commentKey);
    setTimeout(() => setSavedKey(null), 2000);
  };

  // Inline Customer Save
  const saveCustomerName = (fgCode: string) => {
    if (onUpdateDemandCustomer && tempCustomerName.trim() !== '') {
      onUpdateDemandCustomer(fgCode, tempCustomerName.trim());
    }
    setEditingCustomerFgCode(null);
  };

  // Export 4-Week Matrix CSV
  const exportToCSV = () => {
    const headers = [
      'Customer Name',
      'FG Code',
      'FG Description',
      'Mini Factory',
      'Line',
      'Component Code',
      'Component Description',
      'Category',
      'Vendor / Supplier',
      'W1 Shortage Qty',
      'W1 Purchase Action',
      'W2 Shortage Qty',
      'W2 Purchase Action',
      'W3 Shortage Qty',
      'W3 Purchase Action',
      'W4 Shortage Qty',
      'W4 Purchase Action'
    ];

    const csvData = filteredRows.map((r) => {
      const getComm = (wNum: 1 | 2 | 3 | 4) => {
        const key = r.weeks[wNum].commentKey;
        return draftComments[key] !== undefined ? draftComments[key] : r.weeks[wNum].comment;
      };

      return [
        `"${r.customerName.replace(/"/g, '""')}"`,
        `"${r.fgCode}"`,
        `"${r.fgDescription.replace(/"/g, '""')}"`,
        `"${r.miniFactory || ''}"`,
        `"${r.line || ''}"`,
        `"${r.componentCode}"`,
        `"${r.componentDescription.replace(/"/g, '""')}"`,
        r.category,
        `"${r.vendor.replace(/"/g, '""')}"`,
        r.weeks[1].shortageQty,
        `"${getComm(1).replace(/"/g, '""')}"`,
        r.weeks[2].shortageQty,
        `"${getComm(2).replace(/"/g, '""')}"`,
        r.weeks[3].shortageQty,
        `"${getComm(3).replace(/"/g, '""')}"`,
        r.weeks[4].shortageQty,
        `"${getComm(4).replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvData.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Executive_4Week_Shortage_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Executive Dark Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-300">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Management Shortage & Purchase Action Plan Report
              </h2>
              <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>4-Week Consolidated Tabular Matrix</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium max-w-3xl">
              All 4 planning weeks displayed side-by-side with live component shortage quantities, FG capacity impact, and Purchase Action Plan comments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Matrix CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Executive View</span>
            </button>
          </div>
        </div>

        {/* High-Level Executive Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Constrained Material Pairs</span>
            </div>
            <div className="text-2xl font-black text-red-400 mt-1">{totalRowsWithShortage}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">FG x Component shortage lines</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Affected FGs</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{uniqueFGCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Finished Goods with shortages</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Key Accounts Impacted</span>
            </div>
            <div className="text-2xl font-black text-purple-300 mt-1">{uniqueCustomerList.length}</div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {uniqueCustomerList.length > 0 ? uniqueCustomerList.join(', ') : 'None'}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Total FG Units Constrained</span>
            </div>
            <div className="text-2xl font-black text-blue-300 mt-1">
              {totalFGImpactUnitsAll.toLocaleString()} <span className="text-xs font-normal text-slate-400">PC</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cumulated 4-week production gap</div>
          </div>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Customer, FG Code, Component, Vendor or Purchase comment..."
              className="w-full pl-9 pr-8 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
            {/* Show only shortages toggle */}
            <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={onlyShortages}
                onChange={(e) => setOnlyShortages(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Only Shortages</span>
            </label>

            {/* Filter Week */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-700 shrink-0">Filter Week:</span>
              <select
                value={selectedWeekFilter}
                onChange={(e) => setSelectedWeekFilter(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All 4 Weeks</option>
                <option value="1">Shortage in W1</option>
                <option value="2">Shortage in W2</option>
                <option value="3">Shortage in W3</option>
                <option value="4">Shortage in W4</option>
              </select>
            </div>

            {/* Material Category */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="font-bold text-slate-700 shrink-0">Type:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All RM & PM</option>
                <option value="RM">Raw Materials (RM)</option>
                <option value="PM">Packaging Materials (PM)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Week Side-by-Side Tabular Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Executive Shortages & Purchase Comments (W1 – W4 Side-by-Side)
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-2 py-0.5 rounded-full">
              {filteredRows.length} Matrix Items
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Scroll horizontally to view full 4-week timeline & update Purchase comments.
          </span>
        </div>

        {filteredRows.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No Material Shortages Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All raw and packaging material requirements across Week 1 to Week 4 are fully covered for the selected filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1400px]">
              <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase text-[11px] tracking-wide border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-4 w-[160px] sticky left-0 bg-slate-100 z-10 border-r border-slate-200 shadow-xs">
                    Customer Account
                  </th>
                  <th className="p-3 w-[180px]">Finished Good (FG)</th>
                  <th className="p-3 w-[180px]">Shortage RM/PM Component</th>
                  <th className="p-3 min-w-[280px] bg-blue-50/60 border-l border-blue-200 text-blue-900 text-center">
                    Week 1 (Jul 01 - Jul 07)
                  </th>
                  <th className="p-3 min-w-[280px] bg-indigo-50/60 border-l border-indigo-200 text-indigo-900 text-center">
                    Week 2 (Jul 08 - Jul 14)
                  </th>
                  <th className="p-3 min-w-[280px] bg-purple-50/60 border-l border-purple-200 text-purple-900 text-center">
                    Week 3 (Jul 15 - Jul 21)
                  </th>
                  <th className="p-3 min-w-[280px] bg-slate-100/80 border-l border-slate-300 text-slate-900 text-center">
                    Week 4 (Jul 22 - Jul 31)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredRows.map((row) => (
                  <tr key={row.rowId} className="hover:bg-blue-50/20 transition-colors">
                    {/* Sticky Column: Customer Name */}
                    <td className="p-3 pl-4 align-top sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                      {editingCustomerFgCode === row.fgCode ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempCustomerName}
                            onChange={(e) => setTempCustomerName(e.target.value)}
                            className="px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none bg-white font-bold w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => saveCustomerName(row.fgCode)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer shrink-0"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingCustomerFgCode(row.fgCode);
                            setTempCustomerName(row.customerName);
                          }}
                          className="group cursor-pointer"
                          title="Click to edit Customer Name"
                        >
                          <div className="flex items-center gap-1.5 text-slate-900 font-black text-xs group-hover:text-blue-700">
                            <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="line-clamp-2">{row.customerName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 group-hover:underline flex items-center gap-0.5 mt-0.5">
                            <Edit2 className="w-2.5 h-2.5" /> Edit Customer
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Finished Good (FG) */}
                    <td className="p-3 align-top">
                      <div className="font-mono font-extrabold text-blue-700 text-xs">{row.fgCode}</div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5 line-clamp-2">{row.fgDescription}</div>
                      {(row.miniFactory || row.line) && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {row.miniFactory && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 border border-blue-200 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                              <Factory className="w-2.5 h-2.5 text-blue-600" />
                              <span>{row.miniFactory}</span>
                            </span>
                          )}
                          {row.line && (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 border border-purple-200 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                              <GitFork className="w-2.5 h-2.5 text-purple-600" />
                              <span>{row.line}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Shortage RM / PM Component */}
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                            row.category === 'RM'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-purple-100 text-purple-900 border border-purple-300'
                          }`}
                        >
                          {row.category}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{row.componentCode}</span>
                      </div>
                      <div className="font-medium text-slate-800 text-xs mt-0.5 line-clamp-2">{row.componentDescription}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Vendor: <strong className="text-slate-700">{row.vendor}</strong>
                      </div>
                    </td>

                    {/* Week Columns 1 to 4 */}
                    {([1, 2, 3, 4] as const).map((wNum) => {
                      const weekData = row.weeks[wNum];
                      const { shortageQty, fgImpactQty, commentKey, comment } = weekData;
                      const activeCommentText = draftComments[commentKey] !== undefined ? draftComments[commentKey] : comment;
                      const isSaved = savedKey === commentKey;

                      return (
                        <td key={wNum} className={`p-3 align-top border-l ${wNum === 1 ? 'border-blue-200 bg-blue-50/10' : wNum === 2 ? 'border-indigo-200 bg-indigo-50/10' : wNum === 3 ? 'border-purple-200 bg-purple-50/10' : 'border-slate-200'}`}>
                          {shortageQty > 0 ? (
                            <div className="space-y-2">
                              {/* Shortage Metrics Badge */}
                              <div className="bg-red-50 border border-red-200 p-2 rounded-lg text-left shadow-2xs">
                                <div className="flex items-center justify-between text-red-700 font-black text-xs">
                                  <span>Shortage: -{shortageQty.toLocaleString()} {row.uom}</span>
                                  <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                                    SHORT
                                  </span>
                                </div>
                                <div className="text-[10px] font-bold text-amber-800 mt-0.5 flex items-center justify-between">
                                  <span>FG Capacity Impact:</span>
                                  <span className="font-black text-red-700">-{fgImpactQty.toLocaleString()} Units</span>
                                </div>
                              </div>

                              {/* Purchase Action Plan Textarea */}
                              <div className="space-y-1">
                                <div className="relative">
                                  <textarea
                                    value={activeCommentText}
                                    onChange={(e) => handleCommentChange(commentKey, e.target.value)}
                                    placeholder={`Purchase action for W${wNum}...`}
                                    rows={2}
                                    className="w-full text-[11px] p-2 border border-slate-300 focus:border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white font-medium resize-y focus:outline-none shadow-2xs"
                                  />
                                  {isSaved && (
                                    <div className="absolute right-1 bottom-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-2xs">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      <span>Saved</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-1">
                                  {/* Quick Preset Buttons */}
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <button
                                      onClick={() => applyPreset(commentKey, 'Dispatch in transit; ETA 48h.')}
                                      className="px-1 py-0.2 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded text-[9px] font-semibold border border-slate-200 cursor-pointer"
                                      title="Set Transit Preset"
                                    >
                                      🚚 Transit
                                    </button>
                                    <button
                                      onClick={() => applyPreset(commentKey, 'Spot order placed.')}
                                      className="px-1 py-0.2 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded text-[9px] font-semibold border border-slate-200 cursor-pointer"
                                      title="Set Spot Order Preset"
                                    >
                                      ⚡ Spot Order
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleSaveComment(commentKey)}
                                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer shrink-0"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg text-center space-y-1">
                              <span className="text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Covered</span>
                              </span>
                              <p className="text-[10px] text-emerald-800 font-medium">0 Shortage</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
