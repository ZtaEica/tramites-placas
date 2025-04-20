import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Admin = () => {
  const [autenticado, setAutenticado] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tramites, setTramites] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  const [nuevo, setNuevo] = useState({
    nombre_tramite: '',
    estado: 'En tramitación',
    detalles: '',
    fecha_creacion: today,
  });

  const login = async () => {
    let { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('usuario', user)
      .eq('password', pass)
      .single();

    if (error || !data) {
      alert('Credenciales inválidas');
    } else {
      setAutenticado(true);
    }
  };

  const cargarTramites = async () => {
    const { data, error } = await supabase
      .from('tramites')
      .select('*')
      .eq('telefono', telefono)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      alert('Error al cargar trámites');
    } else {
      setTramites(data);
    }
  };

  const crearTramite = async () => {
    const { nombre_tramite, estado, detalles } = nuevo;

    if (!telefono || !nombre_tramite || !estado || !detalles) {
      alert('Completa todos los campos');
      return;
    }

    const { error } = await supabase.from('tramites').insert({
      telefono,
      nombre_tramite,
      estado,
      detalles,
      fecha_creacion: today,
    });

    if (error) {
      alert('Error al crear trámite');
    } else {
      cargarTramites();
      setNuevo({
        nombre_tramite: '',
        estado: 'En tramitación',
        detalles: '',
      });
    }
  };

  const actualizarTramite = async (id, campo, valor) => {
    const { error } = await supabase
      .from('tramites')
      .update({ [campo]: valor })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar');
    } else {
      cargarTramites();
    }
  };

  const actualizarEstado = async (tramite) => {
    const nuevoEstado = prompt('Nuevo estado:', tramite.estado);
    const nuevoDetalle = prompt('Detalle del cambio:', '');

    if (!nuevoEstado) return;

    const nuevoHistorial = [
      ...(tramite.historial || []),
      {
        estado: nuevoEstado,
        detalle: nuevoDetalle,
        fecha: new Date().toISOString(),
      },
    ];

    const { error } = await supabase
      .from('tramites')
      .update({
        estado: nuevoEstado,
        historial: nuevoHistorial,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', tramite.id);

    if (error) {
      alert('Error al actualizar estado');
    } else {
      cargarTramites();
    }
  };

  const eliminarTramite = async (id) => {
    //const confirmacion = confirm('¿Estás seguro de eliminar este trámite?');
    //if (!confirmacion) return;

    const { error } = await supabase.from('tramites').delete().eq('id', id);

    if (error) {
      alert('Error al eliminar');
    } else {
      cargarTramites();
    }
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
          <input
            type="text"
            placeholder="Usuario"
            className="w-full mb-2 p-2 border rounded"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full mb-4 p-2 border rounded"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>

      <div className="mb-6 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Teléfono del cliente"
          className="p-2 border rounded"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <button
          onClick={cargarTramites}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buscar trámites
        </button>
      </div>

      {telefono && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold text-lg mb-2">Crear nuevo trámite</h3>
          <input
            type="text"
            placeholder="Nombre del trámite"
            className="w-full mb-2 p-2 border rounded"
            value={nuevo.nombre_tramite}
            onChange={(e) =>
              setNuevo({ ...nuevo, nombre_tramite: e.target.value })
            }
          />
          <select
            className="w-full mb-2 p-2 border rounded"
            value={nuevo.estado}
            onChange={(e) => setNuevo({ ...nuevo, estado: e.target.value })}
          >
            <option>En tramitación</option>
            <option>En subsanación</option>
            <option>Aprobado</option>
            <option>Rechazado</option>
            <option>Pendiente de envío</option>
          </select>
          <textarea
            placeholder="Detalle del trámite"
            className="w-full p-2 border rounded mb-2"
            value={nuevo.detalles}
            onChange={(e) => setNuevo({ ...nuevo, detalles: e.target.value })}
          />
          <button
            onClick={crearTramite}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar nuevo trámite
          </button>
        </div>
      )}

      <div className="space-y-4">
        {tramites.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded shadow border-l-4 border-blue-600"
          >
            <input
              className="font-bold text-lg w-full mb-1"
              defaultValue={t.nombre_tramite}
              onBlur={(e) =>
                actualizarTramite(t.id, 'nombre_tramite', e.target.value)
              }
            />
            <select
              className="mb-1 w-full p-1 border rounded"
              defaultValue={t.estado}
              onChange={(e) => actualizarEstado(t)}
            >
              <option>En tramitación</option>
              <option>En subsanación</option>
              <option>Aprobado</option>
              <option>Rechazado</option>
              <option>Pendiente de envío</option>
            </select>
            <textarea
              className="w-full border rounded p-1 mb-2"
              defaultValue={t.detalles}
              onBlur={(e) =>
                actualizarTramite(t.id, 'detalles', e.target.value)
              }
            />
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => eliminarTramite(t.id)}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
