import React, { useState } from 'react';
import Papa from 'papaparse';
import { BOMItem, InventoryItem, DemandItem, DeliveryScheduleItem, ProductionLogItem, SAPInwardItem } from '../../types';
import { FileSpreadsheet, Upload, Download, CheckCircle, X } from 'lucide-react';

interface CSVUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  boms: BOMItem[];
  inventory: InventoryItem[];
  demands: DemandItem[];
  deliverySchedules: DeliveryScheduleItem[];
  productionLogs: ProductionLogItem[];
  sapInwards?: SAPInwardItem[];
  onImportBOM: (items: BOMItem[]) => void;
  onImportInventory: (items: InventoryItem[]) => void;
  onImportDemand: (items: DemandItem[]) => void;
  onImportDelivery: (items: DeliveryScheduleItem[]) => void;
  onImportProduction: (items: ProductionLogItem[]) => void;
  onImportSAPInwards?: (items: SAPInwardItem[]) => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  isOpen,
  onClose,
  boms,
  inventory,
  demands,
  deliverySchedules,
  productionLogs,
  sapInwards = [],
  onImportBOM,
  onImportInventory,
  onImportDemand,
  onImportDelivery,
  onImportProduction,
  onImportSAPInwards
}) => {
  const [activeTab, setActiveTab] = useState<'bom' | 'inventory' | 'demand' | 'delivery' | 'production' | 'sap_inward'>('bom');
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generic CSV Downloader
  const downloadCSV = (filename: string, data: any[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generic CSV Uploader Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data as any[];

          if (fileType === 'bom') {
            const parsed: BOMItem[] = rawData.map((row, idx) => ({
              id: `bom-imp-${idx}`,
              fgCode: row['FG'] || row['fgCode'] || `FG-${idx}`,
              fgDescription: row['FG Description'] || row['fgDescription'] || 'FG Item',
              componentCode: row['Component'] || row['componentCode'] || 'RM-101',
              componentDescription: row['Component Description'] || row['componentDescription'] || 'Component',
              qty: parseFloat(row['Qty'] || row['qty'] || '1'),
              uom: row['UoM'] || row['uom'] || 'PC',
              miniFactory: row['Mini Factory'] || row['miniFactory'] || undefined,
              line: row['Line'] || row['line'] || undefined
            }));
            onImportBOM(parsed);
            setMessage(`Successfully imported ${parsed.length} BOM records!`);
          } else if (fileType === 'inventory') {
            const parsed: InventoryItem[] = rawData.map((row, idx) => ({
              id: `inv-imp-${idx}`,
              materialNumber: row['Material Number'] || row['materialNumber'] || `MAT-${idx}`,
              materialDescription: row['Material Description'] || row['materialDescription'] || 'Material',
              plant: row['Plnt'] || row['plant'] || 'P101',
              sloc: row['SLoc'] || row['sloc'] || 'SL01-Raw',
              bun: row['BUn'] || row['bun'] || 'PC',
              unrestricted: parseFloat(row['Unrestricted'] || row['unrestricted'] || '0'),
              inQualityInsp: parseFloat(row['In Quality Insp.'] || row['inQualityInsp'] || '0'),
              restrictedUse: parseFloat(row['Restricted-Use'] || row['restrictedUse'] || '0'),
              blocked: parseFloat(row['Blocked'] || row['blocked'] || '0'),
              safetyStock: parseFloat(row['Safety Stock'] || row['safetyStock'] || '0')
            }));
            onImportInventory(parsed);
            setMessage(`Successfully imported ${parsed.length} Inventory stock records!`);
          } else if (fileType === 'demand') {
            const parsed: DemandItem[] = rawData.map((row, idx) => {
              const monthly = parseFloat(row['Qty'] || row['monthlyDemand'] || '10000');
              const eq = Math.round(monthly / 4);
              return {
                id: `dem-imp-${idx}`,
                fgCode: row['FG'] || row['fgCode'] || `FG-${idx}`,
                fgDescription: row['FG Description'] || row['fgDescription'] || 'FG Item',
                monthlyDemand: monthly,
                uom: row['UoM'] || row['uom'] || 'PC',
                week1Demand: eq,
                week2Demand: eq,
                week3Demand: eq,
                week4Demand: eq,
                miniFactory: row['Mini Factory'] || row['miniFactory'] || undefined,
                line: row['Line'] || row['line'] || undefined
              };
            });
            onImportDemand(parsed);
            setMessage(`Successfully imported ${parsed.length} Demand records!`);
          } else if (fileType === 'delivery') {
            const parsed: DeliveryScheduleItem[] = rawData.map((row, idx) => ({
              id: `del-imp-${idx}`,
              materialCode: row['Material'] || row['materialCode'] || 'RM-101',
              description: row['Description'] || row['description'] || 'Material',
              qty: parseFloat(row['Qty'] || row['qty'] || '1000'),
              unit: row['Unit'] || row['unit'] || 'PC',
              vendor: row['Vendor'] || row['vendor'] || 'Supplier',
              etd: row['ETD'] || row['etd'] || '2026-07-01',
              eta: row['ETA'] || row['eta'] || '2026-07-05',
              week: (parseInt(row['Week'] || '1') as 1 | 2 | 3 | 4) || 1,
              delivered: (row['Delivered Y/N'] || row['delivered'] || 'N').toUpperCase() === 'Y' ? 'Y' : 'N',
              poNumber: row['PO'] || row['poNumber'] || `PO-${idx}`,
              lastReason: row['Reason'] || row['lastReason'] || 'Imported Schedule'
            }));
            onImportDelivery(parsed);
            setMessage(`Successfully imported ${parsed.length} Delivery schedule records!`);
          } else if (fileType === 'sap_inward' && onImportSAPInwards) {
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
            onImportSAPInwards(parsed);
            setMessage(`Successfully imported ${parsed.length} SAP Inward records!`);
          } else if (fileType === 'production') {
            const parsed: ProductionLogItem[] = rawData.map((row, idx) => ({
              id: `prod-imp-${idx}`,
              description: row['Description'] || row['description'] || 'Batch Run',
              materialCode: row['Material'] || row['materialCode'] || 'FG-1001',
              reference: row['Reference'] || row['reference'] || 'REF-100',
              mvt: row['MvT'] || row['mvt'] || '101',
              supplier: row['Supplier'] || row['supplier'] || 'Line 1',
              documentHeaderText: row['Document Header Text'] || row['documentHeaderText'] || 'GR',
              po: row['PO'] || row['po'] || 'PO-100',
              plant: row['Plnt'] || row['plant'] || 'P101',
              userName: row['User Name'] || row['userName'] || 'ADMIN',
              cocd: row['CoCd'] || row['cocd'] || 'C100',
              item: row['Item'] || row['item'] || '001',
              matDoc: row['Mat. Doc.'] || row['matDoc'] || '5000100',
              entryDate: row['Entry Date'] || row['entryDate'] || '2026-07-10',
              quantity: parseFloat(row['Quantity'] || row['quantity'] || '1000'),
              eun: row['EUn'] || row['eun'] || 'PC'
            }));
            onImportProduction(parsed);
            setMessage(`Successfully imported ${parsed.length} Production log records!`);
          }
        } catch (err) {
          setMessage('Error parsing CSV file. Please check column headers.');
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Import / Export Data CSV Files</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('bom')}
            className={`flex-1 py-2.5 px-3 text-center cursor-pointer transition whitespace-nowrap ${
              activeTab === 'bom' ? 'bg-white border-b-2 border-blue-600 text-blue-700' : 'text-slate-600'
            }`}
          >
            1. BOM
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2.5 px-3 text-center cursor-pointer transition whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-white border-b-2 border-amber-600 text-amber-700' : 'text-slate-600'
            }`}
          >
            2. Inventory
          </button>
          <button
            onClick={() => setActiveTab('demand')}
            className={`flex-1 py-2.5 px-3 text-center cursor-pointer transition whitespace-nowrap ${
              activeTab === 'demand' ? 'bg-white border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-600'
            }`}
          >
            3. Demand
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex-1 py-2.5 px-3 text-center cursor-pointer transition whitespace-nowrap ${
              activeTab === 'delivery' ? 'bg-white border-b-2 border-purple-600 text-purple-700' : 'text-slate-600'
            }`}
          >
            4. Delivery Sched
          </button>
          <button
            onClick={() => setActiveTab('sap_inward')}
            className={`flex-1 py-2.5 px-3 text-center cursor-pointer transition whitespace-nowrap ${
              activeTab === 'sap_inward' ? 'bg-white border-b-2 border-blue-800 text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            5. SAP Inwards
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`flex-1 py-2.5 px-3 text-center cursor-pointer transition whitespace-nowrap ${
              activeTab === 'production' ? 'bg-white border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-600'
            }`}
          >
            6. Production Log
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              {activeTab === 'bom' && 'BOM File CSV Upload'}
              {activeTab === 'inventory' && 'Inventory Stock File CSV Upload'}
              {activeTab === 'demand' && 'Monthly Demand File CSV Upload'}
              {activeTab === 'delivery' && 'RMPM Delivery Schedule CSV Upload'}
              {activeTab === 'sap_inward' && 'SAP ERP Goods Receipts (Inward) CSV Upload'}
              {activeTab === 'production' && 'Production Done So Far CSV Upload'}
            </h4>

            <p className="text-xs text-slate-600">
              Upload a standard CSV file or export the current template for {activeTab}.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <label className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Choose & Upload CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, activeTab)}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  if (activeTab === 'bom') downloadCSV('BOM_Template.csv', boms);
                  else if (activeTab === 'inventory') downloadCSV('Inventory_Template.csv', inventory);
                  else if (activeTab === 'demand') downloadCSV('Demand_Template.csv', demands);
                  else if (activeTab === 'delivery') downloadCSV('DeliverySchedule_Template.csv', deliverySchedules);
                  else if (activeTab === 'sap_inward') downloadCSV('SAP_Inwards_Template.csv', sapInwards);
                  else if (activeTab === 'production') downloadCSV('ProductionLog_Template.csv', productionLogs);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Current CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-900 cursor-pointer"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};

