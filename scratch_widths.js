import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  const ws = wb.getWorksheet('Convenio Corporativo (9 Eq)');
  for (let c = 1; c <= 9; c++) {
    const col = ws.getColumn(c);
    const letter = String.fromCharCode(64 + c);
    console.log(`Col ${letter} (${c}): width = ${col.width}`);
  }
}

main().catch(console.error);
