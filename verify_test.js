import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/updated_test.xlsx');

  console.log('Sheet names:', wb.worksheets.map(w => w.name));
  const ws = wb.getWorksheet('Super Pack + Antivirus (9 Eq)');

  console.log('\n--- VERIFYING ROWS AND VALUES ---');
  for (let r = 1; r <= 46; r++) {
    const row = ws.getRow(r);
    const cells = [];
    row.eachCell({ includeEmpty: false }, (cell, c) => {
      let val = cell.value;
      if (val && typeof val === 'object') {
        if (val.formula) val = `[=${val.formula} (${val.result})]`;
      }
      cells.push(`${cell.address}: ${val}`);
    });
    if (cells.length > 0) {
      console.log(`R${r}: ` + cells.join(' | '));
    }
  }
}

main().catch(console.error);
