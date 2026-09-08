// imageHelper.js - Resuelve URLs de imágenes de forma segura en local y producción

export const resolveImageUrl = (url, defaultFallback = '') => {
  if (!url || typeof url !== 'string') return defaultFallback;
  const trimmed = url.trim();
  if (!trimmed) return defaultFallback;

  // Si es Base64 o URL absoluta externa (http / https)
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Archivos subidos dinámicamente en el backend (/backend/uploads/... o uploads/...)
  if (trimmed.includes('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // En entorno local de desarrollo con Vite + PHP en puerto 8000
      const uploadPart = cleanPath.replace('/backend', '');
      return `http://localhost:8000${uploadPart}`;
    }
    // En producción (laromanacopiapo.cl / cPanel), Apache sirve directamente /backend/uploads/...
    return cleanPath.startsWith('/backend') ? cleanPath : `/backend${cleanPath}`;
  }

  // Archivos estáticos en /assets o en la raíz (/Logo_romana_dorado.png, /gorra_trucker.png, etc.)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
};
