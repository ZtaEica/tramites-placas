import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const tramites = [
  {
    id: 1,
    nombre: 'Requisitos para Cambio de Color',
    requisitos: [
      'Registro Único Vehicular Original.',
      'Nota firmada por el Propietario donde solicita.',
      'Copia de cédula del Propietario.',
      'Copia de revisado.',
      'Nota membretada y firmada por el taller donde se realizó el cambio de color, deben incluir la cédula de la persona que firma la carta.',
    ],
  },
  {
    id: 2,
    nombre: 'Requisitos para Duplicado de Registro',
    requisitos: [
      'Nota de solicitud de certificación corta para duplicado de Registro.',
      'Copia de cédula.',
      'Copia de revisado.',
    ],
  },
  {
    id: 3,
    nombre: 'Requisitos para Duplicado de Registro',
    requisitos: [
      'Nota de solicitud de certificación corta para duplicado de Registro.',
      'Copia de cédula.',
      'Copia de revisado.',
    ],
  },
  {
    id: 4,
    nombre: 'Requisitos para Duplicado de Registro',
    requisitos: [
      'Nota de solicitud de certificación corta para duplicado de Registro.',
      'Copia de cédula.',
      'Copia de revisado.',
    ],
  },
  {
    id: 5,
    nombre: 'Requisitos para Duplicado de Registro',
    requisitos: [
      'Nota de solicitud de certificación corta para duplicado de Registro.',
      'Copia de cédula.',
      'Copia de revisado.',
    ],
  },
  {
    id: 6,
    nombre: 'Requisitos para Duplicado de Registro',
    requisitos: [
      'Nota de solicitud de certificación corta para duplicado de Registro.',
      'Copia de cédula.',
      'Copia de revisado.',
    ],
  },
  // Agregar más trámites aquí...
];

const TramitesList = ({ onSelectTramite, onVerMas }) => {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="tramites"
      className="px-4 py-10 relative"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Trámites Disponibles
        </h2>
        <div
          className="w-24 h-1 mx-auto rounded-full"
          style={{ backgroundColor: '#e3433f' }}
        ></div>
      </div>

      <div className="relative">
        {/* Flechas */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10"
        >
          <ChevronLeft className="text-[#e3433f]" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10"
        >
          <ChevronRight className="text-[#e3433f]" />
        </button>

        {/* Contenedor de tarjetas */}
        <div
          ref={containerRef}
          className="flex space-x-4 overflow-x-auto scroll-smooth pb-2 px-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>
            {`
              #tramites::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {tramites.map((tramite) => (
            <div
              key={tramite.id}
              className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl shadow p-6"
              style={{
                minWidth: '280px',
                maxWidth: '320px',
                height: '370px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 className="text-md font-semibold mb-2 text-gray-800 line-clamp-2">
                  {tramite.nombre}
                </h3>

                <div className="text-sm text-gray-600 overflow-hidden h-40 relative">
                  <ul className="list-disc ml-5 space-y-1 text-sm">
                    {tramite.requisitos.map((req, index) => (
                      <li
                        key={index}
                        className="line-clamp-2"
                      >
                        {req}
                      </li>
                    ))}
                  </ul>

                  <div className="absolute bottom-0 left-0 w-full text-right bg-gradient-to-t from-white via-white/90 to-transparent pt-4">
                    <button
                      className="text-[#e3433f] text-sm font-medium hover:underline pr-2"
                      onClick={() => onVerMas(tramite)}
                    >
                      ... Ver más
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="mt-6 w-full bg-[#e3433f] hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition duration-300"
                onClick={() => onSelectTramite(tramite)}
              >
                Realizar Trámite
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TramitesList;
