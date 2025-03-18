import { useState } from 'react';

const Chatbox = ({ tramite, onClose }) => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);

  const enviarMensaje = () => {
    if (!mensaje.trim()) return;
    setMensajes([...mensajes, { tipo: 'usuario', texto: mensaje }]);
    setMensaje('');
  };

  return (
    <div className="fixed bottom-5 right-5 bg-white shadow-lg rounded-lg w-80">
      <div className="bg-blue-600 text-white p-2 flex justify-between">
        <span>Chat con Asesor</span>
        <button onClick={onClose}>❌</button>
      </div>
      <div className="p-3 h-60 overflow-y-auto">
        {mensajes.map((msg, index) => (
          <div
            key={index}
            className={msg.tipo === 'usuario' ? 'text-right' : 'text-left'}
          >
            <p className="bg-gray-200 inline-block p-2 rounded">{msg.texto}</p>
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex">
        <input
          className="flex-1 border rounded p-1"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <button
          className="bg-blue-600 text-white px-3 ml-2 rounded"
          onClick={enviarMensaje}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
