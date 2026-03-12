function ProdutosCard({ produto }) {
    return (
        <div className="produto-card">
            <h2>{produto.nome}</h2>
            <p>{produto.descricao}</p>
            <p>Preço: R${produto.preco}</p>
            <ProdutosCard produto={produto} />
        </div>
    );
}