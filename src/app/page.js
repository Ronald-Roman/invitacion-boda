"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Carousel from "@/components/carousel";
import Countdown from "@/components/countdown";

export default function Home() {

  const [invitado, setInvitado] = useState(null);
  const [asistencia, setAsistencia] = useState("");
  const [regalo, setRegalo] = useState("");
  const [yaConfirmado, setYaConfirmado] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo");

    if (!codigo) {
      setInvitado({ error: true });
      return;
    }

    async function obtenerInvitado() {

      const { data } = await supabase
        .from("invitados")
        .select("*")
        .eq("codigo", codigo)
        .single();

      if (data) {
        setInvitado(data);
        if (data.confirmado) {
          setYaConfirmado(true);
          setAsistencia(data.confirmado);
          setRegalo(data.regalo);
        }
      } else {
        setInvitado({ error: true, dbError: true });
      }

    }

    obtenerInvitado();

  }, []);


  async function confirmar() {

    if (!regalo) {
      setErrorMensaje("Por favor selecciona un regalo antes de confirmar tu asistencia.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo");

    await supabase
      .from("invitados")
      .update({
        confirmado: asistencia,
        regalo: regalo,
        fecha_confirmacion: new Date()
      })
      .eq("codigo", codigo);

    setYaConfirmado(true);
    alert("Gracias por confirmar ❤️");

  }

  if (!invitado) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-[#fdfaf6]">
        <p className="text-[var(--sage-deep)] text-2xl animate-pulse" style={{ fontFamily: "'Playfair Display', serif" }}>
          Cargando invitación...
        </p>
      </div>
    );
  }

  if (invitado.error) {
    return (
      <div className="flex w-full h-screen items-center justify-center flex-col bg-[#fdfaf6] px-6 text-center">
        <h1 className="text-3xl text-[var(--sage-deep)] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Acceso Inválido
        </h1>
        <p className="text-[var(--text-soft)] max-w-[400px]">
          Por favor, asegúrate de utilizar el enlace exacto que te enviaron los novios (el cual incluye tu código de invitado especial).
        </p>
      </div>
    );
  }

  return (

    <main>

      {/* HERO / PORTADA */}

      <section className="hero">

        {/* Decoraciones en esquinas */}
        <div className="corner tl"></div>
        <div className="corner tr"></div>
        <div className="corner bl"></div>
        <div className="corner br"></div>

        {/* Pétalos flotantes */}
        <div className="petal" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="petal" style={{ left: '20%', animationDelay: '1s' }}></div>
        <div className="petal" style={{ left: '30%', animationDelay: '2s' }}></div>
        <div className="petal" style={{ left: '40%', animationDelay: '3s' }}></div>
        <div className="petal" style={{ left: '50%', animationDelay: '4s' }}></div>
        <div className="petal" style={{ left: '60%', animationDelay: '5s' }}></div>
        <div className="petal" style={{ left: '70%', animationDelay: '6s' }}></div>
        <div className="petal" style={{ left: '80%', animationDelay: '7s' }}></div>
        <div className="petal" style={{ left: '90%', animationDelay: '8s' }}></div>

        <div className="hero-eyebrow">Te invitamos a nuestra boda</div>

        <div className="floral-frame">
          <svg className="floral-top" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,40 Q60,10 100,40 T180,40" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,28 Q40,15 50,28 Q40,35 30,28" fill="var(--sage)" />
            <path d="M70,24 Q80,10 90,24 Q80,30 70,24" fill="var(--sage)" />
            <path d="M110,24 Q120,10 130,24 Q120,30 110,24" fill="var(--sage)" />
            <path d="M150,28 Q160,15 170,28 Q160,35 150,28" fill="var(--sage)" />
            <circle cx="100" cy="40" r="7" fill="var(--rose)" />
            <circle cx="100" cy="40" r="3" fill="var(--gold)" />
            <circle cx="60" cy="32" r="5" fill="var(--blush-mid)" />
            <circle cx="140" cy="32" r="5" fill="var(--blush-mid)" />
            <circle cx="35" cy="22" r="3" fill="var(--rose)" />
            <circle cx="165" cy="22" r="3" fill="var(--rose)" />
          </svg>

          <div className="hero-names">
            A. FERNANDA <span className="hero-amp">&</span> BENJAMIN
          </div>

          <svg className="floral-bottom" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,20 Q60,50 100,20 T180,20" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,32 Q40,45 50,32 Q40,25 30,32" fill="var(--sage)" />
            <path d="M70,36 Q80,50 90,36 Q80,30 70,36" fill="var(--sage)" />
            <path d="M110,36 Q120,50 130,36 Q120,30 110,36" fill="var(--sage)" />
            <path d="M150,32 Q160,45 170,32 Q160,25 150,32" fill="var(--sage)" />
            <circle cx="100" cy="20" r="7" fill="var(--rose)" />
            <circle cx="100" cy="20" r="3" fill="var(--gold)" />
            <circle cx="60" cy="28" r="5" fill="var(--blush-mid)" />
            <circle cx="140" cy="28" r="5" fill="var(--blush-mid)" />
            <circle cx="35" cy="38" r="3" fill="var(--rose)" />
            <circle cx="165" cy="38" r="3" fill="var(--rose)" />
          </svg>
        </div>

        <div className="hero-rule"></div>

        <div className="scroll-cue">
          <span>Desliza</span>
          <div className="scroll-tick"></div>
        </div>

      </section>



      {/* INVITADO PERSONALIZADO */}

      <section className="invitado">

        <h2>Hola! {invitado.nombre}</h2>

        <p>
          Ayudanos a reservarte {invitado.personas} lugar(es) para ti en nuestra boda!
        </p>
        <p className="bg-red-50 text-red-700 font-semibold text-center p-3 rounded-lg border border-red-300 my-4">
          Favor recordar que esta invitacion es SIN Niños
        </p>


        {/* Auto rally */}
        <div className="rally-box">
          <div className="road"></div>
          <div className="rally-car"></div>
        </div>

      </section>

      <Carousel />
      <Countdown />

      <section className="py-24 w-full bg-transparent overflow-hidden">

        {/* Título estrictamente centrado */}
        <div className="w-full flex flex-col items-center justify-center text-center px-4 mb-16 relative">
          <svg viewBox="0 0 200 60" className="w-[200px] sm:w-[240px] opacity-70 mb-[-12px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,40 Q60,10 100,40 T180,40" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,28 Q40,15 50,28 Q40,35 30,28" fill="var(--sage)" />
            <path d="M70,24 Q80,10 90,24 Q80,30 70,24" fill="var(--sage)" />
            <path d="M110,24 Q120,10 130,24 Q120,30 110,24" fill="var(--sage)" />
            <path d="M150,28 Q160,15 170,28 Q160,35 150,28" fill="var(--sage)" />
            <circle cx="100" cy="40" r="7" fill="var(--rose)" />
            <circle cx="100" cy="40" r="3" fill="var(--gold)" />
          </svg>
          <h2
            className="text-[var(--text)] m-0 leading-tight z-10 relative"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 7vw, 3.8rem)', fontWeight: 400, fontStyle: 'italic' }}
          >
            Itinerario del<br />Matrimonio
          </h2>
          <svg viewBox="0 0 200 60" className="w-[200px] sm:w-[240px] opacity-70 mt-[-10px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,20 Q60,50 100,20 T180,20" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,32 Q40,45 50,32 Q40,25 30,32" fill="var(--sage)" />
            <path d="M70,36 Q80,50 90,36 Q80,30 70,36" fill="var(--sage)" />
            <path d="M110,36 Q120,50 130,36 Q120,30 110,36" fill="var(--sage)" />
            <path d="M150,32 Q160,45 170,32 Q160,25 150,32" fill="var(--sage)" />
            <circle cx="100" cy="20" r="7" fill="var(--rose)" />
            <circle cx="100" cy="20" r="3" fill="var(--gold)" />
          </svg>
        </div>

        {/* Grilla centralizada con formato fiel a la imagen */}
        <div className="w-full flex justify-center px-4">
          <div className="flex flex-col items-center">
            {[
              { time: "18:00", title: "Recepción", location: "" },
              { time: "19:00", title: "Ceremonia", location: "En pasarela de termas" },
              { time: "20:30", title: "Cóctel", location: "En la pileta de la pérgola" },
              { time: "21:00", title: "Cena", location: "En el salón central" },
              { time: "23:00", title: "Vals de los novios", location: "En la pérgola central" },
              { time: "23:30", title: "Inicio de fiesta", location: "Con DJ, juego, tortas y más" }
            ].map((item, i, arr) => (
              <div key={i} className="flex flex-col items-center">

                {/* Ítem dual: Hora y Detalle */}
                <div className="flex items-start justify-center gap-5 sm:gap-8 w-full">
                  <div className="w-[85px] sm:w-[120px] text-right flex-shrink-0 pt-[2px]">
                    <span
                      className="text-[1.6rem] sm:text-[2.2rem] text-[var(--text)] whitespace-nowrap"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.time}
                    </span>
                  </div>

                  <div className="flex flex-col items-start justify-start text-left flex-1 min-w-[160px] sm:min-w-[220px]">
                    <span
                      className="text-[1.5rem] sm:text-[1.8rem] text-[var(--text)] leading-tight mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.title}
                    </span>
                    {item.location && (
                      <span className="text-[0.95rem] sm:text-[1.05rem] font-light text-[var(--text-soft)] leading-snug">
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Separador inferior opcional (menos en el último) */}
                {i < arr.length - 1 && (
                  <div className="flex justify-center items-center opacity-40 my-6 sm:my-8 w-full">
                    <div className="h-[1px] w-[50px] sm:w-[70px] bg-gradient-to-r from-transparent to-[var(--sage-deep)]"></div>
                    <span className="mx-3 text-[var(--sage-deep)] font-serif italic text-xs">✧</span>
                    <div className="h-[1px] w-[50px] sm:w-[70px] bg-gradient-to-l from-transparent to-[var(--sage-deep)]"></div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

      </section>

      {/* UBICACION EN EL MAPA */}
      <section className="ubicacion py-16 md:py-24 w-full flex flex-col items-center bg-transparent mt-4">

        {/* Título decorado de la Ubicación */}
        <div className="floral-frame mb-10 flex flex-col items-center text-center w-full px-4">
          <svg viewBox="0 0 200 60" className="w-[160px] sm:w-[180px] opacity-70 mb-[-12px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,40 Q60,10 100,40 T180,40" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,28 Q40,15 50,28 Q40,35 30,28" fill="var(--sage)" />
            <path d="M150,28 Q160,15 170,28 Q160,35 150,28" fill="var(--sage)" />
            <circle cx="100" cy="40" r="5" fill="var(--rose)" />
          </svg>

          <h2 className="sec-title relative z-10 m-0 leading-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)' }}>
            Ubicación
          </h2>

          <svg viewBox="0 0 200 60" className="w-[160px] sm:w-[180px] opacity-70 mt-[-8px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,20 Q60,50 100,20 T180,20" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,32 Q40,45 50,32 Q40,25 30,32" fill="var(--sage)" />
            <path d="M150,32 Q160,45 170,32 Q160,25 150,32" fill="var(--sage)" />
            <circle cx="100" cy="20" r="5" fill="var(--rose)" />
          </svg>
        </div>

        {/* Textos descriptivos */}
        <div className="text-center mb-10 px-4">
          <p
            className="text-[1.5rem] md:text-[2rem] text-[var(--sage-deep)] tracking-wide mb-2 transition-colors hover:text-[var(--gold)]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Hotel Termas de Cauquenes
          </p>
          <p className="text-[0.95rem] md:text-[1.1rem] font-light text-[var(--text-soft)] max-w-[400px] mx-auto">
            Ruta H-75 Km 26, Machalí, Región de O'Higgins, Chile
          </p>
        </div>

        {/* Mapa embebido de Google */}
        <div className="w-full max-w-lg px-4 flex justify-center z-10 mx-auto">
          <div className="w-full shadow-2xl rounded-2xl overflow-hidden border border-[var(--sage)]/50 backdrop-blur-sm" style={{ height: "250px", width: "250px" }}>
            <iframe
              src="https://maps.google.com/maps?q=Hotel%20Termas%20de%20Cauquenes,%20Machali,%20Chile&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Hotel Termas de Cauquenes"
            ></iframe>
          </div>
        </div>
      </section>



      {/* SELECCIONA TU REGALO */}
      <section className="regalos py-16 md:py-24 w-full flex flex-col items-center bg-transparent mt-4">

        {/* Título decorado */}
        <div className="floral-frame mb-12 flex flex-col items-center text-center w-full px-4">
          <svg viewBox="0 0 200 60" className="w-[160px] sm:w-[180px] opacity-70 mb-[-12px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,40 Q60,10 100,40 T180,40" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,28 Q40,15 50,28 Q40,35 30,28" fill="var(--sage)" />
            <path d="M150,28 Q160,15 170,28 Q160,35 150,28" fill="var(--sage)" />
            <circle cx="100" cy="40" r="5" fill="var(--rose)" />
          </svg>

          <h2 className="sec-title relative z-10 m-0 leading-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)' }}>
            Selecciona tu regalo
          </h2>

          <svg viewBox="0 0 200 60" className="w-[160px] sm:w-[180px] opacity-70 mt-[-8px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,20 Q60,50 100,20 T180,20" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,32 Q40,45 50,32 Q40,25 30,32" fill="var(--sage)" />
            <path d="M150,32 Q160,45 170,32 Q160,25 150,32" fill="var(--sage)" />
            <circle cx="100" cy="20" r="5" fill="var(--rose)" />
          </svg>
        </div>

        {/* Grilla Centrada de Opciones */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto px-4 w-full">
            {[
              { id: "opcion1", title: "Estanque Lleno!", desc: "Ayúdanos a llenar el estanque de nuestra camioneta para nuestros viajes.", img: "/regalos/l200.jpg", price: "$70.000" },
              { id: "opcion2", title: "Cena romántica", desc: "Invítanos a una cena inolvidable para celebrar nuestro compromiso matrimonial.", img: "/regalos/cena.jpg", price: "$140.000" },
              { id: "opcion3", title: "Noche de SPA!", desc: "Regálanos un día de relajación total y masajes para después de la gran fiesta.", img: "/regalos/spa.jpg", price: "$200.000" },
              { id: "opcion4", title: "Viaje a la Playa", desc: "Un aporte para un viaje de desconexión a la playa.", img: "/regalos/playa.jpg", price: "$300.000" }
            ].map((opt) => (
              <div
                key={opt.id}
                className={`flex flex-col bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 ${yaConfirmado ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} w-full mx-auto max-w-sm md:max-w-none ${regalo === opt.id
                  ? 'border-2 border-[var(--gold)] shadow-[0_0_20px_rgba(215,181,109,0.3)] scale-[1.02]'
                  : 'border border-[var(--sage)]/30 shadow-lg hover:shadow-xl hover:-translate-y-1'
                  }`}
                onClick={() => !yaConfirmado && (setRegalo(opt.id), setErrorMensaje(""))}
              >
                {/* Imagen estilo card-img-top */}
                <div className="w-full h-48 md:h-56 overflow-hidden relative">
                  <img src={opt.img} alt={opt.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  {regalo === opt.id && (
                    <div className="absolute inset-0 bg-[var(--gold)]/20 flex items-center justify-center backdrop-blur-[2px] transition-all">
                      <span className="bg-white/95 text-[var(--gold)] px-6 py-2 rounded-full text-sm font-bold tracking-widest shadow-lg">✓ SELECCIONADO</span>
                    </div>
                  )}
                </div>

                {/* Cuerpo estilo card-body */}
                <div className="p-6 md:p-8 flex flex-col items-center text-center flex-grow">
                  <h5 className="text-[1.5rem] md:text-[1.8rem] text-[var(--sage-deep)] mb-3" style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
                    {opt.title}
                  </h5>
                  <p className="text-[0.95rem] font-light text-[var(--text-soft)] mb-5 flex-grow leading-relaxed">
                    {opt.desc}
                  </p>

                  {/* PRECIO */}
                  <div className="mb-6 w-full flex justify-center border-t border-[var(--sage)]/20 pt-4">
                    <span className="text-[1.2rem] text-[var(--gold)] font-medium tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {opt.price}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); !yaConfirmado && (setRegalo(opt.id), setErrorMensaje("")); }}
                    disabled={yaConfirmado}
                    className={`px-8 py-3 rounded-full uppercase tracking-[0.2em] text-[0.75rem] font-semibold transition-all duration-300 w-full sm:w-auto ${regalo === opt.id
                      ? 'bg-[var(--gold)] text-white shadow-md border border-[var(--gold)]'
                      : 'bg-transparent text-[var(--sage-deep)] border border-[var(--sage-deep)] hover:bg-[var(--sage-light)] hover:text-white hover:border-transparent'
                      } ${yaConfirmado ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {regalo === opt.id ? 'Elegido' : 'Elegir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Espaciador físico garantizado */}
        <div className="w-full" style={{ height: '50px' }}></div>

        {/* REGALO VIP*/}
        <div className="w-full max-w-2xl mx-auto px-4 mb-20">
          <div
            className={`flex flex-col md:flex-row bg-[#1c221f] rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl relative ${yaConfirmado ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${regalo === "opcionVIP"
              ? 'border-2 border-[var(--gold)] shadow-[0_0_40px_rgba(215,181,109,0.5)] scale-[1.02]'
              : 'border border-[#3a4439] hover:shadow-[0_0_20px_rgba(215,181,109,0.2)] hover:-translate-y-1'
              }`}
            onClick={() => !yaConfirmado && (setRegalo("opcionVIP"), setErrorMensaje(""))}
          >
            {/* Imagen Especial VIP */}
            <div className="w-full md:w-5/12 h-64 md:h-auto overflow-hidden relative border-r border-[#3a4439]">
              <img src="/regalos/vip.jpeg" alt="Luna de Miel VIP" className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110 opacity-70" />

              {/* Gradiente de fusion */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#1c221f] via-transparent to-transparent opacity-90"></div>

              {regalo === "opcionVIP" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] transition-all">
                  <span className="bg-[#1c221f]/90 text-[var(--gold)] px-6 py-2 rounded-full text-sm font-bold tracking-widest shadow-lg uppercase border border-[var(--gold)]/30">
                    ✨ VIP ELEGIDO ✨
                  </span>
                </div>
              )}

              {/* Etiqueta Flotante VIP */}
              <span className="absolute top-4 left-4 bg-[var(--gold)] text-[#1c221f] text-[0.6rem] px-4 py-1.5 tracking-[0.4em] rounded-sm font-bold shadow-md">
                OPCIÓN VIP
              </span>
            </div>

            {/* Cuerpo del Regalo VIP */}
            <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center text-center md:text-left relative z-10">
              <h5 className="text-[1.8rem] md:text-[2.2rem] text-[var(--gold)] mb-3" style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
                Luna de Miel
              </h5>
              <p className="text-[0.95rem] font-light text-gray-300 opacity-90 mb-6 flex-grow leading-relaxed max-w-[400px] mx-auto md:mx-0">
                El aporte maestro. Ayúdanos a vivir el viaje soñado para celebrar nuestro matrimonio de manera internacional e inolvidable.
              </p>

              {/* Precio y Botón en la misma línea en desktop */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-auto gap-5 border-t border-[#3a4439] pt-6">
                <span className="text-[1.6rem] text-white font-medium tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
                  $400.000
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setRegalo("opcionVIP"), setErrorMensaje(""); }}
                  className={`px-10 py-3 uppercase tracking-[0.2em] text-[0.75rem] font-bold transition-all duration-300 w-full sm:w-auto rounded-full ${regalo === "opcionVIP"
                    ? 'bg-[var(--gold)] text-[#1c221f] shadow-[0_0_15px_rgba(215,181,109,0.4)]'
                    : 'bg-transparent text-[var(--gold)] border border-[var(--gold)] hover:bg-[var(--gold)] hover:text-[#1c221f]'
                    }`}
                >
                  {regalo === "opcionVIP" ? 'ELEGIDO' : 'ELEGIR VIP'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Espaciador físico garantizado */}
      <div className="w-full" style={{ height: '50px' }}></div>

      <section className="cuenta-deposito w-full flex flex-col items-center py-4 px-4 mb-10">

        <div className="floral-frame mb-8 flex flex-col items-center text-center w-full">
          <h2 className="sec-title relative z-10 m-0 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}>
            Datos Bancarios
          </h2>
          <p className="text-[0.9rem] text-[var(--text-soft)] mt-4 max-w-sm font-light">
            Deposita tu regalo en la siguiente cuenta:
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-lg border border-[var(--sage)]/30 max-w-lg w-full text-center relative overflow-hidden">
          {/* Decoración discreta de fondo */}
          <svg viewBox="0 0 200 200" className="absolute -top-10 -right-10 w-40 opacity-[0.03] rotate-45" xmlns="http://www.w3.org/2000/svg">
            <path d="M100,0 Q150,50 100,100 T100,200 Q50,150 100,100 T100,0" fill="var(--sage-deep)" />
          </svg>

          <div className="flex flex-col gap-5 text-[0.95rem] text-[var(--text)] relative z-10">
            <div>
              <p className="text-[var(--sage)] text-xs uppercase tracking-[0.2em] mb-1 font-bold">Titular</p>
              <p className="text-[var(--sage-deep)] font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Benjamín Ezequiel Román Larenas</p>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-2 my-2 border-y border-[var(--sage)]/20 py-6">
              <div>
                <p className="text-[var(--sage)] text-[0.65rem] uppercase tracking-[0.2em] mb-1 font-bold">RUT</p>
                <p className="font-medium tracking-wide">19.679.532-4</p>
              </div>
              <div>
                <p className="text-[var(--sage)] text-[0.65rem] uppercase tracking-[0.2em] mb-1 font-bold">Banco</p>
                <p className="font-medium">Mercado Pago</p>
              </div>
              <div>
                <p className="text-[var(--sage)] text-[0.65rem] uppercase tracking-[0.2em] mb-1 font-bold">Tipo de Cuenta</p>
                <p className="font-medium">Cuenta Vista</p>
              </div>
              <div>
                <p className="text-[var(--sage)] text-[0.65rem] uppercase tracking-[0.2em] mb-1 font-bold">N° de Cuenta</p>
                <p className="font-medium tracking-wider">1001799027</p>
              </div>
            </div>

            <div>
              <p className="text-[var(--sage)] text-xs uppercase tracking-[0.2em] mb-1 font-bold">Correo Electrónico</p>
              <p className="font-medium text-[var(--sage-deep)] tracking-wide">benjaminromanl@outlook.cl</p>
            </div>
          </div>

          <button
            onClick={() => {
              const text = `Benjamín Ezequiel Román Larenas\nRUT: 19.679.532-4\nBanco: Mercado Pago\nTipo: Cuenta Vista\nN°: 1001799027\nCorreo: benjaminromanl@outlook.cl`;
              navigator.clipboard.writeText(text);
              alert("¡Los datos bancarios han sido copiados!");
            }}
            className="mt-8 px-8 py-4 rounded-full uppercase tracking-[0.2em] text-[0.7rem] font-bold text-[var(--sage-deep)] border border-[var(--sage-deep)] hover:bg-[var(--sage-deep)] hover:text-white transition-all duration-300 w-full flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar Datos
          </button>

          <div className="mt-6 pt-6 border-t border-[var(--sage)]/20 flex flex-col items-center text-center w-full">
            <p className="text-[0.9rem] text-[var(--text-soft)] mb-5 max-w-xs font-light">
              Por favor, mándanos una foto o captura de tu comprobante a nuestro WhatsApp: +56950596046 ó
            </p>
            <a
              href="https://wa.me/56950596046"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full text-[0.85rem] tracking-wide font-bold text-white bg-[#25D366] hover:bg-[#128C7E] transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-3 shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Enviar a WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="sec">
        <p className="text-[var(--text-soft)] text-sm font-light mb-4 text-center">
          Ahora la pregunta mas importante...
        </p>

        {/* Título decorado */}
        <div className="floral-frame mb-8 flex flex-col items-center text-center w-full px-4">
          <svg viewBox="0 0 200 60" className="w-[180px] sm:w-[200px] opacity-70 mb-[-12px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,40 Q60,10 100,40 T180,40" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,28 Q40,15 50,28 Q40,35 30,28" fill="var(--sage)" />
            <path d="M70,24 Q80,10 90,24 Q80,30 70,24" fill="var(--sage)" />
            <path d="M110,24 Q120,10 130,24 Q120,30 110,24" fill="var(--sage)" />
            <path d="M150,28 Q160,15 170,28 Q160,35 150,28" fill="var(--sage)" />
            <circle cx="100" cy="40" r="7" fill="var(--rose)" />
            <circle cx="100" cy="40" r="3" fill="var(--gold)" />
            <circle cx="60" cy="32" r="5" fill="var(--blush-mid)" />
            <circle cx="140" cy="32" r="5" fill="var(--blush-mid)" />
            <circle cx="35" cy="22" r="3" fill="var(--rose)" />
            <circle cx="165" cy="22" r="3" fill="var(--rose)" />
          </svg>

          <h2 className="sec-title relative z-10 m-0 leading-tight" style={{ fontSize: 'clamp(2.5rem, 7vw, 3.5rem)' }}>
            ¿Podrás acompañarnos?
          </h2>

          <svg viewBox="0 0 200 60" className="w-[180px] sm:w-[200px] opacity-70 mt-[-10px]" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M20,20 Q60,50 100,20 T180,20" fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" />
            <path d="M30,32 Q40,45 50,32 Q40,25 30,32" fill="var(--sage)" />
            <path d="M70,36 Q80,50 90,36 Q80,30 70,36" fill="var(--sage)" />
            <path d="M110,36 Q120,50 130,36 Q120,30 110,36" fill="var(--sage)" />
            <path d="M150,32 Q160,45 170,32 Q160,25 150,32" fill="var(--sage)" />
            <circle cx="100" cy="20" r="7" fill="var(--rose)" />
            <circle cx="100" cy="20" r="3" fill="var(--gold)" />
            <circle cx="60" cy="28" r="5" fill="var(--blush-mid)" />
            <circle cx="140" cy="28" r="5" fill="var(--blush-mid)" />
            <circle cx="35" cy="38" r="3" fill="var(--rose)" />
            <circle cx="165" cy="38" r="3" fill="var(--rose)" />
          </svg>
        </div>

        <div className="toggle-group">
          <button className={`tbtn btn-rally ${asistencia === "si" ? "active" : ""} ${yaConfirmado ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => !yaConfirmado && setAsistencia("si")} disabled={yaConfirmado}>
            <span className="tbtn-txt">Sí, Feliz asistiré</span>
            <div className="btn-car-container">
              <span className="smoke s1"></span>
              <span className="smoke s2"></span>
              <span className="smoke s3"></span>
              <img src="/subaru.png?v=3" alt="" className="btn-car" />
            </div>
          </button>
          <button className={`tbtn btn-rally ${asistencia === "no" ? "active" : ""} ${yaConfirmado ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => !yaConfirmado && setAsistencia("no")} disabled={yaConfirmado}>
            <span className="tbtn-txt">No podré asistir, lo lamento</span>
            <div className="btn-car-container">
              <span className="smoke s1"></span>
              <span className="smoke s2"></span>
              <span className="smoke s3"></span>
              <img src="/subaru.png?v=3" alt="" className="btn-car" />
            </div>
          </button>
        </div>

      </section>



      <button className={`btn-submit btn-rally ${yaConfirmado || !asistencia || !regalo ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={confirmar} disabled={yaConfirmado || !asistencia || !regalo}>
        <span className="tbtn-txt">{yaConfirmado ? 'Ya confirmado' : 'Confirmar asistencia'}</span>
        <div className="btn-car-container">
          <span className="smoke s1"></span>
          <span className="smoke s2"></span>
          <span className="smoke s3"></span>
          <img src="/subaru.png?v=3" alt="" className="btn-car" />
        </div>
      </button>

      {errorMensaje && (
        <p className="text-red-600 font-semibold text-center mt-4 px-4">
          {errorMensaje}
        </p>
      )}

      {yaConfirmado && (
        <div className="text-center mt-8 px-4">
          <p className="text-[var(--text-soft)] text-sm font-light mb-4">
            ¡Gracias por confirmar! Si tienes alguna duda o cambio de opinión, contáctanos directamente al WhatsApp.
          </p>
          <a
            href="https://wa.me/56950596046"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white bg-[#25D366] hover:bg-[#128C7E] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            WhatsApp
          </a>
        </div>
      )}

      {!yaConfirmado && (
        <div className="text-center mt-8 px-4">
          <p className="text-[var(--text-soft)] text-sm font-light">
            Cualquier duda o cambio de opinión, contáctanos directamente al WhatsApp: +56950596046
          </p>
        </div>
      )}

    </main>

  );

}