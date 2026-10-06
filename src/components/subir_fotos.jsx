"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_VIDEO_MB } from "@/lib/fotos";

const LADO_MAX_FOTO = 2560;
const CALIDAD_FOTO = 0.85;
const TAMANO_TROZO = 4 * 1024 * 1024; // debe ser múltiplo de 256 KB
const MAX_REINTENTOS = 8;
const SIN_AVANCE_MS = 20000; // si un trozo no avanza en este tiempo, se corta y se retoma
const PAUSA_MINIMA_MS = 3000; // tiempo en segundo plano tras el cual se retoma al volver

// Subida en curso, para poder cortarla si el celular la dejó colgada al cambiar de app
let xhrActivo = null;

function pausar() {
  if (!xhrActivo) return;
  xhrActivo.pausa = true;
  xhrActivo.abort();
}

const ARCHIVO_ILEGIBLE = "No pudimos leer este archivo desde tu celular. Vuelve a elegirlo e inténtalo de nuevo.";

// En Android, Google Fotos le da al navegador un permiso de lectura que expira en segundos.
// Por eso, apenas se eligen los archivos, se copian todos de inmediato y luego se suben desde la copia.
// La copia se arma en partes como Blob, que Chrome guarda en disco si es grande (no satura la memoria).
async function copiarArchivo(archivo) {
  const lector = archivo.stream().getReader();
  let copia = new Blob([], { type: archivo.type });
  let partes = [];
  let acumulado = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    partes.push(value);
    acumulado += value.byteLength;
    if (acumulado >= 16 * 1024 * 1024) {
      copia = new Blob([copia, ...partes], { type: archivo.type });
      partes = [];
      acumulado = 0;
    }
  }
  copia = new Blob([copia, ...partes], { type: archivo.type });
  if (copia.size !== archivo.size) throw new Error(`copia incompleta ${copia.size}/${archivo.size}`);
  return new File([copia], archivo.name, { type: archivo.type, lastModified: archivo.lastModified });
}

// Reduce la foto en el mismo celular; si algo falla, se sube la original
async function comprimirFoto(archivo) {
  if (!archivo.type.startsWith("image/") || archivo.type === "image/gif") return archivo;
  try {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, LADO_MAX_FOTO / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", CALIDAD_FOTO));
    if (!blob || blob.size >= archivo.size) return archivo;

    const nombre = archivo.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nombre, { type: "image/jpeg", lastModified: archivo.lastModified });
  } catch {
    return archivo;
  }
}

function put(url, cuerpo, contentRange, onProgreso) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let ultimoAvance = Date.now();
    const vigilante = setInterval(() => {
      if (Date.now() - ultimoAvance > SIN_AVANCE_MS) xhr.abort();
    }, 5000);
    const terminar = () => {
      clearInterval(vigilante);
      if (xhrActivo === xhr) xhrActivo = null;
    };

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Range", contentRange);
    xhr.upload.onprogress = (e) => {
      ultimoAvance = Date.now();
      onProgreso?.(e.loaded);
    };
    xhr.upload.onload = () => { ultimoAvance = Date.now(); };
    xhr.onload = () => { terminar(); resolve(xhr); };
    xhr.onerror = () => { terminar(); reject(new Error("Se perdió la conexión")); };
    xhr.onabort = () => {
      terminar();
      reject(Object.assign(new Error("La subida se interrumpió"), { pausa: xhr.pausa }));
    };

    xhrActivo = xhr;
    xhr.send(cuerpo);
  });
}

// Lee el header Range ("bytes=0-1234") para saber desde dónde continuar
function siguienteByte(xhr, porDefecto) {
  const rango = xhr.getResponseHeader("Range");
  const fin = rango && rango.match(/-(\d+)$/);
  return fin ? Number(fin[1]) + 1 : porDefecto;
}

// Sube en trozos a la sesión reanudable de Google Drive; si se corta la señal, retoma donde quedó
async function subirArchivo(url, archivo, onProgreso) {
  const total = archivo.size;
  let inicio = 0;
  let fallos = 0;

  while (inicio < total) {
    const fin = Math.min(inicio + TAMANO_TROZO, total);

    // Leer el trozo a memoria antes de enviarlo: en Android el navegador a veces pierde el permiso
    // para leer archivos de la galería, y así lo detectamos en vez de reintentar sin sentido
    let trozo;
    try {
      trozo = await archivo.slice(inicio, fin).arrayBuffer();
    } catch {
      throw Object.assign(new Error(ARCHIVO_ILEGIBLE), { definitivo: true, ilegible: true });
    }

    try {
      const xhr = await put(url, trozo, `bytes ${inicio}-${fin - 1}/${total}`, (cargado) =>
        onProgreso((inicio + cargado) / total)
      );
      if (xhr.status === 200 || xhr.status === 201) return;
      if (xhr.status === 308) {
        inicio = siguienteByte(xhr, fin);
        fallos = 0;
        continue;
      }
      if (xhr.status < 500) throw Object.assign(new Error("La subida fue rechazada"), { definitivo: true });
      throw new Error("Error temporal del servidor");
    } catch (e) {
      if (e.definitivo) throw e;
      // Las pausas por cambiar de app no cuentan como fallo
      if (!e.pausa && ++fallos > MAX_REINTENTOS) throw e;
      await new Promise((r) => setTimeout(r, e.pausa ? 500 : Math.min(15000, 1000 * 2 ** fallos)));
      try {
        const estado = await put(url, null, `bytes */${total}`);
        if (estado.status === 200 || estado.status === 201) return;
        if (estado.status === 308) inicio = siguienteByte(estado, 0);
      } catch {
        // sin conexión todavía; se reintenta en la siguiente vuelta
      }
    }
  }
}

async function pedirSesion(codigo, archivo) {
  const res = await fetch("/api/fotos/subir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codigo,
      nombre: archivo.name,
      tipo: archivo.type,
      tamano: archivo.size,
      fecha: new Date(archivo.lastModified).toISOString(),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "No pudimos preparar la subida");
  return data.uploadUrl;
}

let siguienteId = 0;

export default function SubirFotos({ codigo, estado }) {

  const [items, setItems] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);
  const colaRef = useRef([]);
  const corriendoRef = useRef(false);

  const pendientes = items.filter((i) => i.estado === "pendiente" || i.estado === "subiendo").length;
  const listos = items.filter((i) => i.estado === "listo").length;
  const conError = items.filter((i) => i.estado === "error");
  const reintentables = conError.filter((i) => i.reintentable);

  function actualizar(id, cambios) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...cambios } : i)));
  }

  // Avisar si intentan cerrar la página con subidas en curso
  useEffect(() => {
    if (!subiendo) return;
    const avisar = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [subiendo]);

  // Al volver a la app después de un rato, retomar de inmediato (el celular suele dejar la subida colgada)
  useEffect(() => {
    if (!subiendo) return;
    let ocultaDesde = null;
    const alCambiar = () => {
      if (document.visibilityState === "hidden") {
        ocultaDesde = Date.now();
      } else if (ocultaDesde && Date.now() - ocultaDesde > PAUSA_MINIMA_MS) {
        pausar();
      }
    };
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, [subiendo]);

  // Mantener la pantalla encendida mientras se sube (si el navegador lo permite)
  useEffect(() => {
    if (!subiendo || !("wakeLock" in navigator)) return;
    let bloqueo = null;
    const pedir = () => {
      if (document.visibilityState === "visible") {
        navigator.wakeLock.request("screen").then((b) => { bloqueo = b; }).catch(() => {});
      }
    };
    pedir();
    document.addEventListener("visibilitychange", pedir);
    return () => {
      document.removeEventListener("visibilitychange", pedir);
      bloqueo?.release().catch(() => {});
    };
  }, [subiendo]);

  async function procesarCola() {
    if (corriendoRef.current) return;
    corriendoRef.current = true;
    setSubiendo(true);
    while (colaRef.current.length > 0) {
      const item = colaRef.current.shift();
      actualizar(item.id, { estado: "subiendo", progreso: 0, error: null });
      try {
        let copia;
        try {
          copia = await item.copia;
        } catch {
          throw Object.assign(new Error(ARCHIVO_ILEGIBLE), { ilegible: true });
        }
        const archivo = await comprimirFoto(copia);
        const url = await pedirSesion(codigo, archivo);
        await subirArchivo(url, archivo, (progreso) => actualizar(item.id, { progreso }));
        actualizar(item.id, { estado: "listo", progreso: 1, copia: null });
        item.copia = null; // liberar la copia
      } catch (e) {
        actualizar(item.id, { estado: "error", error: e.message, reintentable: !e.ilegible });
      }
    }
    corriendoRef.current = false;
    setSubiendo(false);
  }

  function agregar(archivos) {
    const nuevos = Array.from(archivos).map((archivo) => {
      const esVideo = archivo.type.startsWith("video/");
      const esValido = esVideo || archivo.type.startsWith("image/");
      const muyGrande = esVideo && archivo.size > MAX_VIDEO_MB * 1024 * 1024;
      return {
        id: ++siguienteId,
        archivo,
        esVideo,
        progreso: 0,
        estado: !esValido || muyGrande ? "error" : "pendiente",
        error: !esValido ? "Solo se pueden subir fotos y videos" : muyGrande ? `El video supera los ${MAX_VIDEO_MB} MB` : null,
      };
    });
    // Copiar todos de inmediato y en paralelo, antes de que expire el permiso de lectura
    for (const n of nuevos) {
      if (n.estado !== "pendiente") continue;
      n.copia = copiarArchivo(n.archivo);
      n.copia.catch(() => {}); // el error se maneja al momento de subirlo
    }
    setItems((prev) => [...prev, ...nuevos]);
    colaRef.current.push(...nuevos.filter((n) => n.estado === "pendiente"));
    procesarCola();
  }

  function reintentar() {
    reintentables.forEach((i) => actualizar(i.id, { estado: "pendiente", error: null }));
    colaRef.current.push(...reintentables);
    procesarCola();
  }

  return (
    <section className="fotos w-full flex flex-col items-center py-16 px-4">

      <h2 className="sec-title text-center m-0 leading-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)' }}>
        Fotos
      </h2>

      {estado === "cerrada" ? (
        <p className="text-center text-[var(--text-soft)] mt-6 max-w-md" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.05rem)' }}>
          La subida de fotos ya cerró. ¡Gracias a todos por compartir sus recuerdos con nosotros! ❤️
        </p>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center mt-6">

          <p className="text-center text-[var(--text-mid)] mb-8 leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.05rem)' }}>
            ¿Sacaste fotos o videos en la boda? ¡Compártelos con nosotros! Solo nosotros los veremos.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => { agregar(e.target.files); e.target.value = ""; }}
          />

          <button
            onClick={() => inputRef.current?.click()}
            className="px-8 py-4 rounded-full uppercase tracking-[0.15em] text-[0.85rem] font-semibold text-white bg-[var(--sage-deep)] hover:bg-[var(--gold)] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {items.length > 0 ? "Subir más fotos y videos" : "Subir fotos y videos"}
          </button>

          <p className="text-center text-[var(--text-soft)] text-xs mt-3">
            Puedes elegir varios a la vez · Videos de hasta {MAX_VIDEO_MB} MB
          </p>

          {items.length > 0 && (
            <div className="w-full mt-8 bg-white/70 backdrop-blur-md rounded-2xl border border-[var(--sage)]/30 shadow-lg p-5">

              <p className="text-center font-medium text-[var(--text)] mb-1">
                {pendientes > 0
                  ? `Subiendo... ${listos} de ${listos + pendientes} listos`
                  : conError.length === 0
                    ? `¡Gracias! Recibimos tus ${listos} recuerdos ❤️`
                    : `${listos} subidos, ${conError.length} con problemas`}
              </p>

              {pendientes > 0 && (
                <p className="text-center text-xs text-[var(--rose)] mb-3">Mantén esta página abierta hasta que termine. Si cambias de app, la subida se pausa y continúa al volver</p>
              )}

              <ul className="mt-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id} className="text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[var(--text-mid)]">
                        {item.esVideo ? "🎬" : "📷"} {item.archivo.name}
                      </span>
                      <span className="shrink-0 text-xs">
                        {item.estado === "listo" && <span className="text-green-600">✓</span>}
                        {item.estado === "pendiente" && <span className="text-[var(--text-soft)]">En espera</span>}
                        {item.estado === "subiendo" && <span className="text-[var(--gold)]">{Math.round(item.progreso * 100)}%</span>}
                        {item.estado === "error" && <span className="text-red-600">Error</span>}
                      </span>
                    </div>
                    {item.estado === "subiendo" && (
                      <div className="h-1 mt-1 rounded-full bg-[var(--sage)]/30 overflow-hidden">
                        <div className="h-full bg-[var(--gold)] transition-all" style={{ width: `${item.progreso * 100}%` }} />
                      </div>
                    )}
                    {item.estado === "error" && <p className="text-xs text-red-600 mt-0.5">{item.error}</p>}
                  </li>
                ))}
              </ul>

              {!subiendo && reintentables.length > 0 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={reintentar}
                    className="px-6 py-2 rounded-full text-sm font-medium text-[var(--sage-deep)] border border-[var(--sage-deep)] hover:bg-[var(--sage-deep)] hover:text-white transition-all"
                  >
                    Reintentar los que fallaron
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </section>
  );
}
