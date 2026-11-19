"use client";

import { useEffect, useState } from "react";
import { MAX_AUTOR, MAX_MENSAJE, MAX_MENSAJES_POR_INVITACION } from "@/lib/fotos";

function IconoCarta() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

const CAMPO = "w-full rounded-2xl border border-[var(--gold)]/40 bg-[var(--cream)] px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--sage-deep)] focus:ring-2 focus:ring-[var(--sage)]/30 transition";

function Editor({ inicial, puedeCancelar, onGuardar, onCancelar }) {
  const [autor, setAutor] = useState(inicial.autor);
  const [texto, setTexto] = useState(inicial.mensaje);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function enviar() {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setError("");
    try {
      await onGuardar({ autor: autor.trim(), mensaje: texto.trim() });
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <input
        value={autor}
        onChange={(e) => setAutor(e.target.value.slice(0, MAX_AUTOR))}
        placeholder="¿Quién escribe? (opcional)"
        className={`${CAMPO} mb-3`}
        style={{ fontSize: '16px' /* evita el zoom automático en iPhone */ }}
      />
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value.slice(0, MAX_MENSAJE))}
        rows={5}
        placeholder="Escribe aquí tu mensaje..."
        className={`${CAMPO} leading-relaxed resize-none`}
        style={{ fontSize: '16px' }}
      />
      <p className="self-end text-xs text-[var(--text-soft)] mt-1">{texto.length}/{MAX_MENSAJE}</p>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="flex gap-3 mt-4">
        {puedeCancelar && (
          <button
            onClick={onCancelar}
            className="px-6 py-2.5 rounded-full text-sm font-medium text-[var(--text-mid)] border border-[var(--sage)]/50 hover:bg-[var(--sky-pale)] transition-all"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          className="px-8 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[var(--sage-deep)] to-[var(--rose)] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {enviando ? "Enviando..." : inicial.id ? "Guardar cambios" : "Enviar mensaje"}
        </button>
      </div>
    </div>
  );
}

export default function Mensaje({ codigo }) {

  const [mensajes, setMensajes] = useState(null); // null = cargando
  const [editando, setEditando] = useState(null); // null, "nuevo" o el id del mensaje

  // Los mensajes que ya dejó la invitación (se leen desde Drive, así se pueden ver y editar después)
  useEffect(() => {
    fetch(`/api/mensajes?codigo=${encodeURIComponent(codigo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const lista = data?.mensajes ?? [];
        setMensajes(lista);
        if (lista.length === 0) setEditando("nuevo");
      })
      .catch(() => {
        setMensajes([]);
        setEditando("nuevo");
      });
  }, [codigo]);

  async function guardar(id, { autor, mensaje }) {
    const res = await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, autor, mensaje, ...(id && { id }) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No pudimos guardar tu mensaje. Intenta nuevamente.");
    setMensajes((prev) =>
      id ? prev.map((m) => (m.id === id ? { id, autor, mensaje } : m)) : [...prev, { id: data.id, autor, mensaje }]
    );
    setEditando(null);
  }

  const puedeAgregar = mensajes && mensajes.length < MAX_MENSAJES_POR_INVITACION;

  return (
    <section className="mensajes w-full flex flex-col items-center pt-4 pb-12 md:pb-16 px-4">

      <h2 className="sec-title relative z-10 text-center m-0 leading-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)' }}>
        Buenos deseos
      </h2>

      <p className="text-center text-[var(--text-mid)] mt-4 mb-8 max-w-md leading-relaxed" style={{ fontSize: 'clamp(0.95rem, 3vw, 1.05rem)' }}>
        Déjanos un mensaje, un consejo o tus deseos para nuestro matrimonio. Lo guardaremos con mucho cariño.
      </p>

      <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-md border border-[var(--sage)]/30 shadow-[0_20px_50px_-20px_rgba(127,166,136,0.5)] overflow-hidden">

        <div className="h-1.5 bg-gradient-to-r from-[var(--blush-mid)] via-[var(--gold)] to-[var(--sky)]" />

        <div className="p-6 sm:p-8 flex flex-col items-center text-center">

          <span className="w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-[var(--rose)] to-[var(--gold)] text-white flex items-center justify-center shadow-lg">
            <IconoCarta />
          </span>

          {mensajes === null ? (
            <p className="text-sm text-[var(--text-soft)] py-6">Cargando...</p>
          ) : (
            <>
              {mensajes.length > 0 && (
                <>
                  <p className="font-medium text-[var(--text)] mb-4">¡Gracias por sus palabras! 💛</p>
                  <ul className="w-full flex flex-col gap-3 mb-2">
                    {mensajes.map((m) => (
                      <li key={m.id}>
                        {editando === m.id ? (
                          <Editor
                            inicial={m}
                            puedeCancelar
                            onGuardar={(datos) => guardar(m.id, datos)}
                            onCancelar={() => setEditando(null)}
                          />
                        ) : (
                          <div className="w-full text-left rounded-2xl bg-[var(--blush)]/50 border border-[var(--blush-mid)]/40 px-5 py-4">
                            <p className="whitespace-pre-wrap break-words text-[var(--text-mid)] leading-relaxed italic">{m.mensaje}</p>
                            <div className="flex items-center justify-between gap-3 mt-3">
                              <span className="text-sm font-medium text-[var(--text)] truncate">{m.autor && `— ${m.autor}`}</span>
                              {editando === null && (
                                <button
                                  onClick={() => setEditando(m.id)}
                                  className="shrink-0 text-sm font-medium text-[var(--sage-deep)] underline underline-offset-4 hover:text-[var(--rose)] transition-colors"
                                >
                                  Editar
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {editando === "nuevo" ? (
                <div className={`w-full ${mensajes.length > 0 ? "mt-4 pt-5 border-t border-[var(--sage)]/20" : ""}`}>
                  <Editor
                    inicial={{ autor: "", mensaje: "" }}
                    puedeCancelar={mensajes.length > 0}
                    onGuardar={(datos) => guardar(null, datos)}
                    onCancelar={() => setEditando(null)}
                  />
                </div>
              ) : (
                editando === null && puedeAgregar && (
                  <button
                    onClick={() => setEditando("nuevo")}
                    className="mt-4 px-6 py-2 rounded-full text-sm font-medium text-[var(--sage-deep)] border border-[var(--sage-deep)] hover:bg-[var(--sage-deep)] hover:text-white transition-all"
                  >
                    ✍️ Escribir otro mensaje
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

    </section>
  );
}
