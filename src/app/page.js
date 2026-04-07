"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Carousel from "@/components/carousel";
import Countdown from "@/components/countdown";

export default function Home() {

  const [invitado, setInvitado] = useState(null);
  const [asistencia, setAsistencia] = useState("");
  const [regalo, setRegalo] = useState("");

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo");

    if (!codigo) return;

    async function obtenerInvitado() {

      const { data } = await supabase
        .from("invitados")
        .select("*")
        .eq("codigo", codigo)
        .single();

      setInvitado(data);

    }

    obtenerInvitado();

  }, []);


  async function confirmar() {

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

    alert("Gracias por confirmar ❤️");

  }

  if (!invitado) {
    return <p>Cargando invitación...</p>;
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
            Benjamín <span className="hero-amp">&</span> Fernanda
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
          Ayudanos a reservar {invitado.personas} lugares para nuestra boda!
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
                { id: "opcion1", title: "Viaje a la playa!", desc: "Ayúdanos a disfrutar de una hermosa escapada frente al mar para relajarnos.", img: "/carousel/img1.jpeg" },
                { id: "opcion2", title: "Cena romántica", desc: "Invítanos a una cena inolvidable para celebrar nuestro compromiso matrimonial.", img: "/carousel/img2.jpeg" },
                { id: "opcion3", title: "Noche de SPA!", desc: "Regálanos un día de relajación total y masajes para después de la gran fiesta.", img: "/carousel/img3.jpeg" },
                { id: "opcion4", title: "Viaje a la luna", desc: "Un aporte libre para nuestra soñada e inolvidable luna de miel.", img: "/carousel/img4.jpeg" }
              ].map((opt) => (
                <div 
                  key={opt.id} 
                  className={`flex flex-col bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer w-full mx-auto max-w-sm md:max-w-none ${
                      regalo === opt.id 
                      ? 'border-2 border-[var(--gold)] shadow-[0_0_20px_rgba(215,181,109,0.3)] scale-[1.02]' 
                      : 'border border-[var(--sage)]/30 shadow-lg hover:shadow-xl hover:-translate-y-1'
                  }`}
                  onClick={() => setRegalo(opt.id)}
                >
                  {/* ... */}
                  <div className="w-full h-48 md:h-56 overflow-hidden relative">
                    <img src={opt.img} alt={opt.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                    {regalo === opt.id && (
                      <div className="absolute inset-0 bg-[var(--gold)]/20 flex items-center justify-center backdrop-blur-[2px] transition-all">
                          <span className="bg-white/95 text-[var(--gold)] px-6 py-2 rounded-full text-sm font-bold tracking-widest shadow-lg">✓ SELECCIONADO</span>
                      </div>
                    )}
                  </div>
                  
                  {/* ... */}
                  <div className="p-6 md:p-8 flex flex-col items-center text-center flex-grow">
                    <h5 className="text-[1.5rem] md:text-[1.8rem] text-[var(--sage-deep)] mb-3" style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
                      {opt.title}
                    </h5>
                    <p className="text-[0.95rem] font-light text-[var(--text-soft)] mb-8 flex-grow leading-relaxed">
                      {opt.desc}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRegalo(opt.id); }}
                      className={`px-8 py-3 rounded-full uppercase tracking-[0.2em] text-[0.75rem] font-semibold transition-all duration-300 w-full sm:w-auto ${
                          regalo === opt.id 
                          ? 'bg-[var(--gold)] text-white shadow-md border border-[var(--gold)]' 
                          : 'bg-transparent text-[var(--sage-deep)] border border-[var(--sage-deep)] hover:bg-[var(--sage-light)] hover:text-white hover:border-transparent'
                      }`}
                    >
                      {regalo === opt.id ? 'Elegido' : 'Elegir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>

      <section className="sec">

        <h2 className="sec-title">¿Podrás acompañarnos?</h2>

        <div className="toggle-group">
          <button className={`tbtn btn-rally ${asistencia === "si" ? "active" : ""}`} onClick={() => setAsistencia("si")}>
            <span className="tbtn-txt">Sí, Feliz asistiré</span>
            <div className="btn-car-container">
              <span className="smoke s1"></span>
              <span className="smoke s2"></span>
              <span className="smoke s3"></span>
              <img src="/subaru.png?v=3" alt="" className="btn-car" />
            </div>
          </button>
          <button className={`tbtn btn-rally ${asistencia === "no" ? "active" : ""}`} onClick={() => setAsistencia("no")}>
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



      <button className="btn-submit btn-rally" onClick={confirmar}>
        <span className="tbtn-txt">Confirmar asistencia</span>
        <div className="btn-car-container">
          <span className="smoke s1"></span>
          <span className="smoke s2"></span>
          <span className="smoke s3"></span>
          <img src="/subaru.png?v=3" alt="" className="btn-car" />
        </div>
      </button>

    </main>

  );

}