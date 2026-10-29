import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const filePath = 'C:/Users/Brilan/.gemini/antigravity-ide/brain/a0487fa7-98ca-4d1f-8e25-3567bb0805ae/scratch/temp_cotiz.xlsx';
  await wb.xlsx.readFile(filePath);

  const ws = wb.getWorksheet('Convenio Corporativo (9 Eq)');
  console.log('Columns:');
  ws.columns.forEach((col, idx) => {
    console.log(`Col ${idx + 1} (${String.fromCharCode(65 + idx)}): width = ${col.width}`);
  });

  console.log('\nMerges:', ws.model.merges);

  console.log('\nAll Cells with Formatting:');
  for (let r = 1; r <= 45; r++) {
    const row = ws.getRow(r);
    console.log(`--- ROW ${r} (height: ${row.height}) ---`);
    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
        const addr = cell.address;
        const val = typeof cell.value === 'object' && cell.value.formula ? `[=${cell.value.formula} | res: ${cell.value.result}]` : cell.value;
        const font = cell.font ? `${cell.font.name} ${cell.font.size}pt bold:${!!cell.font.bold} color:${cell.font.color?.argb || 'theme'}` : 'none';
        const fill = cell.fill ? `${cell.fill.fgColor?.argb || 'none'}` : 'none';
        const align = cell.alignment ? `h:${cell.alignment.horizontal} v:${cell.alignment.vertical} wrap:${!!cell.alignment.wrapText}` : 'none';
        const numFmt = cell.numFmt || '';
        console.log(`  ${addr}: val="${val}" | font="${font}" | fill="${fill}" | align="${align}" | numFmt="${numFmt}"`);
      }
    }
  }
}

main().catch(console.error);
