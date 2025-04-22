import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import imgFondo from '../assets/seguimiento.jpg';
import { supabase } from '../lib/supabaseClient'; // Asegúrate que la ruta es correcta

const Seguimiento = () => {
  const [step, setStep] = useState(1);
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [tramites, setTramites] = useState([]);

  const transition = { duration: 0.5, ease: 'easeInOut' };

  const enviarSMS = async () => {
    setError('');
    setCanResend(false);
    setResendTimer(30);

    try {
      const { data: tramitesExistentes, error: errorTramites } = await supabase
        .from('tramites')
        .select('*')
        .eq('telefono', telefono);

      if (errorTramites || !tramitesExistentes.length) {
        return setError('Este número no tiene trámites registrados.');
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: '+507' + telefono,
      });

      if (error) {
        setError('Error enviando el código: ' + error.message);
      } else {
        setError('');
        setStep(2);
      }
    } catch (e) {
      setError('Error inesperado al enviar el código.');
    }
  };

  /*const verificarCodigo = async () => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: '+507' + telefono,
        token: codigo,
        type: 'sms',
      });

      if (error || !data.user) {
        setError('Código incorrecto o expirado.');
      } else {
        const { data: tramitesObtenidos, error: errorTramites } = await supabase
          .from('tramites')
          .select('*')
          .eq('telefono', telefono)
          .order('fecha_creacion', { ascending: false });

        if (errorTramites || !tramitesObtenidos.length) {
          setError('No se encontraron trámites.');
        } else {
          setTramites(tramitesObtenidos);
          setStep(3);
        }
      }
    } catch {
      setError('Error verificando el código.');
    }
  };*/

  const verificarCodigo = async () => {
    try {
      // SOLO PARA DESARROLLO – quitar en producción
      const modoDesarrollo = true;

      if (modoDesarrollo) {
        console.log('Modo desarrollo activado: saltando verificación');
        const { data: tramitesObtenidos, error: errorTramites } = await supabase
          .from('tramites')
          .select('*')
          .eq('telefono', telefono)
          .order('fecha_creacion', { ascending: false });

        if (errorTramites || !tramitesObtenidos.length) {
          setError('No se encontraron trámites.');
        } else {
          setTramites(tramitesObtenidos);
          setStep(3);
        }

        return; // Terminar aquí si estamos en desarrollo
      }

      // VERIFICACIÓN REAL
      const { data, error } = await supabase.auth.verifyOtp({
        phone: '+507' + telefono,
        token: codigo,
        type: 'sms',
      });

      if (error || !data.user) {
        setError('Código incorrecto o expirado.');
      } else {
        const { data: tramitesObtenidos, error: errorTramites } = await supabase
          .from('tramites')
          .select('*')
          .eq('telefono', telefono)
          .order('fecha_creacion', { ascending: false });

        if (errorTramites || !tramitesObtenidos.length) {
          setError('No se encontraron trámites.');
        } else {
          setTramites(tramitesObtenidos);
          setStep(3);
        }
      }
    } catch (err) {
      setError('Error verificando el código.');
      console.error(err);
    }
  };

  useEffect(() => {
    let timer;
    if (step === 2 && !canResend) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setCanResend(true);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, canResend]);

  const estados = [
    { label: 'Todos', value: 'todos' },
    { label: 'En Tramitación', value: 'En tramitación' },
    { label: 'En Subsanación', value: 'En subsanación' },
    { label: 'Aprobado', value: 'Aprobado' },
    { label: 'Rechazado', value: 'Rechazado' },
    { label: 'Pendiente de envío', value: 'Pendiente de envío' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Fondo con imagen + overlay oscuro y blur */}
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${imgFondo})` }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" />

      {/* Título principal */}
      <h1 className="text-2xl md:text-4xl font-bold text-center text-white z-10 mb-2">
        Inspeccione su trámite
      </h1>
      <div
        className="w-[150px] md:w-[200px] h-1 mx-auto rounded-full z-10 mb-8"
        style={{ backgroundColor: '#e3433f' }}
      ></div>

      {/* Paso 1: Teléfono */}
      {step === 1 && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-xl w-[90%] lg:w-full max-w-md z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Ingrese su número
          </h2>
          <p className="text-gray-600 text-sm mb-4 text-center">
            Ingresa el mismo número que compartiste al comenzar el trámite. Este
            debe coincidir con el registrado al inicio del acuerdo.
          </p>
          <input
            type="tel"
            placeholder="Ej: 60001122"
            className="w-full p-3 text-center border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#e3433f]"
            value={`+507 ${telefono.slice(0, 4)}${
              telefono.length > 4 ? '-' : ''
            }${telefono.slice(4, 8)}`}
            onChange={(e) => {
              const input = e.target.value.replace(/\D/g, ''); // solo números
              const telefonoSinPrefijo = input.startsWith('507')
                ? input.slice(3)
                : input;
              const telefonoLimpiado = telefonoSinPrefijo.slice(0, 8); // max 7 dígitos (3+4 con guion)
              setTelefono(telefonoLimpiado);
            }}
            maxLength={14} // +507 XXX-XXXX (13 incluyendo el espacio y guion)
          />
          <button
            className="bg-[#e3433f] text-white w-full py-2 rounded hover:bg-red-600 transition"
            onClick={enviarSMS}
          >
            Enviar código
          </button>
          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <XCircle className="w-5 h-5 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Paso 2: Código */}
      {step === 2 && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-xl w-[90%] lg:w-full  max-w-md z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition }}
        >
          <h2 className="text-2xl font-bold mb-2 text-center">
            Verifica tu identidad
          </h2>
          <p className="text-gray-600 text-sm mb-4 text-center">
            Se ha enviado un código por SMS al número ingresado. Ingresa el
            código de 6 dígitos para continuar.
          </p>
          <input
            type="text"
            placeholder="Código de verificación"
            className="w-full text-center p-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#e3433f]"
            value={codigo}
            onChange={(e) => {
              const input = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCodigo(input);
            }}
            maxLength={6}
          />

          <button
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition"
            onClick={verificarCodigo}
          >
            Verificar código
          </button>
          {canResend ? (
            <button
              onClick={enviarSMS}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582M20 20v-5h-.581M4 4l16 16"
                />
              </svg>
              Reenviar código
            </button>
          ) : (
            <div className="mt-4 w-full flex items-center justify-center text-gray-500 text-sm">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Reenviar en {resendTimer}s
              </span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <XCircle className="w-5 h-5 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Paso 3: Trámites */}
      {step === 3 && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-xl w-[90%] lg:w-full max-w-3xl z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Trámites encontrados
          </h2>

          {/* Filtros con hover y transición */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {estados.map((e) => (
              <button
                key={e.value}
                onClick={() => setEstadoFiltro(e.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out transform ${
                  estadoFiltro === e.value
                    ? 'bg-[#e3433f] text-white scale-105 shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-[#e3433f]/90 hover:text-white hover:scale-105'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>

          {/* Lista animada */}
          <motion.ul
            className="divide-y divide-gray-200 overflow-y-auto max-h-[40vh] space-y-4 pr-2"
            key={estadoFiltro} // Este key forza el reinicio de animación al cambiar filtro
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {tramites
              .filter((t) =>
                estadoFiltro === 'todos' ? true : t.estado === estadoFiltro
              )
              .map((t) => (
                <motion.li
                  key={t.id}
                  className="py-3 flex flex-row items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <p className="font-semibold">{t.nombre_tramite}</p>
                    {estadoFiltro === 'todos' && (
                      <p className="text-sm text-gray-500 capitalize">
                        Estado: {t.estado}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 capitalize">
                      {t.detalles}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">
                    {new Date(t.fecha_creacion).toLocaleDateString('es-ES')}
                  </p>
                </motion.li>
              ))}
          </motion.ul>
        </motion.div>
      )}
    </div>
  );
};

export default Seguimiento;
