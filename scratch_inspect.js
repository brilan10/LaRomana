import ExcelJS from 'exceljs';
import path from 'path';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  console.log('Worksheets:', wb.worksheets.map(ws => ws.name));

  for (const ws of wb.worksheets) {
    console.log(`\n================== SHEET: ${ws.name} (id: ${ws.id}) ==================`);
    console.log('Row count:', ws.rowCount, 'Col count:', ws.columnCount);
    
    // Print column widths
    const widths = ws.columns ? ws.columns.map((c, i) => `Col ${i+1}: ${c.width}`).join(', ') : 'none';
    console.log('Column widths:', widths);

    // Print all rows with content
    ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const cells = [];
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        let val = cell.value;
        if (val && typeof val === 'object') {
          if (val.formula) {
            val = `[FORMULA: =${val.formula} (result: ${val.result})]`;
          } else if (val.richText) {
            val = val.richText.map(t => t.text).join('');
          } else {
            val = JSON.stringify(val);
          }
        }
        cells.push(`[${cell.address}: ${val}]`);
      });
      console.log(`Row ${rowNumber}: ` + cells.join(' | '));
    });
  }
}

main().catch(err => console.error(err));
