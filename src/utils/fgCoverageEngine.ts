import {
  BOMItem,
  InventoryItem,
  DemandItem,
  DeliveryScheduleItem,
  ProductionLogItem,
  ComponentWeeklyMRP,
  RMReservationItem,
  FGCoverageReportItem,
  FGWeeklyCoverageDetail,
  FGBottleneckComponent
} from '../types';
import { getFGProductionCompleted, getUnrestrictedStock } from './mrpEngine';
import {
  getCurrentWeekNumber,
  isReservationActiveAsOnDate,
  DEFAULT_AS_ON_DATE
} from './dateCalendarUtils';

/**
 * Calculates FG-Centric Production Coverage & Critical RM/PM Shortage Breakdown
 * factoring in Active Material Reservations for Other Finished Goods
 */
export function calculateFGCoverageReport(
  boms: BOMItem[],
  inventory: InventoryItem[],
  demands: DemandItem[],
  deliverySchedules: DeliveryScheduleItem[],
  productionLogs: ProductionLogItem[],
  mrpData: ComponentWeeklyMRP[],
  reservations: RMReservationItem[] = [],
  asOnDate: string = DEFAULT_AS_ON_DATE
): FGCoverageReportItem[] {
  const currentWeek = getCurrentWeekNumber(asOnDate);

  // Active reservations on or after asOnDate week
  const activeReservations = reservations.filter((r) => isReservationActiveAsOnDate(r, asOnDate));

  // Get all unique FG codes from demands and BOMs
  const fgCodes = Array.from(
    new Set([
      ...demands.map((d) => d.fgCode),
      ...boms.map((b) => b.fgCode)
    ])
  );

  const report: FGCoverageReportItem[] = [];

  fgCodes.forEach((fgCode) => {
    const demandEntry = demands.find((d) => d.fgCode === fgCode);
    const fgBoms = boms.filter((b) => b.fgCode === fgCode);

    if (fgBoms.length === 0) return;

    const fgDescription = demandEntry?.fgDescription || fgBoms[0]?.fgDescription || fgCode;
    const uom = demandEntry?.uom || fgBoms[0]?.uom || 'PC';
    const miniFactory = demandEntry?.miniFactory || fgBoms[0]?.miniFactory;
    const line = demandEntry?.line || fgBoms[0]?.line;
    const monthlyDemand = demandEntry?.monthlyDemand || 10000;
    const productionCompleted = getFGProductionCompleted(fgCode, productionLogs);
    const netMonthlyDemand = Math.max(0, monthlyDemand - productionCompleted);

    // Get weekly FG demands
    const w1Demand = demandEntry?.week1Demand ?? netMonthlyDemand / 4;
    const w2Demand = demandEntry?.week2Demand ?? netMonthlyDemand / 4;
    const w3Demand = demandEntry?.week3Demand ?? netMonthlyDemand / 4;
    const w4Demand = demandEntry?.week4Demand ?? netMonthlyDemand / 4;
    const weeklyFgDemands = [w1Demand, w2Demand, w3Demand, w4Demand];

    // Evaluate each component required by this FG
    const allComponents: FGBottleneckComponent[] = [];

    fgBoms.forEach((bom) => {
      // Find matching component MRP calculation
      const compMrp = mrpData.find((m) => m.componentCode === bom.componentCode);

      // Determine category (RM vs PM)
      let category: 'RM' | 'PM' = 'RM';
      if (bom.category) {
        category = bom.category;
      } else if (bom.componentCode.startsWith('PM') || bom.componentDescription.toLowerCase().includes('bottle') || bom.componentDescription.toLowerCase().includes('cap') || bom.componentDescription.toLowerCase().includes('preform') || bom.componentDescription.toLowerCase().includes('label') || bom.componentDescription.toLowerCase().includes('carton') || bom.componentDescription.toLowerCase().includes('box') || bom.componentDescription.toLowerCase().includes('shrink')) {
        category = 'PM';
      } else {
        category = 'RM';
      }

      const totalMonthReq = netMonthlyDemand * bom.qty;
      const openingStock = getUnrestrictedStock(bom.componentCode, inventory);

      // Material reservations for OTHER FGs
      const compActiveRes = activeReservations.filter((r) => r.componentCode === bom.componentCode);
      const otherFGRes = compActiveRes.filter((r) => r.reservedForFGCode !== fgCode);
      const reservedForOtherFGs = otherFGRes.reduce((acc, r) => acc + r.reservedQty, 0);
      const effectiveAvailableStock = Math.max(0, openingStock - reservedForOtherFGs);

      const otherFGReservations = otherFGRes.map((r) => ({
        fgCode: r.reservedForFGCode,
        fgDescription: r.reservedForFGDescription,
        customerName: r.customerName,
        reservedQty: r.reservedQty,
        week: r.week,
        reason: r.reason,
        validDateRange: `${r.validFromDate} to ${r.validToDate}`
      }));
      
      const totalInbound = compMrp ? compMrp.totalMonthInbound : 0;
      const totalShortage = compMrp ? compMrp.totalMonthShortage : 0;

      // Effective shortage considering reservation deductions
      const effectiveShortageQty = Math.max(0, Math.round(totalMonthReq - (effectiveAvailableStock + totalInbound)));
      const effectiveFGImpact = bom.qty > 0 && effectiveShortageQty > 0 ? Math.ceil(effectiveShortageQty / bom.qty) : 0;

      // Find earliest shortage week for this component
      let shortageWeek: 1 | 2 | 3 | 4 | 'None' = 'None';
      let shortageQty = 0;

      if (compMrp) {
        for (const wk of compMrp.weeks) {
          if (wk.netRequirement > 0) {
            shortageWeek = wk.week;
            shortageQty = wk.netRequirement;
            break;
          }
        }
      }

      const fgShortageImpact = bom.qty > 0 && shortageQty > 0 ? Math.ceil(shortageQty / bom.qty) : 0;
      const compStatus: 'OK' | 'WARNING' | 'CRITICAL' =
        effectiveShortageQty > 0 || shortageQty > 0 ? 'CRITICAL' : compMrp?.overallStatus === 'WARNING' ? 'WARNING' : 'OK';

      const weeklyMRP = compMrp ? compMrp.weeks.map((wk) => {
        const weekOtherRes = compActiveRes
          .filter((r) => r.reservedForFGCode !== fgCode && r.week === wk.week)
          .reduce((acc, r) => acc + r.reservedQty, 0);

        return {
          week: wk.week,
          openingStock: Math.round(wk.openingStock),
          grossRequirement: Math.round(wk.grossRequirement),
          reservedForOtherFGs: weekOtherRes,
          scheduledInbound: Math.round(wk.scheduledInbound),
          closingStock: Math.round(wk.closingStock),
          netRequirement: Math.round(wk.netRequirement)
        };
      }) : undefined;

      allComponents.push({
        componentCode: bom.componentCode,
        componentDescription: bom.componentDescription,
        category,
        uom: bom.uom,
        qtyPerFG: bom.qty,
        totalMonthReq: Math.round(totalMonthReq),
        openingStock: Math.round(openingStock),
        reservedForOtherFGs,
        effectiveAvailableStock: Math.round(effectiveAvailableStock),
        otherFGReservations,
        totalInbound: Math.round(totalInbound),
        shortageWeek,
        shortageQty: Math.round(shortageQty),
        effectiveShortageQty,
        fgShortageImpact,
        effectiveFGImpact,
        status: compStatus,
        weeklyMRP
      });
    });

    // Compute weekly FG producible coverage with carryforward of unproduced demand
    const weeklyCoverage: FGWeeklyCoverageDetail[] = [];
    let producibleFGTotal = 0;
    let carryforwardDeficit = 0;

    for (let w = 1; w <= 4; w++) {
      const originalWeeklyDemand = Math.round(weeklyFgDemands[w - 1]);
      const currentCarriedOver = carryforwardDeficit;
      const netBeforeCap = originalWeeklyDemand + currentCarriedOver;
      const fgTargetDemand = Math.max(0, netBeforeCap);

      let maxProducibleForWeek = Infinity;
      const weekBottlenecks: FGBottleneckComponent[] = [];

      allComponents.forEach((comp) => {
        const compMrp = mrpData.find((m) => m.componentCode === comp.componentCode);
        if (!compMrp) return;

        const wkDetail = compMrp.weeks.find((wk) => wk.week === w);
        if (!wkDetail) return;

        // Effective Available component quantity in this week (after subtracting reservations from week onwards)
        const weekOtherRes = comp.otherFGReservations?.filter((r) => r.week === w).reduce((a, b) => a + b.reservedQty, 0) || 0;
        const totalCompAvailable = Math.max(0, wkDetail.totalAvailable - weekOtherRes);
        const maxFgFromComp = comp.qtyPerFG > 0 ? Math.floor(totalCompAvailable / comp.qtyPerFG) : Infinity;

        if (maxFgFromComp < maxProducibleForWeek) {
          maxProducibleForWeek = maxFgFromComp;
        }

        if (maxFgFromComp < fgTargetDemand) {
          weekBottlenecks.push({
            ...comp,
            shortageWeek: w as 1 | 2 | 3 | 4,
            shortageQty: Math.max(0, Math.round(fgTargetDemand * comp.qtyPerFG - totalCompAvailable)),
            fgShortageImpact: Math.max(0, fgTargetDemand - Math.max(0, maxFgFromComp))
          });
        }
      });

      if (maxProducibleForWeek === Infinity) maxProducibleForWeek = fgTargetDemand;

      const producible = Math.max(0, maxProducibleForWeek);
      
      // Calculate carryforward for next week
      carryforwardDeficit = (fgTargetDemand - producible) + Math.min(0, netBeforeCap);

      const isCovered = producible >= fgTargetDemand;
      const coveragePercent =
        fgTargetDemand > 0 ? Math.min(100, Math.round((producible / fgTargetDemand) * 100)) : 100;

      producibleFGTotal += Math.min(fgTargetDemand, producible);

      weeklyCoverage.push({
        week: w as 1 | 2 | 3 | 4,
        fgTargetDemand,
        originalWeeklyDemand,
        carriedOverDemand: currentCarriedOver,
        maxProducibleFG: producible,
        isCovered,
        coveragePercent,
        bottlenecks: weekBottlenecks
      });
    }

    const coveragePercent =
      netMonthlyDemand > 0 ? Math.min(100, Math.round((producibleFGTotal / netMonthlyDemand) * 100)) : 100;

    const criticalRMComponents = allComponents.filter(
      (c) => c.category === 'RM' && c.status === 'CRITICAL'
    );
    const criticalPMComponents = allComponents.filter(
      (c) => c.category === 'PM' && c.status === 'CRITICAL'
    );

    let overallCoverageStatus: 'COVERED' | 'PARTIALLY_COVERED' | 'CRITICAL' = 'COVERED';

    if (criticalRMComponents.length > 0 || criticalPMComponents.length > 0) {
      if (!weeklyCoverage[0].isCovered || !weeklyCoverage[1].isCovered) {
        overallCoverageStatus = 'CRITICAL';
      } else {
        overallCoverageStatus = 'PARTIALLY_COVERED';
      }
    }

    report.push({
      fgCode,
      fgDescription,
      uom,
      monthlyDemand,
      productionCompleted,
      netMonthlyDemand,
      overallCoverageStatus,
      producibleFGTotal: Math.round(producibleFGTotal),
      coveragePercent,
      weeklyCoverage,
      criticalRMComponents,
      criticalPMComponents,
      allComponents,
      miniFactory,
      line
    });
  });

  return report;
}

