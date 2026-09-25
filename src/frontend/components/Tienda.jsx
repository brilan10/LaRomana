import React, { useState, useEffect } from 'react';
import { API_URL } from '../App';
import { formatRut } from '../utils/rut';
import { resolveImageUrl } from '../utils/imageHelper';

const ProductoCard = ({ p, agregarAlCarrito, onVerDetalle, onVerImagenGrande }) => {
  const images = p.imagen_url ? p.imagen_url.split(',').map(url => url.trim()).filter(Boolean) : [];
  const [imgIndex, setImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [cardTouch, setCardTouch] = useState(null);

  const nextImg = (e) => {
    if (e) e.stopPropagation();
    if (images.length > 1) {
      setImgIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImg = (e) => {
    if (e) e.stopPropagation();
    if (images.length > 1) {
      setImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    setCardTouch({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    if (!cardTouch || !e.changedTouches || e.changedTouches.length === 0) return;
    const diffX = cardTouch.x - e.changedTouches[0].clientX;
    const diffY = cardTouch.y - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      e.stopPropagation();
      if (diffX > 0) {
        nextImg(e);
      } else {
        prevImg(e);
      }
    }
    setCardTouch(null);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (onVerImagenGrande && images.length > 0) {
      onVerImagenGrande({
        images,
        index: imgIndex,
        title: p.nombre,
        precio: p.precio,
        producto: p
      });
    } else if (onVerDetalle) {
      onVerDetalle(p);
    }
  };

  return (
    <div 
      className="card" 
      onClick={handleImageClick}
      style={{ 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '14px', 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--gold-jewel)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
      }}
    >
      {images.length > 0 && !imgError ? (
        <div 
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '140px', 
            marginBottom: '12px', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            backgroundColor: '#0a0a0a',
            cursor: 'zoom-in',
            touchAction: 'pan-y'
          }}
          onClick={handleImageClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Toca para ver en grande"
        >
          <img 
            src={resolveImageUrl(images[imgIndex] || images[0])} 
            alt={p.nombre} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }} 
            onError={() => setImgError(true)}
          />

          {/* Badge lupa zoom */}
          <div 
            style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              background: 'rgba(0,0,0,0.8)',
              color: 'var(--gold-jewel)',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              zIndex: 3,
              boxShadow: '0 2px 4px rgba(0,0,0,0.7)'
            }}
          >
            🔍 Grande
          </div>

          {images.length > 1 && (
            <>
              <button 
                onClick={prevImg} 
                style={{ 
                  position: 'absolute', 
                  left: '4px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'rgba(0,0,0,0.85)', 
                  border: '1px solid var(--gold-jewel)', 
                  color: 'var(--gold-jewel)', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  zIndex: 4,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
                title="Foto anterior"
              >
                ‹
              </button>
              <button 
                onClick={nextImg} 
                style={{ 
                  position: 'absolute', 
                  right: '4px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'rgba(0,0,0,0.85)', 
                  border: '1px solid var(--gold-jewel)', 
                  color: 'var(--gold-jewel)', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  zIndex: 4,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
                title="Siguiente foto"
              >
                ›
              </button>
              <div style={{ position: 'absolute', bottom: '5px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '3px', zIndex: 3 }}>
                {images.map((_, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      width: i === imgIndex ? '12px' : '5px', 
                      height: '5px', 
                      borderRadius: '3px', 
                      background: i === imgIndex ? 'var(--gold-jewel)' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.2s ease'
                    }} 
                  />
                ))}
              </div>
              <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.85)', color: 'var(--gold-jewel)', border: '1px solid rgba(212,175,55,0.4)', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', zIndex: 3 }}>
                📷 {imgIndex + 1}/{images.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '3rem', marginBottom: '10px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '8px' }}>🛍️</div>
      )}
      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '6px', flex: 1, color: '#fff', lineHeight: 1.3 }}>{p.nombre}</div>
      <div style={{ color: 'var(--gold-jewel)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>${Number(p.precio).toLocaleString('es-CL')}</div>
      <div style={{ fontSize: '0.8rem', color: p.stock < 5 ? '#e74c3c' : 'var(--text-secondary)', marginBottom: '12px' }}>
        {p.stock > 0 ? `Stock: ${p.stock} un.` : 'Agotado'}
      </div>
      <button 
        className="btn-outline-gold" 
        style={{ padding: '8px 12px', width: '100%', opacity: p.stock <= 0 ? 0.5 : 1, fontSize: '0.9rem' }} 
        onClick={(e) => {
          e.stopPropagation();
          agregarAlCarrito(p, 1);
        }} 
        disabled={p.stock <= 0}
      >
        {p.stock > 0 ? '🛒 Añadir' : 'Agotado'}
      </button>
    </div>
  );
};

export default function Tienda({ session, onNuevoPedido, onBackToHome, onGoToCitas }) {
  const [carrito, setCarrito] = useState([]);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['Gorras y Accesorios', 'Perfumes y Decants', 'Capilares', 'Más Vendidos']);
  const [catSeleccionada, setCatSeleccionada] = useState('Gorras y Accesorios');

  // Datos para compra / ticket
  const [rutCliente, setRutCliente] = useState(session?.usuario?.rut || '');
  const [nombreCliente, setNombreCliente] = useState(session?.usuario?.nombre || '');
  const [telefonoCliente, setTelefonoCliente] = useState(session?.usuario?.telefono || '');
  const [metodoPago, setMetodoPago] = useState('local'); // 'local' o 'transferencia'
  const [buscandoRut, setBuscandoRut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para búsqueda de Tickets
  const [modalTickets, setModalTickets] = useState(false);
  const [rutBusquedaTickets, setRutBusquedaTickets] = useState(session?.usuario?.rut || '');
  const [sugerenciasTickets, setSugerenciasTickets] = useState([]);
  const [showDropdownTickets, setShowDropdownTickets] = useState(false);
  const [pedidosEncontrados, setPedidosEncontrados] = useState(null);
  const [cargandoTickets, setCargandoTickets] = useState(false);

  // Modal Detalle / Galería de Producto tipo Tienda
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [imgDetalleIndex, setImgDetalleIndex] = useState(0);
  const [cantModal, setCantModal] = useState(1);
  const [agregadoFeedback, setAgregadoFeedback] = useState(false);

  // Modal Fullscreen / Lightbox para ver la imagen en grande
  const [imagenEnGrande, setImagenEnGrande] = useState(null); // { images: [], index: 0, title: '', precio: 0, producto: null }
  const [globalTouch, setGlobalTouch] = useState(null);

  const handleGlobalTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    setGlobalTouch({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    });
  };

  const handleGlobalTouchEnd = (e, nextFn, prevFn) => {
    if (!globalTouch || !e.changedTouches || e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = globalTouch.x - touchEndX;
    const diffY = globalTouch.y - touchEndY;

    if (Math.abs(diffX) > 28 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        if (nextFn) nextFn();
      } else {
        if (prevFn) prevFn();
      }
    }
    setGlobalTouch(null);
  };

  // Bloquear scroll de fondo y escuchar teclado para Lightbox
  useEffect(() => {
    if (imagenEnGrande) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setImagenEnGrande(null);
        } else if (e.key === 'ArrowRight') {
          setImagenEnGrande(prev => {
            if (!prev || !prev.images || prev.images.length <= 1) return prev;
            return { ...prev, index: (prev.index + 1) % prev.images.length };
          });
        } else if (e.key === 'ArrowLeft') {
          setImagenEnGrande(prev => {
            if (!prev || !prev.images || prev.images.length <= 1) return prev;
            return { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length };
          });
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [imagenEnGrande]);

  useEffect(() => {
    fetch(`${API_URL}/api.php?action=get_productos`)
      .then(r => r.json())
      .then(data => {
        const prods = data || [];
        setProductos(prods);
        const rawCats = [...new Set(prods.map(p => p.categoria).filter(Boolean))];

        const getPriority = (name) => {
          const lower = name.toLowerCase();
          if (lower.includes('gorra') || lower.includes('accesorio')) return 1;
          if (lower.includes('perfume') || lower.includes('decant')) return 2;
          if (lower.includes('capilar')) return 3;
          return 10;
        };

        const sortedCats = rawCats.sort((a, b) => getPriority(a) - getPriority(b));
        const finalCats = sortedCats.length > 0 ? [...sortedCats, 'Más Vendidos'] : ['Gorras y Accesorios', 'Perfumes y Decants', 'Capilares', 'Más Vendidos'];
        setCategorias(finalCats);

        setCatSeleccionada(prev => {
          if (prev && finalCats.includes(prev) && prev !== 'Más Vendidos') {
            return prev;
          }
          return finalCats[0] || 'Gorras y Accesorios';
        });
      })
      .catch(e => console.error(e));
  }, []);

  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleRutChange = async (e) => {
    const rawVal = e.target.value;
    const formatted = formatRut(rawVal);
    setRutCliente(formatted);

    const clean = rawVal.replace(/[^0-9kK]/g, '');
    if (clean.length >= 2) {
      setBuscandoRut(true);
      try {
        const resp = await fetch(`${API_URL}/api.php?action=search_clientes&q=${encodeURIComponent(clean)}`);
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          setSugerencias(data);
          setShowDropdown(true);
          const exact = data.find(c => c.rut.replace(/[^0-9kK]/gi, '').toUpperCase() === clean.toUpperCase());
          if (exact) {
            setClienteEncontrado(exact);
            setNombreCliente(exact.nombre);
            if (exact.telefono) setTelefonoCliente(exact.telefono);
          }
        } else {
          setSugerencias([]);
          setShowDropdown(false);
          if (clean.length >= 8) setClienteEncontrado(false);
        }
      } catch (err) {
        setSugerencias([]);
      } finally {
        setBuscandoRut(false);
      }
    } else {
      setSugerencias([]);
      setShowDropdown(false);
      setClienteEncontrado(null);
    }
  };

  const seleccionarSugerencia = (cli) => {
    setRutCliente(cli.rut);
    setNombreCliente(cli.nombre);
    if (cli.telefono) setTelefonoCliente(cli.telefono);
    setClienteEncontrado(cli);
    setSugerencias([]);
    setShowDropdown(false);
  };

  // Manejo de búsqueda de tickets
  const handleRutBusquedaTickets = async (e) => {
    const rawVal = e.target.value;
    const formatted = formatRut(rawVal);
    setRutBusquedaTickets(formatted);

    const clean = rawVal.replace(/[^0-9kK]/g, '');
    if (clean.length >= 2) {
      try {
        const resp = await fetch(`${API_URL}/api.php?action=search_clientes&q=${encodeURIComponent(clean)}`);
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          setSugerenciasTickets(data);
          setShowDropdownTickets(true);
        } else {
          setSugerenciasTickets([]);
          setShowDropdownTickets(false);
        }
      } catch (err) {
        setSugerenciasTickets([]);
      }
    } else {
      setSugerenciasTickets([]);
      setShowDropdownTickets(false);
    }
  };

  const consultarTickets = async (rutConsultar) => {
    const rutFinal = rutConsultar || rutBusquedaTickets;
    if (!rutFinal || rutFinal.length < 3) return;

    setCargandoTickets(true);
    setShowDropdownTickets(false);
    try {
      const resp = await fetch(`${API_URL}/api.php?action=get_pedidos_by_rut&rut=${encodeURIComponent(rutFinal)}`);
      const data = await resp.json();
      setPedidosEncontrados(data);
    } catch (err) {
      alert('Error consultando tickets.');
    } finally {
      setCargandoTickets(false);
    }
  };

  const productosMostrar = catSeleccionada === 'Más Vendidos' 
    ? [...productos].sort((a,b) => (b.ventas || 0) - (a.ventas || 0)).slice(0, 12)
    : productos.filter(p => p.categoria === catSeleccionada);

  const abrirDetalleProducto = (p) => {
    setProductoDetalle(p);
    setImgDetalleIndex(0);
    setCantModal(1);
    setAgregadoFeedback(false);
  };

  const agregarAlCarrito = (prod, cantidad = 1) => {
    const cant = Number(cantidad) || 1;
    setCarrito(prev => {
      const existe = prev.find(item => item.id === prod.id);
      if (existe) {
        const nuevaCant = Math.min(prod.stock, existe.cantidad + cant);
        return prev.map(item => item.id === prod.id ? {...item, cantidad: nuevaCant} : item);
      }
      return [...prev, {...prod, cantidad: Math.min(prod.stock, cant)}];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const finalizarPedido = async () => {
    if (isSubmitting) return;
    if (!rutCliente || rutCliente.length < 8) {
      alert('Por favor, ingresa tu RUT para emitir tu orden / ticket.');
      return;
    }
    if (!nombreCliente) {
      alert('Por favor, ingresa tu Nombre.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch(`${API_URL}/api.php?action=nuevo_pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: session?.usuario?.id || null,
          rut: rutCliente,
          nombre: nombreCliente,
          telefono: telefonoCliente,
          total: total,
          metodo_pago: metodoPago === 'transferencia' ? 'Transferencia' : 'Efectivo',
          carrito: carrito
        })
      });
      const data = await resp.json();
      
      if (data.status === 'success') {
        const idPedido = `LR-${String(data.pedido_id).padStart(4, '0')}`;
        setPedidoConfirmado({
          id: idPedido,
          total: total,
          items: [...carrito],
          metodoPago: metodoPago,
          rut: rutCliente,
          nombre: nombreCliente
        });
        setCarrito([]);
        setRutCliente('');
        setNombreCliente('');
        setTelefonoCliente('');
        setClienteEncontrado(null);
        setSugerencias([]);
        setShowDropdown(false);
        setIsCheckingOut(false);
        
        if (onNuevoPedido) {
          onNuevoPedido({ id: idPedido, total, items: carrito.length, fecha: new Date() });
        }
      } else {
        alert(data.error || 'Error procesando pedido.');
      }
    } catch (e) {
      alert('Error guardando pedido en BD.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- VISTA DE TICKET DE COMPRA CONFIRMADA ---
  if (pedidoConfirmado) {
    return (
      <div style={{ padding: '30px 15px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
        <div className="card" style={{ border: '2px solid var(--gold-jewel)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🧾</div>
          <h2 style={{ color: 'var(--gold-jewel)', marginBottom: '5px' }}>¡Ticket de Compra Generado!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Orden: <strong style={{ color: '#fff', fontSize: '1.2rem' }}>{pedidoConfirmado.id}</strong>
          </p>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', textAlign: 'left', marginBottom: '20px', fontSize: '0.9rem' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '10px' }}>
              <div><strong>Cliente:</strong> {pedidoConfirmado.nombre} ({pedidoConfirmado.rut})</div>
              <div><strong>Modalidad de Pago:</strong> {pedidoConfirmado.metodoPago === 'transferencia' ? '🏦 Transferencia Bancaria' : '🏪 Pago en Local'}</div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Detalle de Productos:</strong>
              {pedidoConfirmado.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>{it.cantidad}x {it.nombre}</span>
                  <span>${(it.precio * it.cantidad).toLocaleString('es-CL')}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <span>Total a pagar:</span>
              <span style={{ color: 'var(--gold-jewel)' }}>${pedidoConfirmado.total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* DATOS DE TRANSFERENCIA */}
          {pedidoConfirmado.metodoPago === 'transferencia' ? (
            <div style={{ background: 'rgba(39, 174, 96, 0.15)', border: '1px solid var(--green-emerald-light)', borderRadius: '10px', padding: '15px', textAlign: 'left', marginBottom: '20px', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <h4 style={{ color: 'var(--green-emerald-light)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🏦 Datos para Transferir:
              </h4>
              <div><strong>Banco:</strong> Banco Estado / Banco de Chile</div>
              <div><strong>Tipo de Cuenta:</strong> Cuenta Corriente</div>
              <div><strong>N° Cuenta:</strong> 1234567890</div>
              <div><strong>RUT:</strong> 76.543.210-K</div>
              <div><strong>Titular:</strong> La Romana Barbería S.P.A</div>
              <div><strong>Correo de Comprobante:</strong> pagos@laromana.cl</div>
              <div style={{ marginTop: '8px', color: 'var(--gold-jewel)' }}>
                * En el asunto o glosa de la transferencia, coloca tu número de orden: <strong>{pedidoConfirmado.id}</strong>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(218, 165, 32, 0.15)', border: '1px solid var(--gold-jewel)', borderRadius: '10px', padding: '15px', textAlign: 'left', marginBottom: '20px', fontSize: '0.85rem' }}>
              🏪 <strong>Pago en el Local:</strong> Acércate a la caja en la barbería con tu código de ticket <strong>{pedidoConfirmado.id}</strong> o tu RUT para pagar y retirar tus productos.
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', marginBottom: '10px' }} onClick={() => setPedidoConfirmado(null)}>
            Seguir Comprando
          </button>
          {onGoToCitas && (
            <button className="btn-outline-gold" style={{ width: '100%' }} onClick={onGoToCitas}>
              ✂️ Agendar una Hora de Corte
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '15px 0', position: 'relative', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: 'var(--gold-jewel)', margin: 0, fontSize: '1.3rem' }}>🛍️ Catálogo de Productos</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Botón Buscar Ticket / Mis Pedidos */}
          <button 
            onClick={() => setModalTickets(true)} 
            className="btn-img-action" 
            title="Mis Tickets"
            style={{ width: '130px' }}
          >
            <img src="/botones/mis_pedidos.png" alt="Mis Pedidos" style={{ height: '38px', objectFit: 'contain' }} />
          </button>

          {carrito.length > 0 && (
            <button 
              onClick={() => setIsCheckingOut(true)}
              className="btn-img-action"
              style={{ width: '130px' }}
              title={`Ver Carrito (${carrito.reduce((sum, i) => sum + i.cantidad, 0)} ítems)`}
            >
              <img src="/botones/ver_carrito.png" alt="Ver Carrito" style={{ height: '38px', objectFit: 'contain' }} />
            </button>
          )}
          {onGoToCitas && (
            <button onClick={onGoToCitas} className="btn-outline-gold" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              ✂️ Citas
            </button>
          )}
          {onBackToHome && (
            <button className="btn-img-action" onClick={onBackToHome} style={{ width: '80px' }}>
              <img src="/botones/boton_volver.png" alt="Volver" style={{ height: '34px', objectFit: 'contain' }} />
            </button>
          )}
        </div>
      </div>
      
      {/* Categorías */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
        {categorias.map(cat => (
          <button 
            key={cat} 
            onClick={() => setCatSeleccionada(cat)}
            className={catSeleccionada === cat ? 'btn-primary' : 'btn-outline-gold'}
            style={{ padding: '6px 14px', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {productos.length === 0 ? <p>Cargando catálogo...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {productosMostrar.map(p => (
            <ProductoCard 
              key={p.id} 
              p={p} 
              agregarAlCarrito={agregarAlCarrito} 
              onVerDetalle={abrirDetalleProducto} 
              onVerImagenGrande={(imgData) => setImagenEnGrande(imgData)}
            />
          ))}
        </div>
      )}

      {/* Botón Flotante de Carrito Seguro y Centrado */}
      {carrito.length > 0 && !isCheckingOut && (
        <div style={{ 
          position: 'fixed', 
          bottom: '75px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 1200, 
          width: '92%', 
          maxWidth: '420px' 
        }}>
          <button 
            className="btn-primary" 
            style={{ 
              width: '100%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '14px 20px', 
              borderRadius: '50px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.8), 0 0 20px rgba(39, 174, 96, 0.4)', 
              fontSize: '1rem', 
              fontWeight: 'bold',
              border: '2px solid var(--gold-jewel)',
              cursor: 'pointer'
            }} 
            onClick={() => setIsCheckingOut(true)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛒 <span>{carrito.reduce((sum, i) => sum + i.cantidad, 0)} {carrito.reduce((sum, i) => sum + i.cantidad, 0) === 1 ? 'ítem' : 'ítems'}</span>
            </span>
            <span style={{ color: '#fff', fontSize: '0.95rem' }}>
              Ver Carrito (${total.toLocaleString('es-CL')}) ➔
            </span>
          </button>
        </div>
      )}

      {/* --- MODAL DE DETALLE Y GALERÍA DE FOTOS DEL PRODUCTO (TIPO TIENDA) --- */}
      {productoDetalle && (() => {
        const pImages = productoDetalle.imagen_url 
          ? productoDetalle.imagen_url.split(',').map(u => u.trim()).filter(Boolean) 
          : [];
        const hasMultiple = pImages.length > 1;
        const currentImgUrl = pImages.length > 0 ? (pImages[imgDetalleIndex] || pImages[0]) : null;

        const nextModalImg = (e) => {
          e?.stopPropagation();
          if (hasMultiple) {
            setImgDetalleIndex((prev) => (prev + 1) % pImages.length);
          }
        };

        const prevModalImg = (e) => {
          e?.stopPropagation();
          if (hasMultiple) {
            setImgDetalleIndex((prev) => (prev - 1 + pImages.length) % pImages.length);
          }
        };

        const handleModalAddCart = () => {
          if (productoDetalle.stock <= 0) return;
          agregarAlCarrito(productoDetalle, cantModal);
          setAgregadoFeedback(true);
          setTimeout(() => {
            setAgregadoFeedback(false);
          }, 2500);
        };

        const openFullscreenZoom = (e, targetIdx = null) => {
          if (e) e.stopPropagation();
          const idx = targetIdx !== null ? targetIdx : imgDetalleIndex;
          setImagenEnGrande({
            images: pImages.length > 0 ? pImages : (currentImgUrl ? [currentImgUrl] : []),
            index: idx,
            title: productoDetalle.nombre,
            precio: productoDetalle.precio,
            producto: productoDetalle
          });
        };

        return (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(10px)',
              zIndex: 2500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              animation: 'fadeIn 0.25s ease-out'
            }}
            onClick={() => setProductoDetalle(null)}
          >
            <div 
              className="card"
              style={{
                width: '100%',
                maxWidth: '560px',
                maxHeight: '92vh',
                overflowY: 'auto',
                backgroundColor: '#161616',
                border: '2px solid var(--gold-jewel)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.25)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabecera del modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  background: 'rgba(212, 175, 55, 0.15)', 
                  color: 'var(--gold-jewel)', 
                  border: '1px solid rgba(212, 175, 55, 0.4)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold' 
                }}>
                  🏷️ {productoDetalle.categoria || 'Catálogo Oficial'}
                </span>
                <button 
                  onClick={() => setProductoDetalle(null)}
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    color: '#fff', 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '50%', 
                    fontSize: '1.2rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>

              {/* Visor Principal de Imagen (Clic para ver en grande / Lightbox) */}
              <div 
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '280px', 
                  backgroundColor: '#0a0a0a', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'zoom-in',
                  touchAction: 'pan-y'
                }}
                onClick={(e) => openFullscreenZoom(e)}
                onTouchStart={handleGlobalTouchStart}
                onTouchEnd={(e) => hasMultiple && handleGlobalTouchEnd(e, nextModalImg, prevModalImg)}
                title="Toca para ver la imagen en pantalla completa"
              >
                {currentImgUrl ? (
                  <img 
                    src={resolveImageUrl(currentImgUrl)} 
                    alt={productoDetalle.nombre} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain', 
                      backgroundColor: '#0a0a0a',
                      transition: 'opacity 0.2s ease-in-out'
                    }}
                    onError={(e) => {
                      e.target.src = '/icon-192.png';
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '4.5rem' }}>🛍️</div>
                )}

                {/* Badge indicador de zoom */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  pointerEvents: 'none',
                  zIndex: 2
                }}>
                  🔍 Ver en grande
                </div>

                {/* Flechas de navegación (SOLO si hay más de 1 imagen) */}
                {hasMultiple && (
                  <>
                    <button 
                      onClick={prevModalImg} 
                      style={{ 
                        position: 'absolute', 
                        left: '10px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        background: 'rgba(0,0,0,0.8)', 
                        border: '2px solid var(--gold-jewel)', 
                        color: 'var(--gold-jewel)', 
                        borderRadius: '50%', 
                        width: '42px', 
                        height: '42px', 
                        fontSize: '1.6rem', 
                        fontWeight: 'bold',
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
                        zIndex: 3
                      }}
                      title="Foto anterior"
                    >
                      ‹
                    </button>
                    <button 
                      onClick={nextModalImg} 
                      style={{ 
                        position: 'absolute', 
                        right: '10px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        background: 'rgba(0,0,0,0.8)', 
                        border: '2px solid var(--gold-jewel)', 
                        color: 'var(--gold-jewel)', 
                        borderRadius: '50%', 
                        width: '42px', 
                        height: '42px', 
                        fontSize: '1.6rem', 
                        fontWeight: 'bold',
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
                        zIndex: 3
                      }}
                      title="Siguiente foto"
                    >
                      ›
                    </button>

                    {/* Indicador de foto actual */}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      right: '10px', 
                      background: 'rgba(0,0,0,0.8)', 
                      color: 'var(--gold-jewel)', 
                      border: '1px solid rgba(212,175,55,0.4)',
                      padding: '3px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      zIndex: 3
                    }}>
                      📷 {imgDetalleIndex + 1} / {pImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Carrusel / Tira de Miniaturas (SOLO si hay más de 1 imagen) */}
              {hasMultiple && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  overflowX: 'auto', 
                  paddingBottom: '4px',
                  scrollBehavior: 'smooth'
                }}>
                  {pImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setImgDetalleIndex(i)}
                      style={{
                        width: '62px',
                        height: '62px',
                        flexShrink: 0,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        padding: 0,
                        border: i === imgDetalleIndex ? '2px solid var(--gold-jewel)' : '1px solid rgba(255,255,255,0.2)',
                        background: '#0d0d0d',
                        cursor: 'pointer',
                        boxShadow: i === imgDetalleIndex ? '0 0 8px rgba(212,175,55,0.6)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img 
                        src={resolveImageUrl(imgUrl)} 
                        alt={`Thumb ${i + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Información del Producto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.35rem', lineHeight: 1.25 }}>
                  {productoDetalle.nombre}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ color: 'var(--gold-jewel)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    ${Number(productoDetalle.precio).toLocaleString('es-CL')}
                  </div>

                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 'bold',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: productoDetalle.stock > 0 ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                    color: productoDetalle.stock > 0 ? 'var(--green-emerald-light)' : '#e74c3c',
                    border: `1px solid ${productoDetalle.stock > 0 ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`
                  }}>
                    {productoDetalle.stock > 0 ? `🟢 En Stock (${productoDetalle.stock} disponibles)` : '🔴 Agotado'}
                  </div>
                </div>

                {/* Descripción */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '12px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.45,
                  marginTop: '4px'
                }}>
                  {productoDetalle.descripcion && productoDetalle.descripcion.trim().length > 0 
                    ? productoDetalle.descripcion 
                    : 'Artículo disponible en La Romana Peluquería & Barbería. Calidad y estilo garantizados.'}
                </div>
              </div>

              {/* Acciones de compra en el modal */}
              {productoDetalle.stock > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cantidad:</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', overflow: 'hidden', background: '#0a0a0a' }}>
                      <button 
                        onClick={() => setCantModal(prev => Math.max(1, prev - 1))}
                        style={{ background: 'transparent', border: 'none', color: 'var(--gold-jewel)', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ width: '36px', textAlign: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
                        {cantModal}
                      </span>
                      <button 
                        onClick={() => setCantModal(prev => Math.min(productoDetalle.stock, prev + 1))}
                        style={{ background: 'transparent', border: 'none', color: 'var(--gold-jewel)', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                      Subtotal: <strong style={{ color: 'var(--gold-jewel)' }}>${(Number(productoDetalle.precio) * cantModal).toLocaleString('es-CL')}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn-primary" 
                      style={{ 
                        flex: 1, 
                        padding: '12px', 
                        fontSize: '1rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)'
                      }}
                      onClick={handleModalAddCart}
                    >
                      🛒 {agregadoFeedback ? '✅ ¡Añadido al Carrito!' : `Añadir al Carrito (${cantModal})`}
                    </button>
                    <button 
                      className="btn-outline-gold"
                      style={{ padding: '12px 18px', borderRadius: '10px', fontSize: '0.9rem' }}
                      onClick={() => setProductoDetalle(null)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <button className="btn-outline-gold" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                    Producto Agotado
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* --- MODAL PANTALLA COMPLETA / LIGHTBOX PARA VER IMAGEN EN GRANDE (ZOOM) --- */}
      {imagenEnGrande && (() => {
        const listImgs = imagenEnGrande.images || [];
        const currentIdx = imagenEnGrande.index || 0;
        const currentUrl = listImgs[currentIdx];
        const hasMultiple = listImgs.length > 1;

        const nextBigImg = (e) => {
          if (e) e.stopPropagation();
          if (hasMultiple) {
            setImagenEnGrande(prev => ({
              ...prev,
              index: (prev.index + 1) % listImgs.length
            }));
          }
        };

        const prevBigImg = (e) => {
          if (e) e.stopPropagation();
          if (hasMultiple) {
            setImagenEnGrande(prev => ({
              ...prev,
              index: (prev.index - 1 + listImgs.length) % listImgs.length
            }));
          }
        };

        const handleImageAreaClick = (e) => {
          if (!hasMultiple) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX < rect.width / 2) {
            prevBigImg(e);
          } else {
            nextBigImg(e);
          }
        };

        const handleQuickAdd = () => {
          if (imagenEnGrande.producto) {
            agregarAlCarrito(imagenEnGrande.producto, 1);
            setAgregadoFeedback(true);
            setTimeout(() => setAgregadoFeedback(false), 2000);
          }
        };

        return (
          <div 
            className="lightbox-modal"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.96)',
              backdropFilter: 'blur(14px)',
              zIndex: 5000,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 10px',
              userSelect: 'none',
              touchAction: 'pan-y'
            }}
            onClick={() => setImagenEnGrande(null)}
            onTouchStart={handleGlobalTouchStart}
            onTouchEnd={(e) => hasMultiple && handleGlobalTouchEnd(e, nextBigImg, prevBigImg)}
          >
            {/* Barra superior del lightbox */}
            <div 
              style={{
                width: '100%',
                maxWidth: '900px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(20,20,20,0.85)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                zIndex: 5010
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                  {imagenEnGrande.title || 'Foto de Producto'}
                </span>
                {imagenEnGrande.precio && (
                  <span style={{ color: 'var(--gold-jewel)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    ${Number(imagenEnGrande.precio).toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {hasMultiple && (
                  <span style={{ 
                    background: 'rgba(212, 175, 55, 0.2)', 
                    color: 'var(--gold-jewel)', 
                    border: '1px solid var(--gold-jewel)',
                    padding: '3px 10px', 
                    borderRadius: '14px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    📷 {currentIdx + 1} / {listImgs.length}
                  </span>
                )}

                <button 
                  onClick={() => setImagenEnGrande(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s'
                  }}
                  title="Cerrar vista grande"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenedor central de la imagen con flechas flotantes */}
            <div 
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '960px',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px 0',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {currentUrl ? (
                <img 
                  key={currentIdx}
                  src={resolveImageUrl(currentUrl)} 
                  alt={imagenEnGrande.title || 'Foto'} 
                  className="lightbox-content"
                  style={{
                    maxWidth: '100%',
                    maxHeight: hasMultiple ? '66vh' : '74vh',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.95), 0 0 25px rgba(212,175,55,0.25)',
                    cursor: hasMultiple ? 'pointer' : 'default'
                  }}
                  onClick={handleImageAreaClick}
                  onError={(e) => { e.target.src = '/icon-192.png'; }}
                />
              ) : (
                <div style={{ fontSize: '5rem' }}>🛍️</div>
              )}

              {/* Botón flotante IZQUIERDO */}
              {hasMultiple && (
                <button 
                  onClick={prevBigImg}
                  className="lightbox-nav-btn"
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    border: '2px solid var(--gold-jewel)',
                    color: 'var(--gold-jewel)',
                    borderRadius: '50%',
                    width: '52px',
                    height: '52px',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.9), 0 0 10px rgba(212,175,55,0.4)',
                    zIndex: 5020
                  }}
                  title="Foto anterior"
                >
                  ‹
                </button>
              )}

              {/* Botón flotante DERECHO */}
              {hasMultiple && (
                <button 
                  onClick={nextBigImg}
                  className="lightbox-nav-btn"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    border: '2px solid var(--gold-jewel)',
                    color: 'var(--gold-jewel)',
                    borderRadius: '50%',
                    width: '52px',
                    height: '52px',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.9), 0 0 10px rgba(212,175,55,0.4)',
                    zIndex: 5020
                  }}
                  title="Siguiente foto"
                >
                  ›
                </button>
              )}
            </div>

            {/* Barra inferior del lightbox con indicadores y miniaturas */}
            <div 
              style={{
                width: '100%',
                maxWidth: '900px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5010
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Indicadores de puntos y texto de ayuda táctil */}
              {hasMultiple && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {listImgs.map((_, i) => (
                      <div 
                        key={i}
                        onClick={() => setImagenEnGrande(prev => ({ ...prev, index: i }))}
                        style={{
                          width: i === currentIdx ? '20px' : '6px',
                          height: '6px',
                          borderRadius: '3px',
                          background: i === currentIdx ? 'var(--gold-jewel)' : 'rgba(255,255,255,0.4)',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: '#aaa', fontSize: '0.72rem', letterSpacing: '0.3px' }}>
                    👆 Desliza con el dedo hacia los lados para ver más fotos
                  </span>
                </div>
              )}

              {/* Tira de Miniaturas */}
              {hasMultiple && (
                <div 
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'rgba(15,15,15,0.85)',
                    borderRadius: '25px',
                    border: '1px solid rgba(212,175,55,0.3)',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.7)'
                  }}
                >
                  {listImgs.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImagenEnGrande(prev => ({ ...prev, index: i }))}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        padding: 0,
                        border: i === currentIdx ? '2px solid var(--gold-jewel)' : '1px solid rgba(255,255,255,0.2)',
                        background: '#111',
                        cursor: 'pointer',
                        boxShadow: i === currentIdx ? '0 0 10px rgba(212,175,55,0.8)' : 'none',
                        flexShrink: 0,
                        transform: i === currentIdx ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img src={resolveImageUrl(img)} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Botón rápido de añadir al carrito o ver más detalles */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                {imagenEnGrande.producto && imagenEnGrande.producto.stock > 0 && (
                  <button
                    className="btn-primary"
                    onClick={handleQuickAdd}
                    style={{
                      padding: '8px 20px',
                      fontSize: '0.9rem',
                      borderRadius: '25px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)'
                    }}
                  >
                    🛒 {agregadoFeedback ? '✅ ¡Añadido al Carrito!' : 'Añadir al Carrito'}
                  </button>
                )}
                {imagenEnGrande.producto && (
                  <button
                    className="btn-outline-gold"
                    onClick={() => {
                      const prod = imagenEnGrande.producto;
                      setImagenEnGrande(null);
                      abrirDetalleProducto(prod);
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      borderRadius: '25px',
                      background: 'rgba(0,0,0,0.6)'
                    }}
                  >
                    📋 Ver detalles
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- MODAL PARA BUSCAR TICKETS DE COMPRA --- */}
      {modalTickets && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', border: '2px solid var(--gold-jewel)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <h3 style={{ color: 'var(--gold-jewel)', margin: 0, fontSize: '1.15rem' }}>🧾 Consultar Mis Tickets</h3>
              <button onClick={() => { setModalTickets(false); setPedidosEncontrados(null); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
              Ingresa tu RUT para consultar tus compras, órdenes y tickets pendientes o pagados.
            </p>

            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>RUT del Cliente:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej: 19123456-7" 
                  value={rutBusquedaTickets} 
                  onChange={handleRutBusquedaTickets}
                  onFocus={() => sugerenciasTickets.length > 0 && setShowDropdownTickets(true)}
                  style={{ marginBottom: 0, fontSize: '1.05rem', fontWeight: 'bold' }}
                />
                <button 
                  onClick={() => consultarTickets()} 
                  className="btn-primary" 
                  style={{ padding: '0 16px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                  disabled={cargandoTickets}
                >
                  {cargandoTickets ? 'Buscando...' : '🔍 Buscar'}
                </button>
              </div>

              {/* DROPDOWN DE SUGERENCIAS EN BÚSQUEDA DE TICKETS */}
              {showDropdownTickets && sugerenciasTickets.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '65px',
                  left: 0,
                  right: 0,
                  background: '#1c1c1c',
                  border: '2px solid var(--gold-jewel)',
                  borderRadius: '8px',
                  zIndex: 1500,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.9)',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  <div style={{ padding: '6px 10px', background: 'rgba(212,175,55,0.15)', fontSize: '0.75rem', color: 'var(--gold-jewel)', fontWeight: 'bold' }}>
                    👇 Toca tu nombre para ver tus tickets:
                  </div>
                  {sugerenciasTickets.map(cli => (
                    <div
                      key={cli.id}
                      onClick={() => {
                        setRutBusquedaTickets(cli.rut);
                        setShowDropdownTickets(false);
                        consultarTickets(cli.rut);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 174, 96, 0.25)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>👤 {cli.nombre}</div>
                        <div style={{ color: 'var(--gold-jewel)', fontSize: '0.75rem' }}>RUT: {cli.rut}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RESULTADOS DE TICKETS */}
            {pedidosEncontrados && (
              <div>
                {pedidosEncontrados.found ? (
                  <div>
                    <div style={{ background: 'rgba(39, 174, 96, 0.15)', border: '1px solid var(--green-emerald-light)', padding: '10px 12px', borderRadius: '8px', marginBottom: '15px' }}>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        👤 {pedidosEncontrados.cliente.nombre}
                      </div>
                      <div style={{ color: 'var(--gold-jewel)', fontSize: '0.8rem' }}>
                        RUT: {pedidosEncontrados.cliente.rut} • Total Pedidos: {pedidosEncontrados.pedidos.length}
                      </div>
                    </div>

                    {pedidosEncontrados.pedidos.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
                        No tienes compras previas registradas con este RUT.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pedidosEncontrados.pedidos.map(ped => {
                          const idTicket = `LR-${String(ped.id).padStart(4, '0')}`;
                          const isEntregado = ped.estado === 'Entregado';
                          const isPreparando = ped.estado === 'Preparando';
                          const isCancelado = ped.estado === 'Cancelado';

                          return (
                            <div 
                              key={ped.id} 
                              style={{ 
                                background: 'rgba(255,255,255,0.04)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '10px', 
                                padding: '12px',
                                lineHeight: '1.5'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                                <strong style={{ color: 'var(--gold-jewel)', fontSize: '1rem' }}>Ticket {idTicket}</strong>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  background: isEntregado ? 'rgba(39, 174, 96, 0.2)' : isPreparando ? 'rgba(41, 128, 185, 0.2)' : isCancelado ? 'rgba(231, 76, 60, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                                  color: isEntregado ? 'var(--green-emerald-light)' : isPreparando ? '#3498db' : isCancelado ? '#e74c3c' : 'var(--gold-jewel)',
                                  border: `1px solid ${isEntregado ? 'var(--green-emerald-light)' : isPreparando ? '#3498db' : isCancelado ? '#e74c3c' : 'var(--gold-jewel)'}`
                                }}>
                                  {ped.estado || 'Pendiente'}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                📅 Fecha: {new Date(ped.fecha_creacion).toLocaleString('es-CL')}
                              </div>

                              <div style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '8px' }}>
                                <strong>Items:</strong> {ped.detalle_items || 'Productos varios'}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total:</span>
                                <strong style={{ color: 'var(--gold-jewel)' }}>${Number(ped.total).toLocaleString('es-CL')}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                    ❌ No encontramos clientes registrados con ese RUT.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL DE CHECKOUT / TICKET --- */}
      {isCheckingOut && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--gold-jewel)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <h3 style={{ color: 'var(--gold-jewel)', margin: 0 }}>🛒 Tu Carrito y Checkout</h3>
              <button onClick={() => setIsCheckingOut(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* Lista de Items */}
            <div style={{ marginBottom: '15px' }}>
              {carrito.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '8px 0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.nombre}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.cantidad} x ${Number(item.precio).toLocaleString('es-CL')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--green-emerald-light)' }}>
                      ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                    </span>
                    <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <span>Total Orden:</span>
              <span style={{ color: 'var(--gold-jewel)' }}>${total.toLocaleString('es-CL')}</span>
            </div>

            {/* Formulario de Identificación con RUT */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', marginBottom: '15px', position: 'relative' }}>
              <h4 style={{ color: 'var(--gold-jewel)', margin: '0 0 10px 0', fontSize: '0.95rem' }}>🪪 Datos del Comprador</h4>
              
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>RUT (ej: 19123456-7):</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="RUT del cliente" 
                  value={rutCliente} 
                  onChange={handleRutChange}
                  onFocus={() => sugerencias.length > 0 && setShowDropdown(true)}
                  maxLength={12}
                  required 
                  style={{ marginBottom: '0' }}
                />
                {buscandoRut && <div style={{ fontSize: '0.75rem', color: 'var(--gold-jewel)', marginTop: '4px' }}>🔍 Buscando...</div>}

                {/* DROPDOWN DE SUGERENCIAS */}
                {showDropdown && sugerencias.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '65px',
                    left: 0,
                    right: 0,
                    background: '#1c1c1c',
                    border: '2px solid var(--gold-jewel)',
                    borderRadius: '8px',
                    zIndex: 1500,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.9)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ padding: '6px 10px', background: 'rgba(212,175,55,0.15)', fontSize: '0.75rem', color: 'var(--gold-jewel)', fontWeight: 'bold' }}>
                      👇 Sugerencias encontradas (toca para autorrellenar):
                    </div>
                    {sugerencias.map(cli => (
                      <div
                        key={cli.id}
                        onClick={() => seleccionarSugerencia(cli)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 174, 96, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>👤 {cli.nombre}</div>
                          <div style={{ color: 'var(--gold-jewel)', fontSize: '0.75rem' }}>RUT: {cli.rut}</div>
                        </div>
                        {cli.cortes_acumulados > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--green-emerald-light)' }}>⭐ {cli.cortes_acumulados} cortes</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nombre Completo:</label>
                {clienteEncontrado && clienteEncontrado.nombre && (
                  <span style={{ color: 'var(--green-emerald-light)', fontSize: '0.75rem', background: 'rgba(39, 174, 96, 0.2)', padding: '2px 6px', borderRadius: '10px' }}>
                    ✨ Autorrellenado con éxito
                  </span>
                )}
              </div>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Tu Nombre y Apellido" 
                value={nombreCliente} 
                onChange={(e) => setNombreCliente(e.target.value)} 
                required 
                style={{ 
                  marginBottom: '10px',
                  border: clienteEncontrado?.nombre ? '1px solid var(--green-emerald-light)' : '1px solid rgba(255,255,255,0.1)'
                }}
              />

              {/* VALIDACIÓN DE TELÉFONO EN TIENDA */}
              {clienteEncontrado && (!clienteEncontrado.telefono || clienteEncontrado.telefono.trim() === '') ? (
                <div style={{ marginTop: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid var(--gold-jewel)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--gold-jewel)', fontWeight: 'bold' }}>
                    <span>📱 Falta tu Teléfono / WhatsApp:</span>
                    <span style={{ fontSize: '0.7rem', color: '#fff' }}>(Para avisos de tu orden)</span>
                  </label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="Ej: +56912345678" 
                    value={telefonoCliente} 
                    onChange={(e) => setTelefonoCliente(e.target.value)} 
                    style={{ marginBottom: '0', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--gold-jewel)', color: '#fff' }}
                    required 
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Teléfono / WhatsApp:</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="+569..." 
                    value={telefonoCliente} 
                    onChange={(e) => setTelefonoCliente(e.target.value)} 
                    style={{ marginBottom: '0' }}
                  />
                </div>
              )}
            </div>

            {/* Selección de Método de Pago */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--gold-jewel)' }}>
                💳 ¿Cómo deseas pagar tu pedido?
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: metodoPago === 'local' ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: metodoPago === 'local' ? '2px solid var(--green-emerald-light)' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="radio" name="metodoPago" value="local" checked={metodoPago === 'local'} onChange={() => setMetodoPago('local')} />
                    <div>
                      <strong>🏪 Pagar en el Local</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Efectivo o Tarjeta al retirar en barbería</div>
                    </div>
                  </div>
                  <img src="/botones/pagar_local.png" alt="Pagar en Local" style={{ height: '36px', objectFit: 'contain' }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: metodoPago === 'transferencia' ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: metodoPago === 'transferencia' ? '2px solid var(--green-emerald-light)' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="radio" name="metodoPago" value="transferencia" checked={metodoPago === 'transferencia'} onChange={() => setMetodoPago('transferencia')} />
                    <div>
                      <strong>🏦 Transferencia Bancaria</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Datos directos para comprobante inmediato</div>
                    </div>
                  </div>
                  <img src="/botones/transferir.png" alt="Transferir" style={{ height: '36px', objectFit: 'contain' }} />
                </label>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }} 
              onClick={finalizarPedido} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Generando Ticket...' : `Generar Ticket de Compra ($${total.toLocaleString('es-CL')})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
