import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [providers, setProviders] = useState([]);
  const [rfc, setRfc] = useState('');
  const [error, setError] = useState(null);

  const fetchProviders = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/providers');
      const data = await res.json();
      setProviders(data);
    } catch (e) {
      setError('Error al obtener proveedores');
    }
  };

  const addProvider = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfc })
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error);
      } else {
        setRfc('');
        setError(null);
        fetchProviders();
      }
    } catch (e) {
      setError('Error al agregar');
    }
  };

  useEffect(() => {
    fetchProviders();
    const id = setInterval(fetchProviders, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="App">
      <h1>Monitoreo REPSE</h1>
      <div className="form">
        <input value={rfc} onChange={e => setRfc(e.target.value.toUpperCase())} placeholder="RFC" />
        <button onClick={addProvider}>Agregar</button>
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>RFC</th>
            <th>Razón Social</th>
            <th>Estatus</th>
            <th>Vigencia</th>
            <th>Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {providers.map(p => (
            <tr key={p.rfc}>
              <td>{p.rfc}</td>
              <td>{p.info?.razonSocial}</td>
              <td>{p.info?.estatus}</td>
              <td>{p.info?.vigencia}</td>
              <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
