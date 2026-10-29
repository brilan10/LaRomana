import React, { useState, useEffect } from 'react';
import { API_URL } from '../App';
import { printThermalTicket, printLiquidacionTicket } from '../utils/printTicket';
import { formatRut } from '../utils/rut';

export default function PosTrabajador({ session }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [ultimoCobroInfo, setUltimoCobroInfo] = useState(null);
  const [agendados, setAgendados] = useState([]);

  // Helpers de fechas dinámicas (Punto 4: Agenda para hoy, mañana, pasado mañana)
  const getOffsetDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const hoyISO = getOffsetDate(0);
  const mananaISO = getOffsetDate(1);
  const pasadoMananaISO = getOffsetDate(2);

  const [fechaAgenda, setFechaAgenda] = useState(hoyISO);
  
  // Resumen de citas para próximos días y citas generales
  const [resumenAgenda, setResumenAgenda] = useState({});
  const [proximasCitas, setProximasCitas] = useState([]);

  // States for Express Booking
  const [showExpress, setShowExpress] = useState(false);
  const [expressData, setExpressData] = useState({ 
    nombre: '', 
    rut: '', 
    hora: '10:00',
    fecha: hoyISO,
    cliente_id: null
  });
  const [expressSugerencias, setExpressSugerencias] = useState([]);
  const [showDropdownExpress, setShowDropdownExpress] = useState(false);
  const [buscandoClienteExpress, setBuscandoClienteExpress] = useState(false);
  const [expressClienteEncontrado, setExpressClienteEncontrado] = useState(null);

  const HORAS_DISPONIBLES = [
    '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // States for Payment (Punto 5: Reemplazar Descuento por Otro Valor)
  const [otroValor, setOtroValor] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [aromaVIP, setAromaVIP] = useState('');

  // States for Worker Payments View
  const [showMisPagos, setShowMisPagos] = useState(false);
  const [misPagosList, setMisPagosList] = useState([]);
  const [loadingMisPagos, setLoadingMisPagos] = useState(false);

  const fetchMisPagos = async () => {
    if (!session?.usuario?.id) return;
    setLoadingMisPagos(true);
    try {
      const res = await fetch(`${API_URL}/api.php?action=get_mis_pagos_trabajador&trabajador_id=${session.usuario.id}`);
      const data = await res.json();
      setMisPagosList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching mis pagos:", e);
    } finally {
      setLoadingMisPagos(false);
    }
  };

  const fetchAgenda = (fechaTarget) => {
    if (session?.usuario?.id) {
      const f = fechaTarget || fechaAgenda;
      fetch(`${API_URL}/api.php?action=get_citas_trabajador&trabajador_id=${session.usuario.id}&fecha=${f}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) setAgendados(Array.isArray(data) ? data : []);
        })
        .catch(e => console.error("Error fetching citas:", e));

      // Cargar conteo de citas para hoy, mañana, pasado mañana
      fetch(`${API_URL}/api.php?action=get_resumen_agenda_trabajador&trabajador_id=${session.usuario.id}`)
        .then(r => r.json())
        .then(data => {
          if (data && typeof data === 'object') setResumenAgenda(data);
        })
        .catch(() => {});

      // Cargar próximas citas del barbero
      fetch(`${API_URL}/api.php?action=get_proximas_citas_trabajador&trabajador_id=${session.usuario.id}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setProximasCitas(data);
        })
        .catch(() => {});
    }
  };

  const cambiarFechaAgenda = (nuevaFecha) => {
    setFechaAgenda(nuevaFecha);
    setExpressData(prev => ({ ...prev, fecha: nuevaFecha }));
    fetchAgenda(nuevaFecha);
  };

  useEffect(() => {
    fetchAgenda(fechaAgenda);

    const intervalId = setInterval(() => fetchAgenda(fechaAgenda), 10000);
    const onFocus = () => fetchAgenda(fechaAgenda);
    const onVisibility = () => { if (!document.hidden) fetchAgenda(fechaAgenda); };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [session, fechaAgenda]);

  const handleCambiarClave = async () => {
    const newPass = prompt("Ingresa tu nueva contraseña secreta:");
    if (!newPass) return;
    
    try {
      const res = await fetch(`${API_URL}/api.php?action=update_password_trabajador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trabajador_id: session.usuario.id, new_password: newPass })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("¡Tu contraseña ha sido actualizada exitosamente!");
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error cambiando contraseña.");
    }
  };

  const buscarClientesExpress = async (query, sourceField) => {
    const qTrim = (query || '').trim();
    if (qTrim.length < 2) {
      setExpressSugerencias([]);
      setShowDropdownExpress(false);
      return;
    }
    setBuscandoClienteExpress(true);
    try {
      const resp = await fetch(`${API_URL}/api.php?action=search_clientes&q=${encodeURIComponent(qTrim)}`);
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        setExpressSugerencias(data);
        setShowDropdownExpress(true);

        // Si es búsqueda por RUT y coincide exactamente con un cliente registrado
        if (sourceField === 'rut') {
          const clean = qTrim.replace(/[^0-9kK]/g, '').toUpperCase();
          const exact = data.find(c => (c.rut || '').replace(/[^0-9kK]/gi, '').toUpperCase() === clean);
          if (exact) {
            setExpressClienteEncontrado(exact);
            setExpressData(prev => ({
              ...prev,
              rut: exact.rut || prev.rut,
              nombre: exact.nombre && !exact.nombre.startsWith('Cliente ') ? exact.nombre : prev.nombre,
              cliente_id: exact.id
            }));
          }
        }
        // Si es búsqueda por Nombre y coincide exactamente con un cliente registrado
        if (sourceField === 'nombre') {
          const exactName = data.find(c => (c.nombre || '').trim().toLowerCase() === qTrim.toLowerCase());
          if (exactName) {
            setExpressClienteEncontrado(exactName);
            setExpressData(prev => ({
              ...prev,
              rut: exactName.rut || prev.rut,
              nombre: exactName.nombre,
              cliente_id: exactName.id
            }));
          }
        }
      } else {
        setExpressSugerencias([]);
        setShowDropdownExpress(false);
        setExpressClienteEncontrado(null);
      }
    } catch (err) {
      setExpressSugerencias([]);
      setShowDropdownExpress(false);
    } finally {
      setBuscandoClienteExpress(false);
    }
  };

  const handleRutChangeExpress = (rawVal) => {
    const formatted = formatRut(rawVal);
    setExpressData(prev => ({ ...prev, rut: formatted }));
    buscarClientesExpress(rawVal, 'rut');
  };

  const handleNombreChangeExpress = (rawVal) => {
    setExpressData(prev => ({ ...prev, nombre: rawVal }));
    buscarClientesExpress(rawVal, 'nombre');
  };

  const seleccionarSugerenciaExpress = (cli) => {
    setExpressData(prev => ({
      ...prev,
      rut: cli.rut || prev.rut,
      nombre: cli.nombre || prev.nombre,
      cliente_id: cli.id
    }));
    setExpressClienteEncontrado(cli);
    setExpressSugerencias([]);
    setShowDropdownExpress(false);
  };

  // PUNTO 4: Barbero agenda citas express para cualquier día (hoy, mañana, pasado mañana) con autocompletado y cartera de clientes
  const handleAgendarExpress = async (e) => {
    e.preventDefault();
    try {
      const fechaParaAgendar = expressData.fecha || fechaAgenda || hoyISO;
      const rutTrim = (expressData.rut || '').trim();
      const nombreTrim = (expressData.nombre || '').trim();

      if (!rutTrim && !nombreTrim) {
        alert('⚠️ Por favor ingresa el RUT o el Nombre del cliente para agendar.');
        return;
      }
      
      // Validar limitación de horario (10:00 a 19:00 hrs)
      const horaSel = expressData.hora || '10:00';
      const [h, m] = horaSel.split(':').map(Number);
      if (isNaN(h) || h < 10 || h > 19 || (h === 19 && m > 0)) {
        alert('⚠️ El horario de atención es exclusivamente de 10:00 a 19:00 hrs. Selecciona una hora dentro de este rango.');
        return;
      }

      const res = await fetch(`${API_URL}/api.php?action=agendar_cita`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: expressData.cliente_id || null,
          rut: rutTrim || null,
          nombre: nombreTrim || null,
          trabajador_id: session.usuario.id,
          fecha: fechaParaAgendar,
          hora: horaSel,
          es_staff: true,
          servicios: [1]
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        const clienteMsg = nombreTrim || rutTrim || 'Cliente';
        alert(`¡Cita agendada con éxito para ${clienteMsg} el día ${fechaParaAgendar} a las ${horaSel} hrs!`);
        setShowExpress(false);
        setExpressData({ nombre: '', rut: '', hora: '10:00', fecha: fechaParaAgendar, cliente_id: null });
        setExpressSugerencias([]);
        setShowDropdownExpress(false);
        setExpressClienteEncontrado(null);
        // Cambiar inmediatamente la vista al día de la cita para que se visualice
        cambiarFechaAgenda(fechaParaAgendar);
      } else {
        alert('⚠️ ' + (data.error || data.message || "Error al agendar"));
      }
    } catch (error) {
      console.error('Error agendando cita:', error);
      alert("Error de red al agendar. Verifica tu conexión.");
    }
  };

  const checkVip = () => {
    const isVip = Number(selectedClient.cortes || 0) >= 4 || Number(selectedClient.cortes_acumulados || 0) >= 3;
    if (isVip && !aromaVIP) {
      setAromaVIP('Decant Creed Aventus 10ml');
    }
    return true;
  };

  // PUNTO 5: Cobro con "Otro Valor" en vez de Descuento
  const handleCobrarAqui = async () => {
    if (!checkVip()) return;
    const basePrice = Number(selectedClient.precio || selectedClient.monto || 14000);
    // Si especificó "Otro Valor", se cobra ese valor exacto; si no, el valor base del servicio
    const totVal = (otroValor !== '' && !isNaN(Number(otroValor)) && Number(otroValor) >= 0) 
      ? Number(otroValor) 
      : basePrice;
    const subVal = totVal;
    const aromaFinal = aromaVIP || ((Number(selectedClient.cortes || 0) >= 4 || Number(selectedClient.cortes_acumulados || 0) >= 3) ? 'Decant Creed Aventus 10ml' : null);

    const ticketItems = [
      {
        nombre: selectedClient.servicio_nombre || 'Servicio de Barbería',
        cantidad: 1,
        precio: subVal,
        subtotal: subVal
      }
    ];

    if (aromaFinal) {
      ticketItems.push({
        nombre: `🎁 REGALO VIP: ${aromaFinal}`,
        cantidad: 1,
        precio: 0,
        subtotal: 0
      });
    }

    const ticketData = {
      tipo: 'corte',
      folio: `LR-CITA-${String(selectedClient.id).padStart(4, '0')}`,
      fecha: new Date(),
      cliente: selectedClient.nombre || 'Cliente General',
      rut: selectedClient.rut || '',
      telefono: selectedClient.telefono || '',
      barbero: session?.usuario?.nombre || 'Barbero Staff',
      items: ticketItems,
      subtotal: subVal,
      descuento: 0,
      total: totVal,
      metodoPago: metodoPago,
      estado: 'PAGADO',
      cortesAcumulados: selectedClient.cortes !== undefined ? (selectedClient.cortes + 1) : null
    };

    try {
      const res = await fetch(`${API_URL}/api.php?action=finalizar_cita`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cita_id: selectedClient.id,
          subtotal: totVal,
          monto: totVal,
          descuento: 0,
          metodo_pago: metodoPago,
          aroma_decant: aromaFinal,
          decant_entregado: aromaFinal
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUltimoCobroInfo(ticketData);
        setIsPaid(true);
      } else {
        alert(data.error || 'Error al procesar el cobro.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al procesar cobro.');
    }
  };

  const handleDerivarCaja = async () => {
    if (!checkVip()) return;
    const aromaFinal = aromaVIP || ((Number(selectedClient.cortes || 0) >= 4 || Number(selectedClient.cortes_acumulados || 0) >= 3) ? 'Decant Creed Aventus 10ml' : null);
    try {
      const res = await fetch(`${API_URL}/api.php?action=derivar_a_caja`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cita_id: selectedClient.id,
          aroma_decant: aromaFinal,
          decant_entregado: aromaFinal
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Cliente derivado a caja. El administrador finalizará el pago.");
        setSelectedClient(null);
        setAromaVIP('');
        setOtroValor('');
        fetchAgenda(fechaAgenda);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (selectedClient) {
    if (isPaid) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: '420px', margin: '0 auto', padding: '30px 20px', border: '2px solid var(--gold-jewel)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>💳</div>
            <h2 style={{ color: 'var(--gold-jewel)', margin: '0 0 10px 0' }}>¡Cobro Realizado con Éxito!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              El pago se ha procesado con éxito y la cita se cerró.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ultimoCobroInfo && (
                <button 
                  className="btn-primary" 
                  style={{ padding: '12px', fontWeight: 'bold', fontSize: '0.95rem' }} 
                  onClick={() => printThermalTicket(ultimoCobroInfo)}
                >
                  🖨️ Imprimir Boleta Térmica (POS-80)
                </button>
              )}
              <button 
                className="btn-outline-gold" 
                style={{ padding: '10px' }} 
                onClick={() => {
                  setIsPaid(false);
                  setSelectedClient(null);
                  setAromaVIP('');
                  setOtroValor('');
                  setUltimoCobroInfo(null);
                  fetchAgenda(fechaAgenda);
                }}
              >
                Volver a la Agenda
              </button>
            </div>
          </div>
        </div>
      );
    }

    const isVip = Number(selectedClient.cortes || 0) >= 4 || Number(selectedClient.cortes_acumulados || 0) >= 3;
    const basePrice = Number(selectedClient.precio || selectedClient.monto || 14000);
    const valorCalculado = (otroValor !== '' && !isNaN(Number(otroValor)) && Number(otroValor) >= 0) 
      ? Number(otroValor) 
      : basePrice;

    return (
      <div style={{ padding: '20px 0' }}>
        <button onClick={() => { setSelectedClient(null); setOtroValor(''); }} className="btn-img-action" style={{ width: '120px', marginBottom: '15px' }}>
          <img src="/botones/boton_volver.png" alt="Volver a Agenda" style={{ height: '36px', objectFit: 'contain' }} />
        </button>

        <div className={`card ${isVip ? 'vip-alert' : ''}`} style={{ textAlign: 'center', marginBottom: '20px' }}>
          {isVip && (
            <div style={{ padding: '15px', marginBottom: '20px', background: 'var(--gold-jewel)', color: '#000', borderRadius: '8px', animation: 'vip-pulse 1s infinite', border: '2px solid #FFF' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>🎉 ¡PREMIO VIP ALCANZADO!</h3>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>🎁 Entregar Decant VIP de 10ml</p>
            </div>
          )}
          
          <img 
            src={selectedClient.foto || 'https://via.placeholder.com/100'} 
            alt={selectedClient.nombre} 
            style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '15px', objectFit: 'cover', border: isVip ? '3px solid var(--gold-jewel)' : '2px solid transparent' }} 
          />
          <h2 style={{ marginBottom: '5px' }}>{selectedClient.nombre}</h2>
          <div style={{ display: 'inline-block', background: 'var(--bg-charcoal)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--gold-jewel)' }}>
            Cortes acumulados: {selectedClient.cortes_acumulados || selectedClient.cortes || 0}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--gold-jewel)' }}>Cierre de Cita</h3>
          
          {isVip && (
            <div style={{ marginBottom: '20px', background: 'rgba(212, 175, 55, 0.1)', padding: '15px', borderRadius: '10px', border: '1px solid var(--gold-jewel)' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gold-jewel)', fontWeight: 'bold' }}>
                🎁 Aroma del Decant Entregado:
              </label>
              <select className="input-field" value={aromaVIP} onChange={e => setAromaVIP(e.target.value)}>
                <option value="Decant Creed Aventus 10ml">💎 Creed Aventus (10ml)</option>
                <option value="Decant Tom Ford Oud Wood 10ml">💎 Tom Ford Oud Wood (10ml)</option>
                <option value="Decant Dior Sauvage Elixir 10ml">💎 Dior Sauvage Elixir (10ml)</option>
                <option value="Decant Bleu de Chanel 10ml">💎 Bleu de Chanel (10ml)</option>
                <option value="Decant Jean Paul Gaultier 10ml">💎 Jean Paul Gaultier Le Male (10ml)</option>
                <option value="Decant VIP de Cortesía 10ml">✨ Decant VIP de Cortesía (10ml)</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Servicios Realizados</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Corte de pelo degradado ($14.000)', 'Corte clásico ($12.000)', 'Corte de Barba ($8.000)', 'Corte y barba ($20.000)'].map(servicio => (
                <div key={servicio} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-charcoal)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '1rem', color: '#fff' }}>✂️ {servicio}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* PUNTO 5: REEMPLAZAR BOTÓN DESCUENTO POR OTRO VALOR EN EL PERFIL DEL BARBERO */}
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.25)', marginBottom: '20px' }}>
             <h4 style={{ color: 'var(--gold-jewel)', marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span>💵</span> Opciones de Cobro
             </h4>
             <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                   <label style={{ fontSize: '0.8rem', color: '#ccc', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                     <strong>Otro Valor ($):</strong>
                     <span style={{ color: 'var(--gold-jewel)', fontSize: '0.72rem' }}>Modificar precio</span>
                   </label>
                   <input 
                     type="number" 
                     className="input-field" 
                     value={otroValor} 
                     onChange={e => setOtroValor(e.target.value)} 
                     placeholder={`Normal: $${basePrice.toLocaleString('es-CL')}`} 
                     style={{ margin: 0, fontWeight: 'bold' }}
                   />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                   <label style={{ fontSize: '0.8rem', color: '#ccc', display: 'block', marginBottom: '4px' }}>Método de Pago</label>
                   <select className="input-field" value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ margin: 0 }}>
                     <option value="Efectivo">Efectivo</option>
                     <option value="Transferencia">Transferencia</option>
                     <option value="Tarjeta">Tarjeta</option>
                   </select>
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.12)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--gold-jewel)' }}>
               <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Total a Cobrar:</span>
               <strong style={{ fontSize: '1.25rem', color: 'var(--gold-jewel)' }}>
                 ${valorCalculado.toLocaleString('es-CL')}
               </strong>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
             <button onClick={handleDerivarCaja} className="btn-romana" style={{ flex: 1, backgroundColor: 'transparent', height: '48px' }}>
                <span className="icon-separator">📥</span> DERIVAR A CAJA
             </button>
             <button onClick={handleCobrarAqui} className="btn-img-action" style={{ flex: 1, maxWidth: '200px' }}>
                <img src="/botones/boton_cobrar.png" alt="Cobrar Aquí" style={{ height: '48px', objectFit: 'contain' }} />
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      
      {/* Barra de Título y Botones de Acción */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: 'var(--gold-jewel)', margin: 0, fontSize: '1.4rem' }}>
            Mi Agenda 
            <span style={{ fontSize: '0.95rem', color: '#aaa', fontWeight: 'normal', marginLeft: '8px' }}>
              ({fechaAgenda === hoyISO ? 'Hoy' : (fechaAgenda === mananaISO ? 'Mañana' : (fechaAgenda === pasadoMananaISO ? 'Pasado Mañana' : fechaAgenda))})
            </span>
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>
            Revisa o agenda horas para hoy o fechas futuras.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
           <button className="btn-romana" style={{ fontSize: '0.8rem', padding: '6px 14px', backgroundColor: 'rgba(46, 204, 113, 0.15)', borderColor: '#2ecc71', color: '#2ecc71' }} onClick={() => { setShowMisPagos(true); fetchMisPagos(); }}>
             <span className="icon-separator" style={{ minHeight: '22px', fontSize: '1.1rem', paddingRight: '6px', marginRight: '6px' }}>💰</span> MIS PAGOS
           </button>
           <button className="btn-img-action" style={{ width: '130px' }} onClick={() => setShowExpress(!showExpress)}>
             <img src="/botones/boton_agendar_hora.png" alt="Agendar" style={{ height: '38px', objectFit: 'contain' }} />
           </button>
           <button className="btn-romana" style={{ fontSize: '0.8rem', padding: '5px 15px', backgroundColor: 'transparent' }} onClick={handleCambiarClave}>
             <span className="icon-separator" style={{ minHeight: '25px', fontSize: '1.2rem', paddingRight: '10px', marginRight: '10px' }}>🔐</span> CLAVE
           </button>
        </div>
      </div>

      {/* PUNTO 4: SELECTOR DE FECHAS DE LA AGENDA DEL BARBERO (HOY, MAÑANA, PASADO MAÑANA, ETC) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        background: 'rgba(255,255,255,0.03)', 
        padding: '10px 14px', 
        borderRadius: '10px', 
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--gold-jewel)', fontWeight: 'bold' }}>📅 Ver día:</span>
        
        <button 
          type="button"
          onClick={() => cambiarFechaAgenda(hoyISO)}
          style={{
            background: fechaAgenda === hoyISO ? 'var(--gold-jewel)' : 'rgba(0,0,0,0.4)',
            color: fechaAgenda === hoyISO ? '#000' : '#fff',
            border: fechaAgenda === hoyISO ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: fechaAgenda === hoyISO ? 'bold' : 'normal',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          📌 Hoy
          {resumenAgenda[hoyISO] ? (
            <span style={{ background: fechaAgenda === hoyISO ? '#000' : 'var(--gold-jewel)', color: fechaAgenda === hoyISO ? '#fff' : '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {resumenAgenda[hoyISO]}
            </span>
          ) : null}
        </button>

        <button 
          type="button"
          onClick={() => cambiarFechaAgenda(mananaISO)}
          style={{
            background: fechaAgenda === mananaISO ? 'var(--gold-jewel)' : 'rgba(0,0,0,0.4)',
            color: fechaAgenda === mananaISO ? '#000' : '#fff',
            border: fechaAgenda === mananaISO ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: fechaAgenda === mananaISO ? 'bold' : 'normal',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ☀️ Mañana
          {resumenAgenda[mananaISO] ? (
            <span style={{ background: fechaAgenda === mananaISO ? '#000' : 'var(--gold-jewel)', color: fechaAgenda === mananaISO ? '#fff' : '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {resumenAgenda[mananaISO]}
            </span>
          ) : null}
        </button>

        <button 
          type="button"
          onClick={() => cambiarFechaAgenda(pasadoMananaISO)}
          style={{
            background: fechaAgenda === pasadoMananaISO ? 'var(--gold-jewel)' : 'rgba(0,0,0,0.4)',
            color: fechaAgenda === pasadoMananaISO ? '#000' : '#fff',
            border: fechaAgenda === pasadoMananaISO ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: fechaAgenda === pasadoMananaISO ? 'bold' : 'normal',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          🗓️ Pasado Mañana
          {resumenAgenda[pasadoMananaISO] ? (
            <span style={{ background: fechaAgenda === pasadoMananaISO ? '#000' : 'var(--gold-jewel)', color: fechaAgenda === pasadoMananaISO ? '#fff' : '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {resumenAgenda[pasadoMananaISO]}
            </span>
          ) : null}
        </button>

        <input 
          type="date" 
          className="input-field" 
          value={fechaAgenda} 
          onChange={e => cambiarFechaAgenda(e.target.value)} 
          style={{ margin: 0, padding: '4px 8px', fontSize: '0.82rem', width: 'auto', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--gold-jewel)' }}
          title="Seleccionar otra fecha para ver tu agenda"
        />
      </div>

      {/* FORMULARIO AGENDAR EXPRESS CON AUTOCOMPLETADO Y SELECTOR DE HORAS DESTACADO */}
      {showExpress && (
         <div className="card" style={{ marginBottom: '20px', background: 'var(--bg-charcoal)', border: '1px solid var(--gold-jewel)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>⚡</span>
                <h3 style={{ margin: 0, color: 'var(--gold-jewel)', fontSize: '1.15rem' }}>Agendar Cita Express</h3>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowExpress(false);
                  setShowDropdownExpress(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.4rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAgendarExpress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {/* Fila 1: RUT y Nombre con Búsqueda en Vivo */}
               <div style={{ position: 'relative' }}>
                 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                   {/* Campo RUT */}
                   <div style={{ flex: 1, minWidth: '180px' }}>
                     <label style={{ fontSize: '0.82rem', color: expressClienteEncontrado ? '#2ecc71' : 'var(--gold-jewel)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                       <span>🪪 RUT del Cliente:</span>
                       {buscandoClienteExpress && <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Buscando...</span>}
                     </label>
                     <input 
                       type="text" 
                       className="input-field" 
                       value={expressData.rut} 
                       onChange={e => handleRutChangeExpress(e.target.value)} 
                       onFocus={() => expressSugerencias.length > 0 && setShowDropdownExpress(true)}
                       placeholder="Ej: 12.345.678-9 (o busca aquí)" 
                       style={{ 
                         margin: 0, 
                         borderColor: expressClienteEncontrado ? '#2ecc71' : (expressData.rut ? 'var(--gold-jewel)' : undefined),
                         boxShadow: expressClienteEncontrado ? '0 0 10px rgba(46, 204, 113, 0.25)' : undefined
                       }}
                     />
                   </div>

                   {/* Campo Nombre */}
                   <div style={{ flex: 1, minWidth: '180px' }}>
                     <label style={{ fontSize: '0.82rem', color: expressClienteEncontrado ? '#2ecc71' : 'var(--gold-jewel)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                       <span>👤 Nombre del Cliente:</span>
                       <span style={{ fontSize: '0.72rem', color: '#888' }}>Poner RUT o Nombre</span>
                     </label>
                     <input 
                       type="text" 
                       className="input-field" 
                       value={expressData.nombre} 
                       onChange={e => handleNombreChangeExpress(e.target.value)} 
                       onFocus={() => expressSugerencias.length > 0 && setShowDropdownExpress(true)}
                       placeholder="Ej: Juan Pérez" 
                       style={{ 
                         margin: 0, 
                         borderColor: expressClienteEncontrado ? '#2ecc71' : (expressData.nombre ? 'var(--gold-jewel)' : undefined),
                         boxShadow: expressClienteEncontrado ? '0 0 10px rgba(46, 204, 113, 0.25)' : undefined
                       }}
                     />
                   </div>
                 </div>

                 {/* Dropdown Flotante de Sugerencias de Clientes */}
                 {showDropdownExpress && expressSugerencias.length > 0 && (
                   <div style={{
                     position: 'absolute',
                     top: '100%',
                     left: 0,
                     right: 0,
                     background: '#1a1a1a',
                     border: '2px solid var(--gold-jewel)',
                     borderRadius: '10px',
                     maxHeight: '220px',
                     overflowY: 'auto',
                     zIndex: 100,
                     boxShadow: '0 12px 35px rgba(0,0,0,0.95)',
                     marginTop: '6px'
                   }}>
                     <div style={{ padding: '6px 12px', background: 'rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.3)', fontSize: '0.75rem', color: 'var(--gold-jewel)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span>👇 Clientes encontrados en cartera ({expressSugerencias.length}):</span>
                       <span style={{ cursor: 'pointer', fontSize: '1rem', color: '#aaa' }} onClick={() => setShowDropdownExpress(false)}>×</span>
                     </div>
                     {expressSugerencias.map((sug) => (
                       <div
                         key={sug.id}
                         onClick={() => seleccionarSugerenciaExpress(sug)}
                         style={{
                           padding: '10px 14px',
                           borderBottom: '1px solid rgba(255,255,255,0.06)',
                           cursor: 'pointer',
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           transition: 'background 0.15s ease'
                         }}
                         onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.18)'}
                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                       >
                         <div>
                           <strong style={{ color: '#fff', fontSize: '0.92rem', display: 'block' }}>
                             👤 {sug.nombre}
                           </strong>
                           <span style={{ fontSize: '0.76rem', color: 'var(--gold-jewel)' }}>
                             🪪 {sug.rut} {sug.telefono ? `• 📞 ${sug.telefono}` : ''}
                           </span>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                           <span style={{ 
                             fontSize: '0.74rem', 
                             background: 'rgba(46,204,113,0.18)', 
                             color: '#2ecc71', 
                             padding: '3px 9px', 
                             borderRadius: '12px', 
                             fontWeight: 'bold',
                             border: '1px solid rgba(46,204,113,0.3)'
                           }}>
                             ✂️ {sug.cortes_acumulados || 0} cortes
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {/* Banner de Estado del Cliente: Reconocido vs Nuevo */}
               {expressClienteEncontrado ? (
                 <div style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'space-between', 
                   gap: '8px', 
                   background: 'rgba(46, 204, 113, 0.12)', 
                   border: '1px solid #2ecc71', 
                   borderRadius: '8px', 
                   padding: '8px 12px', 
                   color: '#2ecc71', 
                   fontSize: '0.82rem' 
                 }}>
                   <span>
                     ✅ <strong>Cliente Registrado:</strong> {expressClienteEncontrado.nombre} ({expressClienteEncontrado.cortes_acumulados || 0} cortes en historial)
                   </span>
                   <button 
                     type="button" 
                     onClick={() => {
                       setExpressClienteEncontrado(null);
                       setExpressData(prev => ({ ...prev, cliente_id: null }));
                     }}
                     style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                   >
                     Limpiar selección
                   </button>
                 </div>
               ) : (
                 (expressData.rut || expressData.nombre) && (
                   <div style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '8px', 
                     background: 'rgba(52, 152, 219, 0.12)', 
                     border: '1px solid #3498db', 
                     borderRadius: '8px', 
                     padding: '8px 12px', 
                     color: '#3498db', 
                     fontSize: '0.82rem' 
                   }}>
                     <span>➕</span>
                     <span><strong>Cliente Nuevo:</strong> Se agregará automáticamente a la cartera de clientes de La Romana al confirmar la cita.</span>
                   </div>
                 )
               )}

               {/* Fila 2: Fecha de la Cita con Accesos Rápidos */}
               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                   <label style={{ fontSize: '0.82rem', color: '#ddd', fontWeight: 'bold' }}>
                     📅 Fecha de la Cita:
                   </label>
                   <div style={{ display: 'flex', gap: '6px' }}>
                     <button
                       type="button"
                       onClick={() => setExpressData(prev => ({ ...prev, fecha: hoyISO }))}
                       style={{
                         padding: '4px 8px',
                         borderRadius: '4px',
                         fontSize: '0.72rem',
                         background: expressData.fecha === hoyISO ? 'var(--gold-jewel)' : 'rgba(255,255,255,0.06)',
                         color: expressData.fecha === hoyISO ? '#000' : '#ccc',
                         fontWeight: expressData.fecha === hoyISO ? 'bold' : 'normal',
                         border: 'none',
                         cursor: 'pointer'
                       }}
                     >
                       Hoy
                     </button>
                     <button
                       type="button"
                       onClick={() => setExpressData(prev => ({ ...prev, fecha: mananaISO }))}
                       style={{
                         padding: '4px 8px',
                         borderRadius: '4px',
                         fontSize: '0.72rem',
                         background: expressData.fecha === mananaISO ? 'var(--gold-jewel)' : 'rgba(255,255,255,0.06)',
                         color: expressData.fecha === mananaISO ? '#000' : '#ccc',
                         fontWeight: expressData.fecha === mananaISO ? 'bold' : 'normal',
                         border: 'none',
                         cursor: 'pointer'
                       }}
                     >
                       Mañana
                     </button>
                     <button
                       type="button"
                       onClick={() => setExpressData(prev => ({ ...prev, fecha: pasadoMananaISO }))}
                       style={{
                         padding: '4px 8px',
                         borderRadius: '4px',
                         fontSize: '0.72rem',
                         background: expressData.fecha === pasadoMananaISO ? 'var(--gold-jewel)' : 'rgba(255,255,255,0.06)',
                         color: expressData.fecha === pasadoMananaISO ? '#000' : '#ccc',
                         fontWeight: expressData.fecha === pasadoMananaISO ? 'bold' : 'normal',
                         border: 'none',
                         cursor: 'pointer'
                       }}
                     >
                       Pasado Mañana
                     </button>
                   </div>
                 </div>
                 <input 
                   type="date" 
                   className="input-field" 
                   required 
                   value={expressData.fecha} 
                   onChange={e => setExpressData(prev => ({ ...prev, fecha: e.target.value }))} 
                   style={{ margin: 0, padding: '8px 12px' }}
                 />
               </div>

               {/* Fila 3: SELECTOR DE HORA DESTACADO (10:00 a 19:00 hrs con 13:00 y 19:00 claramente visibles) */}
               <div style={{ background: 'rgba(212,175,55,0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.3)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                   <label style={{ fontSize: '0.85rem', color: 'var(--gold-jewel)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <span>🕒</span> Horario de Atención (10:00 a 19:00 hrs):
                   </label>
                   <span style={{ fontSize: '0.8rem', color: 'var(--gold-jewel)', background: 'rgba(0,0,0,0.5)', padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--gold-jewel)', fontWeight: 'bold' }}>
                     Hora elegida: {expressData.hora} hrs
                   </span>
                 </div>

                 {/* Grilla 5x2 de botones de hora */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                   {HORAS_DISPONIBLES.map(h => {
                     const isSel = expressData.hora === h;
                     const esDestacada = h === '13:00' || h === '19:00';
                     return (
                       <button
                         key={h}
                         type="button"
                         onClick={() => setExpressData(prev => ({ ...prev, hora: h }))}
                         style={{
                           padding: '10px 4px',
                           borderRadius: '8px',
                           fontSize: '0.85rem',
                           fontWeight: isSel ? 'bold' : '600',
                           cursor: 'pointer',
                           textAlign: 'center',
                           transition: 'all 0.15s ease',
                           background: isSel 
                             ? 'var(--gold-jewel)' 
                             : (esDestacada ? 'rgba(212, 175, 55, 0.14)' : 'rgba(255, 255, 255, 0.04)'),
                           color: isSel ? '#000' : (esDestacada ? 'var(--gold-jewel)' : '#fff'),
                           border: isSel 
                             ? '2px solid #fff' 
                             : (esDestacada ? '1px solid var(--gold-jewel)' : '1px solid rgba(255, 255, 255, 0.12)'),
                           boxShadow: isSel ? '0 0 12px rgba(212,175,55,0.6)' : 'none'
                         }}
                       >
                         {h} {esDestacada && '⭐'}
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Botón de Confirmación */}
               <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                 <button 
                   type="submit" 
                   className="btn-romana" 
                   style={{ flex: 2, height: '46px', fontSize: '0.95rem', fontWeight: 'bold', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                 >
                   <span>⚡</span> CONFIRMAR Y AGENDAR CITA
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setShowExpress(false)}
                   className="btn-outline-gold" 
                   style={{ flex: 1, height: '46px', fontSize: '0.88rem', borderRadius: '8px' }}
                 >
                   Cancelar
                 </button>
               </div>
            </form>
         </div>
      )}
      
      {/* Lista de citas agendadas para la fecha seleccionada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {agendados.length === 0 && (
          <div style={{ padding: '25px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
              No hay citas agendadas para el día <strong>{fechaAgenda}</strong>.
            </p>
            {proximasCitas.length > 0 && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--gold-jewel)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    📅 Citas agendadas encontradas en otros días ({proximasCitas.length}):
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#888' }}>Toca una cita para ver ese día</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {proximasCitas.map(pc => (
                    <div 
                      key={pc.id}
                      onClick={() => cambiarFechaAgenda(pc.fecha)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'rgba(212, 175, 55, 0.08)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{pc.nombre}</strong>
                        <div style={{ color: 'var(--gold-jewel)', fontSize: '0.78rem' }}>{pc.servicio_nombre || 'Barbería'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--green-emerald-light)', fontSize: '0.85rem' }}>{pc.fecha}</div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gold-jewel)' }}>{pc.hora} hrs 🔍 Ir al día</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {agendados.map(cliente => (
          <div 
            key={cliente.id} 
            className="card" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              transition: 'transform 0.2s', 
              borderLeft: cliente.estado === 'Terminado_Esperando_Pago' ? '4px solid var(--gold-jewel)' : 
                          cliente.estado === 'Completada' ? '4px solid var(--green-emerald-light)' : 'none' 
            }}
            onClick={() => cliente.estado === 'Pendiente' ? setSelectedClient(cliente) : (cliente.estado === 'Completada' ? alert('Esta cita ya fue atendida y cobrada.') : alert('Esta cita ya fue derivada a caja.'))}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={cliente.foto || 'https://via.placeholder.com/60'} alt={cliente.nombre} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{cliente.nombre}</h3>
                {cliente.rut && (
                  <div style={{ color: 'var(--gold-jewel)', fontSize: '0.78rem', marginTop: '1px' }}>
                    🪪 {cliente.rut}
                  </div>
                )}
                <div style={{ color: '#bbb', fontSize: '0.82rem', marginTop: '2px' }}>
                  {cliente.servicio_nombre || 'Corte Clásico'}
                </div>
                <span style={{ color: '#aaa', fontSize: '0.78rem' }}>Cortes: {cliente.cortes}/4</span>
                {cliente.estado === 'Terminado_Esperando_Pago' && <div style={{ fontSize: '0.8rem', color: '#ffb74d', marginTop: '4px' }}>⏳ Esperando Pago en Caja</div>}
                {cliente.estado === 'Completada' && <div style={{ fontSize: '0.8rem', color: 'var(--green-emerald-light)', marginTop: '4px' }}>✅ Pagada y Atendida</div>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--gold-jewel)' }}>{(cliente.hora || '').slice(0, 5)}</div>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>{cliente.fecha || fechaAgenda}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Mis Pagos */}
      {showMisPagos && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }}>
          <div style={{ background: '#181818', borderRadius: '14px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '2px solid var(--gold-jewel)', padding: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.9)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>💰</span>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--gold-jewel)', fontSize: '1.15rem' }}>Mis Pagos y Liquidaciones</h3>
                  <span style={{ fontSize: '0.78rem', color: '#aaa' }}>Historial de pagos recibidos de la administración</span>
                </div>
              </div>
              <button 
                onClick={() => setShowMisPagos(false)} 
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '15px', padding: '12px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#ccc' }}>Total Liquidado Histórico:</span>
              <strong style={{ fontSize: '1.2rem', color: '#2ecc71' }}>
                ${misPagosList.reduce((sum, p) => sum + Number(p.monto || 0), 0).toLocaleString('es-CL')}
              </strong>
            </div>

            {loadingMisPagos ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Cargando pagos...</div>
            ) : misPagosList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                No tienes pagos de liquidación registrados aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {misPagosList.map((p) => (
                  <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--gold-jewel)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        📅 Pagado: {p.fecha_pago}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2ecc71' }}>
                        ${Number(p.monto).toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                      <strong>Período:</strong> {p.periodo_inicio} al {p.periodo_fin}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <span><strong>Método:</strong> {p.metodo_pago}</span>
                        {p.numero_comprobante && <span><strong>N° Operación:</strong> {p.numero_comprobante}</span>}
                      </div>
                      <button
                        type="button"
                        className="btn-outline-gold"
                        onClick={() => {
                          printLiquidacionTicket({
                            barberoNombre: session?.usuario?.nombre || 'Barbero',
                            periodoInicio: p.periodo_inicio || '',
                            periodoFin: p.periodo_fin || '',
                            fechaPago: p.fecha_pago,
                            totalCortes: p.total_cortes || 0,
                            diasTrabajados: p.dias_trabajados || 0,
                            totalBruto: Number(p.total_bruto || 0),
                            comisionMonto: Number(p.monto || 0),
                            metodoPago: p.metodo_pago || 'Transferencia',
                            numeroComprobante: p.numero_comprobante || '',
                            notas: p.notas || ''
                          });
                        }}
                        style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        title="Imprimir comprobante térmico de este pago"
                      >
                        🖨️ Imprimir Voucher
                      </button>
                    </div>
                    {p.notas && (
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', fontStyle: 'italic' }}>
                        "{p.notas}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button className="btn-outline-gold" onClick={() => setShowMisPagos(false)} style={{ padding: '8px 20px' }}>
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
