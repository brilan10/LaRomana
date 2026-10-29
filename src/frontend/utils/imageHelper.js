// imageHelper.js - Resuelve URLs de imágenes de forma segura en local y producción

/**
 * Resuelve una URL de imagen a su ruta válida en Vite/Apache.
 * Si recibe múltiples URLs separadas por coma (productos con varias fotos), toma la primera foto principal.
 */
export const resolveImageUrl = (url, defaultFallback = '') => {
  if (!url) return defaultFallback;

  // Si es un array o string con múltiples URLs separadas por coma, tomar la primera
  let targetUrl = '';
  if (Array.isArray(url)) {
    targetUrl = url.find(u => Boolean(u && typeof u === 'string' && u.trim())) || '';
  } else if (typeof url === 'string') {
    targetUrl = url.includes(',') ? url.split(',')[0].trim() : url.trim();
  } else {
    targetUrl = String(url).trim();
  }

  if (!targetUrl) return defaultFallback;

  // Si es Base64 o URL absoluta externa (http / https)
  if (targetUrl.startsWith('data:') || targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return targetUrl;
  }

  // Archivos subidos dinámicamente en el backend (/backend/uploads/... o uploads/...)
  if (targetUrl.includes('uploads/')) {
    const cleanPath = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // En entorno local de desarrollo con Vite + PHP en puerto 8000
      const uploadPart = cleanPath.replace('/backend', '');
      return `http://localhost:8000${uploadPart}`;
    }
    // En producción (cPanel / WebHost), Apache sirve directamente /backend/uploads/...
    return cleanPath.startsWith('/backend') ? cleanPath : `/backend${cleanPath}`;
  }

  // Archivos estáticos en /assets o en la raíz (/Logo_romana_dorado.png, /gorra_trucker.png, etc.)
  if (targetUrl.startsWith('/')) {
    return targetUrl;
  }

  return `/${targetUrl}`;
};

/**
 * Parsea y resuelve todas las fotos de un producto (para objetos con 1 o más fotos).
 * Retorna siempre un array de URLs válidas.
 */
export const resolveProductImages = (url, defaultFallback = '') => {
  if (!url) return defaultFallback ? [defaultFallback] : [];
  
  let rawList = [];
  if (Array.isArray(url)) {
    rawList = url;
  } else if (typeof url === 'string') {
    rawList = url.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    rawList = [String(url).trim()];
  }

  const resolved = rawList.map(item => resolveImageUrl(item)).filter(Boolean);
  if (resolved.length === 0 && defaultFallback) {
    return [defaultFallback];
  }
  return resolved;
};
