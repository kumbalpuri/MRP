import {
  MonthlyPlanState,
  MonthlyPlanFlag,
  SystemAuditLogItem,
  DailyRollingPlanRow
} from '../types';

export const INITIAL_MONTHLY_PLAN_STATE: MonthlyPlanState = {
  month: '2026-08',
  title: 'August 2026 Automobile Ancillaries S&OP Commitment Plan (VP, Oil Pump, EGR, BPV, ETB)',
  status: 'FLAGS_RAISED',
  releasedAt: '2026-08-01 09:30:00',
  releasedBy: 'Vikram Joshi (Lead Demand Planner)',
  totalMonthlyDemand: 74664,
  totalProducibleDemand: 68500,
  version: 2,
  notes: 'Plan released for Supply Feasibility Validation. Purchase team has raised 3 critical category flags concerning rotor grinding capacity, ETB sensor chip allocation, and EGR stepper motor customs clearance.'
};

export const INITIAL_MONTHLY_FLAGS: MonthlyPlanFlag[] = [
  {
    id: 'FLAG-2026-01',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    componentCode: 'RM-ROTOR-850',
    componentDescription: 'Precision Rotor Assembly 40mm',
    category: 'SUPPLIER_CAPACITY',
    severity: 'CRITICAL',
    raisedByRole: 'supply_planner',
    raisedByName: 'Rajesh Kumar (Sr. Supply Planner)',
    raisedAt: '2026-08-02 11:15:00',
    title: 'Supplier Grinding Capacity Constraint at Precision Dynamics',
    description: 'Precision Dynamics CNC rotor grinding capacity is capped at 8,000 units for August due to spindle maintenance. Total multi-FG demand requires 9,220 units (shortfall of 1,220 units). Recommend adjusting weekly demand schedule or splitting lots with backup grinding vendor.',
    supplierName: 'Precision Dynamics Pune',
    supplierCapacityLimit: 8000,
    currentDemandQty: 9220,
    recommendedDemandCut: 1220,
    status: 'IN_DISCUSSION',
    discussions: [
      {
        id: 'DISC-01-1',
        authorRole: 'supply_planner',
        authorName: 'Rajesh Kumar (Supply Planner)',
        timestamp: '2026-08-02 11:18:22',
        message: 'Precision Dynamics confirmed they cannot exceed 8,000 units in August without adding a 3rd shift on CNC Grinder #4. Panther vacuum pump line will face raw material dry-out in W3 Shift A unless ETA is prioritized.',
        proposedAction: 'Cut Panther VP monthly demand from 9,220 to 8,500 units or approve expedited weekend grinding surcharge.'
      },
      {
        id: 'DISC-01-2',
        authorRole: 'demand_planner',
        authorName: 'Vikram Joshi (Demand Planner)',
        timestamp: '2026-08-02 14:05:10',
        message: 'TATA Motors Powertrain has confirmed firm vehicle assembly schedules for 8,500 units minimum. We can agree to reduce W1-W2 buffer by 720 units, keeping firm dispatch commitment at 8,500 units.',
        proposedAction: 'Reduce demand by 720 units and authorize express afternoon dispatches.'
      },
      {
        id: 'DISC-01-3',
        authorRole: 'management',
        authorName: 'Sunil Mehta (VP Operations)',
        timestamp: '2026-08-02 16:40:00',
        message: 'Approved: 1) Reduce monthly target by 720 units for Panther VP. 2) Purchase team to release PO for 850 pcs ETA 19.08 7:00 PM and 800 pcs ETA 20.08 3:00 PM.',
        proposedAction: 'Execute 720 units demand cut and release expedited delivery schedules.'
      }
    ]
  },
  {
    id: 'FLAG-2026-02',
    fgCode: '7.02256.08.0',
    fgDescription: 'Electric EGR Valve Module Euro-6',
    componentCode: 'RM-MOTOR-DC12',
    componentDescription: 'Brushless DC High-Torque Stepper Motor 12V',
    category: 'PM_LEAD_TIME',
    severity: 'HIGH',
    raisedByRole: 'procurement',
    raisedByName: 'Priya Sharma (Machining & Actuator Procurement)',
    raisedAt: '2026-08-03 10:20:00',
    title: 'Customs Clearance & Lead Time Delay on EGR Stepper Motors',
    description: 'Import consignment of 2,200 stepper motors from Mikuni Japan underwent customs documentation audit at Mumbai Air Cargo. Clearance delayed by 3 working days.',
    supplierName: 'Mikuni India Auto Components',
    supplierCapacityLimit: 5000,
    currentDemandQty: 6300,
    recommendedDemandCut: 800,
    status: 'OPEN',
    discussions: [
      {
        id: 'DISC-02-1',
        authorRole: 'procurement',
        authorName: 'Priya Sharma (Procurement)',
        timestamp: '2026-08-03 10:22:45',
        message: 'Air Cargo CHA is processing expedited green-channel clearance. Usable inventory on hand (950 pcs) covers W1 & W2 partial runs, but W3 Thursday requires receipt of 1,800 pcs.',
        proposedAction: 'Re-sequence assembly line to run BPV valves on Wed/Thu morning while motors are inwarded.'
      },
      {
        id: 'DISC-02-2',
        authorRole: 'supply_planner',
        authorName: 'Amit Verma (Logistics Lead)',
        timestamp: '2026-08-03 12:10:30',
        message: 'Dedicated express van assigned for airport pickup. Once released on 19-Aug afternoon, delivery to SL01 warehouse guaranteed by 20-Aug morning.'
      }
    ]
  },
  {
    id: 'FLAG-2026-03',
    fgCode: '7.03703.49.0',
    fgDescription: 'Electronic Throttle Body 48mm (ETB)',
    componentCode: 'RM-SENSOR-HALL',
    componentDescription: 'Non-Contact Hall Effect Position Sensor TPS',
    category: 'LOGISTICS_CUSTOMS',
    severity: 'CRITICAL',
    raisedByRole: 'supply_planner',
    raisedByName: 'Karan Patil (Electronics Supply)',
    raisedAt: '2026-08-04 09:00:00',
    title: 'Hall Sensor IC Allocation Constraint for 48mm ETB Throttle Body',
    description: 'Global semiconductor lead time spike at Sensata. Allocated lot of 2,000 pcs has ETA 21.08 11:30 AM. Assembly line A-ETB1 must run single shift on Wed/Thu before ramping up on Friday.',
    supplierName: 'Sensata Technologies Pune',
    supplierCapacityLimit: 4000,
    currentDemandQty: 6700,
    recommendedDemandCut: 500,
    status: 'IN_DISCUSSION',
    discussions: [
      {
        id: 'DISC-03-1',
        authorRole: 'supply_planner',
        authorName: 'Karan Patil (Supply Planner)',
        timestamp: '2026-08-04 09:05:00',
        message: 'Stock on hand is 820 pcs. We should run 480 pcs on 19-Aug and 480 pcs on 20-Aug, then take the 2,000 pcs ETA on 21-Aug for full triple shift run.',
        proposedAction: 'Level ETB production schedule to match 21.08 sensor inwarding.'
      }
    ]
  }
];

export const INITIAL_SYSTEM_AUDIT_LOGS: SystemAuditLogItem[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-08-01 09:30:00',
    phase: 'MONTHLY_PHASE',
    eventType: 'PLAN_RELEASED',
    actorRole: 'Demand Planner',
    actorName: 'Vikram Joshi',
    entityKey: 'PLAN-2026-08',
    description: 'August 2026 Automobile Ancillaries S&OP Production Plan released across 13 Finished Goods (VP, Oil Pump, EGR, BPV, ETB).',
    oldValue: 'DRAFT',
    newValue: 'RELEASED_FOR_VALIDATION',
    reason: 'Monthly business commitment release after OEM customer schedule synchronization.'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-08-02 11:15:00',
    phase: 'MONTHLY_PHASE',
    eventType: 'FLAG_RAISED',
    actorRole: 'Supply Planner',
    actorName: 'Rajesh Kumar',
    entityKey: '7.06496.03.0',
    description: 'Raised concern flag: Supplier Grinding Capacity Issue for RM-ROTOR-850 at Precision Dynamics Pune.',
    oldValue: 'NO_FLAG',
    newValue: 'SUPPLIER_CAPACITY (CRITICAL)',
    reason: 'Supplier spindle overhaul limiting monthly production to 8,000 units.'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-08-02 16:45:00',
    phase: 'MONTHLY_PHASE',
    eventType: 'DEMAND_REDUCED',
    actorRole: 'Demand Planner',
    actorName: 'Vikram Joshi',
    entityKey: '7.06496.03.0',
    description: 'Reduced monthly demand for Vacuum Pump Panther by 720 units following joint S&OP consensus.',
    oldValue: '9,220 units (W1:2400, W2:2400, W3:2200, W4:2220)',
    newValue: '8,500 units (W1:2200, W2:2400, W3:2120, W4:1780)',
    reason: 'Supplier capacity constraint resolution agreed with TATA Motors & VP Operations.'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-08-03 10:20:00',
    phase: 'MONTHLY_PHASE',
    eventType: 'FLAG_RAISED',
    actorRole: 'Packaging Procurement',
    actorName: 'Priya Sharma',
    entityKey: '7.02256.08.0',
    description: 'Raised concern flag: Stepper Motor Lead Time & Customs Delay for RM-MOTOR-DC12.',
    oldValue: 'NO_FLAG',
    newValue: 'PM_LEAD_TIME (HIGH)',
    reason: 'Mumbai Air Cargo documentation audit.'
  },
  {
    id: 'AUD-005',
    timestamp: '2026-08-18 10:30:00',
    phase: 'WEEKLY_PHASE',
    eventType: 'RESERVATION_ALLOCATED',
    actorRole: 'Planner',
    actorName: 'Anand R.',
    entityKey: 'RM-ROTOR-850',
    description: 'Reserved 300 units Precision Rotor Assembly exclusively for TATA Panther VP line.',
    oldValue: 'Unallocated',
    newValue: '300 units Locked for 7.06496.03.0 (W3)',
    reason: 'Firm TATA OEM assembly feeding commitment.'
  },
  {
    id: 'AUD-006',
    timestamp: '2026-08-19 08:30:00',
    phase: 'DAILY_PHASE',
    eventType: 'DAILY_PLAN_RELEASED',
    actorRole: 'Demand Planner',
    actorName: 'Vikram Joshi',
    entityKey: 'AUTO-ANCILLARIES-3DAYS',
    description: '3-Day Operational Rolling Plan (19-Aug to 21-Aug) released across Pumps, Valves & ETB lines.',
    oldValue: 'DRAFT',
    newValue: 'RELEASED_OPERATIONAL',
    reason: 'Daily 2:30 PM shop-floor scheduling cut-off.'
  },
  {
    id: 'AUD-007',
    timestamp: '2026-08-19 11:20:00',
    phase: 'DAILY_PHASE',
    eventType: 'CONSTRAINT_OVERRIDDEN',
    actorRole: 'Demand Planner',
    actorName: 'Vikram Joshi',
    entityKey: '7.09629.01.0',
    description: 'Planner authorized plan release for FAM B despite Shift A component shortage.',
    oldValue: 'BLOCKED',
    newValue: 'FORCE_RELEASED',
    reason: 'Shift B (440) & Shift C (330) are covered by afternoon supplier arrival.'
  }
];

/**
 * Phase 3: Daily 3-Day Rolling Plan (Today 19-Aug-26 Wed, Tomorrow 20-Aug-26 Thu, Day After Tomorrow 21-Aug-26 Fri)
 * Covers: Vacuum Pumps, Oil Pumps, EGR Valves, Bye Pass Valves (BPV), Electronic Throttle Bodies (ETB)
 */
export const INITIAL_DAILY_ROLLING_PLAN_ROWS: DailyRollingPlanRow[] = [
  // -------------------------------------------------------------
  // 1. Line A-PMP1: FAM B Tandem Vacuum Pump
  // -------------------------------------------------------------
  {
    id: 'DP-01',
    lineName: 'A-PMP1 (Vacuum Pump)',
    productNumber: '7.09629.01.0',
    productName: 'FAM B Tandem Vacuum Pump',
    uom: 'PC',
    stdRoutingPerHour: 55,
    alternateRoutingPerHour: 28,
    stdPackSize: 200,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 0, status: 'HALTED_SHORTAGE', note: 'Red Halted: Stator housing shortage' },
      shiftB: { plannedQty: 440, status: 'RUNNING', note: 'Running after afternoon 2:00 PM receipt' },
      shiftC: { plannedQty: 330, status: 'RUNNING', note: 'Running regular night run' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 440, status: 'RUNNING' },
      shiftB: { plannedQty: 440, status: 'RUNNING' },
      shiftC: { plannedQty: 220, status: 'RUNNING' }
    },
    materialStatusRemarks: 'Till Material Available. Stator Housing 500 pcs ETA 19.08 - 02:00 PM.',
    total3DayPlannedQty: 1870,
    maxProducibleFromStock: 770,
    maxProducibleWithETA: 1870,
    isFeasibleStockOnly: false,
    isFeasibleWithETA: true,
    criticalBottleneckComponent: 'RM-STATOR-500',
    criticalBottleneckShortageQty: 330,
    stockoutShiftDescription: 'Shortage on 19-Aug Shift A (Red Halted). Covered from Shift B.',
    isReleased: true,
    hasConstraintOverride: true,
    overrideReason: 'Approved by Planner: Shift B & C covered by 2:00 PM ETA arrival.'
  },

  // -------------------------------------------------------------
  // 2. Line A-PMP1: BR10 Step 2 Mechanical Vacuum Pump
  // -------------------------------------------------------------
  {
    id: 'DP-02',
    lineName: 'A-PMP1 (Vacuum Pump)',
    productNumber: '7.08437.01.0',
    productName: 'BR10 Step 2 Mechanical Vacuum Pump',
    uom: 'PC',
    stdRoutingPerHour: 72,
    alternateRoutingPerHour: 36,
    stdPackSize: 48,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 0, status: 'HALTED_SHORTAGE', note: 'Red Halted' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 288, status: 'RUNNING' },
      shiftB: { plannedQty: 288, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Tooling changeover scheduled on Thu. BR10 flange stock sufficient.',
    total3DayPlannedQty: 576,
    maxProducibleFromStock: 600,
    maxProducibleWithETA: 600,
    isFeasibleStockOnly: true,
    isFeasibleWithETA: true,
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 3. Line A-PMP1: Mahindra 3D 15 Vacuum Pump
  // -------------------------------------------------------------
  {
    id: 'DP-03',
    lineName: 'A-PMP1 (Vacuum Pump)',
    productNumber: '7.11861.21.0',
    productName: 'Mahindra 3D 15 Vacuum Pump',
    uom: 'PC',
    stdRoutingPerHour: 66,
    alternateRoutingPerHour: 31,
    stdPackSize: 40,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 0, status: 'HALTED_SHORTAGE', note: 'Red Halted' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 528, status: 'RUNNING' },
      shiftB: { plannedQty: 528, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 264, status: 'RUNNING' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Till Material Available. Mahindra casting stock 1,200 pcs.',
    total3DayPlannedQty: 1320,
    maxProducibleFromStock: 1200,
    maxProducibleWithETA: 1500,
    isFeasibleStockOnly: false,
    isFeasibleWithETA: true,
    criticalBottleneckComponent: 'RM-CASTING-3D',
    criticalBottleneckShortageQty: 120,
    stockoutShiftDescription: 'Shortage on 21-Aug Shift A without incoming ETA.',
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 4. Line A-PMP2: Vacuum Pump Panther
  // -------------------------------------------------------------
  {
    id: 'DP-04',
    lineName: 'A-PMP2 (Panther VP)',
    productNumber: '7.06496.03.0',
    productName: 'Vacuum Pump Panther (A-PMP2)',
    uom: 'PC',
    stdRoutingPerHour: 40,
    alternateRoutingPerHour: 20,
    stdPackSize: 320,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 0, status: 'IE', note: 'IE (Initial Engineering / Tool Setup)' },
      shiftB: { plannedQty: 200, status: 'RUNNING' },
      shiftC: { plannedQty: 240, status: 'RUNNING' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 320, status: 'RUNNING' },
      shiftB: { plannedQty: 320, status: 'RUNNING' },
      shiftC: { plannedQty: 240, status: 'RUNNING' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 320, status: 'RUNNING' },
      shiftB: { plannedQty: 320, status: 'RUNNING' },
      shiftC: { plannedQty: 160, status: 'RUNNING' }
    },
    materialStatusRemarks: 'Rotor_850 pcs_ETA_19.08 - 07:00 PM. Rotor_800 pcs_ETA_20.08 - 03:00 PM.',
    total3DayPlannedQty: 2120,
    maxProducibleFromStock: 440,
    maxProducibleWithETA: 2090,
    isFeasibleStockOnly: false,
    isFeasibleWithETA: true,
    criticalBottleneckComponent: 'RM-ROTOR-850',
    criticalBottleneckShortageQty: 30,
    stockoutShiftDescription: 'Covered by 19.08 7:00 PM ETA (850 pcs) and 20.08 3:00 PM ETA (800 pcs).',
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 5. Line A-OIL1: Mahindra 4D15 Engine Oil Pump
  // -------------------------------------------------------------
  {
    id: 'DP-05',
    lineName: 'A-OIL1 (Engine Oil Pump)',
    productNumber: '7.12148.00.0',
    productName: 'Mahindra 4D15 Engine Oil Pump',
    uom: 'PC',
    stdRoutingPerHour: 48,
    alternateRoutingPerHour: 24,
    stdPackSize: 90,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 384, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 180, status: 'RUNNING' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Till Material Available. Fasteners & Housing stock sufficient.',
    total3DayPlannedQty: 564,
    maxProducibleFromStock: 600,
    maxProducibleWithETA: 600,
    isFeasibleStockOnly: true,
    isFeasibleWithETA: true,
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 6. Line A-OIL1: RNIPL H13 High Pressure Oil Pump
  // -------------------------------------------------------------
  {
    id: 'DP-06',
    lineName: 'A-OIL1 (Engine Oil Pump)',
    productNumber: '7.13554.00.0',
    productName: 'RNIPL H13 High Pressure Oil Pump',
    uom: 'PC',
    stdRoutingPerHour: 48,
    alternateRoutingPerHour: 24,
    stdPackSize: 250,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 384, status: 'RUNNING' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Housing & Seal stock on hand: 500 pcs. Shift A runs smoothly.',
    total3DayPlannedQty: 384,
    maxProducibleFromStock: 500,
    maxProducibleWithETA: 500,
    isFeasibleStockOnly: true,
    isFeasibleWithETA: true,
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 7. Line A-OIL2: TATA 1.5 VOP TGDI Variable Oil Pump
  // -------------------------------------------------------------
  {
    id: 'DP-07',
    lineName: 'A-OIL2 (Variable Oil Pump)',
    productNumber: '7.09763.01.0',
    productName: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    uom: 'PC',
    stdRoutingPerHour: 60,
    alternateRoutingPerHour: 30,
    stdPackSize: 120,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 480, status: 'RUNNING' },
      shiftB: { plannedQty: 480, status: 'RUNNING' },
      shiftC: { plannedQty: 240, status: 'RUNNING' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 480, status: 'RUNNING' },
      shiftB: { plannedQty: 360, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Gerotor & Solenoid kits 2,200 units in SL01. Ready for Thu startup.',
    total3DayPlannedQty: 2040,
    maxProducibleFromStock: 2200,
    maxProducibleWithETA: 2200,
    isFeasibleStockOnly: true,
    isFeasibleWithETA: true,
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 8. Line A-EGR1: Electric EGR Valve Module Euro-6
  // -------------------------------------------------------------
  {
    id: 'DP-08',
    lineName: 'A-EGR1 (EGR Valve)',
    productNumber: '7.02256.08.0',
    productName: 'Electric EGR Valve Module Euro-6',
    uom: 'PC',
    stdRoutingPerHour: 50,
    alternateRoutingPerHour: 25,
    stdPackSize: 80,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 350, status: 'RUNNING' },
      shiftB: { plannedQty: 350, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 350, status: 'RUNNING' },
      shiftB: { plannedQty: 250, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 250, status: 'RUNNING' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Stepper Motor 1,800 pcs ETA 20.08 - 10:00 AM after customs release.',
    total3DayPlannedQty: 1550,
    maxProducibleFromStock: 950,
    maxProducibleWithETA: 2750,
    isFeasibleStockOnly: false,
    isFeasibleWithETA: true,
    criticalBottleneckComponent: 'RM-MOTOR-DC12',
    criticalBottleneckShortageQty: 0,
    stockoutShiftDescription: 'Covered by 20.08 morning airport receipt.',
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 9. Line A-BPV1: Turbocharger Bye Pass Valve (BPV)
  // -------------------------------------------------------------
  {
    id: 'DP-09',
    lineName: 'A-BPV1 (Turbo Bypass Valve)',
    productNumber: '7.01870.06.0',
    productName: 'Turbocharger Bye Pass Valve (BPV)',
    uom: 'PC',
    stdRoutingPerHour: 65,
    alternateRoutingPerHour: 32,
    stdPackSize: 150,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 450, status: 'RUNNING' },
      shiftB: { plannedQty: 450, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 450, status: 'RUNNING' },
      shiftB: { plannedQty: 500, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 0, status: 'IDLE' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Polyamide housing & silicon diaphragm in stock.',
    total3DayPlannedQty: 1850,
    maxProducibleFromStock: 1900,
    maxProducibleWithETA: 1900,
    isFeasibleStockOnly: true,
    isFeasibleWithETA: true,
    isReleased: true,
    hasConstraintOverride: false
  },

  // -------------------------------------------------------------
  // 10. Line A-ETB1: Electronic Throttle Body 48mm (ETB)
  // -------------------------------------------------------------
  {
    id: 'DP-10',
    lineName: 'A-ETB1 (ETB 48mm)',
    productNumber: '7.03703.49.0',
    productName: 'Electronic Throttle Body 48mm (ETB)',
    uom: 'PC',
    stdRoutingPerHour: 55,
    alternateRoutingPerHour: 28,
    stdPackSize: 100,
    day1: {
      date: '19-Aug-26',
      dayName: 'Wed',
      shiftA: { plannedQty: 400, status: 'RUNNING' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day2: {
      date: '20-Aug-26',
      dayName: 'Thu',
      shiftA: { plannedQty: 400, status: 'RUNNING' },
      shiftB: { plannedQty: 0, status: 'IDLE' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    day3: {
      date: '21-Aug-26',
      dayName: 'Fri',
      shiftA: { plannedQty: 440, status: 'RUNNING' },
      shiftB: { plannedQty: 410, status: 'RUNNING' },
      shiftC: { plannedQty: 0, status: 'IDLE' }
    },
    materialStatusRemarks: 'Hall Sensor 2,000 pcs ETA 21.08 - 11:30 AM.',
    total3DayPlannedQty: 1650,
    maxProducibleFromStock: 820,
    maxProducibleWithETA: 2820,
    isFeasibleStockOnly: false,
    isFeasibleWithETA: true,
    criticalBottleneckComponent: 'RM-SENSOR-HALL',
    criticalBottleneckShortageQty: 0,
    stockoutShiftDescription: 'Day 3 Shift B covered by 21.08 11:30 AM ETA arrival.',
    isReleased: true,
    hasConstraintOverride: false
  }
];
