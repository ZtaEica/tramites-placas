import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Admin = () => {
  const [autenticado, setAutenticado] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tramites, setTramites] = useState([]);
  const [tiposTramite, setTiposTramite] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [ModalRegister, setModalRegister] = useState(false);
  const [ModalTramite, setModalTramite] = useState(false);
  const [EditarTramite, setEditarTramite] = useState(false);
  const [tramiteEditando, setTramiteEditando] = useState(null);
  const [nombreTramite, setNombreTramite] = useState('');
  const [requisitos, setRequisitos] = useState(['']);

  const today = new Date().toISOString().split('T')[0];

  const [nuevo, setNuevo] = useState({
    nombre_cliente: '',
    tipo_tramite_id: '',
    detalles: '',
    estado: 'En tramitación',
    fecha_creacion: today,
    fecha_actualizacion: today,
  });

  const [datosEdicion, setDatosEdicion] = useState({
    nombre_cliente: '',
    telefono: '',
    estado: '',
    tipo_tramite_id: null,
    comentario: '',
  });

  const opcionesEstado = [
    'En tramitación',
    'En subsanación',
    'Aprobado',
    'Rechazado',
    'Pendiente de envío',
  ];

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const login = async () => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('usuario', user)
      .eq('password', pass)
      .single();

    if (error || !data) {
      mostrarMensaje('❌ Credenciales inválidas', 'error');
    } else {
      setAutenticado(true);
      obtenerTiposTramite();
    }
  };

  const obtenerTiposTramite = async () => {
    const { data, error } = await supabase
      .from('tipos_tramite')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error) {
      setTiposTramite(data);
    }
  };

  const cargarTramites = async () => {
    const { data, error } = await supabase
      .from('tramites')
      .select('*, tipos_tramite(nombre)')
      .eq('telefono', telefono)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      mostrarMensaje('❌ Error al cargar trámites', 'error');
    } else {
      setTramites(data);
      if (data.length === 0) {
        mostrarMensaje('🔍 No hay trámites asociados a este número', 'info');
      }
    }
  };

  const crearTramite = async () => {
    if (!nombreTramite.trim())
      return mostrarMensaje('🔍 Nombre del trámite es obligatorio', 'info');

    // 1. Crear el tipo de trámite
    const { data: tipoData, error: tipoError } = await supabase
      .from('tipos_tramite')
      .insert([{ nombre: nombreTramite }])
      .select()
      .single();

    if (tipoError) {
      console.error('Error creando trámite:', tipoError);
      return mostrarMensaje('❌ Error al crear trámite', 'error');
    }

    const tipoTramiteId = tipoData.id;

    // 2. Insertar los requisitos
    const requisitosLimpios = requisitos
      .map((r) => r.trim())
      .filter((r) => r !== '');

    if (requisitosLimpios.length > 0) {
      const reqsInsert = requisitosLimpios.map((descripcion) => ({
        tipo_tramite_id: tipoTramiteId,
        descripcion,
      }));

      const { error: reqsError } = await supabase
        .from('requisitos')
        .insert(reqsInsert);

      if (reqsError) {
        console.error('Error insertando requisitos:', reqsError);
        return mostrarMensaje(
          '❎ Trámite creado, pero hubo error al guardar requisitos.',
          'success'
        );
      }
    }

    mostrarMensaje('✅ Trámite y requisitos creados exitosamente', 'success');
    setModalTramite(false);
    setNombreTramite('');
    setRequisitos(['']);
  };

  const [EditTramites, setEditTramites] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [EditRequisitos, setEditRequisitos] = useState([]);
  const [nuevoRequisito, setNuevoRequisito] = useState('');

  // Cargar tipos de trámite
  useEffect(() => {
    const fetchTramites = async () => {
      const { data, error } = await supabase.from('tipos_tramite').select('*');
      if (!error) setEditTramites(data);
    };
    fetchTramites();
  }, []);

  // Al seleccionar un trámite
  const handleSelectTramite = async (id) => {
    setSelectedId(id);
    const tramite = EditTramites.find((t) => t.id === parseInt(id));
    setNombre(tramite.nombre);

    const { data, error } = await supabase
      .from('requisitos')
      .select('*')
      .eq('tipo_tramite_id', id);

    if (!error) setEditRequisitos(data);
  };

  // Guardar cambios
  const handleSaveChanges = async () => {
    await supabase
      .from('tipos_tramite')
      .update({ nombre })
      .eq('id', selectedId);

    // Refrescar lista principal
    const { data } = await supabase.from('tipos_tramite').select('*');
    setEditTramites(data);
    alert('Trámite actualizado');
  };

  const handleAddRequisito = async () => {
    if (!nuevoRequisito) return;
    const { data, error } = await supabase.from('requisitos').insert({
      tipo_tramite_id: selectedId,
      descripcion: nuevoRequisito,
    });
    if (!error) {
      setEditRequisitos([...EditRequisitos, data[0]]);
      setNuevoRequisito('');
    }
  };

  const handleDeleteRequisito = async (id) => {
    await supabase.from('requisitos').delete().eq('id', id);
    setEditRequisitos(EditRequisitos.filter((r) => r.id !== id));
  };

  const handleDeleteTramite = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('¿Seguro que deseas eliminar este tipo de trámite?')) {
      // eliminar...
      await supabase.from('tipos_tramite').delete().eq('id', selectedId);
      setSelectedId(null);
      setNombre('');
      setEditRequisitos([]);
      const { data } = await supabase.from('tipos_tramite').select('*');
      setEditTramites(data);
    }
  };

  const crearRegistro = async () => {
    if (!nuevo.tipo_tramite_id || !telefono || !nuevo.nombre_cliente) {
      mostrarMensaje('❌ Completa todos los campos', 'error');
      return;
    }

    const { error } = await supabase.from('tramites').insert([
      {
        telefono: telefono,
        nombre_cliente: nuevo.nombre_cliente,
        tipo_tramite_id: nuevo.tipo_tramite_id,
        detalles: nuevo.detalles,
        estado: nuevo.estado,
        fecha_creacion: nuevo.fecha_creacion,
        fecha_actualizacion: nuevo.fecha_actualizacion,
      },
    ]);

    if (error) {
      mostrarMensaje('❌ Error al crear el trámite', 'error');
    } else {
      mostrarMensaje('✅ Trámite creado con éxito', 'success');
      setNuevo({
        tipo_tramite_id: '',
        estado: 'En tramitación',
        detalles: '',
        nombre_cliente: '',
        fecha_creacion: today,
      });
      cargarTramites();
      setModalRegister(false);
    }
  };

  const editarRegistro = async (
    id,
    nuevoNombre,
    nuevoTelefono,
    tipoTramiteId,
    nuevoEstado,
    nuevoComentario
  ) => {
    const { error } = await supabase
      .from('tramites')
      .update({
        telefono: nuevoTelefono,
        nombre_cliente: nuevoNombre,
        tipo_tramite_id: tipoTramiteId,
        estado: nuevoEstado,
        detalles: nuevoComentario,
        fecha_actualizacion: today,
      })
      .eq('id', id);

    if (error) {
      mostrarMensaje('❌ Error al actualizar registro', 'error');
    } else {
      mostrarMensaje('✅ Registro actualizado', 'success');
      cargarTramites();
      setTramiteEditando(null);
      setDatosEdicion({
        nombre_cliente: '',
        telefono: '',
        tipo_tramite_id: null,
        estado: '',
        comentario: '',
      });
    }
  };

  const eliminarRegistro = async (id) => {
    const { error } = await supabase.from('tramites').delete().eq('id', id);
    if (error) {
      mostrarMensaje('❌Error al eliminar trámite', 'error');
    } else {
      mostrarMensaje('❎ Trámite eliminado', 'success');
      cargarTramites();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Panel de Administración
      </h1>

      {!autenticado ? (
        <div className="grid gap-3 max-w-sm mx-auto">
          <input
            className={inputStyle}
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            className={inputStyle}
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={login}
          >
            Ingresar
          </button>
          {mensaje && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                mensaje.tipo === 'error'
                  ? 'bg-red-200 border-[2px] border-red-400 text-red-500'
                  : mensaje.tipo === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {mensaje.texto}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {mensaje && (
            <div
              className={`fixed top-[50%] right-4 border px-4 py-2 rounded shadow z-30 ${
                mensaje.tipo === 'error'
                  ? 'bg-red-100 border-red-400 text-red-800'
                  : mensaje.tipo === 'success'
                  ? 'bg-green-100 border-green-400 text-green-800'
                  : 'bg-blue-200 border-blue-400 text-blue-800'
              }`}
            >
              {mensaje.texto}
            </div>
          )}
          {/* Buscar por teléfono */}
          <div className="flex gap-2 items-center">
            <input
              className={inputStyle}
              placeholder="Teléfono del cliente"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={cargarTramites}
            >
              Buscar
            </button>
            <button
              onClick={() => setModalRegister(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Registrar Cliente
            </button>
            <button
              onClick={() => setModalTramite(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Nuevo Tramite
            </button>
            <button
              onClick={() => setEditarTramite(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Editar Tramite
            </button>
          </div>

          {/* Lista de trámites */}
          {tramites.length > 0 && (
            <div className="space-y-4">
              {tramites.map((tramite) => (
                <div
                  key={tramite.id}
                  className="bg-gray-100 p-4 rounded-lg shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {tramite.tipos_tramite.nombre}
                      </h3>
                      <p className="text-sm text-gray-700">
                        Cliente: {tramite.nombre_cliente}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estado actual:{' '}
                        <span
                          className={`font-semibold ${getColorClass(
                            tramite.estado
                          )}`}
                        >
                          {tramite.estado}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        Registro:{' '}
                        {new Date(tramite.fecha_creacion).toLocaleDateString(
                          'es-ES'
                        )}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        Actualizado:{' '}
                        {new Date(
                          tramite.fecha_actualizacion
                        ).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex flex-col ">
                      <button
                        onClick={() => eliminarRegistro(tramite.id)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => {
                          setTramiteEditando(tramite);
                          setDatosEdicion({
                            nombre_cliente: tramite.nombre_cliente || '',
                            telefono: tramite.telefono || '',
                            estado: tramite.estado || '',
                            tipo_tramite_id: tramite.tipo_tramite_id || null,
                            comentario: tramite.detalles || '',
                          });
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registrar Cliente */}
      {ModalRegister && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setModalRegister(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Registrar nuevo cliente
            </h2>
            <div className="grid gap-3">
              <input
                className={inputStyle}
                placeholder="Nombre del cliente"
                value={nuevo.nombre_cliente}
                onChange={(e) =>
                  setNuevo({ ...nuevo, nombre_cliente: e.target.value })
                }
              />
              <input
                className={inputStyle}
                placeholder="Teléfono del cliente"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <select
                className={inputStyle}
                value={nuevo.tipo_tramite_id}
                onChange={(e) =>
                  setNuevo({ ...nuevo, tipo_tramite_id: e.target.value })
                }
              >
                <option value="">Seleccionar tipo de trámite</option>
                {tiposTramite.map((tipo) => (
                  <option
                    key={tipo.id}
                    value={tipo.id}
                  >
                    {tipo.nombre}
                  </option>
                ))}
              </select>

              <textarea
                className={inputStyle}
                placeholder="Detalles"
                value={nuevo.detalles}
                onChange={(e) =>
                  setNuevo({ ...nuevo, detalles: e.target.value })
                }
              />
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={crearRegistro}
              >
                Registrar cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {tramiteEditando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setTramiteEditando(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Editar trámite</h2>

            <div className="grid gap-3">
              <input
                className={inputStyle}
                placeholder="Nombre del cliente"
                value={datosEdicion.nombre_cliente}
                onChange={(e) =>
                  setDatosEdicion({
                    ...datosEdicion,
                    nombre_cliente: e.target.value,
                  })
                }
              />

              <input
                className={inputStyle}
                placeholder="Teléfono"
                value={datosEdicion.telefono}
                onChange={(e) =>
                  setDatosEdicion({ ...datosEdicion, telefono: e.target.value })
                }
              />

              <select
                className={inputStyle}
                value={datosEdicion.tipo_tramite_id || ''}
                onChange={(e) =>
                  setDatosEdicion({
                    ...datosEdicion,
                    tipo_tramite_id: parseInt(e.target.value),
                  })
                }
              >
                <option value="">Selecciona un tipo de trámite</option>
                {tiposTramite.map((tipo) => (
                  <option
                    key={tipo.id}
                    value={tipo.id}
                  >
                    {tipo.nombre}
                  </option>
                ))}
              </select>

              <select
                className={inputStyle}
                value={datosEdicion.estado}
                onChange={(e) =>
                  setDatosEdicion({ ...datosEdicion, estado: e.target.value })
                }
              >
                <option value="">Selecciona un estado</option>
                {opcionesEstado.map((estado) => (
                  <option
                    key={estado}
                    value={estado}
                  >
                    {estado}
                  </option>
                ))}
              </select>

              <textarea
                className={inputStyle}
                placeholder="Detalles"
                value={datosEdicion.comentario}
                onChange={(e) =>
                  setDatosEdicion({
                    ...datosEdicion,
                    comentario: e.target.value,
                  })
                }
              />
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() =>
                  editarRegistro(
                    tramiteEditando.id,
                    datosEdicion.nombre_cliente,
                    datosEdicion.telefono,
                    datosEdicion.tipo_tramite_id,
                    datosEdicion.estado,
                    datosEdicion.comentario
                  )
                }
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Crear Tramite*/}
      {ModalTramite && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setModalTramite(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Crear nuevo trámite</h2>
            <div className="grid gap-3">
              <input
                className={inputStyle}
                placeholder="Nombre del trámite"
                value={nombreTramite}
                onChange={(e) => setNombreTramite(e.target.value)}
              />

              <h3 className="text-md font-medium">Requisitos</h3>
              {requisitos.map((req, index) => (
                <div
                  key={index}
                  className="flex gap-2"
                >
                  <input
                    className={`${inputStyle} flex-1`}
                    placeholder={`Requisito ${index + 1}`}
                    value={req}
                    onChange={(e) => {
                      const nuevos = [...requisitos];
                      nuevos[index] = e.target.value;
                      setRequisitos(nuevos);
                    }}
                  />
                  <button
                    className="text-red-500"
                    onClick={() => {
                      const nuevos = requisitos.filter((_, i) => i !== index);
                      setRequisitos(nuevos);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setRequisitos([...requisitos, ''])}
              >
                + Agregar requisito
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={crearTramite}
              >
                Crear trámite
              </button>
            </div>
          </div>
        </div>
      )}

      {EditarTramite && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setEditarTramite(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Editar trámite</h2>

            <select
              className="border p-2 rounded w-full mb-3"
              value={selectedId || ''}
              onChange={(e) => handleSelectTramite(e.target.value)}
            >
              <option value="">Selecciona un trámite</option>
              {EditTramites.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                >
                  {t.nombre}
                </option>
              ))}
            </select>

            {selectedId && (
              <>
                <input
                  className="border p-2 rounded w-full mb-2"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nuevo nombre del trámite"
                />

                <h3 className="text-sm font-semibold mt-3">Requisitos:</h3>
                <ul className="text-sm mb-2">
                  {EditRequisitos.map((r) => (
                    <li
                      key={r.id}
                      className="flex justify-between items-center"
                    >
                      {r.descripcion}
                      <button
                        onClick={() => handleDeleteRequisito(r.id)}
                        className="text-red-500 text-xs"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="flex mb-2">
                  <input
                    className="border p-2 rounded w-full"
                    value={nuevoRequisito}
                    onChange={(e) => setNuevoRequisito(e.target.value)}
                    placeholder="Agregar nuevo requisito"
                  />
                  <button
                    onClick={handleAddRequisito}
                    className="ml-2 px-3 py-2 bg-green-500 text-white rounded"
                  >
                    +
                  </button>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleSaveChanges}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleDeleteTramite}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Eliminar trámite
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

// Estilo input rápido:
const inputStyle =
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

const getColorClass = (estado) => {
  switch (estado) {
    case 'Aprobado':
      return 'text-green-600';
    case 'Rechazado':
      return 'text-red-600';
    case 'En tramitación':
      return 'text-yellow-600';
    case 'En subsanación':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};
