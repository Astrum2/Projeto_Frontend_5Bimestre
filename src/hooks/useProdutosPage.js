import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/productsApi';

export function useProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function buscarProdutos() {
      try {
        setCarregando(true);
        setErro('');

        const dados = await fetchProducts(controller.signal);
        setProdutos(dados);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErro('Falha ao conectar com o backend. Confira a URL e o CORS da API.');
        }
      } finally {
        setCarregando(false);
      }
    }

    buscarProdutos();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    produtos,
    carregando,
    erro,
  };
}