import ProdutosCard from "../componentes/ProdutosCard";
import "../estilo/ProdutosCard.css";
import { useProdutosPage } from "../hooks/useProdutosPage";

function Produtos() {
    const { produtos, carregando, erro } = useProdutosPage();

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