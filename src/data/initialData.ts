import { BOMItem, InventoryItem, DemandItem, DeliveryScheduleItem, ProductionLogItem, SAPInwardItem, RMReservationItem } from '../types';

export const INITIAL_BOM: BOMItem[] = [
  // FG-1001: Mango Juice 500ml PET -> MF1 / Line 1A
  {
    id: 'bom-1',
    fgCode: 'FG-1001',
    fgDescription: 'Mango Juice 500ml PET Bottle',
    componentCode: 'RM-501',
    componentDescription: 'Puree Concentrate - Alphonso Mango',
    qty: 0.12,
    uom: 'KG',
    category: 'RM',
    miniFactory: 'MF1',
    line: 'Line 1A'
  },
  {
    id: 'bom-2',
    fgCode: 'FG-1001',
    fgDescription: 'Mango Juice 500ml PET Bottle',
    componentCode: 'RM-502',
    componentDescription: 'Refined Sugar Syrup 65 Brix',
    qty: 0.08,
    uom: 'KG',
    category: 'RM',
    miniFactory: 'MF1',
    line: 'Line 1A'
  },
  {
    id: 'bom-3',
    fgCode: 'FG-1001',
    fgDescription: 'Mango Juice 500ml PET Bottle',
    componentCode: 'PM-801',
    componentDescription: 'PET Preform 500ml Amber',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF1',
    line: 'Line 1A'
  },
  {
    id: 'bom-4',
    fgCode: 'FG-1001',
    fgDescription: 'Mango Juice 500ml PET Bottle',
    componentCode: 'PM-802',
    componentDescription: '28mm Screw Cap Yellow',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF1',
    line: 'Line 1A'
  },
  {
    id: 'bom-5',
    fgCode: 'FG-1001',
    fgDescription: 'Mango Juice 500ml PET Bottle',
    componentCode: 'PM-803',
    componentDescription: 'Mango 500ml Shrink Label',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF1',
    line: 'Line 1A'
  },
  {
    id: 'bom-6',
    fgCode: 'FG-1001',
    fgDescription: 'Mango Juice 500ml PET Bottle',
    componentCode: 'PM-804',
    componentDescription: 'Corrugated Outer Box (24 Bottles)',
    qty: 0.0417, // 1/24 box per bottle
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF1',
    line: 'Line 1A'
  },

  // FG-1002: Orange Nectar 1L Tetra Pak -> MF2 / Line 2A
  {
    id: 'bom-7',
    fgCode: 'FG-1002',
    fgDescription: 'Orange Nectar 1L Tetra Pak',
    componentCode: 'RM-503',
    componentDescription: 'Orange Juice Concentrate 65 Brix',
    qty: 0.25,
    uom: 'KG',
    category: 'RM',
    miniFactory: 'MF2',
    line: 'Line 2A'
  },
  {
    id: 'bom-8',
    fgCode: 'FG-1002',
    fgDescription: 'Orange Nectar 1L Tetra Pak',
    componentCode: 'RM-502',
    componentDescription: 'Refined Sugar Syrup 65 Brix',
    qty: 0.05,
    uom: 'KG',
    category: 'RM',
    miniFactory: 'MF2',
    line: 'Line 2A'
  },
  {
    id: 'bom-9',
    fgCode: 'FG-1002',
    fgDescription: 'Orange Nectar 1L Tetra Pak',
    componentCode: 'PM-805',
    componentDescription: 'Tetra Slim 1000ml Roll Film',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF2',
    line: 'Line 2A'
  },
  {
    id: 'bom-10',
    fgCode: 'FG-1002',
    fgDescription: 'Orange Nectar 1L Tetra Pak',
    componentCode: 'PM-806',
    componentDescription: 'HeliCap 23 White Closure',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF2',
    line: 'Line 2A'
  },
  {
    id: 'bom-11',
    fgCode: 'FG-1002',
    fgDescription: 'Orange Nectar 1L Tetra Pak',
    componentCode: 'PM-807',
    componentDescription: 'Master Shipping Tray 12x1L',
    qty: 0.0833, // 1/12 tray
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF2',
    line: 'Line 2A'
  },

  // FG-1003: Guava Nectar 250ml Pack -> MF3 / Line 3A
  {
    id: 'bom-12',
    fgCode: 'FG-1003',
    fgDescription: 'Guava Nectar 250ml Slim Pack',
    componentCode: 'RM-504',
    componentDescription: 'Pink Guava Pulp 14 Brix',
    qty: 0.09,
    uom: 'KG',
    category: 'RM',
    miniFactory: 'MF3',
    line: 'Line 3A'
  },
  {
    id: 'bom-13',
    fgCode: 'FG-1003',
    fgDescription: 'Guava Nectar 250ml Slim Pack',
    componentCode: 'RM-502',
    componentDescription: 'Refined Sugar Syrup 65 Brix',
    qty: 0.04,
    uom: 'KG',
    category: 'RM',
    miniFactory: 'MF3',
    line: 'Line 3A'
  },
  {
    id: 'bom-14',
    fgCode: 'FG-1003',
    fgDescription: 'Guava Nectar 250ml Slim Pack',
    componentCode: 'PM-808',
    componentDescription: 'Tetra Brik 250ml Packaging Roll',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF3',
    line: 'Line 3A'
  },
  {
    id: 'bom-15',
    fgCode: 'FG-1003',
    fgDescription: 'Guava Nectar 250ml Slim Pack',
    componentCode: 'PM-809',
    componentDescription: 'U-Straw Paper Wrapper',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'MF3',
    line: 'Line 3A'
  },

  // FG-1004: Machined Aluminum Valve Body -> Machining / CNC Line 1
  {
    id: 'bom-16',
    fgCode: 'FG-1004',
    fgDescription: 'Machined Aluminum Valve Body 50mm',
    componentCode: 'RM-505',
    componentDescription: 'Raw Aluminum Alloy Bar 6061 T6',
    qty: 0.85,
    uom: 'KG',
    category: 'RM',
    miniFactory: 'Machining',
    line: 'CNC Line 1'
  },
  {
    id: 'bom-17',
    fgCode: 'FG-1004',
    fgDescription: 'Machined Aluminum Valve Body 50mm',
    componentCode: 'PM-810',
    componentDescription: 'Precision Wooden Crate (100 Pcs)',
    qty: 0.01,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Machining',
    line: 'CNC Line 1'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Raw Materials
  {
    id: 'inv-1',
    materialNumber: 'RM-501',
    materialDescription: 'Puree Concentrate - Alphonso Mango',
    plant: 'P101',
    sloc: 'SL01-Raw',
    bun: 'KG',
    unrestricted: 1800,
    inQualityInsp: 400,
    restrictedUse: 0,
    blocked: 50,
    safetyStock: 2000, // Below safety threshold (1800 < 2000)
    lastUpdated: '2026-07-20'
  },
  {
    id: 'inv-2',
    materialNumber: 'RM-502',
    materialDescription: 'Refined Sugar Syrup 65 Brix',
    plant: 'P101',
    sloc: 'SL01-Raw',
    bun: 'KG',
    unrestricted: 3500,
    inQualityInsp: 500,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 2500, // Healthy
    lastUpdated: '2026-07-22'
  },
  {
    id: 'inv-3',
    materialNumber: 'RM-503',
    materialDescription: 'Orange Juice Concentrate 65 Brix',
    plant: 'P101',
    sloc: 'SL01-Raw',
    bun: 'KG',
    unrestricted: 1200,
    inQualityInsp: 300,
    restrictedUse: 0,
    blocked: 100,
    safetyStock: 1500, // Below safety threshold (1200 < 1500)
    lastUpdated: '2026-07-18'
  },
  {
    id: 'inv-4',
    materialNumber: 'RM-504',
    materialDescription: 'Pink Guava Pulp 14 Brix',
    plant: 'P101',
    sloc: 'SL01-Raw',
    bun: 'KG',
    unrestricted: 800,
    inQualityInsp: 200,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1000, // Below safety threshold (800 < 1000)
    lastUpdated: '2026-07-21'
  },
  {
    id: 'inv-14',
    materialNumber: 'RM-505',
    materialDescription: 'Raw Aluminum Alloy Bar 6061 T6',
    plant: 'P101',
    sloc: 'SL01-Raw',
    bun: 'KG',
    unrestricted: 12000,
    inQualityInsp: 1000,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 8000, // Healthy
    lastUpdated: '2026-07-25'
  },

  // Packaging Materials
  {
    id: 'inv-5',
    materialNumber: 'PM-801',
    materialDescription: 'PET Preform 500ml Amber',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 15000,
    inQualityInsp: 5000,
    restrictedUse: 0,
    blocked: 200,
    safetyStock: 12000, // Healthy
    lastUpdated: '2026-07-24'
  },
  {
    id: 'inv-6',
    materialNumber: 'PM-802',
    materialDescription: '28mm Screw Cap Yellow',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 28000,
    inQualityInsp: 2000,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 20000, // Healthy
    lastUpdated: '2026-07-23'
  },
  {
    id: 'inv-7',
    materialNumber: 'PM-803',
    materialDescription: 'Mango 500ml Shrink Label',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 12000, // Below safety threshold (12000 < 18000)
    inQualityInsp: 0,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 18000,
    lastUpdated: '2026-07-19'
  },
  {
    id: 'inv-8',
    materialNumber: 'PM-804',
    materialDescription: 'Corrugated Outer Box (24 Bottles)',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 1400,
    inQualityInsp: 100,
    restrictedUse: 0,
    blocked: 10,
    safetyStock: 1200, // Healthy
    lastUpdated: '2026-07-22'
  },
  {
    id: 'inv-9',
    materialNumber: 'PM-805',
    materialDescription: 'Tetra Slim 1000ml Roll Film',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 8500, // Below safety threshold (8500 < 10000)
    inQualityInsp: 1000,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 10000,
    lastUpdated: '2026-07-20'
  },
  {
    id: 'inv-10',
    materialNumber: 'PM-806',
    materialDescription: 'HeliCap 23 White Closure',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 18000,
    inQualityInsp: 0,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 15000, // Healthy
    lastUpdated: '2026-07-24'
  },
  {
    id: 'inv-11',
    materialNumber: 'PM-807',
    materialDescription: 'Master Shipping Tray 12x1L',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 1500,
    inQualityInsp: 0,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1200, // Healthy
    lastUpdated: '2026-07-22'
  },
  {
    id: 'inv-12',
    materialNumber: 'PM-808',
    materialDescription: 'Tetra Brik 250ml Packaging Roll',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 20000,
    inQualityInsp: 2000,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 16000, // Healthy
    lastUpdated: '2026-07-21'
  },
  {
    id: 'inv-13',
    materialNumber: 'PM-809',
    materialDescription: 'U-Straw Paper Wrapper',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 22000,
    inQualityInsp: 0,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 18000, // Healthy
    lastUpdated: '2026-07-21'
  },
  {
    id: 'inv-15',
    materialNumber: 'PM-810',
    materialDescription: 'Precision Wooden Crate (100 Pcs)',
    plant: 'P101',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 180,
    inQualityInsp: 20,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 250, // Below safety threshold (180 < 250)
    lastUpdated: '2026-07-25'
  }
];

export const INITIAL_DEMAND: DemandItem[] = [
  {
    id: 'dem-1',
    fgCode: 'FG-1001',
    fgDescription: 'Mango Juice 500ml PET Bottle',
    customerName: 'PepsiCo Beverages India',
    monthlyDemand: 24000,
    uom: 'PC',
    week1Demand: 6000,
    week2Demand: 6000,
    week3Demand: 6000,
    week4Demand: 6000,
    miniFactory: 'MF1',
    line: 'Line 1A'
  },
  {
    id: 'dem-2',
    fgCode: 'FG-1002',
    fgDescription: 'Orange Nectar 1L Tetra Pak',
    customerName: 'Nestlé South Asia',
    monthlyDemand: 16000,
    uom: 'PC',
    week1Demand: 4000,
    week2Demand: 4000,
    week3Demand: 4000,
    week4Demand: 4000,
    miniFactory: 'MF2',
    line: 'Line 2A'
  },
  {
    id: 'dem-3',
    fgCode: 'FG-1003',
    fgDescription: 'Guava Nectar 250ml Slim Pack',
    customerName: 'Dabur Foods Ltd',
    monthlyDemand: 20000,
    uom: 'PC',
    week1Demand: 5000,
    week2Demand: 5000,
    week3Demand: 5000,
    week4Demand: 5000,
    miniFactory: 'MF3',
    line: 'Line 3A'
  },
  {
    id: 'dem-4',
    fgCode: 'FG-1004',
    fgDescription: 'Machined Aluminum Valve Body 50mm',
    customerName: 'Bosch Rexroth Hydraulics',
    monthlyDemand: 12000,
    uom: 'PC',
    week1Demand: 3000,
    week2Demand: 3000,
    week3Demand: 3000,
    week4Demand: 3000,
    miniFactory: 'Machining',
    line: 'CNC Line 1'
  }
];

export const INITIAL_DELIVERY_SCHEDULE: DeliveryScheduleItem[] = [
  {
    id: 'del-1',
    materialCode: 'PM-803',
    description: 'Mango 500ml Shrink Label',
    qty: 15000,
    unit: 'PC',
    vendor: 'Avery Label Corp Ltd',
    etd: '2026-07-05',
    eta: '2026-07-10',
    week: 2,
    delivered: 'N', // In transit for Week 2
    poNumber: 'PO-90021',
    lastReason: 'Initial committed dispatch schedule from vendor',
    lastModified: '2026-07-01 10:15:00',
    changedBy: 'Buyer_Rajesh',
    revisionCount: 1,
    auditLogs: [
      {
        id: 'log-1',
        scheduleId: 'del-1',
        poNumber: 'PO-90021',
        materialCode: 'PM-803',
        materialDescription: 'Mango 500ml Shrink Label',
        timestamp: '2026-07-01 10:15:00',
        changedBy: 'Buyer_Rajesh',
        changeField: 'Initial Creation',
        oldValue: '-',
        newValue: '15,000 PC (W2)',
        reason: 'Initial committed dispatch schedule from vendor'
      }
    ]
  },
  {
    id: 'del-2',
    materialCode: 'PM-803',
    description: 'Mango 500ml Shrink Label',
    qty: 10000,
    unit: 'PC',
    vendor: 'Avery Label Corp Ltd',
    etd: '2026-07-01',
    eta: '2026-07-03',
    week: 1,
    delivered: 'Y', // Already delivered
    poNumber: 'PO-90010',
    lastReason: 'Arrived at central dock and GR posted in SAP',
    lastModified: '2026-07-03 14:20:00',
    changedBy: 'Dock_Supervisor',
    revisionCount: 1,
    auditLogs: [
      {
        id: 'log-2',
        scheduleId: 'del-2',
        poNumber: 'PO-90010',
        materialCode: 'PM-803',
        materialDescription: 'Mango 500ml Shrink Label',
        timestamp: '2026-07-03 14:20:00',
        changedBy: 'Dock_Supervisor',
        changeField: 'Status -> Delivered',
        oldValue: 'In-Transit (N)',
        newValue: 'Delivered (Y)',
        reason: 'Arrived at central dock and GR posted in SAP'
      }
    ]
  },
  {
    id: 'del-3',
    materialCode: 'RM-501',
    description: 'Puree Concentrate - Alphonso Mango',
    qty: 1500,
    unit: 'KG',
    vendor: 'SunRipe Fruits Exim',
    etd: '2026-07-12',
    eta: '2026-07-18',
    week: 3,
    delivered: 'N',
    poNumber: 'PO-90035',
    lastReason: 'Supplier cold-chain refrigerated truck booking confirmed',
    lastModified: '2026-07-02 09:30:00',
    changedBy: 'Buyer_Rajesh',
    revisionCount: 0,
    auditLogs: []
  },
  {
    id: 'del-4',
    materialCode: 'PM-805',
    description: 'Tetra Slim 1000ml Roll Film',
    qty: 6000,
    unit: 'PC',
    vendor: 'Tetra Packaging Global',
    etd: '2026-07-15',
    eta: '2026-07-22',
    week: 3,
    delivered: 'N',
    poNumber: 'PO-90044',
    lastReason: 'Production run scheduled at supplier mill',
    lastModified: '2026-07-04 11:00:00',
    changedBy: 'Buyer_Priya',
    revisionCount: 0,
    auditLogs: []
  },
  {
    id: 'del-5',
    materialCode: 'RM-503',
    description: 'Orange Juice Concentrate 65 Brix',
    qty: 2000,
    unit: 'KG',
    vendor: 'Citrus Gold Suppliers',
    etd: '2026-07-08',
    eta: '2026-07-14',
    week: 2,
    delivered: 'N',
    poNumber: 'PO-90038',
    lastReason: 'Dispatched from Nagpur processing plant',
    lastModified: '2026-07-05 16:45:00',
    changedBy: 'Buyer_Rajesh',
    revisionCount: 0,
    auditLogs: []
  },
  {
    id: 'del-6',
    materialCode: 'PM-801',
    description: 'PET Preform 500ml Amber',
    qty: 10000,
    unit: 'PC',
    vendor: 'PolyPlast Packaging',
    etd: '2026-07-02',
    eta: '2026-07-04',
    week: 1,
    delivered: 'Y', // Delivered
    poNumber: 'PO-90015',
    lastReason: 'Received in full on schedule',
    lastModified: '2026-07-04 17:00:00',
    changedBy: 'Buyer_Rajesh',
    revisionCount: 0,
    auditLogs: []
  },
  {
    id: 'del-7',
    materialCode: 'RM-502',
    description: 'Refined Sugar Syrup 65 Brix',
    qty: 1500,
    unit: 'KG',
    vendor: 'Triveni Sugar Refineries',
    etd: '2026-07-10',
    eta: '2026-07-13',
    week: 2,
    delivered: 'N',
    poNumber: 'PO-90050',
    lastReason: 'Road tanker transit booked',
    lastModified: '2026-07-05 14:00:00',
    changedBy: 'Buyer_Priya',
    revisionCount: 0,
    auditLogs: []
  },
  {
    id: 'del-8',
    materialCode: 'RM-505',
    description: 'Aluminum Alloy Bar 6061-T6 (Dia 60mm)',
    qty: 12000,
    unit: 'KG',
    vendor: 'Hindalco Extrusions Ltd',
    etd: '2026-07-16',
    eta: '2026-07-21',
    week: 3,
    delivered: 'N',
    poNumber: 'PO-90062',
    lastReason: 'Supplier metallurgical batch clearance',
    lastModified: '2026-07-06 09:15:00',
    changedBy: 'Buyer_Rajesh',
    revisionCount: 0,
    auditLogs: []
  }
];

export const INITIAL_SAP_INWARDS: SAPInwardItem[] = [
  {
    id: 'sap-1',
    matDoc: '50002101',
    postingDate: '2026-07-03',
    week: 1,
    materialCode: 'RM-501',
    materialDescription: 'Puree Concentrate - Alphonso Mango',
    qty: 600,
    uom: 'KG',
    sloc: 'SL01-Raw',
    vendor: 'SunRipe Fruits Exim',
    poNumber: 'PO-90001',
    headerText: 'SAP Inward GR W1'
  },
  {
    id: 'sap-2',
    matDoc: '50002102',
    postingDate: '2026-07-04',
    week: 1,
    materialCode: 'RM-502',
    materialDescription: 'Refined Sugar Syrup 65 Brix',
    qty: 500,
    uom: 'KG',
    sloc: 'SL01-Raw',
    vendor: 'Triveni Sugar Refineries',
    poNumber: 'PO-90002',
    headerText: 'SAP Tanker Inward'
  },
  {
    id: 'sap-3',
    matDoc: '50002103',
    postingDate: '2026-07-04',
    week: 1,
    materialCode: 'PM-801',
    materialDescription: 'PET Preform 500ml Amber',
    qty: 6000,
    uom: 'PC',
    sloc: 'SL02-Pack',
    vendor: 'PolyPlast Packaging',
    poNumber: 'PO-90015',
    headerText: 'SAP GR Preforms'
  },
  {
    id: 'sap-4',
    matDoc: '50002104',
    postingDate: '2026-07-05',
    week: 1,
    materialCode: 'PM-802',
    materialDescription: '28mm Screw Cap Yellow',
    qty: 6000,
    uom: 'PC',
    sloc: 'SL02-Pack',
    vendor: 'Crown Closures International',
    poNumber: 'PO-90004',
    headerText: 'SAP GR Caps'
  },
  {
    id: 'sap-5',
    matDoc: '50002105',
    postingDate: '2026-07-03',
    week: 1,
    materialCode: 'PM-803',
    materialDescription: 'Mango 500ml Shrink Label',
    qty: 5000,
    uom: 'PC',
    sloc: 'SL02-Pack',
    vendor: 'Avery Label Corp Ltd',
    poNumber: 'PO-90010',
    headerText: 'SAP GR Labels W1'
  },
  {
    id: 'sap-6',
    matDoc: '50002106',
    postingDate: '2026-07-05',
    week: 1,
    materialCode: 'RM-503',
    materialDescription: 'Orange Juice Concentrate 65 Brix',
    qty: 800,
    uom: 'KG',
    sloc: 'SL01-Raw',
    vendor: 'Citrus Gold Suppliers',
    poNumber: 'PO-90006',
    headerText: 'SAP Orange Pulp GR'
  },
  {
    id: 'sap-7',
    matDoc: '50002107',
    postingDate: '2026-07-06',
    week: 1,
    materialCode: 'PM-805',
    materialDescription: 'Tetra Slim 1000ml Roll Film',
    qty: 3500,
    uom: 'PC',
    sloc: 'SL02-Pack',
    vendor: 'Tetra Packaging Global',
    poNumber: 'PO-90007',
    headerText: 'SAP Tetra Film Inward'
  },
  {
    id: 'sap-8',
    matDoc: '50002108',
    postingDate: '2026-07-08',
    week: 1,
    materialCode: 'RM-505',
    materialDescription: 'Aluminum Alloy Bar 6061-T6 (Dia 60mm)',
    qty: 6000,
    uom: 'KG',
    sloc: 'SL01-Raw',
    vendor: 'Hindalco Extrusions Ltd',
    poNumber: 'PO-90008',
    headerText: 'SAP Inward Raw Bars'
  }
];

export const INITIAL_PRODUCTION_LOGS: ProductionLogItem[] = [
  {
    id: 'prod-1',
    description: 'Production Batch 01 - Mango Juice',
    materialCode: 'FG-1001',
    reference: 'PROD-ORD-4001',
    mvt: '101', // Goods Receipt
    supplier: 'Internal Line 1A',
    documentHeaderText: 'GR Production Month Run',
    po: 'PROD-4001',
    plant: 'P101',
    userName: 'SUPERVISOR_JOHN',
    cocd: 'C100',
    item: '001',
    matDoc: '50000912',
    entryDate: '2026-07-08',
    quantity: 4500, // 4500 bottles already produced in Week 1
    eun: 'PC',
    miniFactory: 'MF1',
    line: 'Line 1A'
  },
  {
    id: 'prod-2',
    description: 'Production Batch 01 - Orange Nectar',
    materialCode: 'FG-1002',
    reference: 'PROD-ORD-4002',
    mvt: '101',
    supplier: 'Internal Line 2A',
    documentHeaderText: 'GR Production Week 1',
    po: 'PROD-4002',
    plant: 'P101',
    userName: 'SUPERVISOR_MARY',
    cocd: 'C100',
    item: '001',
    matDoc: '50000918',
    entryDate: '2026-07-09',
    quantity: 3000, // 3000 units already produced in Week 1
    eun: 'PC',
    miniFactory: 'MF2',
    line: 'Line 2A'
  },
  {
    id: 'prod-3',
    description: 'Production Batch 01 - Guava Nectar',
    materialCode: 'FG-1003',
    reference: 'PROD-ORD-4003',
    mvt: '101',
    supplier: 'Internal Line 3A',
    documentHeaderText: 'GR Production Week 1',
    po: 'PROD-4003',
    plant: 'P101',
    userName: 'SUPERVISOR_JOHN',
    cocd: 'C100',
    item: '001',
    matDoc: '50000922',
    entryDate: '2026-07-10',
    quantity: 5000, // 5000 units produced in Week 1
    eun: 'PC',
    miniFactory: 'MF3',
    line: 'Line 3A'
  },
  {
    id: 'prod-4',
    description: 'Production Batch 01 - Valve Body',
    materialCode: 'FG-1004',
    reference: 'PROD-ORD-4004',
    mvt: '101',
    supplier: 'CNC Line 1',
    documentHeaderText: 'GR Production Week 1',
    po: 'PROD-4004',
    plant: 'P101',
    userName: 'SUPERVISOR_ALEX',
    cocd: 'C100',
    item: '001',
    matDoc: '50000930',
    entryDate: '2026-07-11',
    quantity: 2800,
    eun: 'PC',
    miniFactory: 'Machining',
    line: 'CNC Line 1'
  }
];

export const INITIAL_RESERVATIONS: RMReservationItem[] = [
  // Past Week 1 reservation (Mon 03 Aug - Sat 08 Aug) -> Expired/consumed in past week, IGNORED per as-on-date rule
  {
    id: 'res-101',
    componentCode: 'RM-502',
    componentDescription: 'Refined Sugar Syrup 65 Brix',
    reservedForFGCode: 'FG-1002',
    reservedForFGDescription: 'Orange Nectar 1L Tetra Pak',
    customerName: 'Walmart Global',
    reservedQty: 1200,
    uom: 'KG',
    week: 1,
    validFromDate: '2026-08-03',
    validToDate: '2026-08-08',
    reason: 'Week 1 Export Priority Allocation (Past Week - Expired)',
    status: 'EXPIRED',
    createdAt: '2026-08-01 09:00:00'
  },
  // Past Week 2 reservation (Mon 10 Aug - Sat 15 Aug) -> Expired/consumed in past week, IGNORED per as-on-date rule
  {
    id: 'res-102',
    componentCode: 'RM-501',
    componentDescription: 'Puree Concentrate - Alphonso Mango',
    reservedForFGCode: 'FG-1001',
    reservedForFGDescription: 'Mango Juice 500ml PET Bottle',
    customerName: 'Reliance Retail',
    reservedQty: 800,
    uom: 'KG',
    week: 2,
    validFromDate: '2026-08-10',
    validToDate: '2026-08-15',
    reason: 'Week 2 Promotional Batch Run (Past Week - Expired)',
    status: 'EXPIRED',
    createdAt: '2026-08-08 11:30:00'
  },
  // Active Week 3 reservation (Mon 17 Aug - Sat 22 Aug) -> CURRENT ACTIVE (Deducted from available stock!)
  {
    id: 'res-103',
    componentCode: 'RM-502',
    componentDescription: 'Refined Sugar Syrup 65 Brix',
    reservedForFGCode: 'FG-1002',
    reservedForFGDescription: 'Orange Nectar 1L Tetra Pak',
    customerName: 'Reliance Fresh',
    reservedQty: 1800,
    uom: 'KG',
    week: 3,
    validFromDate: '2026-08-17',
    validToDate: '2026-08-22',
    reason: 'Institutional Order Batch #4092 Line 2A',
    status: 'ACTIVE',
    createdAt: '2026-08-17 08:30:00'
  },
  // Active Week 3 reservation for PM-802 (Aseptic Cap) reserved for FG-1003
  {
    id: 'res-104',
    componentCode: 'PM-802',
    componentDescription: '28mm Screw Cap Yellow',
    reservedForFGCode: 'FG-1003',
    reservedForFGDescription: 'Guava Nectar 250ml Slim Pack',
    customerName: 'Amazon Pantry',
    reservedQty: 5000,
    uom: 'PC',
    week: 3,
    validFromDate: '2026-08-17',
    validToDate: '2026-08-22',
    reason: 'Airlift Delivery Fulfillment Allocation Line 3A',
    status: 'ACTIVE',
    createdAt: '2026-08-17 10:15:00'
  },
  // Active Week 4 reservation (Mon 24 Aug - Sat 29 Aug) -> FUTURE ACTIVE (Deducted from available stock!)
  {
    id: 'res-105',
    componentCode: 'RM-501',
    componentDescription: 'Puree Concentrate - Alphonso Mango',
    reservedForFGCode: 'FG-1001',
    reservedForFGDescription: 'Mango Juice 500ml PET Bottle',
    customerName: 'Costco Wholesale',
    reservedQty: 2500,
    uom: 'KG',
    week: 4,
    validFromDate: '2026-08-24',
    validToDate: '2026-08-29',
    reason: 'Export Container Loading Allocation Line 1A',
    status: 'ACTIVE',
    createdAt: '2026-08-18 14:00:00'
  },
  // Active Week 4 reservation for PM-801
  {
    id: 'res-106',
    componentCode: 'PM-801',
    componentDescription: 'PET Preform 500ml Amber',
    reservedForFGCode: 'FG-1001',
    reservedForFGDescription: 'Mango Juice 500ml PET Bottle',
    customerName: 'Target Stores',
    reservedQty: 10000,
    uom: 'PC',
    week: 4,
    validFromDate: '2026-08-24',
    validToDate: '2026-08-29',
    reason: 'High-speed Blowing Schedule Reservation Line 1A',
    status: 'ACTIVE',
    createdAt: '2026-08-18 15:45:00'
  },
  // Active Week 3 reservation for PM-805
  {
    id: 'res-107',
    componentCode: 'PM-805',
    componentDescription: 'Tetra Slim 1000ml Roll Film',
    reservedForFGCode: 'FG-1002',
    reservedForFGDescription: 'Orange Nectar 1L Tetra Pak',
    customerName: 'Metro Cash & Carry',
    reservedQty: 8000,
    uom: 'PC',
    week: 3,
    validFromDate: '2026-08-17',
    validToDate: '2026-08-22',
    reason: 'Aseptic Filling Line 2A Pre-allocation',
    status: 'ACTIVE',
    createdAt: '2026-08-19 09:10:00'
  }
];

