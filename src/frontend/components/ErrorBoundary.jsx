import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          background: 'rgba(26, 26, 26, 0.95)',
          borderRadius: '12px',
          border: '1px solid #e74c3c',
          color: '#fff',
          margin: '20px auto',
          maxWidth: '800px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚠️</div>
          <h3 style={{ color: '#e74c3c', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
            {this.props.fallbackTitle || 'Se produjo un error al cargar esta sección'}
          </h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>
            {this.props.fallbackMessage || 'Ha ocurrido un problema inesperado al procesar los datos. Puedes intentar recargar el módulo.'}
          </p>

          {this.state.error && (
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #444',
              color: '#f39c12',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '20px',
              maxHeight: '150px'
            }}>
              {this.state.error.toString()}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={this.handleReset}
              style={{ padding: '10px 24px', fontWeight: 'bold' }}
            >
              🔄 Reintentar
            </button>
            <button
              className="btn-outline-gold"
              onClick={() => window.location.reload()}
              style={{ padding: '10px 20px' }}
            >
              🌐 Recargar Página Completa
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
