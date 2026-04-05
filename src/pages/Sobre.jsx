import "../estilo/Sobre.css";
import { useSobrePage } from "../hooks/useSobrePage";

function Sobre() {
    const { barbeiros, carregando, erro } = useSobrePage();

    return (
        <main className="sobre">
            <section className="sobre-header">
                <h1>Nossos Barbeiros</h1>
                <p>Conheça a equipe disponível no momento.</p>
            </section>

            {carregando && <p className="status">Carregando barbeiros...</p>}
            {!carregando && erro && <p className="status erro">{erro}</p>}

            {!carregando && !erro && (
                <section className="barbeiros-lista">
                    {barbeiros.length > 0 ? (
                        barbeiros.map((barbeiro) => (
                            <article className="barbeiro-card" key={barbeiro.id}>
                                <img
                                    className="barbeiro-foto"
                                    src={`/imagens/${barbeiro.photo}`}
                                    alt={`Foto de ${barbeiro.name}`}
                                    onError={(evento) => {
                                        evento.currentTarget.src = "/imagens/Logo.png";
                                    }}
                                />
                                <span className="barbeiro-numero">#{barbeiro.id}</span>
                                <h2>{barbeiro.name}</h2>
                            </article>
                        ))
                    ) : (
                        <p className="status">Nenhum barbeiro encontrado.</p>
                    )}
                </section>
            )}
        </main>
    );
}

export default Sobre;