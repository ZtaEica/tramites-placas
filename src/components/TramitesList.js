const tramites = [
  {
    id: 1,
    nombre: 'Registro de Placas Nuevas',
    requisitos: ['Cédula', 'Factura del vehículo'],
  },
  {
    id: 2,
    nombre: 'Renovación de Placas',
    requisitos: ['Placas vencidas', 'Pago de impuestos'],
  },
];

const TramitesList = ({ onSelectTramite }) => {
  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-4">Trámites Disponibles</h2>
      <div className="space-y-4">
        {tramites.map((tramite) => (
          <div
            key={tramite.id}
            className="bg-gray-100 p-4 rounded-lg shadow"
          >
            <h3 className="text-lg font-bold">{tramite.nombre}</h3>
            <ul className="list-disc ml-5">
              {tramite.requisitos.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
            <button
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => onSelectTramite(tramite)}
            >
              Realizar Trámite
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TramitesList;
