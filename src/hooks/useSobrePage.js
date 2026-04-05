import { useEffect, useState } from 'react';
import { fetchBarbers, filterActiveBarbers } from '../services/barbersApi';

export function useSobrePage() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function buscarBarbeiros() {
      try {
        setCarregando(true);
        setErro('');

        const dados = await fetchBarbers(controller.signal);
        if (!active) return;

        setBarbeiros(filterActiveBarbers(dados));
      } catch (error) {
        if (!active || error.name === 'AbortError') return;
        setErro(error.message || 'Nao foi possivel carregar os barbeiros.');
      } finally {
        if (active) setCarregando(false);
      }
    }

    buscarBarbeiros();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return {
    barbeiros,
    carregando,
    erro,
  };
}