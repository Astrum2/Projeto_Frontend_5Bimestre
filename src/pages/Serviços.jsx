import { useEffect, useState } from "react";
import "../estilo/Serviços.css";
import { API_BASE_URL } from "../utils/api";

const GENERIC_SERVICES = [
  {
    id: "generico-corte-social",
    nome: "Corte Social",
    descricao: "Corte classico e alinhado para o dia a dia, com finalizacao leve e acabamento limpo.",
    preco: 35,
  },
  {
    id: "generico-degrade",
    nome: "Corte Degrade",
    descricao: "Degrade progressivo nas laterais com topo personalizado, garantindo visual moderno e preciso.",
    preco: 45,
  },
  {
    id: "generico-barba-modelada",
    nome: "Barba Modelada",
    descricao: "Desenho e contorno da barba com toalha quente, navalha e finalizacao com balm.",
    preco: 30,
  },
  {
    id: "generico-corte-barba",
    nome: "Combo Corte + Barba",
    descricao: "Pacote completo com corte no estilo escolhido e modelagem de barba para um visual completo.",
    preco: 65,
  },
  {
    id: "generico-pezinho",
    nome: "Pezinho e Acabamento",
    descricao: "Ajuste rapido de nuca, costeletas e detalhes para manter o corte sempre em dia.",
    preco: 20,
  },
  {
    id: "generico-hidratacao",
    nome: "Hidratacao Capilar",
    descricao: "Tratamento rapido para hidratar os fios, reduzir ressecamento e devolver brilho ao cabelo.",
    preco: 40,
  },
];

function normalizeService(servico, index) {
  const nome = servico.nome || servico.name || servico.titulo || `Servico ${index + 1}`;
  const descricao =
    servico.descricao || servico.description || "Servico profissional executado por barbeiros experientes.";
  const precoBruto = servico.preco ?? servico.price;
  const preco = Number(precoBruto);

  return {
    id: servico.id || `servico-${index + 1}`,
    nome,
    descricao,
    preco: Number.isFinite(preco) ? preco : null,
  };
}

async function buscarServicosBackend(signal) {
  const endpoints = ["/services", "/api/servicos"];

  for (const endpoint of endpoints) {
    const resposta = await fetch(`${API_BASE_URL}${endpoint}`, { signal });

    if (!resposta.ok) {
      continue;
    }

    const dados = await resposta.json();
    if (Array.isArray(dados) && dados.length > 0) {
      return dados.map(normalizeService);
    }
  }

  throw new Error("Nao foi possivel carregar servicos da API.");
}

function Serviços() {
  const [servicos, setServicos] = useState(GENERIC_SERVICES);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function buscarServicos() {
      try {
        setCarregando(true);
        setMensagem("");

        const servicosApi = await buscarServicosBackend(controller.signal);
        setServicos(servicosApi.slice(0, 6));
      } catch (error) {
        if (error.name !== "AbortError") {
          setServicos(GENERIC_SERVICES);
          setMensagem("Exibindo catalogo padrao. Conecte o backend para carregar os servicos cadastrados.");
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
      {!carregando && mensagem && <p className="status-servicos aviso">{mensagem}</p>}

      {!carregando && (
        <div className="servicos-grid">
          {servicos.length > 0 ? (
            servicos.map((servico) => {
              const preco = Number(servico.preco);

              return (
                <div key={servico.id || `${servico.nome}-${servico.preco}`} className="servico-card">
                  <h2>{servico.nome}</h2>
                  <p>{servico.descricao}</p>
                  <p className="preco">
                    Preco: {Number.isFinite(preco) ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sob consulta"}
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
