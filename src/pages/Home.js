import { useState } from 'react';
import Header from '../components/Header';
import TramitesList from '../components/TramitesList';
import Seguimiento from '../components/Seguimiento';
import Chatbox from '../components/ChatBox';

const Home = () => {
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);

  return (
    <div>
      <Header />
      <TramitesList onSelectTramite={setTramiteSeleccionado} />
      <Seguimiento />
      {tramiteSeleccionado && (
        <Chatbox
          tramite={tramiteSeleccionado}
          onClose={() => setTramiteSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default Home;
