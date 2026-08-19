import { BOMItem, InventoryItem, DemandItem, DeliveryScheduleItem, ProductionLogItem, SAPInwardItem, RMReservationItem } from '../types';

/**
 * Automobile Ancillaries Product Master BOM:
 * Covers: Vacuum Pumps, Oil Pumps, EGR Modules, Bye Pass Valves (BPV), Electronic Throttle Bodies (ETB)
 */
export const INITIAL_BOM: BOMItem[] = [
  // -------------------------------------------------------------
  // 1. Vacuum Pump Panther (7.06496.03.0) -> Line A-PMP2 (Panther VP) / Pumps_Division
  // -------------------------------------------------------------
  {
    id: 'bom-vp-01',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    componentCode: 'RM-CASTING-VP01',
    componentDescription: 'Die-Cast Aluminum Housing (Panther)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'bom-vp-02',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    componentCode: 'RM-ROTOR-850',
    componentDescription: 'Precision Rotor Assembly 40mm',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'bom-vp-03',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    componentCode: 'RM-VANE-CARB',
    componentDescription: 'Composite Carbon Sliding Vane (3-Set)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'bom-vp-04',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    componentCode: 'RM-SEAL-FKM50',
    componentDescription: 'Fluorosilicone Shaft Oil Seal 22x35x7',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'bom-vp-05',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    componentCode: 'PM-VCI-PUMP',
    componentDescription: 'VCI Anti-Corrosion Liner Bag',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'bom-vp-06',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    componentCode: 'PM-BOX-MODULAR',
    componentDescription: 'Modular Corrugated Box (Pack of 16)',
    qty: 0.0625,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },

  // -------------------------------------------------------------
  // 2. FAM B Tandem Vacuum Pump (7.09629.01.0) -> Line A-PMP1 / Pumps_Division
  // -------------------------------------------------------------
  {
    id: 'bom-famb-01',
    fgCode: '7.09629.01.0',
    fgDescription: 'FAM B Tandem Vacuum Pump',
    componentCode: 'RM-STATOR-500',
    componentDescription: 'Stator Housing Machined (FAM B)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-famb-02',
    fgCode: '7.09629.01.0',
    fgDescription: 'FAM B Tandem Vacuum Pump',
    componentCode: 'RM-ROTOR-850',
    componentDescription: 'Precision Rotor Assembly 40mm',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-famb-03',
    fgCode: '7.09629.01.0',
    fgDescription: 'FAM B Tandem Vacuum Pump',
    componentCode: 'RM-FASTENER-M6',
    componentDescription: 'Torx Flange Bolt M6x30 Grade 10.9',
    qty: 4.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-famb-04',
    fgCode: '7.09629.01.0',
    fgDescription: 'FAM B Tandem Vacuum Pump',
    componentCode: 'PM-VCI-PUMP',
    componentDescription: 'VCI Anti-Corrosion Liner Bag',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },

  // -------------------------------------------------------------
  // 3. Mahindra 3D 15 Vacuum Pump (7.11861.21.0) -> Line A-PMP1 / Pumps_Division
  // -------------------------------------------------------------
  {
    id: 'bom-3d-01',
    fgCode: '7.11861.21.0',
    fgDescription: 'Mahindra 3D 15 Vacuum Pump',
    componentCode: 'RM-CASTING-3D',
    componentDescription: 'Cast Iron Housing Body (3D 15)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-3d-02',
    fgCode: '7.11861.21.0',
    fgDescription: 'Mahindra 3D 15 Vacuum Pump',
    componentCode: 'RM-SHAFT-G12',
    componentDescription: 'Hardened Cam-Driven Shaft G12',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-3d-03',
    fgCode: '7.11861.21.0',
    fgDescription: 'Mahindra 3D 15 Vacuum Pump',
    componentCode: 'RM-SEAL-FKM50',
    componentDescription: 'Fluorosilicone Shaft Oil Seal 22x35x7',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-3d-04',
    fgCode: '7.11861.21.0',
    fgDescription: 'Mahindra 3D 15 Vacuum Pump',
    componentCode: 'PM-VCI-PUMP',
    componentDescription: 'VCI Anti-Corrosion Liner Bag',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },

  // -------------------------------------------------------------
  // 4. BR10 Step 2 Mechanical Vacuum Pump (7.08437.01.0) -> Line A-PMP1 / Pumps_Division
  // -------------------------------------------------------------
  {
    id: 'bom-br10-01',
    fgCode: '7.08437.01.0',
    fgDescription: 'BR10 Step 2 Mechanical Vacuum Pump',
    componentCode: 'RM-FLANGE-BR10',
    componentDescription: 'Machined Mounting Flange BR10',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-br10-02',
    fgCode: '7.08437.01.0',
    fgDescription: 'BR10 Step 2 Mechanical Vacuum Pump',
    componentCode: 'RM-ROTOR-850',
    componentDescription: 'Precision Rotor Assembly 40mm',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-br10-03',
    fgCode: '7.08437.01.0',
    fgDescription: 'BR10 Step 2 Mechanical Vacuum Pump',
    componentCode: 'RM-FASTENER-M6',
    componentDescription: 'Torx Flange Bolt M6x30 Grade 10.9',
    qty: 3.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'bom-br10-04',
    fgCode: '7.08437.01.0',
    fgDescription: 'BR10 Step 2 Mechanical Vacuum Pump',
    componentCode: 'PM-TRAY-PUMP',
    componentDescription: 'Thermoformed Packaging Tray (12 Cavities)',
    qty: 0.0833,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },

  // -------------------------------------------------------------
  // 5. TATA 1.5 VOP TGDI Variable Oil Pump (7.09763.01.0) -> Line A-OIL2 / Pumps_Division
  // -------------------------------------------------------------
  {
    id: 'bom-oil-01',
    fgCode: '7.09763.01.0',
    fgDescription: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    componentCode: 'RM-OIL-BODY-VOP',
    componentDescription: 'Pressure Die-Cast Oil Pump Housing (VOP)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },
  {
    id: 'bom-oil-02',
    fgCode: '7.09763.01.0',
    fgDescription: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    componentCode: 'RM-OIL-GEARSET',
    componentDescription: 'Sintered Steel Gerotor Gear Set (Inner/Outer)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },
  {
    id: 'bom-oil-03',
    fgCode: '7.09763.01.0',
    fgDescription: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    componentCode: 'RM-SOLENOID-12V',
    componentDescription: 'Proportional Oil Control Valve Solenoid 12V',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },
  {
    id: 'bom-oil-04',
    fgCode: '7.09763.01.0',
    fgDescription: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    componentCode: 'RM-SPRING-PRV',
    componentDescription: 'Calibrated Pressure Relief Valve Spring',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },
  {
    id: 'bom-oil-05',
    fgCode: '7.09763.01.0',
    fgDescription: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    componentCode: 'PM-VCI-PUMP',
    componentDescription: 'VCI Anti-Corrosion Liner Bag',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },

  // -------------------------------------------------------------
  // 6. Mahindra 4D15 Engine Oil Pump Assembly (7.12148.00.0) -> Line A-OIL1 / Pumps_Division
  // -------------------------------------------------------------
  {
    id: 'bom-oil4d-01',
    fgCode: '7.12148.00.0',
    fgDescription: 'Mahindra 4D15 Engine Oil Pump',
    componentCode: 'RM-OIL-BODY-4D',
    componentDescription: 'Aluminum Housing Machined (4D15)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'bom-oil4d-02',
    fgCode: '7.12148.00.0',
    fgDescription: 'Mahindra 4D15 Engine Oil Pump',
    componentCode: 'RM-OIL-GEARSET',
    componentDescription: 'Sintered Steel Gerotor Gear Set (Inner/Outer)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'bom-oil4d-03',
    fgCode: '7.12148.00.0',
    fgDescription: 'Mahindra 4D15 Engine Oil Pump',
    componentCode: 'RM-FASTENER-M6',
    componentDescription: 'Torx Flange Bolt M6x30 Grade 10.9',
    qty: 5.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'bom-oil4d-04',
    fgCode: '7.12148.00.0',
    fgDescription: 'Mahindra 4D15 Engine Oil Pump',
    componentCode: 'PM-VCI-PUMP',
    componentDescription: 'VCI Anti-Corrosion Liner Bag',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },

  // -------------------------------------------------------------
  // 7. RNIPL H13 High Pressure Oil Pump (7.13554.00.0) -> Line A-OIL1 / Pumps_Division
  // -------------------------------------------------------------
  {
    id: 'bom-oilh13-01',
    fgCode: '7.13554.00.0',
    fgDescription: 'RNIPL H13 High Pressure Oil Pump',
    componentCode: 'RM-OIL-BODY-4D',
    componentDescription: 'Aluminum Housing Machined (4D15)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'bom-oilh13-02',
    fgCode: '7.13554.00.0',
    fgDescription: 'RNIPL H13 High Pressure Oil Pump',
    componentCode: 'RM-SHAFT-G12',
    componentDescription: 'Hardened Cam-Driven Shaft G12',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'bom-oilh13-03',
    fgCode: '7.13554.00.0',
    fgDescription: 'RNIPL H13 High Pressure Oil Pump',
    componentCode: 'RM-SEAL-FKM50',
    componentDescription: 'Fluorosilicone Shaft Oil Seal 22x35x7',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'bom-oilh13-04',
    fgCode: '7.13554.00.0',
    fgDescription: 'RNIPL H13 High Pressure Oil Pump',
    componentCode: 'PM-BOX-MODULAR',
    componentDescription: 'Modular Corrugated Box (Pack of 16)',
    qty: 0.0625,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },

  // -------------------------------------------------------------
  // 8. Electric EGR Valve Module Euro-6 (7.02256.08.0) -> Line A-EGR1 / Valves_Division
  // -------------------------------------------------------------
  {
    id: 'bom-egr-01',
    fgCode: '7.02256.08.0',
    fgDescription: 'Electric EGR Valve Module Euro-6',
    componentCode: 'RM-EGR-CASTING',
    componentDescription: 'Stainless Steel EGR Body Casting (Euro-6)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR1 (EGR Valve)'
  },
  {
    id: 'bom-egr-02',
    fgCode: '7.02256.08.0',
    fgDescription: 'Electric EGR Valve Module Euro-6',
    componentCode: 'RM-MOTOR-DC12',
    componentDescription: 'Brushless DC High-Torque Stepper Motor 12V',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR1 (EGR Valve)'
  },
  {
    id: 'bom-egr-03',
    fgCode: '7.02256.08.0',
    fgDescription: 'Electric EGR Valve Module Euro-6',
    componentCode: 'RM-SENSOR-HALL',
    componentDescription: 'Non-Contact Hall Effect Position Sensor TPS',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR1 (EGR Valve)'
  },
  {
    id: 'bom-egr-04',
    fgCode: '7.02256.08.0',
    fgDescription: 'Electric EGR Valve Module Euro-6',
    componentCode: 'RM-GASKET-MLS',
    componentDescription: 'Multi-Layer Steel Exhaust Gasket (MLS)',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR1 (EGR Valve)'
  },
  {
    id: 'bom-egr-05',
    fgCode: '7.02256.08.0',
    fgDescription: 'Electric EGR Valve Module Euro-6',
    componentCode: 'PM-VCI-PUMP',
    componentDescription: 'VCI Anti-Corrosion Liner Bag',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR1 (EGR Valve)'
  },

  // -------------------------------------------------------------
  // 9. Integrated EGR Cooler & Flap Assembly (7.04381.12.0) -> Line A-EGR2 / Valves_Division
  // -------------------------------------------------------------
  {
    id: 'bom-egrc-01',
    fgCode: '7.04381.12.0',
    fgDescription: 'Integrated EGR Cooler & Flap Assembly',
    componentCode: 'RM-EGR-COOLER-CORE',
    componentDescription: 'Laser-Welded Stainless EGR Cooler Tube Matrix',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR2 (EGR Cooler Assy)'
  },
  {
    id: 'bom-egrc-02',
    fgCode: '7.04381.12.0',
    fgDescription: 'Integrated EGR Cooler & Flap Assembly',
    componentCode: 'RM-SOLENOID-12V',
    componentDescription: 'Proportional Oil Control Valve Solenoid 12V',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR2 (EGR Cooler Assy)'
  },
  {
    id: 'bom-egrc-03',
    fgCode: '7.04381.12.0',
    fgDescription: 'Integrated EGR Cooler & Flap Assembly',
    componentCode: 'RM-GASKET-MLS',
    componentDescription: 'Multi-Layer Steel Exhaust Gasket (MLS)',
    qty: 2.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR2 (EGR Cooler Assy)'
  },
  {
    id: 'bom-egrc-04',
    fgCode: '7.04381.12.0',
    fgDescription: 'Integrated EGR Cooler & Flap Assembly',
    componentCode: 'PM-BOX-MODULAR',
    componentDescription: 'Modular Corrugated Box (Pack of 16)',
    qty: 0.125,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Valves_Division',
    line: 'A-EGR2 (EGR Cooler Assy)'
  },

  // -------------------------------------------------------------
  // 10. Turbocharger Bye Pass Valve (BPV) Pneumatic (7.01870.06.0) -> Line A-BPV1 / Valves_Division
  // -------------------------------------------------------------
  {
    id: 'bom-bpv-01',
    fgCode: '7.01870.06.0',
    fgDescription: 'Turbocharger Bye Pass Valve (BPV)',
    componentCode: 'RM-BPV-HOUSING',
    componentDescription: 'High-Temp Polyamide BPV Housing with Flange',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'bom-bpv-02',
    fgCode: '7.01870.06.0',
    fgDescription: 'Turbocharger Bye Pass Valve (BPV)',
    componentCode: 'RM-DIAPHRAGM-BPV',
    componentDescription: 'Reinforced Silicon Rubber Vacuum Diaphragm',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'bom-bpv-03',
    fgCode: '7.01870.06.0',
    fgDescription: 'Turbocharger Bye Pass Valve (BPV)',
    componentCode: 'RM-SPRING-PRV',
    componentDescription: 'Calibrated Pressure Relief Valve Spring',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'bom-bpv-04',
    fgCode: '7.01870.06.0',
    fgDescription: 'Turbocharger Bye Pass Valve (BPV)',
    componentCode: 'PM-TRAY-PUMP',
    componentDescription: 'Thermoformed Packaging Tray (12 Cavities)',
    qty: 0.0833,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },

  // -------------------------------------------------------------
  // 11. Thermal 3-Way Bye Pass Valve (7.03140.02.0) -> Line A-BPV1 / Valves_Division
  // -------------------------------------------------------------
  {
    id: 'bom-tbpv-01',
    fgCode: '7.03140.02.0',
    fgDescription: 'Thermal Management 3-Way Bye Pass Valve',
    componentCode: 'RM-BPV-HOUSING',
    componentDescription: 'High-Temp Polyamide BPV Housing with Flange',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'bom-tbpv-02',
    fgCode: '7.03140.02.0',
    fgDescription: 'Thermal Management 3-Way Bye Pass Valve',
    componentCode: 'RM-SOLENOID-12V',
    componentDescription: 'Proportional Oil Control Valve Solenoid 12V',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'bom-tbpv-03',
    fgCode: '7.03140.02.0',
    fgDescription: 'Thermal Management 3-Way Bye Pass Valve',
    componentCode: 'RM-SEAL-FKM50',
    componentDescription: 'Fluorosilicone Shaft Oil Seal 22x35x7',
    qty: 2.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'bom-tbpv-04',
    fgCode: '7.03140.02.0',
    fgDescription: 'Thermal Management 3-Way Bye Pass Valve',
    componentCode: 'PM-VCI-PUMP',
    componentDescription: 'VCI Anti-Corrosion Liner Bag',
    qty: 1.0,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },

  // -------------------------------------------------------------
  // 12. Electronic Throttle Body 48mm ETB (7.03703.49.0) -> Line A-ETB1 / Throttle_ETB
  // -------------------------------------------------------------
  {
    id: 'bom-etb48-01',
    fgCode: '7.03703.49.0',
    fgDescription: 'Electronic Throttle Body 48mm (ETB)',
    componentCode: 'RM-ETB-BODY-48',
    componentDescription: 'Die-Cast Aluminum Throttle Bore 48mm Housing',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB1 (ETB 48mm)'
  },
  {
    id: 'bom-etb48-02',
    fgCode: '7.03703.49.0',
    fgDescription: 'Electronic Throttle Body 48mm (ETB)',
    componentCode: 'RM-MOTOR-DC12',
    componentDescription: 'Brushless DC High-Torque Stepper Motor 12V',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB1 (ETB 48mm)'
  },
  {
    id: 'bom-etb48-03',
    fgCode: '7.03703.49.0',
    fgDescription: 'Electronic Throttle Body 48mm (ETB)',
    componentCode: 'RM-SENSOR-HALL',
    componentDescription: 'Non-Contact Hall Effect Position Sensor TPS',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB1 (ETB 48mm)'
  },
  {
    id: 'bom-etb48-04',
    fgCode: '7.03703.49.0',
    fgDescription: 'Electronic Throttle Body 48mm (ETB)',
    componentCode: 'RM-ETB-PLATE-48',
    componentDescription: 'Precision Brass Throttle Flap Plate 48mm & Shaft',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB1 (ETB 48mm)'
  },
  {
    id: 'bom-etb48-05',
    fgCode: '7.03703.49.0',
    fgDescription: 'Electronic Throttle Body 48mm (ETB)',
    componentCode: 'PM-TRAY-PUMP',
    componentDescription: 'Thermoformed Packaging Tray (12 Cavities)',
    qty: 0.0833,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB1 (ETB 48mm)'
  },

  // -------------------------------------------------------------
  // 13. Electronic Throttle Body 60mm ETB (7.08204.15.0) -> Line A-ETB2 / Throttle_ETB
  // -------------------------------------------------------------
  {
    id: 'bom-etb60-01',
    fgCode: '7.08204.15.0',
    fgDescription: 'Electronic Throttle Body 60mm High Flow (ETB)',
    componentCode: 'RM-ETB-BODY-60',
    componentDescription: 'Die-Cast Aluminum Throttle Bore 60mm Housing',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB2 (ETB 60mm Drive-by-Wire)'
  },
  {
    id: 'bom-etb60-02',
    fgCode: '7.08204.15.0',
    fgDescription: 'Electronic Throttle Body 60mm High Flow (ETB)',
    componentCode: 'RM-MOTOR-DC12',
    componentDescription: 'Brushless DC High-Torque Stepper Motor 12V',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB2 (ETB 60mm Drive-by-Wire)'
  },
  {
    id: 'bom-etb60-03',
    fgCode: '7.08204.15.0',
    fgDescription: 'Electronic Throttle Body 60mm High Flow (ETB)',
    componentCode: 'RM-SENSOR-HALL',
    componentDescription: 'Non-Contact Hall Effect Position Sensor TPS',
    qty: 1.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB2 (ETB 60mm Drive-by-Wire)'
  },
  {
    id: 'bom-etb60-04',
    fgCode: '7.08204.15.0',
    fgDescription: 'Electronic Throttle Body 60mm High Flow (ETB)',
    componentCode: 'RM-FASTENER-M6',
    componentDescription: 'Torx Flange Bolt M6x30 Grade 10.9',
    qty: 4.0,
    uom: 'PC',
    category: 'RM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB2 (ETB 60mm Drive-by-Wire)'
  },
  {
    id: 'bom-etb60-05',
    fgCode: '7.08204.15.0',
    fgDescription: 'Electronic Throttle Body 60mm High Flow (ETB)',
    componentCode: 'PM-BOX-MODULAR',
    componentDescription: 'Modular Corrugated Box (Pack of 16)',
    qty: 0.0625,
    uom: 'PC',
    category: 'PM',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB2 (ETB 60mm Drive-by-Wire)'
  }
];

/**
 * Automobile Ancillaries Inventory Stock
 */
export const INITIAL_INVENTORY: InventoryItem[] = [
  // Raw Materials / Castings / Machined Parts
  {
    id: 'inv-rm-01',
    materialNumber: 'RM-CASTING-VP01',
    materialDescription: 'Die-Cast Aluminum Housing (Panther)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1200,
    inQualityInsp: 150,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 800,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-02',
    materialNumber: 'RM-ROTOR-850',
    materialDescription: 'Precision Rotor Assembly 40mm',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 440,
    inQualityInsp: 60,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1000,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-03',
    materialNumber: 'RM-VANE-CARB',
    materialDescription: 'Composite Carbon Sliding Vane (3-Set)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 2800,
    inQualityInsp: 200,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1500,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-04',
    materialNumber: 'RM-SEAL-FKM50',
    materialDescription: 'Fluorosilicone Shaft Oil Seal 22x35x7',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 3500,
    inQualityInsp: 300,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 2000,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-05',
    materialNumber: 'RM-STATOR-500',
    materialDescription: 'Stator Housing Machined (FAM B)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 770,
    inQualityInsp: 80,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 900,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-06',
    materialNumber: 'RM-CASTING-3D',
    materialDescription: 'Cast Iron Housing Body (3D 15)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1200,
    inQualityInsp: 100,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 800,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-07',
    materialNumber: 'RM-SHAFT-G12',
    materialDescription: 'Hardened Cam-Driven Shaft G12',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 384,
    inQualityInsp: 50,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1200,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-08',
    materialNumber: 'RM-FLANGE-BR10',
    materialDescription: 'Machined Mounting Flange BR10',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 850,
    inQualityInsp: 50,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 500,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-09',
    materialNumber: 'RM-OIL-BODY-VOP',
    materialDescription: 'Pressure Die-Cast Oil Pump Housing (VOP)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 2200,
    inQualityInsp: 200,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1500,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-10',
    materialNumber: 'RM-OIL-GEARSET',
    materialDescription: 'Sintered Steel Gerotor Gear Set (Inner/Outer)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 3100,
    inQualityInsp: 250,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 2000,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-11',
    materialNumber: 'RM-SOLENOID-12V',
    materialDescription: 'Proportional Oil Control Valve Solenoid 12V',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1850,
    inQualityInsp: 150,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1200,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-12',
    materialNumber: 'RM-SPRING-PRV',
    materialDescription: 'Calibrated Pressure Relief Valve Spring',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 4500,
    inQualityInsp: 300,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 2500,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-13',
    materialNumber: 'RM-OIL-BODY-4D',
    materialDescription: 'Aluminum Housing Machined (4D15)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1400,
    inQualityInsp: 120,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 900,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-14',
    materialNumber: 'RM-FASTENER-M6',
    materialDescription: 'Torx Flange Bolt M6x30 Grade 10.9',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 18500,
    inQualityInsp: 1000,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 10000,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-15',
    materialNumber: 'RM-EGR-CASTING',
    materialDescription: 'Stainless Steel EGR Body Casting (Euro-6)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1100,
    inQualityInsp: 100,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 800,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-16',
    materialNumber: 'RM-MOTOR-DC12',
    materialDescription: 'Brushless DC High-Torque Stepper Motor 12V',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 950,
    inQualityInsp: 100,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1500,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-17',
    materialNumber: 'RM-SENSOR-HALL',
    materialDescription: 'Non-Contact Hall Effect Position Sensor TPS',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 820,
    inQualityInsp: 80,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1600,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-18',
    materialNumber: 'RM-GASKET-MLS',
    materialDescription: 'Multi-Layer Steel Exhaust Gasket (MLS)',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 3200,
    inQualityInsp: 250,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1800,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-19',
    materialNumber: 'RM-EGR-COOLER-CORE',
    materialDescription: 'Laser-Welded Stainless EGR Cooler Tube Matrix',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 650,
    inQualityInsp: 60,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 500,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-20',
    materialNumber: 'RM-BPV-HOUSING',
    materialDescription: 'High-Temp Polyamide BPV Housing with Flange',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 2400,
    inQualityInsp: 180,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1400,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-21',
    materialNumber: 'RM-DIAPHRAGM-BPV',
    materialDescription: 'Reinforced Silicon Rubber Vacuum Diaphragm',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1900,
    inQualityInsp: 150,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1200,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-22',
    materialNumber: 'RM-ETB-BODY-48',
    materialDescription: 'Die-Cast Aluminum Throttle Bore 48mm Housing',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1350,
    inQualityInsp: 120,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1000,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-23',
    materialNumber: 'RM-ETB-PLATE-48',
    materialDescription: 'Precision Brass Throttle Flap Plate 48mm & Shaft',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 1450,
    inQualityInsp: 100,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 1000,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-rm-24',
    materialNumber: 'RM-ETB-BODY-60',
    materialDescription: 'Die-Cast Aluminum Throttle Bore 60mm Housing',
    plant: 'PL01-PUNE',
    sloc: 'SL01-Raw',
    bun: 'PC',
    unrestricted: 980,
    inQualityInsp: 80,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 800,
    lastUpdated: '2026-08-19'
  },

  // Packaging Materials
  {
    id: 'inv-pm-01',
    materialNumber: 'PM-VCI-PUMP',
    materialDescription: 'VCI Anti-Corrosion Liner Bag',
    plant: 'PL01-PUNE',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 12500,
    inQualityInsp: 800,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 6000,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-pm-02',
    materialNumber: 'PM-BOX-MODULAR',
    materialDescription: 'Modular Corrugated Box (Pack of 16)',
    plant: 'PL01-PUNE',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 1200,
    inQualityInsp: 100,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 600,
    lastUpdated: '2026-08-19'
  },
  {
    id: 'inv-pm-03',
    materialNumber: 'PM-TRAY-PUMP',
    materialDescription: 'Thermoformed Packaging Tray (12 Cavities)',
    plant: 'PL01-PUNE',
    sloc: 'SL02-Pack',
    bun: 'PC',
    unrestricted: 1400,
    inQualityInsp: 120,
    restrictedUse: 0,
    blocked: 0,
    safetyStock: 700,
    lastUpdated: '2026-08-19'
  }
];

/**
 * Automobile Ancillaries Demand Master (OEM Customers)
 */
export const INITIAL_DEMAND: DemandItem[] = [
  {
    id: 'dem-01',
    fgCode: '7.06496.03.0',
    fgDescription: 'Vacuum Pump Panther (A-PMP2)',
    customerName: 'TATA Motors Powertrain',
    monthlyDemand: 9220,
    uom: 'PC',
    week1Demand: 2200,
    week2Demand: 2400,
    week3Demand: 2120,
    week4Demand: 2500,
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'dem-02',
    fgCode: '7.09629.01.0',
    fgDescription: 'FAM B Tandem Vacuum Pump',
    customerName: 'Maruti Suzuki India Ltd.',
    monthlyDemand: 7570,
    uom: 'PC',
    week1Demand: 1800,
    week2Demand: 1900,
    week3Demand: 1870,
    week4Demand: 2000,
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'dem-03',
    fgCode: '7.11861.21.0',
    fgDescription: 'Mahindra 3D 15 Vacuum Pump',
    customerName: 'Mahindra & Mahindra Chakan',
    monthlyDemand: 5220,
    uom: 'PC',
    week1Demand: 1200,
    week2Demand: 1300,
    week3Demand: 1320,
    week4Demand: 1400,
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'dem-04',
    fgCode: '7.08437.01.0',
    fgDescription: 'BR10 Step 2 Mechanical Vacuum Pump',
    customerName: 'Hyundai Motor India Ltd.',
    monthlyDemand: 2426,
    uom: 'PC',
    week1Demand: 600,
    week2Demand: 600,
    week3Demand: 576,
    week4Demand: 650,
    miniFactory: 'Pumps_Division',
    line: 'A-PMP1 (Vacuum Pump)'
  },
  {
    id: 'dem-05',
    fgCode: '7.09763.01.0',
    fgDescription: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    customerName: 'TATA Motors Sanand Plant',
    monthlyDemand: 8340,
    uom: 'PC',
    week1Demand: 2000,
    week2Demand: 2100,
    week3Demand: 2040,
    week4Demand: 2200,
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },
  {
    id: 'dem-06',
    fgCode: '7.12148.00.0',
    fgDescription: 'Mahindra 4D15 Engine Oil Pump',
    customerName: 'Mahindra Engine Plant Igatpuri',
    monthlyDemand: 2414,
    uom: 'PC',
    week1Demand: 600,
    week2Demand: 600,
    week3Demand: 564,
    week4Demand: 650,
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'dem-07',
    fgCode: '7.13554.00.0',
    fgDescription: 'RNIPL H13 High Pressure Oil Pump',
    customerName: 'Renault Nissan Oragadam',
    monthlyDemand: 1634,
    uom: 'PC',
    week1Demand: 400,
    week2Demand: 400,
    week3Demand: 384,
    week4Demand: 450,
    miniFactory: 'Pumps_Division',
    line: 'A-OIL1 (Engine Oil Pump)'
  },
  {
    id: 'dem-08',
    fgCode: '7.02256.08.0',
    fgDescription: 'Electric EGR Valve Module Euro-6',
    customerName: 'Toyota Kirloskar Auto Parts',
    monthlyDemand: 6300,
    uom: 'PC',
    week1Demand: 1500,
    week2Demand: 1600,
    week3Demand: 1550,
    week4Demand: 1650,
    miniFactory: 'Valves_Division',
    line: 'A-EGR1 (EGR Valve)'
  },
  {
    id: 'dem-09',
    fgCode: '7.04381.12.0',
    fgDescription: 'Integrated EGR Cooler & Flap Assembly',
    customerName: 'TATA Commercial Vehicles Pune',
    monthlyDemand: 3370,
    uom: 'PC',
    week1Demand: 800,
    week2Demand: 850,
    week3Demand: 820,
    week4Demand: 900,
    miniFactory: 'Valves_Division',
    line: 'A-EGR2 (EGR Cooler Assy)'
  },
  {
    id: 'dem-10',
    fgCode: '7.01870.06.0',
    fgDescription: 'Turbocharger Bye Pass Valve (BPV)',
    customerName: 'BorgWarner Turbo Systems',
    monthlyDemand: 7550,
    uom: 'PC',
    week1Demand: 1800,
    week2Demand: 1900,
    week3Demand: 1850,
    week4Demand: 2000,
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'dem-11',
    fgCode: '7.03140.02.0',
    fgDescription: 'Thermal Management 3-Way Bye Pass Valve',
    customerName: 'Mahindra Electric EV Division',
    monthlyDemand: 3770,
    uom: 'PC',
    week1Demand: 900,
    week2Demand: 950,
    week3Demand: 920,
    week4Demand: 1000,
    miniFactory: 'Valves_Division',
    line: 'A-BPV1 (Turbo Bypass Valve)'
  },
  {
    id: 'dem-12',
    fgCode: '7.03703.49.0',
    fgDescription: 'Electronic Throttle Body 48mm (ETB)',
    customerName: 'Maruti Suzuki Powertrain Rohtak',
    monthlyDemand: 6700,
    uom: 'PC',
    week1Demand: 1600,
    week2Demand: 1700,
    week3Demand: 1650,
    week4Demand: 1750,
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB1 (ETB 48mm)'
  },
  {
    id: 'dem-13',
    fgCode: '7.08204.15.0',
    fgDescription: 'Electronic Throttle Body 60mm High Flow (ETB)',
    customerName: 'Honda Cars India Tapukara',
    monthlyDemand: 4570,
    uom: 'PC',
    week1Demand: 1100,
    week2Demand: 1150,
    week3Demand: 1120,
    week4Demand: 1200,
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB2 (ETB 60mm Drive-by-Wire)'
  }
];

/**
 * Supplier Delivery Schedules & In-Transit ETAs
 */
export const INITIAL_DELIVERY_SCHEDULE: DeliveryScheduleItem[] = [
  // RM-ROTOR-850 (Rotor 40mm)
  {
    id: 'sch-01',
    materialCode: 'RM-ROTOR-850',
    description: 'Precision Rotor Assembly 40mm',
    vendor: 'Precision Dynamics Pune',
    week: 1,
    etd: '2026-08-01',
    eta: '2026-08-05',
    qty: 2400,
    unit: 'PC',
    delivered: 'Y',
    poNumber: 'PO-2026-0881',
    lastReason: 'Initial bulk run dispatch',
    changedBy: 'Procurement Lead'
  },
  {
    id: 'sch-02',
    materialCode: 'RM-ROTOR-850',
    description: 'Precision Rotor Assembly 40mm',
    vendor: 'Precision Dynamics Pune',
    week: 2,
    etd: '2026-08-08',
    eta: '2026-08-12',
    qty: 2500,
    unit: 'PC',
    delivered: 'Y',
    poNumber: 'PO-2026-0882',
    lastReason: 'W2 replenishment schedule',
    changedBy: 'Procurement Lead'
  },
  {
    id: 'sch-03',
    materialCode: 'RM-ROTOR-850',
    description: 'Precision Rotor Assembly 40mm',
    vendor: 'Precision Dynamics Pune',
    week: 3,
    etd: '2026-08-18',
    eta: '2026-08-19',
    qty: 850,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-0883A',
    lastReason: 'ETA 19.08 - 07:00 PM (In Transit - Evening Shift Arrival)',
    changedBy: 'Supply Planner'
  },
  {
    id: 'sch-04',
    materialCode: 'RM-ROTOR-850',
    description: 'Precision Rotor Assembly 40mm',
    vendor: 'Precision Dynamics Pune',
    week: 3,
    etd: '2026-08-19',
    eta: '2026-08-20',
    qty: 800,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-0883B',
    lastReason: 'ETA 20.08 - 03:00 PM (In Transit)',
    changedBy: 'Supply Planner'
  },
  {
    id: 'sch-05',
    materialCode: 'RM-ROTOR-850',
    description: 'Precision Rotor Assembly 40mm',
    vendor: 'Precision Dynamics Pune',
    week: 4,
    etd: '2026-08-24',
    eta: '2026-08-26',
    qty: 2600,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-0884',
    lastReason: 'Month-end commitment order',
    changedBy: 'Procurement Lead'
  },

  // RM-STATOR-500 (Stator Housing FAM B)
  {
    id: 'sch-06',
    materialCode: 'RM-STATOR-500',
    description: 'Stator Housing Machined (FAM B)',
    vendor: 'Rico Auto Industries Dharuhera',
    week: 3,
    etd: '2026-08-18',
    eta: '2026-08-19',
    qty: 500,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-0912',
    lastReason: 'ETA 19.08 - 02:00 PM (Afternoon Express Dispatch)',
    changedBy: 'Supply Planner'
  },
  {
    id: 'sch-07',
    materialCode: 'RM-STATOR-500',
    description: 'Stator Housing Machined (FAM B)',
    vendor: 'Rico Auto Industries Dharuhera',
    week: 3,
    etd: '2026-08-20',
    eta: '2026-08-21',
    qty: 600,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-0913',
    lastReason: 'ETA 21.08 - 10:00 AM',
    changedBy: 'Supply Planner'
  },

  // RM-SHAFT-G12 (Cam Shaft G12)
  {
    id: 'sch-08',
    materialCode: 'RM-SHAFT-G12',
    description: 'Hardened Cam-Driven Shaft G12',
    vendor: 'Sundram Fasteners Hosur',
    week: 3,
    etd: '2026-08-18',
    eta: '2026-08-19',
    qty: 500,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-0941',
    lastReason: 'ETA 19.08 - 07:00 PM',
    changedBy: 'Procurement Lead'
  },
  {
    id: 'sch-09',
    materialCode: 'RM-SHAFT-G12',
    description: 'Hardened Cam-Driven Shaft G12',
    vendor: 'Sundram Fasteners Hosur',
    week: 3,
    etd: '2026-08-19',
    eta: '2026-08-20',
    qty: 800,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-0942',
    lastReason: 'ETA 20.08 - 03:00 PM',
    changedBy: 'Procurement Lead'
  },

  // RM-MOTOR-DC12 (Stepper Motor 12V for EGR & ETB)
  {
    id: 'sch-10',
    materialCode: 'RM-MOTOR-DC12',
    description: 'Brushless DC High-Torque Stepper Motor 12V',
    vendor: 'Mikuni India Auto Components',
    week: 3,
    etd: '2026-08-15',
    eta: '2026-08-20',
    qty: 1800,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-1002',
    lastReason: 'Customs cleared consignment inward',
    changedBy: 'Procurement Lead'
  },
  {
    id: 'sch-11',
    materialCode: 'RM-MOTOR-DC12',
    description: 'Brushless DC High-Torque Stepper Motor 12V',
    vendor: 'Mikuni India Auto Components',
    week: 4,
    etd: '2026-08-22',
    eta: '2026-08-26',
    qty: 2500,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-1003',
    lastReason: 'Monthly final release',
    changedBy: 'Procurement Lead'
  },

  // RM-SENSOR-HALL (TPS Sensor)
  {
    id: 'sch-12',
    materialCode: 'RM-SENSOR-HALL',
    description: 'Non-Contact Hall Effect Position Sensor TPS',
    vendor: 'Sensata Technologies Pune',
    week: 3,
    etd: '2026-08-19',
    eta: '2026-08-21',
    qty: 2000,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-1025',
    lastReason: 'ETA 21.08 - 11:30 AM',
    changedBy: 'Procurement Lead'
  },

  // RM-OIL-GEARSET (Gerotor Gear Set)
  {
    id: 'sch-13',
    materialCode: 'RM-OIL-GEARSET',
    description: 'Sintered Steel Gerotor Gear Set (Inner/Outer)',
    vendor: 'GKN Sinter Metals Pune',
    week: 3,
    etd: '2026-08-18',
    eta: '2026-08-20',
    qty: 2500,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-1088',
    lastReason: 'W3 regular lot delivery',
    changedBy: 'Procurement Lead'
  },

  // RM-EGR-CASTING (Stainless EGR Casting)
  {
    id: 'sch-14',
    materialCode: 'RM-EGR-CASTING',
    description: 'Stainless Steel EGR Body Casting (Euro-6)',
    vendor: 'Bharat Forge Mundhwa',
    week: 3,
    etd: '2026-08-18',
    eta: '2026-08-20',
    qty: 1500,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-1140',
    lastReason: 'Machined batch delivery',
    changedBy: 'Procurement Lead'
  },

  // RM-DIAPHRAGM-BPV (Silicon Diaphragm)
  {
    id: 'sch-15',
    materialCode: 'RM-DIAPHRAGM-BPV',
    description: 'Reinforced Silicon Rubber Vacuum Diaphragm',
    vendor: 'Freudenberg Sealing Technologies Mohali',
    week: 3,
    etd: '2026-08-19',
    eta: '2026-08-21',
    qty: 1800,
    unit: 'PC',
    delivered: 'N',
    poNumber: 'PO-2026-1192',
    lastReason: 'Air courier consignment dispatch',
    changedBy: 'Procurement Lead'
  }
];

/**
 * SAP Inward Actual Goods Receipt Ledger
 */
export const INITIAL_SAP_INWARDS: SAPInwardItem[] = [
  {
    id: 'inw-01',
    matDoc: '500091801',
    postingDate: '2026-08-04',
    week: 1,
    materialCode: 'RM-ROTOR-850',
    materialDescription: 'Precision Rotor Assembly 40mm',
    qty: 2400,
    uom: 'PC',
    sloc: 'SL01-Raw',
    vendor: 'Precision Dynamics Pune',
    poNumber: 'PO-2026-0881',
    headerText: 'GRN against PO-2026-0881 W1 Batch 1'
  },
  {
    id: 'inw-02',
    matDoc: '500091802',
    postingDate: '2026-08-11',
    week: 2,
    materialCode: 'RM-ROTOR-850',
    materialDescription: 'Precision Rotor Assembly 40mm',
    qty: 2500,
    uom: 'PC',
    sloc: 'SL01-Raw',
    vendor: 'Precision Dynamics Pune',
    poNumber: 'PO-2026-0882',
    headerText: 'GRN against PO-2026-0882 W2 Batch 2'
  },
  {
    id: 'inw-03',
    matDoc: '500091803',
    postingDate: '2026-08-06',
    week: 1,
    materialCode: 'RM-MOTOR-DC12',
    materialDescription: 'Brushless DC High-Torque Stepper Motor 12V',
    qty: 2200,
    uom: 'PC',
    sloc: 'SL01-Raw',
    vendor: 'Mikuni India Auto Components',
    poNumber: 'PO-2026-1001',
    headerText: 'Import consignment cleared at customs'
  },
  {
    id: 'inw-04',
    matDoc: '500091804',
    postingDate: '2026-08-13',
    week: 2,
    materialCode: 'RM-OIL-GEARSET',
    materialDescription: 'Sintered Steel Gerotor Gear Set (Inner/Outer)',
    qty: 2600,
    uom: 'PC',
    sloc: 'SL01-Raw',
    vendor: 'GKN Sinter Metals Pune',
    poNumber: 'PO-2026-1087',
    headerText: 'Batch GRN for VOP oil pump line'
  },
  {
    id: 'inw-05',
    matDoc: '500091805',
    postingDate: '2026-08-14',
    week: 2,
    materialCode: 'RM-EGR-CASTING',
    materialDescription: 'Stainless Steel EGR Body Casting (Euro-6)',
    qty: 1600,
    uom: 'PC',
    sloc: 'SL01-Raw',
    vendor: 'Bharat Forge Mundhwa',
    poNumber: 'PO-2026-1139',
    headerText: 'EGR valve casting line supply'
  }
];

/**
 * Production Log History
 */
export const INITIAL_PRODUCTION_LOGS: ProductionLogItem[] = [
  {
    id: 'plog-01',
    description: 'Vacuum Pump Panther (A-PMP2)',
    materialCode: '7.06496.03.0',
    reference: 'PROD-ORD-8801',
    mvt: '101',
    supplier: 'In-House Assembly Line A-PMP2',
    documentHeaderText: 'W1 Production Run',
    po: 'N/A',
    plant: 'PL01',
    userName: 'Sanjay Deshmukh (Supervisor)',
    cocd: 'AUTO1',
    item: '001',
    matDoc: '4900101',
    entryDate: '2026-08-08',
    quantity: 2200,
    eun: 'PC',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'plog-02',
    description: 'Vacuum Pump Panther (A-PMP2)',
    materialCode: '7.06496.03.0',
    reference: 'PROD-ORD-8802',
    mvt: '101',
    supplier: 'In-House Assembly Line A-PMP2',
    documentHeaderText: 'W2 Production Run',
    po: 'N/A',
    plant: 'PL01',
    userName: 'Sanjay Deshmukh (Supervisor)',
    cocd: 'AUTO1',
    item: '001',
    matDoc: '4900102',
    entryDate: '2026-08-15',
    quantity: 2400,
    eun: 'PC',
    miniFactory: 'Pumps_Division',
    line: 'A-PMP2 (Panther VP)'
  },
  {
    id: 'plog-03',
    description: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    materialCode: '7.09763.01.0',
    reference: 'PROD-ORD-8901',
    mvt: '101',
    supplier: 'In-House Assembly Line A-OIL2',
    documentHeaderText: 'W1 Production Run VOP',
    po: 'N/A',
    plant: 'PL01',
    userName: 'Mahesh Patil (Supervisor)',
    cocd: 'AUTO1',
    item: '001',
    matDoc: '4900201',
    entryDate: '2026-08-08',
    quantity: 2000,
    eun: 'PC',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },
  {
    id: 'plog-04',
    description: 'TATA 1.5 VOP TGDI Variable Oil Pump',
    materialCode: '7.09763.01.0',
    reference: 'PROD-ORD-8902',
    mvt: '101',
    supplier: 'In-House Assembly Line A-OIL2',
    documentHeaderText: 'W2 Production Run VOP',
    po: 'N/A',
    plant: 'PL01',
    userName: 'Mahesh Patil (Supervisor)',
    cocd: 'AUTO1',
    item: '001',
    matDoc: '4900202',
    entryDate: '2026-08-15',
    quantity: 2100,
    eun: 'PC',
    miniFactory: 'Pumps_Division',
    line: 'A-OIL2 (Variable Oil Pump)'
  },
  {
    id: 'plog-05',
    description: 'Electric EGR Valve Module Euro-6',
    materialCode: '7.02256.08.0',
    reference: 'PROD-ORD-9001',
    mvt: '101',
    supplier: 'In-House Assembly Line A-EGR1',
    documentHeaderText: 'W1 EGR Production Run',
    po: 'N/A',
    plant: 'PL01',
    userName: 'Rahul Shinde (Supervisor)',
    cocd: 'AUTO1',
    item: '001',
    matDoc: '4900301',
    entryDate: '2026-08-08',
    quantity: 1500,
    eun: 'PC',
    miniFactory: 'Valves_Division',
    line: 'A-EGR1 (EGR Valve)'
  },
  {
    id: 'plog-06',
    description: 'Electronic Throttle Body 48mm (ETB)',
    materialCode: '7.03703.49.0',
    reference: 'PROD-ORD-9101',
    mvt: '101',
    supplier: 'In-House Assembly Line A-ETB1',
    documentHeaderText: 'W1 ETB Production Run',
    po: 'N/A',
    plant: 'PL01',
    userName: 'Anand Rao (Supervisor)',
    cocd: 'AUTO1',
    item: '001',
    matDoc: '4900401',
    entryDate: '2026-08-08',
    quantity: 1600,
    eun: 'PC',
    miniFactory: 'Throttle_ETB',
    line: 'A-ETB1 (ETB 48mm)'
  }
];

/**
 * Raw Material Dedicated Customer/Batch Reservations
 */
export const INITIAL_RESERVATIONS: RMReservationItem[] = [
  {
    id: 'res-01',
    componentCode: 'RM-ROTOR-850',
    componentDescription: 'Precision Rotor Assembly 40mm',
    reservedForFGCode: '7.06496.03.0',
    reservedForFGDescription: 'Vacuum Pump Panther (A-PMP2)',
    customerName: 'TATA Motors Powertrain',
    reservedQty: 300,
    uom: 'PC',
    week: 3,
    validFromDate: '2026-08-17',
    validToDate: '2026-08-22',
    reason: 'Firm TATA OEM line feeding commitment - penalty clause on dry-out',
    status: 'ACTIVE',
    createdAt: '2026-08-18 10:30:00'
  },
  {
    id: 'res-02',
    componentCode: 'RM-MOTOR-DC12',
    componentDescription: 'Brushless DC High-Torque Stepper Motor 12V',
    reservedForFGCode: '7.02256.08.0',
    reservedForFGDescription: 'Electric EGR Valve Module Euro-6',
    customerName: 'Toyota Kirloskar Auto Parts',
    reservedQty: 400,
    uom: 'PC',
    week: 3,
    validFromDate: '2026-08-17',
    validToDate: '2026-08-22',
    reason: 'Dedicated Toyota Euro-6 line allocation',
    status: 'ACTIVE',
    createdAt: '2026-08-18 11:15:00'
  }
];
