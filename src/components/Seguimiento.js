import { useState } from 'react';

const tramitesDB = [
  { telefono: '1234567890', estado: 'En proceso' },
  { telefono: '0987654321', estado: 'Aprobado' },
  { telefono: '5555555555', estado: 'Rechazado' },
];

const Seguimiento = () => {
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState(null);

  const consultarTramite = () => {
    const tramite = tramitesDB.find((t) => t.telefono === telefono);
    if (tramite) {
      setEstado(tramite.estado);
    } else {
      setEstado('No encontrado');
    }
  };

  return (
    <section
      id="seguimiento"
      className="p-6 bg-gray-200 min-h-screen flex flex-col items-center"
    >
      <h2 className="text-2xl mb-4">Consulta tu trámite</h2>
      <input
        type="text"
        placeholder="Ingresa tu número de teléfono"
        className="p-2 border rounded"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
        onClick={consultarTramite}
      >
        Consultar
      </button>
      {estado && <p className="mt-4 text-lg font-semibold">{estado}</p>}
    </section>
  );
};

export default Seguimiento;
