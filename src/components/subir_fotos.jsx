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

function cantidad(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function resumen({ fotos, videos }) {
  return [fotos > 0 && cantidad(fotos, "foto", "fotos"), videos > 0 && cantidad(videos, "video", "videos")]
    .filter(Boolean)
    .join(" y ");
}

function Ornamento({ invertido }) {
  return (
    <svg viewBox="0 0 200 60" className="w-[160px] sm:w-[180px] opacity-70" style={{ display: 'block', margin: invertido ? '-8px auto 0' : '0 auto -12px' }}>
      <path d={invertido ? "M20,20 Q60,50 100,20 T180,20" : "M20,40 Q60,10 100,40 T180,40"} fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
      <path d={invertido ? "M30,32 Q40,45 50,32 Q40,25 30,32" : "M30,28 Q40,15 50,28 Q40,35 30,28"} fill="var(--sage)" />
      <path d={invertido ? "M150,32 Q160,45 170,32 Q160,25 150,32" : "M150,28 Q160,15 170,28 Q160,35 150,28"} fill="var(--sage)" />
      <circle cx="100" cy={invertido ? 20 : 40} r="5" fill="var(--rose)" />
    </svg>
  );
}

function IconoCamara() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function Miniatura({ item }) {
  const porcentaje = Math.round(item.progreso * 100);
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[var(--sky-soft)] to-[var(--blush)] shadow-sm">
      {item.vista && !item.esVideo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.vista} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl">{item.esVideo ? "🎬" : "📷"}</div>
      )}

      {item.estado === "pendiente" && <div className="absolute inset-0 bg-white/55" />}

      {item.estado === "subiendo" && (
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
          <span className="text-white text-sm font-bold drop-shadow">{porcentaje}%</span>
          <div className="absolute bottom-0 left-0 h-1 bg-[var(--gold)] transition-all" style={{ width: `${porcentaje}%` }} />
        </div>
      )}

      {item.estado === "listo" && (
        <span className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[var(--sage-deep)] text-white text-xs flex items-center justify-center shadow">✓</span>
      )}

      {item.estado === "error" && (
        <div className="absolute inset-0 bg-red-500/45 flex items-center justify-center">
          <span className="w-7 h-7 rounded-full bg-white text-red-600 font-bold flex items-center justify-center">!</span>
        </div>
      )}
    </div>
  );
}

export default function SubirFotos({ codigo, estado }) {

  const [items, setItems] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [compartidos, setCompartidos] = useState(null);
  const inputRef = useRef(null);
  const colaRef = useRef([]);
  const corriendoRef = useRef(false);
  const vistasRef = useRef([]);

  const activos = items.filter((i) => i.estado !== "error");
  const pendientes = items.filter((i) => i.estado === "pendiente" || i.estado === "subiendo").length;
  const listos = items.filter((i) => i.estado === "listo").length;
  const conError = items.filter((i) => i.estado === "error");
  const reintentables = conError.filter((i) => i.reintentable);
  const progresoTotal = activos.length ? activos.reduce((suma, i) => suma + i.progreso, 0) / activos.length : 0;
  const totalCompartidos = compartidos ? compartidos.fotos + compartidos.videos : 0;

  function actualizar(id, cambios) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...cambios } : i)));
  }

  // Lo que el invitado ya subió (se lee desde Drive, así se mantiene aunque recargue o cambie de celular)
  useEffect(() => {
    fetch(`/api/fotos/subir?codigo=${encodeURIComponent(codigo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCompartidos(data ?? { fotos: 0, videos: 0 }))
      .catch(() => setCompartidos({ fotos: 0, videos: 0 }));
  }, [codigo]);

  // Liberar las miniaturas al salir
  useEffect(() => {
    const vistas = vistasRef.current;
    return () => vistas.forEach((url) => URL.revokeObjectURL(url));
  }, []);

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
        const tipo = item.esVideo ? "videos" : "fotos";
        setCompartidos((c) => ({ ...(c ?? { fotos: 0, videos: 0 }), [tipo]: (c?.[tipo] ?? 0) + 1 }));
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
      n.copia
        .then((copia) => {
          if (n.esVideo) return;
          const vista = URL.createObjectURL(copia);
          vistasRef.current.push(vista);
          actualizar(n.id, { vista });
        })
        .catch(() => {}); // el error se maneja al momento de subirlo
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
    <section className="fotos w-full flex flex-col items-center pt-4 pb-12 md:pb-16 px-4">

      <Ornamento />
      <h2 className="sec-title relative z-10 text-center m-0 leading-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)' }}>
        Fotos
      </h2>
      <Ornamento invertido />

      <p className="text-center text-[var(--text-mid)] mt-4 mb-8 max-w-md leading-relaxed" style={{ fontSize: 'clamp(0.95rem, 3vw, 1.05rem)' }}>
        {estado === "cerrada"
          ? "Gracias a todos por compartir sus recuerdos con nosotros."
          : "Revivamos juntos este día: compártenos las fotos y videos que tomaste. Solo nosotros los veremos."}
      </p>

      <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-md border border-[var(--sage)]/30 shadow-[0_20px_50px_-20px_rgba(127,166,136,0.5)] overflow-hidden">

        <div className="h-1.5 bg-gradient-to-r from-[var(--sky)] via-[var(--blush-mid)] to-[var(--sage)]" />

        <div className="p-6 sm:p-8 flex flex-col items-center text-center">

          {totalCompartidos > 0 && (
            <div className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--blush)]/70 border border-[var(--blush-mid)]/50 text-[var(--text)] text-sm">
              <span>💛</span>
              <span>Ya nos compartiste <strong className="font-semibold">{resumen(compartidos)}</strong></span>
            </div>
          )}

          {estado === "cerrada" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="text-4xl">📸</span>
              <p className="text-[var(--text-mid)]">La subida de fotos ya cerró. ¡Gracias por acompañarnos! ❤️</p>
            </div>
          ) : (
            <>
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
                className="group w-full rounded-2xl border-2 border-dashed border-[var(--gold)]/50 bg-[var(--cream)] hover:bg-[var(--sky-pale)] hover:border-[var(--sage-deep)] transition-all duration-300 px-6 py-8 flex flex-col items-center gap-4"
              >
                <span className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--sage-deep)] to-[var(--rose)] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <IconoCamara />
                </span>
                <span className="text-[1.5rem] leading-tight text-[var(--text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {items.length > 0 || totalCompartidos > 0 ? "Subir más recuerdos" : "Toca aquí para subir"}
                </span>
                <span className="text-sm text-[var(--text-soft)]">
                  Fotos y videos · puedes elegir varios a la vez
                </span>
              </button>

              <p className="text-xs text-[var(--text-soft)] mt-3">Videos de hasta {MAX_VIDEO_MB} MB</p>
            </>
          )}

          {items.length > 0 && (
            <div className="w-full mt-8 pt-6 border-t border-[var(--sage)]/20">

              <p className="font-medium text-[var(--text)] mb-3">
                {pendientes > 0
                  ? `Subiendo ${listos + 1} de ${listos + pendientes}...`
                  : conError.length === 0
                    ? "¡Listo! Tus recuerdos ya están con nosotros 🎉"
                    : `${cantidad(listos, "archivo subido", "archivos subidos")} · ${conError.length} con problemas`}
              </p>

              {pendientes > 0 && (
                <>
                  <div className="h-2 rounded-full bg-[var(--sage)]/25 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--sage-deep)] to-[var(--gold)] transition-all duration-300"
                      style={{ width: `${Math.round(progresoTotal * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--rose)] mt-3 leading-relaxed">
                    Mantén esta página abierta hasta que termine. Si cambias de app, la subida se pausa y continúa al volver.
                  </p>
                </>
              )}

              <div className="grid grid-cols-4 gap-2 mt-5">
                {items.map((item) => <Miniatura key={item.id} item={item} />)}
              </div>

              {conError.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1 text-left">
                  {conError.map((item) => (
                    <li key={item.id} className="text-xs text-red-600">
                      <span className="font-medium">{item.archivo.name}:</span> {item.error}
                    </li>
                  ))}
                </ul>
              )}

              {!subiendo && reintentables.length > 0 && (
                <button
                  onClick={reintentar}
                  className="mt-4 px-6 py-2 rounded-full text-sm font-medium text-[var(--sage-deep)] border border-[var(--sage-deep)] hover:bg-[var(--sage-deep)] hover:text-white transition-all"
                >
                  Reintentar los que fallaron
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
