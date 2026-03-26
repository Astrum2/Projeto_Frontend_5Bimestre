import { useEffect, useState } from "react";
import "../estilo/Serviços.css";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(/\/$/, "");

function Serviços() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function buscarServicos() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch(`${API_BASE_URL}/services`, {
          signal: controller.signal,
        });

        if (!resposta.ok) {
          throw new Error("Nao foi possivel carregar os servicos.");
        }

        const dados = await resposta.json();
        setServicos(Array.isArray(dados) ? dados : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro("Falha ao conectar com o backend. Confira a URL e o CORS da API.");
        }
      } finally {
        setCarregando(false);
      }
    }

    buscarServicos();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="servicos-container">
      <h1>Nossos Servicos</h1>

      {carregando && <p className="status-servicos">Carregando servicos...</p>}
      {!carregando && erro && <p className="status-servicos erro">{erro}</p>}

      {!carregando && !erro && (
        <div className="servicos-grid">
          {servicos.length > 0 ? (
            servicos.map((servico) => {
              const preco = Number(servico.price);

              return (
                <div key={servico.id || `${servico.name}-${servico.price}`} className="servico-card">
                  <h2>{servico.name}</h2>
                  <p>{servico.descrption}</p>
                  <p className="preco">
                    Preco: {Number.isFinite(preco) ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Nao informado"}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="status-servicos">Nenhum servico encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Serviços;
