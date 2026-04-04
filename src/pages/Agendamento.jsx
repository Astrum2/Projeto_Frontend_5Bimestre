import { useEffect, useState } from "react";
import "../estilo/Agendamento.css";
import { getLoggedUser } from "../utils/auth";
import { TIME_SLOTS } from "../utils/appointments";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(/\/$/, "");
const APPOINTMENTS_ENDPOINT = `${API_BASE_URL}/appointments`;
const SERVICES_ENDPOINT = `${API_BASE_URL}/services`;
const BARBERS_ENDPOINT = `${API_BASE_URL}/barbers`;

function Agendamento() {
    const [appointmentForm, setAppointmentForm] = useState({
        user_id: "",
        service_id: "",
        barber_id: "",
        notes: "",
        created_at: "",
    });
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);
    const [servicos, setServicos] = useState([]);
    const [carregandoServicos, setCarregandoServicos] = useState(true);
    const [erroServicos, setErroServicos] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
    const [barbeiros, setBarbeiros] = useState([]);
    const [carregandoBarbeiros, setCarregandoBarbeiros] = useState(true);
    const [erroBarbeiros, setErroBarbeiros] = useState("");

    function buildCreatedAt(dateValue, timeValue) {
        if (!dateValue || !timeValue) {
            return "";
        }

        return `${dateValue}T${timeValue}`;
    }

    useEffect(() => {
        const controller = new AbortController();
        const authUser = getLoggedUser();

        if (authUser?.id) {
            setAppointmentForm((estadoAnterior) => ({
                ...estadoAnterior,
                user_id: String(authUser.id),
            }));
        }

        async function buscarServicos() {
            try {
                setCarregandoServicos(true);
                setErroServicos("");

                const resposta = await fetch(SERVICES_ENDPOINT, {
                    signal: controller.signal,
                });

                if (!resposta.ok) {
                    throw new Error("Nao foi possivel carregar os servicos.");
                }

                const dados = await resposta.json();
                const lista = Array.isArray(dados) ? dados : [];
                setServicos(lista);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setErroServicos("Nao foi possivel carregar a lista de servicos.");
                }
            } finally {
                setCarregandoServicos(false);
            }
        }

        buscarServicos();

        async function buscarBarbeiros() {
            try {
                setCarregandoBarbeiros(true);
                setErroBarbeiros("");
                const resposta = await fetch(BARBERS_ENDPOINT, { signal: controller.signal });
                if (!resposta.ok) throw new Error("Não foi possível carregar os barbeiros.");
                const dados = await resposta.json();
                setBarbeiros(Array.isArray(dados) ? dados : []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setErroBarbeiros("Não foi possível carregar a lista de barbeiros.");
                }
            } finally {
                setCarregandoBarbeiros(false);
            }
        }

        buscarBarbeiros();

        return () => {
            controller.abort();
        };
    }, []);

    function atualizarCampo(evento) {
        const { name, value } = evento.target;
        setAppointmentForm((estadoAnterior) => ({
            ...estadoAnterior,
            [name]: value,
        }));
    }

    function atualizarData(evento) {
        const nextDate = evento.target.value;
        setSelectedDate(nextDate);
        setAppointmentForm((estadoAnterior) => ({
            ...estadoAnterior,
            created_at: buildCreatedAt(nextDate, selectedTimeSlot),
        }));
    }

    function atualizarHorario(evento) {
        const nextTimeSlot = evento.target.value;
        setSelectedTimeSlot(nextTimeSlot);
        setAppointmentForm((estadoAnterior) => ({
            ...estadoAnterior,
            created_at: buildCreatedAt(selectedDate, nextTimeSlot),
        }));
    }

    async function enviarAgendamento(evento) {
        evento.preventDefault();
        const authUser = getLoggedUser();

        if (!authUser?.token) {
            setErro(true);
            setMensagem("Faca login para realizar o agendamento.");
            return;
        }

        try {
            setEnviando(true);
            setMensagem("");
            setErro(false);

            const resposta = await fetch(APPOINTMENTS_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authUser.token}`,
                },
                body: JSON.stringify({
                    ...appointmentForm,
                    user_id: Number(appointmentForm.user_id),
                    service_id: Number(appointmentForm.service_id),
                    status: "scheduled",
                    notes: appointmentForm.notes || null,
                }),
            });

            if (!resposta.ok) {
                throw new Error("Nao foi possivel criar o agendamento.");
            }

            setMensagem("Agendamento enviado com sucesso!");
            setAppointmentForm((estadoAnterior) => ({
                ...estadoAnterior,
                service_id: "",
                notes: "",
                created_at: "",
            }));
            setSelectedDate("");
            setSelectedTimeSlot("");
        } catch (error) {
            setErro(true);
            setMensagem("Falha ao enviar agendamento. Verifique o backend e tente novamente.");
        } finally {
            setEnviando(false);
        }
    }

    const usuarioAutenticado = Boolean(appointmentForm.user_id);

    return (
        <main className="agendamento">
            <h1>Agendamento</h1>
            <p>Preencha os dados abaixo para reservar seu horario.</p>

            {!usuarioAutenticado && (
                <p className="status-servicos-agendamento erro">Faca login para criar um agendamento.</p>
            )}

            <form className="form-agendamento" onSubmit={enviarAgendamento}>
                <label>
                    Servico
                    <select name="service_id" value={appointmentForm.service_id} onChange={atualizarCampo} disabled={enviando || carregandoServicos || servicos.length === 0 || carregandoBarbeiros || barbeiros.length === 0 || !usuarioAutenticado} required >
                        <option value="">
                            {carregandoServicos ? "Carregando servicos..." : "Selecione"}
                        </option>
                        {servicos.map((servico) => (
                            <option key={servico.id} value={String(servico.id)}>
                                {servico.name}
                            </option>
                        ))}
                    </select>
                </label>

                {erroServicos && <p className="status-servicos-agendamento erro">{erroServicos}</p>}

                <label>
                    Barbeiro
                    <select
                        name="barber_id"
                        value={appointmentForm.barber_id}
                        onChange={atualizarCampo}
                        disabled={carregandoBarbeiros || barbeiros.length === 0 || !usuarioAutenticado}
                        required
                    >
                        <option value="">
                            {carregandoBarbeiros ? "Carregando barbeiros..." : "Selecione"}
                        </option>
                        {barbeiros.map((barbeiro) => (
                            <option key={barbeiro.id} value={String(barbeiro.id)}>
                                {barbeiro.name}
                            </option>
                        ))}
                    </select>
                </label>
                {erroBarbeiros && <p className="status-servicos-agendamento erro">{erroBarbeiros}</p>}



                <label>
                    Data
                    <input type="date" name="appointment_date" value={selectedDate} onChange={atualizarData} required />
                </label>

                <label>
                    Horarios disponiveis (15 em 15 minutos)
                    <select name="appointment_time_slot" value={selectedTimeSlot} onChange={atualizarHorario} required>
                        <option value="">Selecione um horario</option>
                        {TIME_SLOTS.map((timeSlot) => (
                            <option key={timeSlot} value={timeSlot}>
                                {timeSlot}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Observações
                    <input type="text" name="notes" value={appointmentForm.notes} onChange={atualizarCampo} placeholder="Opcional" />
                </label>

                <button
                    type="submit"
                    disabled={enviando || carregandoServicos || servicos.length === 0 || !usuarioAutenticado}
                >
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