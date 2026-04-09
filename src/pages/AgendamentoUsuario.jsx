import { useEffect, useState } from 'react';
import MessageBanner from '../componentes/MessageBanner';
import '../estilo/AgendamentoUsuario.css';
import { TIME_SLOTS, formatAppointmentDate } from '../utils/appointments';
import { useAgendamentoUsuarioPage } from '../hooks/useAgendamentoUsuarioPage';

function AgendamentoUsuario() {
    const [pendingDeleteAppointment, setPendingDeleteAppointment] = useState(null);
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

    const requestDelete = (appointment) => {
        setPendingDeleteAppointment(appointment);
    };

    const cancelDelete = () => {
        setPendingDeleteAppointment(null);
    };

    useEffect(() => {
        if (pendingDeleteAppointment) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [pendingDeleteAppointment]);

    const confirmDelete = async () => {
        if (!pendingDeleteAppointment) {
            return;
        }

        const deleted = await handleDelete(pendingDeleteAppointment.id);

        if (deleted) {
            setPendingDeleteAppointment(null);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: 'Agendamento',
            completed: 'Concluído',
            cancelled: 'Cancelado',
        };

        return labels[status] || status;
    };

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
                        {appointments.map((appointment) => {
                            const currentAppointmentId = appointment.id ?? appointment.appointment_id;

                            return (
                            <article key={currentAppointmentId} className="agendamento-usuario__card">
                                <div className="agendamento-usuario__card-top">
                                    <strong>{serviceNameById[String(appointment.service_id)] || `Serviço #${appointment.service_id}`}</strong>
                                    <span className={`agendamento-usuario__badge agendamento-usuario__badge--${appointment.status || 'scheduled'}`}>
                                        {getStatusLabel(appointment.status || 'scheduled')}
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
                                    <button type="button" onClick={() => handleEdit({ ...appointment, id: currentAppointmentId })}>
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="agendamento-usuario__danger-button"
                                        onClick={() => requestDelete({ ...appointment, id: currentAppointmentId })}
                                        disabled={isSubmitting}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                            );
                        })}
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

            {pendingDeleteAppointment && (
                <div
                    className="agendamento-usuario__overlay agendamento-usuario__overlay--delete"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-agendamento-title"
                    onClick={cancelDelete}
                >
                    <div className="agendamento-usuario__confirm-card" onClick={(event) => event.stopPropagation()}>
                        <h2 id="delete-agendamento-title">Confirmar exclusão</h2>
                        <p>
                            Tem certeza que deseja excluir este agendamento? Essa ação não pode ser desfeita.
                        </p>

                        <div className="agendamento-usuario__confirm-summary">
                            <strong>{serviceNameById[String(pendingDeleteAppointment.service_id)] || `Serviço #${pendingDeleteAppointment.service_id}`}</strong>
                            <span>{formatAppointmentDate(pendingDeleteAppointment)}</span>
                        </div>

                        <div className="agendamento-usuario__confirm-actions">
                            <button type="button" className="agendamento-usuario__ghost-button" onClick={cancelDelete} disabled={isSubmitting}>
                                Cancelar
                            </button>
                            <button type="button" className="agendamento-usuario__danger-button" onClick={confirmDelete} disabled={isSubmitting}>
                                {isSubmitting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AgendamentoUsuario;