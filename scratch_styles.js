import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  const ws = wb.getWorksheet('Convenio Corporativo (9 Eq)');
  console.log('Sheet 1 merges:', ws.model.merges);
  console.log('Sheet 1 views:', JSON.stringify(ws.views));
  console.log('Sheet 1 pageSetup:', JSON.stringify(ws.pageSetup));

  // Sample cell styling
  const sampleCells = ['B2', 'F2', 'B7', 'B13', 'C13', 'E13', 'F13', 'H13', 'B14', 'C14', 'D14', 'E14', 'F14', 'G14', 'H14', 'B17', 'E17', 'H17', 'B19', 'E19', 'H19', 'E21', 'H21', 'B24', 'B28', 'B33', 'B39'];
  for (const addr of sampleCells) {
    const cell = ws.getCell(addr);
    console.log(`\nCell ${addr}:`);
    console.log('  Value:', cell.value);
    console.log('  Font:', JSON.stringify(cell.font));
    console.log('  Fill:', JSON.stringify(cell.fill));
    console.log('  Alignment:', JSON.stringify(cell.alignment));
    console.log('  Border:', JSON.stringify(cell.border));
    console.log('  NumFmt:', cell.numFmt);
  }
}

main().catch(console.error);
