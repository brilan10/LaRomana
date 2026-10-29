/**
 * Utilidad para forzar actualización de la aplicación y borrado de caché
 * Equivalente a Shift + F5 para teléfonos móviles (PWA / Acceso directo) y navegadores de escritorio.
 */

export async function forceAppUpdateAndClearCache() {
  try {
    // 1. Desregistrar todos los Service Workers activos
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          try {
            if (reg.active) {
              reg.active.postMessage({ action: 'clearCache' });
              reg.active.postMessage({ action: 'skipWaiting' });
            }
            await reg.unregister();
          } catch (e) {
            console.warn('Error al desregistrar service worker:', e);
          }
        }
      } catch (e) {
        console.warn('Error obteniendo registrations:', e);
      }
    }

    // 2. Eliminar absolutamente todos los cachés almacenados (CacheStorage)
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(k => caches.delete(k)));
      } catch (e) {
        console.warn('Error borrando caches:', e);
      }
    }

    // 3. Limpiar almacenamiento de sesión y almacenamiento temporal
    try {
      sessionStorage.clear();
    } catch (e) {}

    // 4. Romper el caché HTTP forzando una URL con timestamp único
    const targetUrl = new URL(window.location.origin + window.location.pathname);
    targetUrl.searchParams.set('_v', Date.now().toString());

    // 5. Redireccionar / reemplazar ubicación sin historial para carga limpia
    window.location.replace(targetUrl.toString());
  } catch (err) {
    console.error('Error forzando actualización:', err);
    window.location.reload(true);
  }
}
