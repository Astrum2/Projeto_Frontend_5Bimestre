import { useEffect, useState } from "react";
import "../estilo/Sobre.css";
import { requestJson } from "../utils/api";

function Sobre() {
    const [barbeiros, setBarbeiros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let active = true;

        async function buscarBarbeiros() {
            try {
                setCarregando(true);
                setErro("");

                const dados = await requestJson("/barbers");

                if (!active) return;
                const barbeirosAtivos = Array.isArray(dados)
                    ? dados.filter((barbeiro) => Number(barbeiro.active ?? barbeiro.ativo) !== 0)
                    : [];

                setBarbeiros(barbeirosAtivos);
            } catch (error) {
                if (!active) return;
                setErro(error.message || "Nao foi possivel carregar os barbeiros.");
            } finally {
                if (active) setCarregando(false);
            }
        }

        buscarBarbeiros();

        return () => {
            active = false;
        };
    }, []);

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