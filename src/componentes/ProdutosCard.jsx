function ProdutosCard({ produto }) {
    const preco = Number(produto.preco);

    return (
        <article className="produto-card">
            <h2>{produto.nome}</h2>
            <p>{produto.descricao}</p>
            <p className="produto-preco">
                Preço: {Number.isFinite(preco) ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Não informado"}
            </p>
        </article>
    );
}

export default ProdutosCard;