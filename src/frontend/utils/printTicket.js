// printTicket.js - Utilidad para impresión de boletas térmicas en formato estándar 80mm (POS-80C / Modelo 8390)

export const printThermalTicket = ({
  tipo = 'corte', // 'corte' | 'producto' | 'pedido'
  folio = '',
  fecha = new Date(),
  cliente = 'Cliente General',
  rut = '',
  telefono = '',
  barbero = '',
  items = [], // Array de { nombre, cantidad, precio, subtotal }
  subtotal = 0,
  descuento = 0,
  total = 0,
  metodoPago = 'Efectivo',
  estado = 'PAGADO',
  cortesAcumulados = null,
  notas = ''
}) => {
  const fechaStr = fecha instanceof Date 
    ? fecha.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'medium' }) 
    : String(fecha);

  const subtotalNum = Number(subtotal || total);
  const descuentoNum = Number(descuento || 0);
  const totalNum = Number(total || (subtotalNum - descuentoNum));

  // Generar HTML optimizado para impresora térmica de 80mm de alto contraste y nitidez extrema
  const ticketHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket ${folio || 'La Romana'}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: geometricPrecision;
      color: #000000 !important;
    }
    body {
      width: 74mm;
      margin: 0 auto;
      padding: 3mm 2mm 15mm 2mm;
      font-family: 'Consolas', 'Courier New', 'Lucida Console', Monaco, monospace;
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.35;
      color: #000000;
      background: #ffffff;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: 900; }
    .title { 
      font-size: 16px; 
      font-weight: 900; 
      margin: 2px 0;
      letter-spacing: 0.5px;
    }
    .subtitle { 
      font-size: 11px; 
      font-weight: 700;
      margin-bottom: 2px; 
    }
    .divider {
      border-top: 1.5px dashed #000000;
      margin: 6px 0;
    }
    .double-divider {
      border-top: 2.5px solid #000000;
      margin: 7px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      font-weight: 700;
      margin: 5px 0;
    }
    th {
      border-bottom: 2px solid #000000;
      padding: 4px 0;
      text-align: left;
      font-size: 11.5px;
      font-weight: 900;
    }
    td {
      padding: 4px 0;
      vertical-align: top;
      font-weight: 700;
    }
    .total-box {
      font-size: 15px;
      font-weight: 900;
      padding: 6px 0;
      margin: 6px 0;
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
    }
    .footer {
      margin-top: 10px;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="text-center">
    <div class="title">💈 LA ROMANA BARBER SHOP 💈</div>
    <div class="subtitle">Copiapó, Atacama - Chile</div>
    <div class="subtitle">Atención y Estilo Exclusivo</div>
  </div>

  <div class="double-divider"></div>

  <div class="row"><span class="bold">COMPROBANTE:</span><span class="bold">${folio || 'TICKET DE VENTA'}</span></div>
  <div class="row"><span>FECHA:</span><span>${fechaStr}</span></div>
  <div class="row"><span class="bold">CLIENTE:</span><span class="bold">${cliente}</span></div>
  ${rut ? `<div class="row"><span>RUT:</span><span>${rut}</span></div>` : ''}
  ${telefono ? `<div class="row"><span>TELÉFONO:</span><span>${telefono}</span></div>` : ''}
  ${barbero ? `<div class="row"><span>ATENDIDO POR:</span><span class="bold">${barbero}</span></div>` : ''}
  <div class="row"><span>MÉTODO DE PAGO:</span><span class="bold">${metodoPago}</span></div>
  <div class="row"><span>ESTADO:</span><span class="bold">${estado.toUpperCase()}</span></div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th style="width: 50%;">DESCRIPCIÓN</th>
        <th style="width: 15%; text-align: center;">CANT</th>
        <th style="width: 35%; text-align: right;">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${items && items.length > 0 
        ? items.map(it => `
          <tr>
            <td style="font-weight: 800;">${it.nombre || 'Item'}</td>
            <td style="text-align: center; font-weight: 800;">${it.cantidad || 1}</td>
            <td style="text-align: right; font-weight: 800;">$${Number(it.subtotal || it.precio || 0).toLocaleString('es-CL')}</td>
          </tr>
        `).join('')
        : `<tr><td style="font-weight: 800;">Servicio de Barbería</td><td style="text-align:center; font-weight: 800;">1</td><td style="text-align:right; font-weight: 800;">$${totalNum.toLocaleString('es-CL')}</td></tr>`
      }
    </tbody>
  </table>

  <div class="divider"></div>

  ${descuentoNum > 0 ? `
    <div class="row"><span>SUBTOTAL:</span><span>$${subtotalNum.toLocaleString('es-CL')}</span></div>
    <div class="row"><span>DESCUENTO:</span><span>-$${descuentoNum.toLocaleString('es-CL')}</span></div>
  ` : ''}

  <div class="total-box row">
    <span>TOTAL PAGADO:</span>
    <span>$${totalNum.toLocaleString('es-CL')}</span>
  </div>

  ${cortesAcumulados !== null && cortesAcumulados !== undefined ? `
    <div class="divider"></div>
    <div class="text-center bold" style="font-size: 11px;">
      ✂️ CORTES ACUMULADOS: ${cortesAcumulados} / 4
    </div>
    <div class="text-center" style="font-size: 10px; font-weight: 700; margin-top: 2px;">
      ${cortesAcumulados >= 4 ? '🎉 ¡FELICIDADES! Reclama tu Decant VIP 10ml' : '¡Acumula 4 cortes y gana tu perfume Decant VIP!'}
    </div>
  ` : ''}

  ${notas ? `
    <div class="divider"></div>
    <div style="font-size: 10px; font-weight: 700;"><strong>NOTAS:</strong> ${notas}</div>
  ` : ''}

  <div class="double-divider"></div>

  <div class="footer">
    <div class="bold" style="font-size: 11px;">¡GRACIAS POR TU PREFERENCIA!</div>
    <div>www.laromanacopiapo.cl</div>
    <div>Instagram: @laromanabarber</div>
  </div>
  <br/>
</body>
</html>
  `;

  // Crear un iframe oculto para lanzar la impresión limpia sin salir de la página
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(ticketHtml);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow.print();
    } catch (e) {
      console.error("Error al imprimir ticket:", e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  }, 350);
};
