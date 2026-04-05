import MessageBanner from '../componentes/MessageBanner';
import '../estilo/AgendamentoUsuario.css';
import { TIME_SLOTS, formatAppointmentDate } from '../utils/appointments';
import { useAgendamentoUsuarioPage } from '../hooks/useAgendamentoUsuarioPage';

function AgendamentoUsuario() {
    const {
        appointments,
        services,
        barbers,
        isLoading,
        isSubmitting,
        message,
        editingAppointmentId,
        selectedDate,
        selectedTimeSlot,
        formData,
        serviceNameById,
        barberNameById,
        resetForm,
        handleChange,
        handleDateChange,
        handleTimeChange,
        handleSubmit,
        handleEdit,
        handleDelete,
    } = useAgendamentoUsuarioPage();

    if (isLoading) {
        return (
            <main className="agendamento-usuario">
                <h1>Meus Agendamentos</h1>
                <p>Carregando seus agendamentos...</p>
            </main>
        );
    }

    return (
        <main className="agendamento-usuario">
            <div className="agendamento-usuario__header">
                <div>
                    <h1>Meus Agendamentos</h1>
                    <p>Consulte, altere ou exclua seus agendamentos vinculados ao seu usuário.</p>
                </div>
            </div>

            <MessageBanner type={message?.type}>{message?.text}</MessageBanner>

            <section className="agendamento-usuario__list">
                <h2>Seus agendamentos</h2>

                {appointments.length === 0 ? (
                    <p className="agendamento-usuario__empty">Nenhum agendamento encontrado para este usuário.</p>
                ) : (
                    <div className="agendamento-usuario__cards">
                        {appointments.map((appointment) => (
                            <article key={appointment.id} className="agendamento-usuario__card">
                                <div className="agendamento-usuario__card-top">
                                    <strong>{serviceNameById[String(appointment.service_id)] || `Serviço #${appointment.service_id}`}</strong>
                                    <span className={`agendamento-usuario__badge agendamento-usuario__badge--${appointment.status || 'scheduled'}`}>
                                        {appointment.status || 'scheduled'}
                                    </span>
                                </div>

                                <p>
                                    <span>Barbeiro:</span> {barberNameById[String(appointment.barber_id)] || `ID ${appointment.barber_id}`}
                                </p>
                                <p>
                                    <span>Data:</span> {formatAppointmentDate(appointment)}
                                </p>
                                <p>
                                    <span>Observações:</span> {appointment.notes || 'Sem observações'}
                                </p>

                                <div className="agendamento-usuario__card-actions">
                                    <button type="button" onClick={() => handleEdit(appointment)}>
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="agendamento-usuario__danger-button"
                                        onClick={() => handleDelete(appointment.id)}
                                        disabled={isSubmitting}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {editingAppointmentId && (
                <div className="agendamento-usuario__overlay" role="dialog" aria-modal="true" aria-labelledby="edit-agendamento-title">
                    <div className="agendamento-usuario__overlay-card">
                        <div className="agendamento-usuario__panel-header">
                            <h2 id="edit-agendamento-title">Editar agendamento</h2>
                            <button type="button" className="agendamento-usuario__ghost-button" onClick={resetForm}>
                                Cancelar
                            </button>
                        </div>

                        <form className="agendamento-usuario__form" onSubmit={handleSubmit}>
                            <label>
                                Serviço
                                <select name="service_id" value={formData.service_id} onChange={handleChange} required>
                                    <option value="">Selecione</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={String(service.id)}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Barbeiro
                                <select name="barber_id" value={formData.barber_id} onChange={handleChange} required>
                                    <option value="">Selecione</option>
                                    {barbers.map((barber) => (
                                        <option key={barber.id} value={String(barber.id)}>
                                            {barber.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Data
                                <input type="date" value={selectedDate} onChange={handleDateChange} required />
                            </label>

                            <label>
                                Horário
                                <select value={selectedTimeSlot} onChange={handleTimeChange} required>
                                    <option value="">Selecione um horário</option>
                                    {TIME_SLOTS.map((timeSlot) => (
                                        <option key={timeSlot} value={timeSlot}>
                                            {timeSlot}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Observações
                                <input
                                    type="text"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Opcional"
                                />
                            </label>

                            <label>
                                Status
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="scheduled">Agendado</option>
                                    <option value="completed">Concluído</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </label>

                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AgendamentoUsuario;