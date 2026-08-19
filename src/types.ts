/**
 * Core Data Models for Production & MRP Planning Engine
 */

export type UserRole = 'planner' | 'warehouse_manager' | 'production_supervisor' | 'procurement';

// 0. Mini Factory & Production Lines Data Definition
export type MiniFactory = 'MF1' | 'MF2' | 'MF3' | 'Machining';

export const MINI_FACTORIES: MiniFactory[] = ['MF1', 'MF2', 'MF3', 'Machining'];

export const MINI_FACTORY_LINES: Record<MiniFactory, string[]> = {
  MF1: ['Line 1A', 'Line 1B', 'Line 1C'],
  MF2: ['Line 2A', 'Line 2B'],
  MF3: ['Line 3A', 'Line 3B', 'Line 3C'],
  Machining: ['CNC Line 1', 'CNC Line 2', 'Milling Line 1']
};

// 1. BOM (Bill of Materials) - Screenshot 1
export interface BOMItem {
  id: string;
  fgCode: string;
  fgDescription: string;
  componentCode: string;
  componentDescription: string;
  qty: number; // Quantity required per unit of FG
  uom: string; // Unit of Measure (KG, PC, LTR, MTR)
  category?: 'RM' | 'PM'; // Raw Material or Packaging Material
  miniFactory?: MiniFactory;
  line?: string;
}

// 2. Inventory Item - Screenshot 2
export interface InventoryItem {
  id: string;
  materialNumber: string;
  materialDescription: string;
  plant: string;
  sloc: string; // Storage Location e.g., SL01-Raw, SL02-Pack, SL03-FG
  bun: string; // Base Unit
  unrestricted: number; // Usable Stock
  inQualityInsp: number; // Quality Inspection Stock
  restrictedUse: number; // Restricted Stock
  blocked: number; // Blocked Stock
  safetyStock?: number; // Safety Stock Minimum Threshold
  lastUpdated?: string;
}

// 3. Demand Item - Screenshot 3
export interface DemandItem {
  id: string;
  fgCode: string;
  fgDescription: string;
  customerName?: string;
  monthlyDemand: number;
  uom: string;
  week1Demand?: number;
  week2Demand?: number;
  week3Demand?: number;
  week4Demand?: number;
  miniFactory?: MiniFactory;
  line?: string;
}

// 4. RMPM Delivery Schedule (Vendor Dispatches) - Screenshot 4
export interface ScheduleAuditLog {
  id: string;
  scheduleId: string;
  poNumber: string;
  materialCode: string;
  materialDescription?: string;
  timestamp: string; // ISO or formatted timestamp e.g. 2026-07-15 14:30:00
  changedBy: string;
  changeField: string; // e.g. 'ETA Date & Week', 'Quantity', 'Status', 'Vendor'
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface DeliveryScheduleItem {
  id: string;
  materialCode: string;
  description: string;
  qty: number;
  unit: string;
  vendor: string;
  etd: string; // Estimated Time of Departure
  eta: string; // Estimated Time of Arrival (YYYY-MM-DD or Week 1..4)
  week: 1 | 2 | 3 | 4; // Assigned Week based on ETA
  delivered: 'Y' | 'N'; // Delivered Y/N flag
  poNumber?: string;
  lastReason?: string;
  lastModified?: string;
  changedBy?: string;
  revisionCount?: number;
  auditLogs?: ScheduleAuditLog[];
}

// 4.1 SAP Inward / Goods Receipt Record (Actual Receipts)
export interface SAPInwardItem {
  id: string;
  matDoc: string; // SAP Material Document Number e.g., 50001201
  postingDate: string; // YYYY-MM-DD
  week: 1 | 2 | 3 | 4; // Week 1 to 4
  materialCode: string;
  materialDescription: string;
  qty: number;
  uom: string;
  sloc: string; // Storage Location e.g. SL01-Raw
  vendor?: string;
  poNumber?: string;
  headerText?: string;
}

// 4.2 Material Allocation & Reservation for Other Finished Goods (FG)
export interface RMReservationItem {
  id: string;
  componentCode: string;
  componentDescription?: string;
  reservedForFGCode: string; // The specific FG this material is locked/earmarked for
  reservedForFGDescription: string;
  customerName?: string;
  reservedQty: number;
  uom: string;
  week: 1 | 2 | 3 | 4; // Assigned Week (1=W1, 2=W2, 3=W3, 4=W4)
  validFromDate: string; // Monday date (YYYY-MM-DD)
  validToDate: string; // Saturday date (YYYY-MM-DD)
  reason: string; // e.g. "Firm Export Order Customer A", "Dedicated Batch Run Line 1A"
  status: 'ACTIVE' | 'RELEASED' | 'EXPIRED';
  createdAt?: string;
}

// 4.3 Monday-to-Saturday Weekly Calendar Definition
export interface WeekCalendarInfo {
  week: 1 | 2 | 3 | 4;
  label: string;
  startDate: string; // Monday YYYY-MM-DD
  endDate: string; // Saturday YYYY-MM-DD
  status: 'PAST' | 'CURRENT' | 'FUTURE';
}

// 4.4 Consolidated Weekly RM Requirement & Tracking Structure
export interface ConsumingFGDetail {
  fgCode: string;
  fgDescription: string;
  qtyPerFG: number;
  uom: string;
  customerName?: string;
  miniFactory?: MiniFactory;
  line?: string;
  weeklyReq: {
    week: 1 | 2 | 3 | 4;
    fgDemand: number;
    componentReq: number;
  }[];
  totalMonthReq: number;
  // Reservation info specifically for this FG vs Other FGs
  reservedForThisFG: number;
  reservedForOtherFGs: number;
  otherFGReservations: {
    fgCode: string;
    fgDescription: string;
    customerName?: string;
    reservedQty: number;
    week: 1 | 2 | 3 | 4;
    reason: string;
    validDateRange: string;
  }[];
  effectiveAvailableStock: number;
  effectiveNetRequirement: number;
}

export interface RMWeeklyConsolidatedData {
  materialCode: string;
  materialDescription: string;
  category: 'RM' | 'PM';
  uom: string;
  currentWarehouseStock: number;
  inQualityInspStock: number;
  safetyStock: number;
  primaryVendor: string;
  leadTimeDays: number;
  // Reservation Summary
  totalReservedForOtherFGs: number; // Sum of active reservations (as on date onwards)
  effectiveAvailableStock: number; // Warehouse stock minus active reservations for other FGs
  activeReservationsList: RMReservationItem[]; // Details of other FGs locking this material
  usedInFGs: ConsumingFGDetail[];
  totalFGCount: number;
  weeks: {
    week: 1 | 2 | 3 | 4;
    grossDemand: number;
    backlogFromPrevious: number;
    reservedForOtherFGs: number; // Reserved quantity in this week (Mon-Sat)
    totalRequirement: number; // Gross demand + carried backlog
    effectiveRequirement: number; // Net requirement considering active reservations
    actualReceiptSAP: number; // Actual Goods Receipt from SAP Inward file
    backlogCarryToNext: number; // Unmet requirement carried over
    purchaseETASchedule: number; // Planned supplier dispatch for this week
    projectedClosingStock: number; // Projected available stock
    effectiveClosingStock: number; // Effective closing stock after subtracting reservations
    variance: number; // Inward + ETA - Requirement
    status: 'OK' | 'WARNING' | 'SHORTAGE';
  }[];
  totalMonthGrossDemand: number;
  totalMonthRequirement: number;
  totalMonthEffectiveRequirement: number;
  totalMonthActualReceipt: number;
  totalMonthETASchedule: number;
  totalMonthBacklog: number;
  overallStatus: 'OK' | 'WARNING' | 'SHORTAGE';
}

// 5. Production Done So Far - Screenshot 5
export interface ProductionLogItem {
  id: string;
  description: string;
  materialCode: string; // FG Material Number
  reference: string; // Production Order / Batch Ref
  mvt: string; // 101 Goods Receipt, 261 Issue
  supplier: string;
  documentHeaderText: string;
  po: string;
  plant: string;
  userName: string;
  cocd: string;
  item: string;
  matDoc: string; // Material Document Number
  entryDate: string;
  quantity: number;
  eun: string; // Entry Unit
  miniFactory?: MiniFactory;
  line?: string;
}

// Weekly Net Requirement Calculation Result per Component
export interface ComponentWeeklyMRP {
  componentCode: string;
  componentDescription: string;
  uom: string;
  openingUnrestrictedStock: number;
  inQualityInspStock: number;
  blockedStock: number;
  usedInFGs: {
    fgCode: string;
    fgDescription: string;
    qtyPerFG: number;
    miniFactory?: MiniFactory;
    line?: string;
  }[];
  weeks: {
    week: 1 | 2 | 3 | 4;
    openingStock: number;
    grossRequirement: number;
    scheduledInbound: number; // Only for Delivered == 'N'
    totalAvailable: number; // Opening + Scheduled Inbound
    netRequirement: number; // Shortage (if Gross > Available)
    closingStock: number; // Remaining stock at end of week
    status: 'OK' | 'WARNING' | 'CRITICAL';
  }[];
  totalMonthGrossReq: number;
  totalMonthInbound: number;
  totalMonthShortage: number;
  overallStatus: 'OK' | 'WARNING' | 'CRITICAL';
  daysOfSupply: number;
}

// Production Feasibility Check Result
export interface FeasibilityCheckResult {
  fgCode: string;
  fgDescription: string;
  targetQuantity: number;
  isFeasible: boolean;
  maxProducible: number;
  componentCheck: {
    componentCode: string;
    componentDescription: string;
    requiredQty: number;
    availableStock: number;
    shortage: number;
    isSufficient: boolean;
  }[];
}

// FG-Centric Coverage & RM/PM Critical Bottleneck Analysis
export interface FGBottleneckComponent {
  componentCode: string;
  componentDescription: string;
  category: 'RM' | 'PM';
  uom: string;
  qtyPerFG: number;
  totalMonthReq: number;
  openingStock: number; // Raw unrestricted warehouse stock
  reservedForOtherFGs?: number; // Quantity reserved/locked for other FGs as on date
  effectiveAvailableStock?: number; // Opening stock minus reserved for other FGs
  otherFGReservations?: {
    fgCode: string;
    fgDescription: string;
    customerName?: string;
    reservedQty: number;
    week: 1 | 2 | 3 | 4;
    reason: string;
    validDateRange: string;
  }[];
  totalInbound: number;
  shortageWeek: 1 | 2 | 3 | 4 | 'None';
  shortageQty: number;
  effectiveShortageQty?: number; // Shortage after subtracting reservations
  fgShortageImpact: number; // units of FG production lost due to this component
  effectiveFGImpact?: number;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  weeklyMRP?: {
    week: 1 | 2 | 3 | 4;
    openingStock: number;
    grossRequirement: number;
    reservedForOtherFGs?: number;
    scheduledInbound: number;
    closingStock: number;
    netRequirement: number;
  }[];
}

export interface FGWeeklyCoverageDetail {
  week: 1 | 2 | 3 | 4;
  fgTargetDemand: number;
  originalWeeklyDemand?: number;
  carriedOverDemand?: number;
  maxProducibleFG: number;
  isCovered: boolean;
  coveragePercent: number;
  bottlenecks: FGBottleneckComponent[];
}

export interface FGCoverageReportItem {
  fgCode: string;
  fgDescription: string;
  uom: string;
  monthlyDemand: number;
  productionCompleted: number;
  netMonthlyDemand: number;
  overallCoverageStatus: 'COVERED' | 'PARTIALLY_COVERED' | 'CRITICAL';
  producibleFGTotal: number;
  coveragePercent: number;
  weeklyCoverage: FGWeeklyCoverageDetail[];
  criticalRMComponents: FGBottleneckComponent[];
  criticalPMComponents: FGBottleneckComponent[];
  allComponents: FGBottleneckComponent[];
  miniFactory?: MiniFactory;
  line?: string;
}

// 6. Management Shortage & Purchase Action Plan Report Item
export interface ManagementShortageItem {
  id: string; // Key e.g., FG-1001_RM-101_W2
  fgCode: string;
  fgDescription: string;
  customerName: string;
  miniFactory?: MiniFactory;
  line?: string;
  componentCode: string;
  componentDescription: string;
  category: 'RM' | 'PM';
  uom: string;
  week: 1 | 2 | 3 | 4;
  shortageQty: number;
  fgImpactQty: number;
  purchaseComment: string;
  vendor?: string;
  lastUpdated?: string;
}

