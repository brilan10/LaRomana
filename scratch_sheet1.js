import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  const ws = wb.getWorksheet('Convenio Corporativo (9 Eq)');
  console.log(`\n=== SHEET: ${ws.name} ===`);
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells = [];
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      let val = cell.value;
      if (val && typeof val === 'object') {
        if (val.formula) {
          val = `[FORMULA: =${val.formula} (${val.result})]`;
        } else if (val.richText) {
          val = val.richText.map(t => t.text).join('');
        } else {
          val = JSON.stringify(val);
        }
      }
      cells.push(`${cell.address}: ${val}`);
    });
    console.log(`Row ${rowNumber}: ` + cells.join(' | '));
  });
}

main().catch(console.error);
