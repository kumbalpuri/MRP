import {
  BOMItem,
  InventoryItem,
  DemandItem,
  DeliveryScheduleItem,
  ProductionLogItem,
  ComponentWeeklyMRP,
  FeasibilityCheckResult,
  MiniFactory
} from '../types';

/**
 * Calculates total FG production completed so far from production logs (MvT 101 Goods Receipt)
 */
export function getFGProductionCompleted(
  fgCode: string,
  productionLogs: ProductionLogItem[]
): number {
  return productionLogs
    .filter((log) => log.materialCode === fgCode && log.mvt === '101')
    .reduce((sum, log) => sum + (Number(log.quantity) || 0), 0);
}

/**
 * Gets total unrestricted stock for a given material across all plants and storage locations
 */
export function getUnrestrictedStock(
  materialCode: string,
  inventory: InventoryItem[]
): number {
  return inventory
    .filter((inv) => inv.materialNumber === materialCode)
    .reduce((sum, inv) => sum + (Number(inv.unrestricted) || 0), 0);
}

/**
 * Gets total Quality Inspection stock for a given material
 */
export function getQualityInspStock(
  materialCode: string,
  inventory: InventoryItem[]
): number {
  return inventory
    .filter((inv) => inv.materialNumber === materialCode)
    .reduce((sum, inv) => sum + (Number(inv.inQualityInsp) || 0), 0);
}

/**
 * Gets total Blocked stock for a given material
 */
export function getBlockedStock(
  materialCode: string,
  inventory: InventoryItem[]
): number {
  return inventory
    .filter((inv) => inv.materialNumber === materialCode)
    .reduce((sum, inv) => sum + (Number(inv.blocked) || 0), 0);
}

/**
 * Core MRP Calculation Engine
 * Expands BOM, factors in Demand (minus Production done so far),
 * computes stock in transit (Delivered=='N' only!), and evaluates Weekly Net Requirements (W1-W4)
 */
export function calculateMRPMatrix(
  boms: BOMItem[],
  inventory: InventoryItem[],
  demands: DemandItem[],
  deliverySchedules: DeliveryScheduleItem[],
  productionLogs: ProductionLogItem[]
): ComponentWeeklyMRP[] {
  // 1. First, map unique components from BOM
  const componentMap = new Map<
    string,
    {
      description: string;
      uom: string;
      usedInFGs: {
        fgCode: string;
        fgDescription: string;
        qtyPerFG: number;
        miniFactory?: MiniFactory;
        line?: string;
      }[];
    }
  >();

  boms.forEach((bom) => {
    if (!componentMap.has(bom.componentCode)) {
      componentMap.set(bom.componentCode, {
        description: bom.componentDescription,
        uom: bom.uom,
        usedInFGs: []
      });
    }
    const comp = componentMap.get(bom.componentCode)!;
    if (!comp.usedInFGs.some((f) => f.fgCode === bom.fgCode)) {
      comp.usedInFGs.push({
        fgCode: bom.fgCode,
        fgDescription: bom.fgDescription,
        qtyPerFG: Number(bom.qty) || 0,
        miniFactory: bom.miniFactory,
        line: bom.line
      });
    }
  });

  // 2. Compute Weekly Demand per FG (net of production completed if configured)
  const fgWeeklyDemandMap = new Map<
    string,
    { w1: number; w2: number; w3: number; w4: number }
  >();

  demands.forEach((dem) => {
    const totalProduced = getFGProductionCompleted(dem.fgCode, productionLogs);
    // Option: The user requested monthly demand equally divided into 4 weeks.
    // Production so far offsets the earlier weeks demand or reduces total monthly demand.
    const netMonthlyDemand = Math.max(0, dem.monthlyDemand - totalProduced);

    // If explicit weekly demands exist, use them, else divide net monthly demand by 4
    const w1 = dem.week1Demand !== undefined ? dem.week1Demand : netMonthlyDemand / 4;
    const w2 = dem.week2Demand !== undefined ? dem.week2Demand : netMonthlyDemand / 4;
    const w3 = dem.week3Demand !== undefined ? dem.week3Demand : netMonthlyDemand / 4;
    const w4 = dem.week4Demand !== undefined ? dem.week4Demand : netMonthlyDemand / 4;

    fgWeeklyDemandMap.set(dem.fgCode, { w1, w2, w3, w4 });
  });

  // 3. Process each component to generate 4-Week MRP Projection
  const mrpResults: ComponentWeeklyMRP[] = [];

  componentMap.forEach((compData, componentCode) => {
    const initialUnrestricted = getUnrestrictedStock(componentCode, inventory);
    const inQC = getQualityInspStock(componentCode, inventory);
    const blocked = getBlockedStock(componentCode, inventory);

    // Compute Gross Requirement per Week by exploding BOM
    let grossW1 = 0;
    let grossW2 = 0;
    let grossW3 = 0;
    let grossW4 = 0;

    compData.usedInFGs.forEach((fgUsage) => {
      const fgDemand = fgWeeklyDemandMap.get(fgUsage.fgCode) || { w1: 0, w2: 0, w3: 0, w4: 0 };
      grossW1 += fgDemand.w1 * fgUsage.qtyPerFG;
      grossW2 += fgDemand.w2 * fgUsage.qtyPerFG;
      grossW3 += fgDemand.w3 * fgUsage.qtyPerFG;
      grossW4 += fgDemand.w4 * fgUsage.qtyPerFG;
    });

    // Scheduled Deliveries per week (ONLY where delivered === 'N')
    const getScheduledInbound = (weekNum: 1 | 2 | 3 | 4) => {
      return deliverySchedules
        .filter(
          (ds) =>
            ds.materialCode === componentCode &&
            ds.week === weekNum &&
            ds.delivered === 'N' // CRITICAL: Delivered Y/N check
        )
        .reduce((sum, ds) => sum + (Number(ds.qty) || 0), 0);
    };

    const scheduledW1 = getScheduledInbound(1);
    const scheduledW2 = getScheduledInbound(2);
    const scheduledW3 = getScheduledInbound(3);
    const scheduledW4 = getScheduledInbound(4);

    // Simulate stock flow across W1 -> W2 -> W3 -> W4
    // Week 1
    const openW1 = initialUnrestricted;
    const availW1 = openW1 + scheduledW1;
    const netReqW1 = Math.max(0, grossW1 - availW1);
    const closeW1 = Math.max(0, availW1 - grossW1);
    const statusW1 = netReqW1 > 0 ? 'CRITICAL' : closeW1 < grossW1 * 0.2 ? 'WARNING' : 'OK';

    // Week 2
    const openW2 = closeW1;
    const availW2 = openW2 + scheduledW2;
    const netReqW2 = Math.max(0, grossW2 - availW2);
    const closeW2 = Math.max(0, availW2 - grossW2);
    const statusW2 = netReqW2 > 0 ? 'CRITICAL' : closeW2 < grossW2 * 0.2 ? 'WARNING' : 'OK';

    // Week 3
    const openW3 = closeW2;
    const availW3 = openW3 + scheduledW3;
    const netReqW3 = Math.max(0, grossW3 - availW3);
    const closeW3 = Math.max(0, availW3 - grossW3);
    const statusW3 = netReqW3 > 0 ? 'CRITICAL' : closeW3 < grossW3 * 0.2 ? 'WARNING' : 'OK';

    // Week 4
    const openW4 = closeW3;
    const availW4 = openW4 + scheduledW4;
    const netReqW4 = Math.max(0, grossW4 - availW4);
    const closeW4 = Math.max(0, availW4 - grossW4);
    const statusW4 = netReqW4 > 0 ? 'CRITICAL' : closeW4 < grossW4 * 0.2 ? 'WARNING' : 'OK';

    const totalGross = grossW1 + grossW2 + grossW3 + grossW4;
    const totalInbound = scheduledW1 + scheduledW2 + scheduledW3 + scheduledW4;
    const totalShortage = netReqW1 + netReqW2 + netReqW3 + netReqW4;

    const overallStatus: 'OK' | 'WARNING' | 'CRITICAL' =
      netReqW1 > 0 || netReqW2 > 0 || netReqW3 > 0 || netReqW4 > 0
        ? 'CRITICAL'
        : statusW1 === 'WARNING' || statusW2 === 'WARNING' || statusW3 === 'WARNING' || statusW4 === 'WARNING'
        ? 'WARNING'
        : 'OK';

    // Days / Weeks of Supply calculation
    const weeklyAvgDemand = totalGross / 4;
    const currentSupply = initialUnrestricted + totalInbound;
    const daysOfSupply = weeklyAvgDemand > 0 ? Math.round((currentSupply / weeklyAvgDemand) * 7) : 99;

    mrpResults.push({
      componentCode,
      componentDescription: compData.description,
      uom: compData.uom,
      openingUnrestrictedStock: initialUnrestricted,
      inQualityInspStock: inQC,
      blockedStock: blocked,
      usedInFGs: compData.usedInFGs,
      weeks: [
        {
          week: 1,
          openingStock: Math.round(openW1),
          grossRequirement: Math.round(grossW1),
          scheduledInbound: Math.round(scheduledW1),
          totalAvailable: Math.round(availW1),
          netRequirement: Math.round(netReqW1),
          closingStock: Math.round(closeW1),
          status: statusW1
        },
        {
          week: 2,
          openingStock: Math.round(openW2),
          grossRequirement: Math.round(grossW2),
          scheduledInbound: Math.round(scheduledW2),
          totalAvailable: Math.round(availW2),
          netRequirement: Math.round(netReqW2),
          closingStock: Math.round(closeW2),
          status: statusW2
        },
        {
          week: 3,
          openingStock: Math.round(openW3),
          grossRequirement: Math.round(grossW3),
          scheduledInbound: Math.round(scheduledW3),
          totalAvailable: Math.round(availW3),
          netRequirement: Math.round(netReqW3),
          closingStock: Math.round(closeW3),
          status: statusW3
        },
        {
          week: 4,
          openingStock: Math.round(openW4),
          grossRequirement: Math.round(grossW4),
          scheduledInbound: Math.round(scheduledW4),
          totalAvailable: Math.round(availW4),
          netRequirement: Math.round(netReqW4),
          closingStock: Math.round(closeW4),
          status: statusW4
        }
      ],
      totalMonthGrossReq: Math.round(totalGross),
      totalMonthInbound: Math.round(totalInbound),
      totalMonthShortage: Math.round(totalShortage),
      overallStatus,
      daysOfSupply
    });
  });

  return mrpResults;
}

/**
 * Checks production feasibility for a given FG and target quantity right now
 */
export function checkProductionFeasibility(
  fgCode: string,
  targetQty: number,
  boms: BOMItem[],
  inventory: InventoryItem[]
): FeasibilityCheckResult {
  const fgBom = boms.filter((b) => b.fgCode === fgCode);
  const fgDescription = fgBom[0]?.fgDescription || fgCode;

  let isFeasible = true;
  let maxProducible = Infinity;

  const componentCheck = fgBom.map((bom) => {
    const requiredQty = bom.qty * targetQty;
    const availableStock = getUnrestrictedStock(bom.componentCode, inventory);
    const shortage = Math.max(0, requiredQty - availableStock);
    const isSufficient = availableStock >= requiredQty;

    if (!isSufficient) {
      isFeasible = false;
    }

    const maxUnitsThisCompCanMake = bom.qty > 0 ? Math.floor(availableStock / bom.qty) : Infinity;
    if (maxUnitsThisCompCanMake < maxProducible) {
      maxProducible = maxUnitsThisCompCanMake;
    }

    return {
      componentCode: bom.componentCode,
      componentDescription: bom.componentDescription,
      requiredQty: Math.round(requiredQty * 100) / 100,
      availableStock: Math.round(availableStock * 100) / 100,
      shortage: Math.round(shortage * 100) / 100,
      isSufficient
    };
  });

  if (maxProducible === Infinity) maxProducible = 0;

  return {
    fgCode,
    fgDescription,
    targetQuantity: targetQty,
    isFeasible,
    maxProducible,
    componentCheck
  };
}
