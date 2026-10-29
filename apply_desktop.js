import ExcelJS from 'exceljs';

async function applyToDesktop() {
  const desktopPath = 'C:/Users/Brilan/Desktop/Cotizacion_Formal_PCG_SPA.xlsx';
  const updatedTestPath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/updated_test.xlsx';

  // We can load updated_test.xlsx and write to Desktop path
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(updatedTestPath);

  await wb.xlsx.writeFile(desktopPath);
  console.log(`Successfully updated Desktop file: ${desktopPath}`);
}

applyToDesktop().catch(console.error);
