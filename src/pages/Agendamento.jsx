import { useEffect, useState } from "react";
import "../estilo/Agendamento.css";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(/\/$/, "");
const APPOINTMENTS_ENDPOINT = `${API_BASE_URL}/appointments`;

function Agendamento() {
    const [form, setForm] = useState({
        nome: "",
        telefone: "",
        servico: "",
        data: "",
        horario: "",
    });
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);
    const [servicos, setServicos] = useState([]);
    const [carregandoServicos, setCarregandoServicos] = useState(true);
    const [erroServicos, setErroServicos] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function buscarServicos() {
            try {
                setCarregandoServicos(true);
                setErroServicos("");

                const resposta = await fetch(APPOINTMENTS_ENDPOINT, {
                    signal: controller.signal,
                });

                if (!resposta.ok) {
                    throw new Error("Nao foi possivel carregar os servicos.");
                }

                const dados = await resposta.json();
                const lista = Array.isArray(dados) ? dados : [];
                const nomesUnicos = [...new Set(lista.map((item) => item.servico || item.service).filter(Boolean))];
                const opcoes = nomesUnicos.map((nome) => ({ nome }));

                setServicos(opcoes);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setErroServicos("Nao foi possivel carregar a lista de servicos.");
                }
            } finally {
                setCarregandoServicos(false);
            }
        }

        buscarServicos();

        return () => {
            controller.abort();
        };
    }, []);

    function atualizarCampo(evento) {
        const { name, value } = evento.target;
        setForm((estadoAnterior) => ({
            ...estadoAnterior,
            [name]: value,
        }));
    }

    async function enviarAgendamento(evento) {
        evento.preventDefault();

        try {
            setEnviando(true);
            setMensagem("");
            setErro(false);

            const resposta = await fetch(APPOINTMENTS_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!resposta.ok) {
                throw new Error("Nao foi possivel criar o agendamento.");
            }

            setMensagem("Agendamento enviado com sucesso!");
            setForm({
                nome: "",
                telefone: "",
                servico: "",
                data: "",
                horario: "",
            });
        } catch (error) {
            setErro(true);
            setMensagem("Falha ao enviar agendamento. Verifique o backend e tente novamente.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="agendamento">
            <h1>Agendamento</h1>
            <p>Preencha os dados abaixo para reservar seu horario.</p>

            <form className="form-agendamento" onSubmit={enviarAgendamento}>
                <label>
                    Nome
                    <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={atualizarCampo}
                        required
                    />
                </label>

                <label>
                    Telefone
                    <input
                        type="tel"
                        name="telefone"
                        value={form.telefone}
                        onChange={atualizarCampo}
                        required
                    />
                </label>

                <label>
                    Servico
                    <select
                        name="servico"
                        value={form.servico}
                        onChange={atualizarCampo}
                        disabled={carregandoServicos || servicos.length === 0}
                        required
                    >
                        <option value="">
                            {carregandoServicos ? "Carregando servicos..." : "Selecione"}
                        </option>
                        {servicos.map((servico) => (
                            <option key={servico.id || servico.nome} value={servico.nome}>
                                {servico.nome}
                            </option>
                        ))}
                    </select>
                </label>

                {erroServicos && <p className="status-servicos-agendamento erro">{erroServicos}</p>}

                <label>
                    Data
                    <input
                        type="date"
                        name="data"
                        value={form.data}
                        onChange={atualizarCampo}
                        required
                    />
                </label>

                <label>
                    Horario
                    <input
                        type="time"
                        name="horario"
                        value={form.horario}
                        onChange={atualizarCampo}
                        required
                    />
                </label>

                <button type="submit" disabled={enviando || carregandoServicos || servicos.length === 0}>
                    {enviando ? "Enviando..." : "Confirmar agendamento"}
                </button>
            </form>

            {mensagem && (
                <p className={`mensagem ${erro ? "erro" : "sucesso"}`}>
                    {mensagem}
                </p>
            )}
        </main>
    );
}

export default Agendamento;