import React, { useState } from 'react';
import { forceAppUpdateAndClearCache } from '../utils/appUpdate';

export default function BotonActualizarApp({ 
  estilo = 'header', 
  texto = 'Actualizar App',
  mostrarIcono = true,
  className = '',
  style = {} 
}) {
  const [actualizando, setActualizando] = useState(false);

  const handleClick = async () => {
    if (actualizando) return;
    setActualizando(true);
    // Pausa breve para mostrar el feedback visual antes de recargar
    setTimeout(async () => {
      await forceAppUpdateAndClearCache();
    }, 250);
  };

  if (estilo === 'barbero') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={actualizando}
        className={`btn-romana ${className}`}
        title="Actualizar aplicación y limpiar memoria caché (Shift+F5)"
        style={{
          fontSize: '0.8rem',
          padding: '6px 12px',
          backgroundColor: 'rgba(212, 175, 55, 0.12)',
          borderColor: 'var(--gold-jewel)',
          color: 'var(--gold-jewel)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          ...style
        }}
      >
        <span style={{ 
          fontSize: '1rem', 
          display: 'inline-block',
          animation: actualizando ? 'spin 0.8s linear infinite' : 'none' 
        }}>
          🔄
        </span>
        <span>{actualizando ? 'Actualizando...' : texto}</span>
      </button>
    );
  }

  // Estilo Header (compacto, elegante)
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={actualizando}
      className={`btn-actualizar-app ${className}`}
      title="Actualizar aplicación y borrar memoria caché (Shift+F5 para celulares)"
      style={{
        background: actualizando ? 'var(--gold-jewel)' : 'rgba(212, 175, 55, 0.12)',
        border: '1px solid var(--gold-jewel)',
        color: actualizando ? '#000' : 'var(--gold-jewel)',
        borderRadius: '50px',
        padding: '5px 12px',
        fontSize: '0.78rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      <span style={{ 
        fontSize: '0.95rem', 
        display: 'inline-block',
        animation: actualizando ? 'spin 0.8s linear infinite' : 'none' 
      }}>
        🔄
      </span>
      <span>{actualizando ? 'Limpiando...' : texto}</span>
    </button>
  );
}
