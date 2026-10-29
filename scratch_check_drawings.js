import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  for (const ws of wb.worksheets) {
    console.log(`Sheet: ${ws.name}, images: ${ws.getImages().length}`);
    if (ws.model.drawing) {
      console.log(`  Drawing:`, ws.model.drawing);
    }
  }
}

main().catch(console.error);
