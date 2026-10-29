import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  for (const sheetName of ['Opcion Esencial (Mantencion)', 'Opcion Avanzada (Super Pack)', '_DataGraficos']) {
    const ws = wb.getWorksheet(sheetName);
    console.log(`\n================== SHEET: ${ws.name} ==================`);
    for (let r = 1; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const cells = [];
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        let val = cell.value;
        if (val && typeof val === 'object') {
          if (val.formula) val = `=${val.formula} (${val.result})`;
          else if (val.richText) val = val.richText.map(t => t.text).join('');
        }
        cells.push(`${cell.address}: ${val}`);
      });
      if (cells.length > 0) {
        console.log(`Row ${r}: ` + cells.join(' | '));
      }
    }
  }
}

main().catch(console.error);
