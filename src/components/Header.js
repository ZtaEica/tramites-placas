import { useState } from 'react';
import logo from '../logo.svg';
import headerImage from '../assets/Header.jpg';
import './header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Lista de secciones del menú
  const sections = [
    { name: 'Inicio', href: '/' },
    { name: 'Trámites', href: '#tramites' },
    { name: 'Seguimiento', href: '#seguimiento' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className="m-0 p-0">
      {/* Barra superior */}
      <div className="bg-[#fa6f4d] w-full h-[28px]"></div>

      {/* Contenedor principal */}
      <div className="w-full h-auto pb-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Logo */}
          <div className="w-full h-auto pt-4">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Logo con enlace */}
              <a
                href="/"
                className="flex flex-row items-center justify-center gap-4 transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={logo}
                  alt="Logo"
                  className="w-[100px] cursor-pointer"
                />
                <h1 className="text-2xl font-bold cursor-pointer text-[#fa6f4d]">
                  FAST
                  <br />
                  <span className="text-[#e3433f]">PROCESS PTY</span>
                </h1>
              </a>
            </div>
          </div>

          {/* Menú */}
          <nav className="container mx-auto flex flex-col sm:flex-row justify-center">
            {/* Botón de menú hamburguesa */}
            <div className="flex justify-center sm:hidden">
              <button
                className="relative w-10 h-10 flex flex-col justify-center items-center gap-1"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span
                  className={`block w-8 h-1 bg-[#e3433f] rounded transition-transform duration-300 ${
                    menuOpen ? 'rotate-45 translate-y-[9px]' : ''
                  }`}
                ></span>
                <span
                  className={`block w-8 h-1 bg-[#e3433f] rounded transition-opacity duration-300 ${
                    menuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span
                  className={`block w-8 h-1 bg-[#e3433f] rounded transition-transform duration-300 ${
                    menuOpen ? '-rotate-45 -translate-y-[9px]' : ''
                  }`}
                ></span>
              </button>
            </div>

            {/* Menú con animación sin espacio en blanco */}
            <ul
              className={`flex flex-col sm:flex-row gap-4 sm:gap-8 items-center transition-all duration-300 overflow-hidden ${
                menuOpen
                  ? 'h-auto opacity-100 py-4'
                  : 'h-0 opacity-0 sm:h-auto sm:opacity-100'
              }`}
            >
              {sections.map((section) => (
                <li
                  key={section.href}
                  className="relative group"
                >
                  <a
                    href={section.href}
                    className="group-hover:text-[#e3433f] transition-colors duration-300"
                  >
                    {section.name}
                  </a>
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#e3433f] transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Sección de presentación con fondo naranja y curva */}
      <div
        className="flex items-center bg-cover bg-center h-[25rem] max-sm:h-[30rem] max-sm:pb-[2rem] relative"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        {/* Contenedor del borde detrás */}
        <div className="absolute w-1/2 transition-all transition-discrete max-lg:w-3/4 max-md:w-full h-[90%] max-sm:h-full max-sm:top-0 left-6 max-sm:left-0 opacity-50 clippath-md"></div>

        {/* Contenedor principal */}
        <div className="relative w-1/2 transition-all transition-discrete max-lg:w-3/4 max-md:w-full h-full px-8 py-8 text-white content-center max-sm:content-start clip-path-md">
          <p className="pb-2 text-lg">FACILITAMOS TU PROCESO</p>
          <h2 className="text-5xl font-bold">TRÁMITE EN LÍNEA</h2>
          <div className="w-[5rem] h-1 bg-[#f5d5d0]"></div>
          <p className="py-6 text-lg">
            ¡Ahorra tiempo y evita desplazamientos! Realiza tu gestión desde
            cualquier dispositivo y obtén asistencia en cada paso del proceso.
          </p>

          <a
            href="https://wa.me/50764193852?text=Hola%20quiero%20más%20información"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] w-[180px] text-white px-6 py-3 rounded-md shadow-md flex items-center gap-2 hover:bg-[#1da851] transition-transform duration-300 hover:scale-105"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="w-5 h-5"
            />
            CONTÁCTANOS
          </a>
        </div>
      </div>
    </header>
  );
};
export default Header;
