import { useEffect, useState } from "react";
import ProdutosCard from "../componentes/ProdutosCard";
import "../estilo/ProdutosCard.css";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(/\/$/, "");

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function buscarProdutos() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await fetch(`${API_BASE_URL}/api/produtos`, {
                    signal: controller.signal,
                });

                if (!resposta.ok) {
                    throw new Error("Nao foi possivel carregar os produtos.");
                }

                const dados = await resposta.json();
                setProdutos(Array.isArray(dados) ? dados : []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setErro("Falha ao conectar com o backend. Confira a URL e o CORS da API.");
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

    return (
        <main className="pagina-produtos">
            <h1>Servicos da Barbearia CortaAi</h1>
            <p className="subtitulo-pagina-produtos">Confira os servicos e valores atualizados em tempo real.</p>

            {carregando && <p className="status-produtos">Carregando produtos...</p>}
            {!carregando && erro && <p className="status-produtos erro">{erro}</p>}

            {!carregando && !erro && (
                <section className="produtos-grid">
                    {produtos.length > 0 ? (
                        produtos.map((produto) => (
                            <ProdutosCard
                                key={produto.id || `${produto.nome}-${produto.preco}`}
                                produto={produto}
                            />
                        ))
                    ) : (
                        <p className="status-produtos">Nenhum produto encontrado.</p>
                    )}
                </section>
            )}
        </main>
    );
}

export default Produtos;