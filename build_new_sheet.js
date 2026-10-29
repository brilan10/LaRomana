import ExcelJS from 'exceljs';
import path from 'path';

async function generateUpdatedWorkbook() {
  const sourcePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  const outputPath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/updated_test.xlsx';

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(sourcePath);

  // Check if sheet already exists and remove if so
  const existingWs = wb.getWorksheet('Super Pack + Antivirus (9 Eq)');
  if (existingWs) {
    wb.removeWorksheet(existingWs.id);
  }

  // Create new worksheet
  const ws = wb.addWorksheet('Super Pack + Antivirus (9 Eq)');

  // Set column widths matching Sheet 1
  ws.columns = [
    { width: 3.29 },  // A
    { width: 8.29 },  // B
    { width: 37.71 }, // C
    { width: 8.29 },  // D
    { width: 16.29 }, // E
    { width: 16.71 }, // F
    { width: 16.29 }, // G
    { width: 18.71 }, // H
    { width: 11.43 }  // I
  ];

  // Configure PageSetup
  ws.pageSetup = {
    fitToPage: true,
    margins: {
      left: 0.28,
      right: 0.28,
      top: 0.28,
      bottom: 0.28,
      header: 0.3,
      footer: 0.3
    },
    paperSize: 9, // A4
    orientation: 'portrait',
    scale: 80,
    fitToWidth: 1,
    fitToHeight: 1,
    horizontalCentered: true,
    verticalCentered: false
  };

  ws.views = [
    {
      workbookViewId: 0,
      state: 'normal',
      showGridLines: true,
      zoomScale: 100,
      activeCell: 'H23'
    }
  ];

  // Helper styles
  const FONT_TITLE = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  const FONT_SUBTITLE = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  const FONT_HEADER_TITLE = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF0F172A' } };
  const FONT_TH = { name: 'Segoe UI', size: 8, bold: true, color: { argb: 'FFFFFFFF' } };
  const FONT_TD = { name: 'Segoe UI', size: 9, bold: false, color: { argb: 'FF0F172A' } };
  const FONT_TD_BOLD = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  const FONT_TD_MUTED = { name: 'Segoe UI', size: 8, bold: false, color: { argb: 'FF64748B' } };
  const FONT_GREEN = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF15803D' } };
  const FONT_TOTAL_BANNER = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF15803D' } };
  const FONT_TOTAL_HDR = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  const FONT_TOTAL_VAL = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };

  const FILL_DARK = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  const FILL_SECTION = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
  const FILL_LIGHT_GRAY = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  const FILL_MINT = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
  const FILL_ICE_BLUE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
  const FILL_WHITE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  const FILL_PANEL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  const BORDER_HAIR = {
    top: { style: 'hair', color: { argb: 'FF94A3B8' } },
    left: { style: 'hair', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'hair', color: { argb: 'FF94A3B8' } },
    right: { style: 'hair', color: { argb: 'FF94A3B8' } }
  };

  const BORDER_LIGHT = {
    top: { style: 'hair', color: { argb: 'FFE2E8F0' } },
    left: { style: 'hair', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
    right: { style: 'hair', color: { argb: 'FFE2E8F0' } }
  };

  const BORDER_GREEN = {
    top: { style: 'thin', color: { argb: 'FF15803D' } },
    left: { style: 'thin', color: { argb: 'FF15803D' } },
    bottom: { style: 'thin', color: { argb: 'FF15803D' } },
    right: { style: 'thin', color: { argb: 'FF15803D' } }
  };

  const NUM_CURRENCY = '"$" #,##0';

  // Apply row heights
  ws.getRow(1).height = 10;
  ws.getRow(2).height = 20;
  ws.getRow(3).height = 15;
  ws.getRow(4).height = 14;
  ws.getRow(5).height = 14;
  ws.getRow(6).height = 8;
  ws.getRow(7).height = 18;
  ws.getRow(8).height = 14;
  ws.getRow(9).height = 14;
  ws.getRow(10).height = 14;
  ws.getRow(11).height = 14;
  ws.getRow(12).height = 8;
  ws.getRow(13).height = 24;
  ws.getRow(14).height = 36;
  ws.getRow(15).height = 36;
  ws.getRow(16).height = 36;
  ws.getRow(17).height = 32;
  ws.getRow(18).height = 32;
  ws.getRow(19).height = 20;
  ws.getRow(20).height = 8;
  ws.getRow(21).height = 18;
  ws.getRow(22).height = 18;
  ws.getRow(23).height = 22;
  ws.getRow(24).height = 18;
  ws.getRow(25).height = 8;
  ws.getRow(26).height = 18;
  ws.getRow(27).height = 32;
  ws.getRow(28).height = 32;
  ws.getRow(29).height = 18;
  ws.getRow(30).height = 8;
  ws.getRow(31).height = 18;
  ws.getRow(32).height = 14;
  ws.getRow(33).height = 14;
  ws.getRow(34).height = 14;
  ws.getRow(35).height = 8;
  ws.getRow(36).height = 18;
  ws.getRow(37).height = 14;
  ws.getRow(38).height = 14;
  ws.getRow(39).height = 14;
  ws.getRow(40).height = 14;
  ws.getRow(41).height = 8;
  ws.getRow(42).height = 16;
  ws.getRow(43).height = 10;
  ws.getRow(44).height = 14;
  ws.getRow(45).height = 14;
  ws.getRow(46).height = 14;

  // HEADER - PCG SPA
  ws.getCell('B2').value = 'PCG SPA';
  ws.getCell('B2').font = FONT_TITLE;
  ws.getCell('B2').alignment = { vertical: 'middle' };

  ws.getCell('F2').value = 'COTIZACION - SUPER PACK + ANTIVIRUS';
  ws.getCell('F2').font = FONT_HEADER_TITLE;
  ws.getCell('F2').alignment = { horizontal: 'right', vertical: 'middle' };

  ws.getCell('F3').value = 'Nro. Cotizacion:';
  ws.getCell('F3').font = FONT_TD_MUTED;
  ws.getCell('F3').alignment = { horizontal: 'right' };
  ws.getCell('H3').value = 'COT-2026-009-SUPERPACK-AV';
  ws.getCell('H3').font = FONT_SUBTITLE;
  ws.getCell('H3').alignment = { horizontal: 'right' };

  ws.getCell('B4').value = 'INGENIERIA EN SERVICIOS TI & MANTENCION CORPORATIVA';
  ws.getCell('B4').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF15803D' } };
  ws.getCell('F4').value = 'Fecha Emision:';
  ws.getCell('F4').font = FONT_TD_MUTED;
  ws.getCell('F4').alignment = { horizontal: 'right' };
  ws.getCell('H4').value = '21/10/2026';
  ws.getCell('H4').font = FONT_SUBTITLE;
  ws.getCell('H4').alignment = { horizontal: 'right' };

  ws.getCell('B5').value = 'RUT: 77.806.251-8  |  serviciotecnicopcg@gmail.com  |  +56 9 4938 4043';
  ws.getCell('B5').font = FONT_TD_MUTED;
  ws.getCell('F5').value = 'Validez Comercial:';
  ws.getCell('F5').font = FONT_TD_MUTED;
  ws.getCell('F5').alignment = { horizontal: 'right' };
  ws.getCell('H5').value = '15 dias habiles';
  ws.getCell('H5').font = FONT_SUBTITLE;
  ws.getCell('H5').alignment = { horizontal: 'right' };

  // PRESTADOR & CLIENTE BOXES
  ws.getCell('B7').value = 'DATOS DEL PRESTADOR (PCG SPA)';
  ws.getCell('B7').font = FONT_SUBTITLE;
  ws.getCell('B7').fill = FILL_SECTION;
  ws.getCell('B7').alignment = { vertical: 'middle' };

  ws.getCell('E7').value = 'DATOS DEL CLIENTE / RECEPTOR';
  ws.getCell('E7').font = FONT_SUBTITLE;
  ws.getCell('E7').fill = FILL_PANEL;
  ws.getCell('E7').alignment = { vertical: 'middle' };

  ws.getCell('B8').value = 'Razon Social:';
  ws.getCell('B8').font = FONT_TD_MUTED;
  ws.getCell('C8').value = 'PCG SPA';
  ws.getCell('C8').font = FONT_TD_BOLD;
  ws.getCell('E8').value = 'Cliente / Empresa:';
  ws.getCell('E8').font = FONT_TD_MUTED;
  ws.getCell('F8').value = '[NOMBRE O RAZON SOCIAL DEL CLIENTE]';
  ws.getCell('F8').font = FONT_TD_BOLD;

  ws.getCell('B9').value = 'RUT Emisor:';
  ws.getCell('B9').font = FONT_TD_MUTED;
  ws.getCell('C9').value = '77.806.251-8';
  ws.getCell('C9').font = FONT_TD;
  ws.getCell('E9').value = 'RUT Cliente:';
  ws.getCell('E9').font = FONT_TD_MUTED;
  ws.getCell('F9').value = '[XX.XXX.XXX-X]';
  ws.getCell('F9').font = FONT_TD;

  ws.getCell('B10').value = 'Giro Comercial:';
  ws.getCell('B10').font = FONT_TD_MUTED;
  ws.getCell('C10').value = 'Servicios TI, Soporte & Mantenimiento';
  ws.getCell('C10').font = FONT_TD;
  ws.getCell('E10').value = 'Contacto / Cargo:';
  ws.getCell('E10').font = FONT_TD_MUTED;
  ws.getCell('F10').value = '[NOMBRE DE CONTACTO / GERENCIA]';
  ws.getCell('F10').font = FONT_TD;

  ws.getCell('B11').value = 'Parque Objetivo:';
  ws.getCell('B11').font = FONT_TD_MUTED;
  ws.getCell('C11').value = '9 Equipos Informaticos (Super Pack Integral)';
  ws.getCell('C11').font = FONT_TD_BOLD;
  ws.getCell('E11').value = 'Direccion / Ciudad:';
  ws.getCell('E11').font = FONT_TD_MUTED;
  ws.getCell('F11').value = '[DIRECCION COMERCIAL, CIUDAD]';
  ws.getCell('F11').font = FONT_TD;

  // TABLE HEADERS (Row 13)
  const thHeaders = [
    { col: 'B', text: 'ITEM', align: 'center' },
    { col: 'C', text: 'SERVICIO / ESPECIFICACIONES TECNICAS', align: 'left' },
    { col: 'D', text: 'PARQUE', align: 'center' },
    { col: 'E', text: 'TARIFA NORMAL\n(UNITARIO)', align: 'right' },
    { col: 'F', text: 'TARIFA CONVENIO\n(UNITARIO)', align: 'right' },
    { col: 'G', text: 'AHORRO UNIT.\n(POR EQUIPO)', align: 'right' },
    { col: 'H', text: 'TOTAL CONVENIO\n(9 EQUIPOS)', align: 'right' }
  ];

  for (const th of thHeaders) {
    const c = ws.getCell(`${th.col}13`);
    c.value = th.text;
    c.font = FONT_TH;
    c.fill = FILL_DARK;
    c.alignment = { horizontal: th.align, vertical: 'middle', wrapText: true };
    c.border = BORDER_HAIR;
  }

  // TABLE ITEMS (Rows 14-18)
  const items = [
    {
      row: 14,
      item: 1,
      desc: 'Mantencion Preventiva de Hardware de PC\n(Desarme completo, limpieza profunda ultrasonica/aire, lubricacion de ventiladores y pasta termica premium certificada).',
      qty: '9 Eq.',
      normal: 45000,
      convenio: 40000
    },
    {
      row: 15,
      item: 2,
      desc: 'Instalacion de Sistema Operativo + Office + Optimizacion Avanzada\n(Formateo profesional en limpio, instalacion de Windows, suite Office corporativa, optimizacion de arranque y servicios sin bloatware).',
      qty: '9 Eq.',
      normal: 50000,
      convenio: 35000 // Exactamente $35.000 como pidió el usuario
    },
    {
      row: 16,
      item: 3,
      desc: 'Licencia Antivirus Comercial / Corporativo + Instalacion y Configuracion\n(Licencia oficial 1 ano + instalacion tecnica personalizada, activacion por equipo, proteccion en tiempo real y firewall configurado).',
      qty: '9 Eq.',
      normal: 38000,
      convenio: 24000 // Exactamente $24.000 (costo base $12k + instalación)
    },
    {
      row: 17,
      item: 4,
      desc: 'Actualizacion Integral de Drivers Oficiales y Programas Base\n(Tarifa normal: $20.000 drivers + $15.000 programas esenciales. 100% BONIFICADO por Convenio Super Pack para todo el parque).',
      qty: '9 Eq.',
      normal: 35000,
      convenio: 0
    },
    {
      row: 18,
      item: 5,
      desc: 'Dashboard de Inventario Tecnico Digitalizado & Ficha de Activos TI\n(Mapeo de hardware, componentes, estado de salud y ficha digital de los 9 equipos. 100% BONIFICADO dentro del Super Pack).',
      qty: '9 Eq.',
      normal: 60000,
      convenio: 0
    }
  ];

  for (const it of items) {
    const r = it.row;
    ws.getCell(`B${r}`).value = it.item;
    ws.getCell(`B${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell(`B${r}`).font = FONT_TD_BOLD;
    ws.getCell(`B${r}`).border = BORDER_HAIR;

    ws.getCell(`C${r}`).value = it.desc;
    ws.getCell(`C${r}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    ws.getCell(`C${r}`).font = FONT_TD;
    ws.getCell(`C${r}`).border = BORDER_HAIR;

    ws.getCell(`D${r}`).value = it.qty;
    ws.getCell(`D${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell(`D${r}`).font = FONT_TD;
    ws.getCell(`D${r}`).border = BORDER_HAIR;

    ws.getCell(`E${r}`).value = { formula: `${it.normal}`, result: it.normal };
    ws.getCell(`E${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
    ws.getCell(`E${r}`).font = { name: 'Segoe UI', size: 9, bold: false, color: { argb: 'FF64748B' } };
    ws.getCell(`E${r}`).fill = FILL_LIGHT_GRAY;
    ws.getCell(`E${r}`).border = BORDER_HAIR;
    ws.getCell(`E${r}`).numFmt = NUM_CURRENCY;

    ws.getCell(`F${r}`).value = { formula: `${it.convenio}`, result: it.convenio };
    ws.getCell(`F${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
    ws.getCell(`F${r}`).font = FONT_TD_BOLD;
    ws.getCell(`F${r}`).fill = FILL_WHITE;
    ws.getCell(`F${r}`).border = BORDER_HAIR;
    ws.getCell(`F${r}`).numFmt = NUM_CURRENCY;

    ws.getCell(`G${r}`).value = { formula: `F${r}-E${r}`, result: it.convenio - it.normal };
    ws.getCell(`G${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
    ws.getCell(`G${r}`).font = FONT_GREEN;
    ws.getCell(`G${r}`).fill = FILL_MINT;
    ws.getCell(`G${r}`).border = BORDER_HAIR;
    ws.getCell(`G${r}`).numFmt = NUM_CURRENCY;

    ws.getCell(`H${r}`).value = { formula: `F${r}*9`, result: it.convenio * 9 };
    ws.getCell(`H${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
    ws.getCell(`H${r}`).font = FONT_TD_BOLD;
    ws.getCell(`H${r}`).fill = FILL_ICE_BLUE;
    ws.getCell(`H${r}`).border = BORDER_HAIR;
    ws.getCell(`H${r}`).numFmt = NUM_CURRENCY;
  }

  // ROW 19: TOTAL POR UNIDAD (1 EQUIPO COMPLETO)
  ws.getCell('B19').value = 'TOTAL POR UNIDAD (1 EQUIPO COMPLETO):';
  ws.getCell('B19').font = FONT_TD_BOLD;
  ws.getCell('B19').fill = FILL_LIGHT_GRAY;
  ws.getCell('B19').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('B19').border = BORDER_HAIR;
  ws.getCell('C19').border = BORDER_HAIR;
  ws.getCell('D19').border = BORDER_HAIR;

  ws.getCell('E19').value = { formula: 'SUM(E14:E18)', result: 228000 };
  ws.getCell('E19').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF64748B' } };
  ws.getCell('E19').fill = FILL_LIGHT_GRAY;
  ws.getCell('E19').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E19').border = BORDER_HAIR;
  ws.getCell('E19').numFmt = NUM_CURRENCY;

  ws.getCell('F19').value = { formula: 'SUM(F14:F18)', result: 99000 };
  ws.getCell('F19').font = FONT_TD_BOLD;
  ws.getCell('F19').fill = FILL_LIGHT_GRAY;
  ws.getCell('F19').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('F19').border = BORDER_HAIR;
  ws.getCell('F19').numFmt = NUM_CURRENCY;

  ws.getCell('G19').value = { formula: 'SUM(G14:G18)', result: -129000 };
  ws.getCell('G19').font = FONT_GREEN;
  ws.getCell('G19').fill = FILL_MINT;
  ws.getCell('G19').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('G19').border = BORDER_HAIR;
  ws.getCell('G19').numFmt = NUM_CURRENCY;

  ws.getCell('H19').value = { formula: 'SUM(H14:H18)', result: 891000 };
  ws.getCell('H19').font = FONT_TD_BOLD;
  ws.getCell('H19').fill = FILL_ICE_BLUE;
  ws.getCell('H19').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('H19').border = BORDER_HAIR;
  ws.getCell('H19').numFmt = NUM_CURRENCY;

  // SUMMARY & TOTALS PANEL (Rows 21-24)
  const bannerText = `AHORRO RECORD SUPER PACK CONVENIO:
-$ 1.161.000 (-56.6% DE DESCUENTO TOTAL)
Subtotal Parque 9 Equipos (Tarifa Normal): $ 2.052.000
Total Final Parque 9 Equipos (Super Pack): $ 891.000
Ahorro directo garantizado de $ 129.000 por equipo completo.`;

  ws.getCell('B21').value = bannerText;
  ws.getCell('B21').font = FONT_TOTAL_BANNER;
  ws.getCell('B21').fill = FILL_MINT;
  ws.getCell('B21').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getCell('B21').border = BORDER_GREEN;

  // Border formatting for merged B21:D24 cells
  for (let r = 21; r <= 24; r++) {
    for (const col of ['B', 'C', 'D']) {
      ws.getCell(`${col}${r}`).border = BORDER_GREEN;
      ws.getCell(`${col}${r}`).fill = FILL_MINT;
    }
  }

  // Row 21: Subtotal
  ws.getCell('E21').value = 'Subtotal Global Parque (Tarifa Normal x 9 Eq.):';
  ws.getCell('E21').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF64748B' } };
  ws.getCell('E21').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E21').border = BORDER_LIGHT;
  ws.getCell('F21').border = BORDER_LIGHT;
  ws.getCell('G21').border = BORDER_LIGHT;
  ws.getCell('H21').value = { formula: 'E19*9', result: 2052000 };
  ws.getCell('H21').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF64748B' } };
  ws.getCell('H21').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('H21').border = BORDER_LIGHT;
  ws.getCell('H21').numFmt = NUM_CURRENCY;

  // Row 22: Descuento
  ws.getCell('E22').value = 'Descuento Super Pack Consolidado:';
  ws.getCell('E22').font = FONT_GREEN;
  ws.getCell('E22').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E22').border = BORDER_LIGHT;
  ws.getCell('F22').border = BORDER_LIGHT;
  ws.getCell('G22').border = BORDER_LIGHT;
  ws.getCell('H22').value = { formula: 'G19*9', result: -1161000 };
  ws.getCell('H22').font = FONT_GREEN;
  ws.getCell('H22').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('H22').border = BORDER_LIGHT;
  ws.getCell('H22').numFmt = NUM_CURRENCY;

  // Row 23: Total Final Global
  ws.getCell('E23').value = 'TOTAL FINAL GLOBAL SUPER PACK (9 EQ.):';
  ws.getCell('E23').font = FONT_TOTAL_HDR;
  ws.getCell('E23').fill = FILL_DARK;
  ws.getCell('E23').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E23').border = BORDER_LIGHT;
  ws.getCell('F23').fill = FILL_DARK;
  ws.getCell('F23').border = BORDER_LIGHT;
  ws.getCell('G23').fill = FILL_DARK;
  ws.getCell('G23').border = BORDER_LIGHT;
  ws.getCell('H23').value = { formula: 'H19', result: 891000 };
  ws.getCell('H23').font = FONT_TOTAL_VAL;
  ws.getCell('H23').fill = FILL_DARK;
  ws.getCell('H23').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('H23').border = BORDER_LIGHT;
  ws.getCell('H23').numFmt = NUM_CURRENCY;

  // Row 24: Tarifa Final Neta por equipo
  ws.getCell('E24').value = 'Tarifa Final Neta: $ 99.000 por equipo (Ahorro directo de $ 129.000 c/u - 56.6% DCTO)';
  ws.getCell('E24').font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: 'FF15803D' } };
  ws.getCell('E24').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E24').border = BORDER_LIGHT;
  ws.getCell('F24').border = BORDER_LIGHT;
  ws.getCell('G24').border = BORDER_LIGHT;
  ws.getCell('H24').border = BORDER_LIGHT;

  // ROW 26: SIMULACIONES ALTERNATIVAS MODULARES
  ws.getCell('B26').value = 'SIMULACIONES ALTERNATIVAS: SERVICIOS MODULARES (9 EQUIPOS)';
  ws.getCell('B26').font = FONT_SUBTITLE;
  ws.getCell('B26').fill = FILL_SECTION;
  ws.getCell('B26').alignment = { vertical: 'middle' };

  // SIM-1: Hardware exclusivo
  ws.getCell('B27').value = 'SIM-1';
  ws.getCell('B27').font = FONT_TD_BOLD;
  ws.getCell('B27').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell('B27').border = BORDER_HAIR;
  ws.getCell('C27').value = 'Mantencion Preventiva de Hardware Exclusiva Parque Completo\n(Desarme integral, limpieza ultrasonica/aire, cambio pasta termica premium y reporte individual).';
  ws.getCell('C27').font = FONT_TD;
  ws.getCell('C27').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  ws.getCell('C27').border = BORDER_HAIR;
  ws.getCell('D27').value = '9 Eq.';
  ws.getCell('D27').font = FONT_TD;
  ws.getCell('D27').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell('D27').border = BORDER_HAIR;
  ws.getCell('E27').value = { formula: 'E14', result: 45000 };
  ws.getCell('E27').font = { name: 'Segoe UI', size: 9, bold: false, color: { argb: 'FF64748B' } };
  ws.getCell('E27').fill = FILL_LIGHT_GRAY;
  ws.getCell('E27').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E27').border = BORDER_HAIR;
  ws.getCell('E27').numFmt = NUM_CURRENCY;
  ws.getCell('F27').value = { formula: 'F14', result: 40000 };
  ws.getCell('F27').font = FONT_TD_BOLD;
  ws.getCell('F27').fill = FILL_WHITE;
  ws.getCell('F27').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('F27').border = BORDER_HAIR;
  ws.getCell('F27').numFmt = NUM_CURRENCY;
  ws.getCell('G27').value = { formula: 'G14', result: -5000 };
  ws.getCell('G27').font = FONT_GREEN;
  ws.getCell('G27').fill = FILL_MINT;
  ws.getCell('G27').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('G27').border = BORDER_HAIR;
  ws.getCell('G27').numFmt = NUM_CURRENCY;
  ws.getCell('H27').value = { formula: 'F27*9', result: 360000 };
  ws.getCell('H27').font = FONT_TD_BOLD;
  ws.getCell('H27').fill = FILL_ICE_BLUE;
  ws.getCell('H27').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('H27').border = BORDER_HAIR;
  ws.getCell('H27').numFmt = NUM_CURRENCY;

  // SIM-2: Logico & Seguridad (SO + Antivirus)
  ws.getCell('B28').value = 'SIM-2';
  ws.getCell('B28').font = FONT_TD_BOLD;
  ws.getCell('B28').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell('B28').border = BORDER_HAIR;
  ws.getCell('C28').value = 'Servicio Logico & Seguridad: Sistema Operativo ($35.000) + Licencia Antivirus Instalada ($24.000)\n(Formateo en limpio, Office, drivers + Antivirus corporativo configurado en 9 equipos).';
  ws.getCell('C28').font = FONT_TD;
  ws.getCell('C28').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  ws.getCell('C28').border = BORDER_HAIR;
  ws.getCell('D28').value = '9 Eq.';
  ws.getCell('D28').font = FONT_TD;
  ws.getCell('D28').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell('D28').border = BORDER_HAIR;
  ws.getCell('E28').value = { formula: 'E15+E16', result: 88000 };
  ws.getCell('E28').font = { name: 'Segoe UI', size: 9, bold: false, color: { argb: 'FF64748B' } };
  ws.getCell('E28').fill = FILL_LIGHT_GRAY;
  ws.getCell('E28').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E28').border = BORDER_HAIR;
  ws.getCell('E28').numFmt = NUM_CURRENCY;
  ws.getCell('F28').value = { formula: 'F15+F16', result: 59000 };
  ws.getCell('F28').font = FONT_TD_BOLD;
  ws.getCell('F28').fill = FILL_WHITE;
  ws.getCell('F28').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('F28').border = BORDER_HAIR;
  ws.getCell('F28').numFmt = NUM_CURRENCY;
  ws.getCell('G28').value = { formula: 'F28-E28', result: -29000 };
  ws.getCell('G28').font = FONT_GREEN;
  ws.getCell('G28').fill = FILL_MINT;
  ws.getCell('G28').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('G28').border = BORDER_HAIR;
  ws.getCell('G28').numFmt = NUM_CURRENCY;
  ws.getCell('H28').value = { formula: 'F28*9', result: 531000 };
  ws.getCell('H28').font = FONT_TD_BOLD;
  ws.getCell('H28').fill = FILL_ICE_BLUE;
  ws.getCell('H28').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('H28').border = BORDER_HAIR;
  ws.getCell('H28').numFmt = NUM_CURRENCY;

  // Row 29: Notes on simulations
  ws.getCell('B29').value = '* Proyecciones Modulares: Opcion 1 (Solo Hardware): $ 360.000 | Opcion 2 (SO + Antivirus): $ 531.000 | Super Pack Total (Todo Incluido): $ 891.000.';
  ws.getCell('B29').font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: 'FF0F172A' } };
  ws.getCell('B29').fill = FILL_PANEL;
  ws.getCell('B29').alignment = { vertical: 'middle' };

  // ROW 31: VENTAJAS DE INGENIERIA TITULADA PCG SPA
  ws.getCell('B31').value = 'VENTAJAS DE INGENIERIA TITULADA PCG SPA VS SERVICIOS INFORMALES DEL MERCADO';
  ws.getCell('B31').font = FONT_SUBTITLE;
  ws.getCell('B31').fill = FILL_SECTION;
  ws.getCell('B31').alignment = { vertical: 'middle' };

  ws.getCell('B32').value = '- Profesionales Titulados: Atencion directa ejecutada por Ingenieros e Informaticos titulados (garantiza cero improvisacion).';
  ws.getCell('B32').font = FONT_TD_MUTED;
  ws.getCell('B33').value = '- Insumos Certificados: Pasta termica premium de alta conductividad (reduccion termica comprobada de hasta 37 C en procesadores).';
  ws.getCell('B33').font = FONT_TD_MUTED;
  ws.getCell('B34').value = '- Seguridad y Estabilidad: Antivirus comercial con licencia oficial por 1 ano, SO optimizado sin bloatware y 30 dias de garantia.';
  ws.getCell('B34').font = FONT_TD_MUTED;

  // ROW 36: CONDICIONES COMERCIALES & DATOS BANCARIOS
  ws.getCell('B36').value = 'CONDICIONES COMERCIALES';
  ws.getCell('B36').font = FONT_SUBTITLE;
  ws.getCell('B36').fill = FILL_SECTION;
  ws.getCell('B36').alignment = { vertical: 'middle' };

  ws.getCell('E36').value = 'DATOS PARA TRANSFERENCIA BANCARIA (BANCO EDWARDS / CHILE)';
  ws.getCell('E36').font = FONT_SUBTITLE;
  ws.getCell('E36').fill = FILL_PANEL;
  ws.getCell('E36').alignment = { vertical: 'middle' };

  ws.getCell('B37').value = '- Forma de Pago: 50% anticipo y 50% recepcion conforme.';
  ws.getCell('B37').font = FONT_TD_MUTED;
  ws.getCell('E37').value = 'Banco: Banco Edwards / Banco de Chile';
  ws.getCell('E37').font = FONT_TD_MUTED;

  ws.getCell('B38').value = '- Tiempo de Ejecucion: 1 a 2 jornadas habiles coordinadas.';
  ws.getCell('B38').font = FONT_TD_MUTED;
  ws.getCell('E38').value = 'Tipo de Cuenta: Cuenta Corriente Comercial';
  ws.getCell('E38').font = FONT_TD_MUTED;

  ws.getCell('B39').value = '- Garantia Tecnica: 30 dias de soporte integral sobre trabajos.';
  ws.getCell('B39').font = FONT_TD_MUTED;
  ws.getCell('E39').value = 'Nro. de Cuenta: 001182166501';
  ws.getCell('E39').font = FONT_TD_MUTED;

  ws.getCell('B40').value = '- Validez de la Oferta: 15 dias habiles desde la emision.';
  ws.getCell('B40').font = FONT_TD_MUTED;
  ws.getCell('E40').value = 'Titular: PCG SPA  |  RUT: 77.806.251-8  |  serviciotecnicopcg@gmail.com';
  ws.getCell('E40').font = FONT_TD_MUTED;

  // ROW 42: PIE DE GARANTIA
  ws.getCell('B42').value = 'Garantia tecnica de 30 dias sobre hardware, optimizacion logica, antivirus y configuracion. PCG SPA - Soluciones Informaticas Especializadas.';
  ws.getCell('B42').font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: 'FF64748B' } };
  ws.getCell('B42').alignment = { horizontal: 'center', vertical: 'middle' };

  // ROW 44-46: FIRMAS
  ws.getCell('B44').value = '_________________________________________';
  ws.getCell('B44').font = { name: 'Segoe UI', size: 9, color: { argb: 'FF94A3B8' } };
  ws.getCell('B44').alignment = { horizontal: 'center' };
  ws.getCell('E44').value = '_________________________________________';
  ws.getCell('E44').font = { name: 'Segoe UI', size: 9, color: { argb: 'FF94A3B8' } };
  ws.getCell('E44').alignment = { horizontal: 'center' };

  ws.getCell('B45').value = 'PCG SPA - Area de Servicios Tecnicos TI';
  ws.getCell('B45').font = FONT_TD_BOLD;
  ws.getCell('B45').alignment = { horizontal: 'center' };
  ws.getCell('E45').value = 'Firma y Aceptacion Conforme del Cliente';
  ws.getCell('E45').font = FONT_TD_BOLD;
  ws.getCell('E45').alignment = { horizontal: 'center' };

  ws.getCell('B46').value = 'Firma y Timbre Prestador';
  ws.getCell('B46').font = FONT_TD_MUTED;
  ws.getCell('B46').alignment = { horizontal: 'center' };
  ws.getCell('E46').value = 'RUT / Representante Legal Empresa';
  ws.getCell('E46').font = FONT_TD_MUTED;
  ws.getCell('E46').alignment = { horizontal: 'center' };

  // MERGES
  const merges = [
    'B2:D3',
    'F2:H2',
    'B4:D4',
    'B5:D5',
    'B7:D7',
    'E7:H7',
    'B19:D19',
    'B21:D24',
    'E21:G21',
    'E22:G22',
    'E23:G23',
    'E24:H24',
    'B26:H26',
    'B29:H29',
    'B31:H31',
    'B36:D36',
    'E36:H36',
    'B42:H42',
    'B44:D44',
    'E44:H44',
    'B45:D45',
    'E45:H45',
    'B46:D46',
    'E46:H46'
  ];

  for (const m of merges) {
    ws.mergeCells(m);
  }

  await wb.xlsx.writeFile(outputPath);
  console.log(`Updated test workbook written successfully to ${outputPath}`);
}

generateUpdatedWorkbook().catch(console.error);
