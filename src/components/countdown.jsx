import { useState, useEffect } from "react";

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Evitar errores de hidratación en Next.js (el servidor renderiza distinto al cliente si no está montado)
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fecha objetivo: 21 de Noviembre de 2026 a las 00:00:00 (o la hora exacta que inicia)
        const targetDate = new Date("November 21, 2026 00:00:00").getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!isMounted) {
        // Muestra un estado vacío inicialmente para que coincida con el servidor
        return <div className="py-16 opacity-0">...</div>;
    }

    const TimeBox = ({ value, label }) => (
        <div className="flex flex-col items-center px-4 sm:px-8">
            <span
                className="text-5xl md:text-6xl lg:text-7xl text-[var(--sage-deep)] relative z-10 transition-colors hover:text-[var(--gold)]"
                style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
            >
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[0.70rem] sm:text-[0.85rem] uppercase tracking-[0.3em] font-light text-[var(--text-soft)] mt-3">
                {label}
            </span>
        </div>
    );

    return (
        <section className="py-24 my-16 w-full flex flex-col items-center justify-center relative bg-transparent">

            {/* Título Estilizado */}
            <h3
                className="text-[1.8rem] sm:text-[2.2rem] mb-12 text-[var(--text)] italic opacity-90 "
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                Tan solo faltan...
            </h3>

            {/* Números con divisores elegantes */}
            <div className="flex justify-center items-center divide-x divide-opacity-30 divide-[var(--sage-deep)] relative z-10">
                <TimeBox value={timeLeft.days} label="Días" />
                <TimeBox value={timeLeft.hours} label="Hrs" />
                <TimeBox value={timeLeft.minutes} label="Min" />
                <TimeBox value={timeLeft.seconds} label="Seg" />
            </div>

            {/* Separador romántico inferior */}
            <div className="flex justify-center items-center mt-16 w-full opacity-60">
                <div className="h-[1px] w-20 sm:w-32 bg-gradient-to-r from-transparent to-[var(--sage-deep)]"></div>
                <svg viewBox="0 0 24 24" className="w-5 h-5 mx-4" fill="none" stroke="var(--sage-deep)" strokeWidth="1">
                    <path d="M12 4 C14 9, 20 12, 20 12 C20 12, 14 15, 12 20 C10 15, 4 12, 4 12 C4 12, 10 9, 12 4 Z" />
                </svg>
                <div className="h-[1px] w-20 sm:w-32 bg-gradient-to-l from-transparent to-[var(--sage-deep)]"></div>
            </div>
        </section>
    );
};

export default Countdown;
