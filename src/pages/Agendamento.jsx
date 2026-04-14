import "../estilo/Agendamento.css";
import { TIME_SLOTS } from "../utils/appointments";
import { useAgendamentoPage } from "../hooks/useAgendamentoPage";

function Agendamento() {
    const {
        appointmentForm,
        enviando,
        mensagem,
        erro,
        servicos,
        carregandoServicos,
        erroServicos,
        selectedDate,
        selectedTimeSlot,
        barbeiros,
        carregandoBarbeiros,
        erroBarbeiros,
        atualizarCampo,
        atualizarData,
        atualizarHorario,
        enviarAgendamento,
    } = useAgendamentoPage();

    const usuarioAutenticado = Boolean(appointmentForm.user_id);

    return (
        <main className="agendamento">
            <h1>Agendamento</h1>
            <p>Preencha os dados abaixo para reservar seu horario.</p>

            {!usuarioAutenticado && (
                <p className="status-servicos-agendamento erro alerta-login">Faca login para criar um agendamento.</p>
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