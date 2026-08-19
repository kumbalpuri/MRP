import {
  BOMItem,
  InventoryItem,
  DemandItem,
  DeliveryScheduleItem,
  SAPInwardItem,
  RMReservationItem,
  RMWeeklyConsolidatedData,
  ConsumingFGDetail
} from '../types';
import {
  getCurrentWeekNumber,
  isReservationActiveAsOnDate,
  DEFAULT_AS_ON_DATE
} from './dateCalendarUtils';

// Approximate vendor profiles for RMs and PMs
const DEFAULT_VENDORS: Record<string, { vendor: string; leadTimeDays: number }> = {
  'RM-501': { vendor: 'SunRipe Fruits Exim', leadTimeDays: 14 },
  'RM-502': { vendor: 'Triveni Sugar Refineries', leadTimeDays: 7 },
  'RM-503': { vendor: 'Citrus Gold Suppliers', leadTimeDays: 10 },
  'RM-504': { vendor: 'EverFresh Agro Puree', leadTimeDays: 12 },
  'RM-505': { vendor: 'Hindalco Extrusions Ltd', leadTimeDays: 21 },
  'PM-801': { vendor: 'PolyPlast Packaging Ltd', leadTimeDays: 7 },
  'PM-802': { vendor: 'Crown Closures International', leadTimeDays: 5 },
  'PM-803': { vendor: 'Avery Label Corp Ltd', leadTimeDays: 10 },
  'PM-804': { vendor: 'WestRock Packaging Ltd', leadTimeDays: 6 },
  'PM-805': { vendor: 'Tetra Packaging Global', leadTimeDays: 15 },
  'PM-806': { vendor: 'Tetra Packaging Global', leadTimeDays: 12 },
  'PM-807': { vendor: 'Smurfit Corrugated Containers', leadTimeDays: 7 },
  'PM-808': { vendor: 'Tetra Packaging Global', leadTimeDays: 14 },
  'PM-809': { vendor: 'EcoStraw Biosolutions', leadTimeDays: 8 },
  'PM-810': { vendor: 'Apex Industrial Crates', leadTimeDays: 10 }
};

export function calculateConsolidatedRMRequirements(
  boms: BOMItem[],
  inventory: InventoryItem[],
  demands: DemandItem[],
  schedules: DeliveryScheduleItem[],
  sapInwards: SAPInwardItem[],
  reservations: RMReservationItem[] = [],
  asOnDate: string = DEFAULT_AS_ON_DATE
): RMWeeklyConsolidatedData[] {
  const currentAsOnWeek = getCurrentWeekNumber(asOnDate);

  // Filter reservations: Only consider ACTIVE reservations from current week onwards (past weeks ignored per Mon-Sat rule)
  const activeReservations = reservations.filter((r) => isReservationActiveAsOnDate(r, asOnDate));

  // 1. Group BOM items by componentCode
  const componentMap = new Map<
    string,
    {
      description: string;
      uom: string;
      category: 'RM' | 'PM';
      boms: BOMItem[];
    }
  >();

  boms.forEach((b) => {
    const existing = componentMap.get(b.componentCode);
    const category: 'RM' | 'PM' =
      b.category || (b.componentCode.startsWith('RM') ? 'RM' : 'PM');

    if (!existing) {
      componentMap.set(b.componentCode, {
        description: b.componentDescription,
        uom: b.uom,
        category,
        boms: [b]
      });
    } else {
      existing.boms.push(b);
    }
  });

  // Also include any inventory items that may not be in BOMs if needed
  inventory.forEach((inv) => {
    if (!componentMap.has(inv.materialNumber)) {
      const category: 'RM' | 'PM' = inv.materialNumber.startsWith('RM') ? 'RM' : 'PM';
      componentMap.set(inv.materialNumber, {
        description: inv.materialDescription,
        uom: inv.bun,
        category,
        boms: []
      });
    }
  });

  const demandMap = new Map<string, DemandItem>();
  demands.forEach((d) => demandMap.set(d.fgCode, d));

  const inventoryMap = new Map<string, InventoryItem>();
  inventory.forEach((inv) => inventoryMap.set(inv.materialNumber, inv));

  const results: RMWeeklyConsolidatedData[] = [];

  // 2. Process each component
  for (const [componentCode, compMeta] of componentMap.entries()) {
    const inv = inventoryMap.get(componentCode);
    const currentWarehouseStock = inv ? inv.unrestricted : 0;
    const inQualityInspStock = inv ? inv.inQualityInsp : 0;
    const safetyStock = inv?.safetyStock ?? 0;

    // Get active reservations for this material
    const compActiveReservations = activeReservations.filter((r) => r.componentCode === componentCode);
    const totalReservedForOtherFGs = compActiveReservations.reduce((acc, r) => acc + (Number(r.reservedQty) || 0), 0);
    const effectiveAvailableStock = Math.max(0, Number((currentWarehouseStock - totalReservedForOtherFGs).toFixed(2)));

    // Identify all consuming Finished Goods
    const usedInFGs: ConsumingFGDetail[] = [];

    // Deduplicate BOM usages per FG
    const seenFG = new Set<string>();
    compMeta.boms.forEach((bomItem) => {
      if (seenFG.has(bomItem.fgCode)) return;
      seenFG.add(bomItem.fgCode);

      const fgDemand = demandMap.get(bomItem.fgCode);
      const monthlyFG = fgDemand ? fgDemand.monthlyDemand : 0;
      const w1FG = fgDemand?.week1Demand ?? Math.round(monthlyFG / 4);
      const w2FG = fgDemand?.week2Demand ?? Math.round(monthlyFG / 4);
      const w3FG = fgDemand?.week3Demand ?? Math.round(monthlyFG / 4);
      const w4FG = fgDemand?.week4Demand ?? Math.round(monthlyFG / 4);

      const weeklyReq: { week: 1 | 2 | 3 | 4; fgDemand: number; componentReq: number }[] = [
        { week: 1, fgDemand: w1FG, componentReq: Number((w1FG * bomItem.qty).toFixed(2)) },
        { week: 2, fgDemand: w2FG, componentReq: Number((w2FG * bomItem.qty).toFixed(2)) },
        { week: 3, fgDemand: w3FG, componentReq: Number((w3FG * bomItem.qty).toFixed(2)) },
        { week: 4, fgDemand: w4FG, componentReq: Number((w4FG * bomItem.qty).toFixed(2)) }
      ];

      const totalMonthReq = Number((monthlyFG * bomItem.qty).toFixed(2));

      // Calculate reservations specifically for this FG vs other FGs
      const thisFGReservations = compActiveReservations.filter((r) => r.reservedForFGCode === bomItem.fgCode);
      const reservedForThisFG = thisFGReservations.reduce((acc, r) => acc + r.reservedQty, 0);

      const otherFGResItems = compActiveReservations.filter((r) => r.reservedForFGCode !== bomItem.fgCode);
      const reservedForOtherFGs = otherFGResItems.reduce((acc, r) => acc + r.reservedQty, 0);

      const otherFGReservations = otherFGResItems.map((r) => ({
        fgCode: r.reservedForFGCode,
        fgDescription: r.reservedForFGDescription,
        customerName: r.customerName,
        reservedQty: r.reservedQty,
        week: r.week,
        reason: r.reason,
        validDateRange: `${r.validFromDate} to ${r.validToDate}`
      }));

      const fgEffectiveAvailable = Math.max(0, Number((currentWarehouseStock - reservedForOtherFGs).toFixed(2)));
      const fgEffectiveNetRequirement = Math.max(0, Number((totalMonthReq - fgEffectiveAvailable).toFixed(2)));

      usedInFGs.push({
        fgCode: bomItem.fgCode,
        fgDescription: bomItem.fgDescription,
        qtyPerFG: bomItem.qty,
        uom: bomItem.uom,
        customerName: fgDemand?.customerName,
        miniFactory: bomItem.miniFactory || fgDemand?.miniFactory,
        line: bomItem.line || fgDemand?.line,
        weeklyReq,
        totalMonthReq,
        reservedForThisFG,
        reservedForOtherFGs,
        otherFGReservations,
        effectiveAvailableStock: fgEffectiveAvailable,
        effectiveNetRequirement: fgEffectiveNetRequirement
      });
    });

    // 3. Calculate Consolidated Weekly Requirements with Backlog Carryover & As-on-date Reservations
    const weeksData: RMWeeklyConsolidatedData['weeks'] = [];
    let carriedBacklog = 0;
    let runningProjectedStock = currentWarehouseStock;

    for (let w = 1; w <= 4; w++) {
      const weekNum = w as 1 | 2 | 3 | 4;

      // Sum gross requirement from all consuming FGs for this week
      const grossDemand = Number(
        usedInFGs
          .reduce((acc, fg) => {
            const wDetail = fg.weeklyReq.find((item) => item.week === weekNum);
            return acc + (wDetail ? wDetail.componentReq : 0);
          }, 0)
          .toFixed(2)
      );

      // Active reservation assigned to this specific week (only if weekNum >= currentAsOnWeek)
      let weeklyReservations = 0;
      if (weekNum >= currentAsOnWeek) {
        weeklyReservations = compActiveReservations
          .filter((r) => r.week === weekNum)
          .reduce((acc, r) => acc + r.reservedQty, 0);
      }

      // Backlog from previous week added into this week's requirement
      const backlogFromPrevious = carriedBacklog;
      const totalRequirement = Number((grossDemand + backlogFromPrevious).toFixed(2));
      const effectiveRequirement = Number((totalRequirement + weeklyReservations).toFixed(2));

      // Actual SAP Inward Receipt for this material in this week
      const actualReceiptSAP = Number(
        sapInwards
          .filter((sap) => sap.materialCode === componentCode && sap.week === weekNum)
          .reduce((acc, sap) => acc + sap.qty, 0)
          .toFixed(2)
      );

      // Purchase ETA Schedule (Promised in-transit inbound for this week)
      const purchaseETASchedule = Number(
        schedules
          .filter((sch) => sch.materialCode === componentCode && sch.week === weekNum && sch.delivered !== 'Y')
          .reduce((acc, sch) => acc + sch.qty, 0)
          .toFixed(2)
      );

      // Compute unmet backlog quantity to carry over into NEXT week
      let backlogCarryToNext = 0;
      if (actualReceiptSAP < totalRequirement) {
        backlogCarryToNext = Number((totalRequirement - actualReceiptSAP).toFixed(2));
      } else {
        backlogCarryToNext = 0;
      }
      carriedBacklog = backlogCarryToNext;

      // Net variance for the week (Inward + ETA - Effective Requirement)
      const totalInflow = actualReceiptSAP + purchaseETASchedule;
      const variance = Number((totalInflow - totalRequirement).toFixed(2));

      // Projected Stock Calculation:
      runningProjectedStock = Number((runningProjectedStock + actualReceiptSAP + purchaseETASchedule - grossDemand).toFixed(2));
      const effectiveClosingStock = Math.max(0, Number((runningProjectedStock - (weekNum >= currentAsOnWeek ? weeklyReservations : 0)).toFixed(2)));

      // Determine Status for the week considering reservations and safety stock
      let status: 'OK' | 'WARNING' | 'SHORTAGE' = 'OK';
      if (runningProjectedStock < 0 || effectiveClosingStock < 0 || (totalInflow < totalRequirement && runningProjectedStock < safetyStock)) {
        status = 'SHORTAGE';
      } else if (runningProjectedStock < safetyStock || effectiveClosingStock < safetyStock) {
        status = 'WARNING';
      }

      weeksData.push({
        week: weekNum,
        grossDemand,
        backlogFromPrevious,
        reservedForOtherFGs: weeklyReservations,
        totalRequirement,
        effectiveRequirement,
        actualReceiptSAP,
        backlogCarryToNext,
        purchaseETASchedule,
        projectedClosingStock: runningProjectedStock,
        effectiveClosingStock,
        variance,
        status
      });
    }

    // Totals
    const totalMonthGrossDemand = Number(weeksData.reduce((acc, w) => acc + w.grossDemand, 0).toFixed(2));
    const totalMonthRequirement = Number(weeksData.reduce((acc, w) => acc + w.totalRequirement, 0).toFixed(2));
    const totalMonthEffectiveRequirement = Number(weeksData.reduce((acc, w) => acc + w.effectiveRequirement, 0).toFixed(2));
    const totalMonthActualReceipt = Number(weeksData.reduce((acc, w) => acc + w.actualReceiptSAP, 0).toFixed(2));
    const totalMonthETASchedule = Number(weeksData.reduce((acc, w) => acc + w.purchaseETASchedule, 0).toFixed(2));
    const totalMonthBacklog = weeksData[3]?.backlogCarryToNext || 0;

    let overallStatus: 'OK' | 'WARNING' | 'SHORTAGE' = 'OK';
    if (weeksData.some((w) => w.status === 'SHORTAGE') || effectiveAvailableStock < safetyStock) {
      overallStatus = 'SHORTAGE';
    } else if (weeksData.some((w) => w.status === 'WARNING')) {
      overallStatus = 'WARNING';
    }

    const vendorInfo = DEFAULT_VENDORS[componentCode] || {
      vendor: 'Approved Industrial Suppliers Ltd',
      leadTimeDays: 10
    };

    results.push({
      materialCode: componentCode,
      materialDescription: compMeta.description,
      category: compMeta.category,
      uom: compMeta.uom,
      currentWarehouseStock,
      inQualityInspStock,
      safetyStock,
      primaryVendor: vendorInfo.vendor,
      leadTimeDays: vendorInfo.leadTimeDays,
      totalReservedForOtherFGs,
      effectiveAvailableStock,
      activeReservationsList: compActiveReservations,
      usedInFGs,
      totalFGCount: usedInFGs.length,
      weeks: weeksData,
      totalMonthGrossDemand,
      totalMonthRequirement,
      totalMonthEffectiveRequirement,
      totalMonthActualReceipt,
      totalMonthETASchedule,
      totalMonthBacklog,
      overallStatus
    });
  }

  // Sort by Category (RM first, then PM), then by overall status (SHORTAGE first), then by materialCode
  return results.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'RM' ? -1 : 1;
    }
    if (a.overallStatus !== b.overallStatus) {
      if (a.overallStatus === 'SHORTAGE') return -1;
      if (b.overallStatus === 'SHORTAGE') return 1;
      if (a.overallStatus === 'WARNING') return -1;
      if (b.overallStatus === 'WARNING') return 1;
    }
    return a.materialCode.localeCompare(b.materialCode);
  });
}

