import React from 'react';

const ButtonOption = ({ options, value, onChange, placeholder = "Seleccionar" }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    // Buscamos la etiqueta a mostrar en base al valor seleccionado
    const displayValue = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className="w-full flex justify-center font-sans">
            <div className="flex flex-col w-full max-w-xs relative">
                <button type="button" onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white/60 text-gray-800 border-[var(--sage)] shadow-sm hover:bg-white focus:outline-none transition-colors backdrop-blur-sm"
                >
                    <span className="flex-1 text-center pl-6">{displayValue}</span>
                    <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280" >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <ul className="absolute top-full left-0 z-50 w-full bg-white border border-[var(--sage)] rounded-xl shadow-lg mt-1 py-2 max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                className={`px-4 py-2 text-center hover:bg-[var(--sage)] hover:text-white cursor-pointer transition-colors ${value === opt.value ? "bg-[var(--sage)] text-white font-medium" : ""}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ButtonOption;
