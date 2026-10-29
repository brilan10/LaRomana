import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  const ws = wb.getWorksheet('Convenio Corporativo (9 Eq)');
  console.log('Merges:', ws.model.merges.sort());
}

main().catch(console.error);
