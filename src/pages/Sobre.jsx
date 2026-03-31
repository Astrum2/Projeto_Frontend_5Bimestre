import { useEffect, useState } from "react";
import "../estilo/Sobre.css";
import { requestJson } from "../utils/api";

function Sobre() {
    const [barbeiros, setBarbeiros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function buscarBarbeiros() {
            try {
                setCarregando(true);
                setErro("");

                const dados = await requestJson("/barbers");

                if (!ativo) return;
                setBarbeiros(Array.isArray(dados) ? dados : []);
            } catch (error) {
                if (!ativo) return;
                setErro(error.message || "Nao foi possivel carregar os barbeiros.");
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        buscarBarbeiros();

        return () => {
            ativo = false;
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