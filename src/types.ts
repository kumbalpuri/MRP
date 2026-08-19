/**
 * Core Data Models for Production & MRP Planning Engine
 */

export type UserRole =
  | 'demand_planner'
  | 'supply_planner'
  | 'management'
  | 'planner'
  | 'procurement'
  | 'warehouse_manager'
  | 'production_supervisor';

export type AppPhase = 'monthly' | 'weekly' | 'daily' | 'management';

// 0. Mini Factory & Production Lines Data Definition
export type MiniFactory =
  | 'Pumps_Division'
  | 'Valves_Division'
  | 'Throttle_ETB'
  | 'Machining'
  | 'Pump_Assembly'
  | 'MF1'
  | 'MF2'
  | 'MF3';

export const MINI_FACTORIES: MiniFactory[] = [
  'Pumps_Division',
  'Valves_Division',
  'Throttle_ETB',
  'Machining'
];

export const MINI_FACTORY_LINES: Record<MiniFactory, string[]> = {
  Pumps_Division: [
    'A-PMP1 (Vacuum Pump)',
    'A-PMP2 (Panther VP)',
    'A-OIL1 (Engine Oil Pump)',
    'A-OIL2 (Variable Oil Pump)'
  ],
  Valves_Division: [
    'A-EGR1 (EGR Valve)',
    'A-EGR2 (EGR Cooler Assy)',
    'A-BPV1 (Turbo Bypass Valve)'
  ],
  Throttle_ETB: [
    'A-ETB1 (ETB 48mm)',
    'A-ETB2 (ETB 60mm Drive-by-Wire)'
  ],
  Machining: [
    'CNC Line 1 (Castings)',
    'CNC Line 2 (Rotors/Shafts)',
    'Milling Line 1 (Valve Bodies)'
  ],
  Pump_Assembly: [
    'A-PMP1',
    'A-PMP2',
    'A-PMP3',
    'A-PMP4'
  ],
  MF1: ['Line 1A', 'Line 1B', 'Line 1C'],
  MF2: ['Line 2A', 'Line 2B'],
  MF3: ['Line 3A', 'Line 3B', 'Line 3C']
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

// ==========================================
// PHASE 1: MONTHLY S&OP & FEASIBILITY MODELS
// ==========================================

export type MonthlyPlanStatus =
  | 'DRAFT'
  | 'RELEASED_FOR_VALIDATION'
  | 'FLAGS_RAISED'
  | 'CONSENSUS_REACHED'
  | 'APPROVED_LOCKED';

export interface MonthlyPlanState {
  month: string; // e.g., '2026-07'
  title: string;
  status: MonthlyPlanStatus;
  releasedAt?: string;
  releasedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  totalMonthlyDemand: number;
  totalProducibleDemand: number;
  notes?: string;
  version: number;
}

export type MonthlyPlanFlagCategory =
  | 'SUPPLIER_CAPACITY'
  | 'RM_SHORTAGE'
  | 'PM_LEAD_TIME'
  | 'LOGISTICS_CUSTOMS'
  | 'MOQ_BATCH_SIZE'
  | 'QUALITY_HOLD'
  | 'PRICING_COMMERCIAL'
  | 'OTHER';

export const FLAG_CATEGORY_LABELS: Record<MonthlyPlanFlagCategory, string> = {
  SUPPLIER_CAPACITY: 'Supplier Capacity Issue',
  RM_SHORTAGE: 'Raw Material Shortage',
  PM_LEAD_TIME: 'Packaging Material Lead Time Delay',
  LOGISTICS_CUSTOMS: 'Logistics / Freight / Customs Bottleneck',
  MOQ_BATCH_SIZE: 'MOQ / Minimum Batch Size Constraint',
  QUALITY_HOLD: 'Quality Quarantine / Hold',
  PRICING_COMMERCIAL: 'Commercial / Pricing Hold',
  OTHER: 'Other Operational Concern'
};

export interface FlagDiscussionMessage {
  id: string;
  authorRole: 'demand_planner' | 'supply_planner' | 'procurement' | 'logistics' | 'production_supervisor' | 'management';
  authorName: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  message: string;
  proposedAction?: string;
  badge?: string;
}

export interface MonthlyPlanFlag {
  id: string;
  fgCode: string;
  fgDescription: string;
  componentCode?: string;
  componentDescription?: string;
  category: MonthlyPlanFlagCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  raisedByRole: 'supply_planner' | 'procurement' | 'logistics' | 'production_supervisor';
  raisedByName: string;
  raisedAt: string; // YYYY-MM-DD HH:mm:ss
  title: string;
  description: string;
  supplierName?: string;
  supplierCapacityLimit?: number;
  currentDemandQty: number;
  recommendedDemandCut?: number; // e.g. 500 units or 20%
  status: 'OPEN' | 'IN_DISCUSSION' | 'RESOLVED' | 'WAIVED';
  resolutionAction?: 'DEMAND_REDUCED' | 'SUPPLY_EXPEDITED' | 'REALLOCATED' | 'ACCEPTED_AS_IS';
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  discussions: FlagDiscussionMessage[];
}

// ==========================================
// SYSTEM AUDIT TRAIL / SYSTEM LOGS
// ==========================================

export interface SystemAuditLogItem {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  phase: 'MONTHLY_PHASE' | 'WEEKLY_PHASE' | 'DAILY_PHASE' | 'MANAGEMENT';
  eventType:
    | 'PLAN_RELEASED'
    | 'FLAG_RAISED'
    | 'DISCUSSION_POSTED'
    | 'DEMAND_REDUCED'
    | 'DEMAND_INCREASED'
    | 'WEEKLY_PLAN_ADJUSTED'
    | 'SUPPLY_SCHEDULE_CHANGED'
    | 'PLAN_APPROVED'
    | 'CONSTRAINT_OVERRIDDEN'
    | 'DAILY_PLAN_RELEASED'
    | 'DAILY_PRODUCTION_LOGGED'
    | 'SAP_INWARD_BOOKED'
    | 'SAP_INWARD_RECORDED'
    | 'RESERVATION_ALLOCATED';
  actorRole: string;
  actorName: string;
  entityKey: string; // e.g. "FG-1001" or "RM-101"
  description: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

// ==========================================
// PHASE 3: DAILY 3-DAY OPERATIONAL ROLLING PLAN
// (Today, Tomorrow, Day After Tomorrow)
// Exactly matching user's uploaded image
// ==========================================

export interface DailyShiftSlot {
  plannedQty: number;
  actualQty?: number;
  status: 'RUNNING' | 'HALTED_SHORTAGE' | 'IE' | 'MAINTENANCE' | 'IDLE';
  note?: string;
}

export interface DailyDayPlan {
  date: string; // e.g. '19-Aug-26'
  dayName: string; // e.g. 'Wed', 'Thu', 'Fri'
  shiftA: DailyShiftSlot;
  shiftB: DailyShiftSlot;
  shiftC: DailyShiftSlot;
}

export interface DailyRollingPlanRow {
  id: string;
  lineName: string; // e.g. 'A-PMP1', 'A-PMP2', 'A-PMP3', 'A-PMP4'
  productNumber: string; // e.g. '7.09629.01.0', '7.06496.03.0'
  productName: string; // e.g. 'FAM B', 'Vacuum Pump Panther', 'Mahindra 3D 15'
  uom: string;
  stdRoutingPerHour: number; // e.g. 55, 72, 66, 40, 48
  alternateRoutingPerHour: number; // e.g. 28, 36, 31, 20, 24
  stdPackSize: number; // e.g. 200, 48, 40, 320, 75, 125
  // 3 Rolling Days
  day1: DailyDayPlan; // Today (19-Aug-26 Wed)
  day2: DailyDayPlan; // Tomorrow (20-Aug-26 Thu)
  day3: DailyDayPlan; // Day After Tomorrow (21-Aug-26 Fri)
  materialStatusRemarks: string; // e.g. "Rotor_850 pcs_ETA_19.08 - 07:00 PM. Rotor_800 pcs_ETA_20.08 - 03:00 PM."
  // Feasibility Check
  total3DayPlannedQty: number;
  maxProducibleFromStock: number;
  maxProducibleWithETA: number;
  isFeasibleStockOnly: boolean;
  isFeasibleWithETA: boolean;
  criticalBottleneckComponent?: string;
  criticalBottleneckShortageQty?: number;
  stockoutShiftDescription?: string; // e.g. "Critical: Shaft stockout on Day 1 Shift A"
  isReleased: boolean;
  hasConstraintOverride: boolean;
  overrideReason?: string;
}

// ==========================================
// MANAGEMENT HORIZON (CURRENT & NEXT WEEK)
// ==========================================

export interface StakeholderPerspective {
  status: 'ALIGNED' | 'FLAGGED' | 'CONSTRAINT' | 'ACTION_REQUIRED' | 'APPROVED';
  viewpoint: string;
  keyMetric: string;
  actionItem: string;
}

export interface ManagementHorizonItem {
  id: string;
  fgCode: string;
  fgDescription: string;
  line: string;
  miniFactory: MiniFactory;
  customerName?: string;
  // Current Week (e.g. W3)
  currentWeekNum: 1 | 2 | 3 | 4;
  currentWeekDemand: number;
  currentWeekMaxProducible: number;
  currentWeekGap: number;
  currentWeekCoveragePercent: number;
  // Next Week (e.g. W4)
  nextWeekNum: 1 | 2 | 3 | 4;
  nextWeekDemand: number;
  nextWeekMaxProducible: number;
  nextWeekGap: number;
  nextWeekCoveragePercent: number;
  // Bottleneck details
  criticalComponentCode: string;
  criticalComponentDescription: string;
  category: 'RM' | 'PM';
  uom: string;
  stockOnHand: number;
  inTransitETA: number;
  etaDate: string;
  supplierName: string;
  supplierCapacityStatus: 'NORMAL' | 'AT_LIMIT' | 'CAPACITY_BREACH';
  flagCategory?: MonthlyPlanFlagCategory;
  // Stakeholder viewpoints
  stakeholderPositions: {
    demandPlanner: StakeholderPerspective;
    supplyPlanner: StakeholderPerspective;
    logistics: StakeholderPerspective;
    plantOps: StakeholderPerspective;
    management: StakeholderPerspective;
  };
}


