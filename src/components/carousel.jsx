import React from 'react';

const Carousel = () => {
    const cardData = [
        { image: "/carousel/img1.jpeg" },
        { image: "/carousel/img2.jpeg" },
        { image: "/carousel/img3.jpeg" },
        { image: "/carousel/img4.jpeg" },
        { image: "/carousel/img5.jpeg" },
        { image: "/carousel/img6.jpeg" },
        { image: "/carousel/img7.jpeg" },
        { image: "/carousel/img8.jpeg" },
        { image: "/carousel/img9.jpeg" },
        { image: "/carousel/img10.jpeg" },
        { image: "/carousel/img11.jpeg" },
    ];

    // Duplicamos las imágenes varias veces para asegurar un flujo constante 
    // incluso en pantallas ultra anchas sin que se corte.
    const extendedData = [...cardData, ...cardData, ...cardData, ...cardData];

    return (
        <div className="w-full py-12 overflow-hidden relative">
            <style>{`
                .marquee-inner {
                    display: flex;
                    width: max-content;
                    animation: marqueeScroll 70s linear infinite;
                }

                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>

            {/* Contenedor que agrupa todas las imágenes animadas */}
            <div className="marquee-inner">
                {extendedData.map((card, index) => (
                    <div key={index} className="w-60 md:w-80 mx-2 md:mx-4 h-[16rem] md:h-[22rem] relative flex-shrink-0">
                        <img
                            src={card.image}
                            alt="Galería boda"
                            className="w-full h-full object-cover rounded-2xl shadow-md"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;