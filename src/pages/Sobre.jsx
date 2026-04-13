import "../estilo/Sobre.css";
import { useSobrePage } from "../hooks/useSobrePage";

function Sobre() {
    const { barbeiros, carregando, erro } = useSobrePage();

    return (
        <main className="sobre">
            <section className="sobre-header">
                <h2 className="sobre-intro-titulo">Nossa Didática</h2>
                <p className="sobre-intro-texto">
                    Nossa equipe trabalha com uma didática simples e personalizada: primeiro entendemos seu estilo,
                    depois explicamos as opções de corte e finalização para você participar da escolha.
                    Assim, cada atendimento fica mais claro, confortável e com resultado alinhado ao que você quer.
                </p>
                <h1>Nossos Barbeiros</h1>
                <p className="sobre-subtitulo">Conheça a equipe disponível no momento.</p>
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