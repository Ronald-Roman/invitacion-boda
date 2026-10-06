// Configuración de la sección "Fotos" (compartida entre la página y el servidor)

// Se abre el día de la boda y queda abierta hasta el 5 de diciembre a las 23:59 (hora de Chile)
export const APERTURA_FOTOS = new Date("2026-11-21T00:00:00-03:00");
export const CIERRE_FOTOS = new Date("2026-12-06T00:00:00-03:00");

export const MAX_VIDEO_MB = 500;
// Las fotos se comprimen antes de subir; este límite solo aplica si no se pudieron comprimir
export const MAX_FOTO_MB = 50;

export function estadoFotos(ahora = new Date()) {
  if (ahora < APERTURA_FOTOS) return "pendiente";
  if (ahora < CIERRE_FOTOS) return "abierta";
  return "cerrada";
}
