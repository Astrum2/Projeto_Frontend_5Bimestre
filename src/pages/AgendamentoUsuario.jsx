import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBanner from '../componentes/MessageBanner';
import '../estilo/AgendamentoUsuario.css';
import { getLoggedUser } from '../utils/auth';
import { requestJson } from '../utils/api';
import { TIME_SLOTS, formatAppointmentDate, toDateInputValue, toTimeInputValue } from '../utils/appointments';

const APPOINTMENT_LIST_ENDPOINTS = (userId) => [
    `/appointments/user/${userId}`,
    `/appointments?user_id=${userId}`,
    `/appointments?userId=${userId}`,
    `/users/${userId}/appointments`,
];

function normalizeArrayResponse(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.appointments)) {
        return data.appointments;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
}

function AgendamentoUsuario() {
    const navigate = useNavigate();
    const authUser = getLoggedUser();

    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [formData, setFormData] = useState({
        service_id: '',
        barber_id: '',
        notes: '',
        status: 'scheduled',
    });

    const serviceNameById = useMemo(() => {
        return services.reduce((accumulator, service) => {
            accumulator[String(service.id)] = service.name;
            return accumulator;
        }, {});
    }, [services]);

    const barberNameById = useMemo(() => {
        return barbers.reduce((accumulator, barber) => {
            accumulator[String(barber.id)] = barber.name;
            return accumulator;
        }, {});
    }, [barbers]);

    const loadAppointments = async () => {
        const endpoints = APPOINTMENT_LIST_ENDPOINTS(authUser.id);
        let lastError = null;

        for (const endpoint of endpoints) {
            try {
                const data = await requestJson(endpoint, {
                    headers: {
                        Authorization: `Bearer ${authUser.token}`,
                    },
                });

                return normalizeArrayResponse(data);
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Nao foi possivel carregar seus agendamentos.');
    };

    const loadReferenceData = async () => {
        const [servicesResult, barbersResult] = await Promise.allSettled([
            requestJson('/services'),
            requestJson('/barbers'),
        ]);

        if (servicesResult.status === 'fulfilled') {
            setServices(normalizeArrayResponse(servicesResult.value));
        } else {
            setMessage({ type: 'error', text: 'Nao foi possivel carregar os servicos.' });
        }

        if (barbersResult.status === 'fulfilled') {
            setBarbers(normalizeArrayResponse(barbersResult.value));
        } else {
            setMessage({ type: 'error', text: 'Nao foi possivel carregar os barbeiros.' });
        }
    };

    const refreshData = async () => {
        setIsLoading(true);

        try {
            const [appointmentsResult] = await Promise.all([
                loadAppointments(),
                loadReferenceData(),
            ]);

            setAppointments(appointmentsResult);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Nao foi possivel carregar seus agendamentos.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authUser?.id || !authUser?.token) {
            navigate('/Login');
            return;
        }

        refreshData();
    }, [authUser?.id, authUser?.token, navigate]);

    useEffect(() => {
        document.body.style.overflow = editingAppointmentId ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [editingAppointmentId]);

    const resetForm = () => {
        setEditingAppointmentId(null);
        setSelectedDate('');
        setSelectedTimeSlot('');
        setFormData({
            service_id: '',
            barber_id: '',
            notes: '',
            status: 'scheduled',
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleTimeChange = (event) => {
        setSelectedTimeSlot(event.target.value);
    };

    const buildCreatedAt = () => {
        if (!selectedDate || !selectedTimeSlot) {
            return '';
        }

        return `${selectedDate}T${selectedTimeSlot}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!editingAppointmentId) {
            setMessage({ type: 'info', text: 'Selecione um agendamento para editar.' });
            return;
        }

        if (!selectedDate || !selectedTimeSlot) {
            setMessage({ type: 'error', text: 'Selecione a data e o horário do agendamento.' });
            return;
        }

        if (!formData.service_id || !formData.barber_id) {
            setMessage({ type: 'error', text: 'Selecione um serviço e um barbeiro.' });
            return;
        }

        const payload = {
            user_id: Number(authUser.id),
            service_id: Number(formData.service_id),
            barber_id: Number(formData.barber_id),
            notes: formData.notes?.trim() || null,
            created_at: buildCreatedAt(),
            status: formData.status || 'scheduled',
        };

        try {
            setIsSubmitting(true);
            setMessage(null);

            await requestJson(`/appointments/${editingAppointmentId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${authUser.token}`,
                },
                body: JSON.stringify(payload),
            });

            setMessage({ type: 'success', text: 'Agendamento atualizado com sucesso.' });

            resetForm();
            await refreshData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Nao foi possivel salvar o agendamento.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (appointment) => {
        setEditingAppointmentId(appointment.id);
        setFormData({
            service_id: String(appointment.service_id || ''),
            barber_id: String(appointment.barber_id || ''),
            notes: appointment.notes || '',
            status: appointment.status || 'scheduled',
        });
        setSelectedDate(toDateInputValue(appointment.created_at || appointment.appointment_date || appointment.date));
        setSelectedTimeSlot(
            toTimeInputValue(
                appointment.created_at || appointment.appointment_time_slot || appointment.time_slot || appointment.time
            )
        );
        setMessage({ type: 'info', text: 'Edicao do agendamento carregada abaixo.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (appointmentId) => {
        const shouldDelete = window.confirm('Deseja excluir este agendamento?');
        if (!shouldDelete) {
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage(null);

            await requestJson(`/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authUser.token}`,
                },
            });

            if (editingAppointmentId === appointmentId) {
                resetForm();
            }

            setMessage({ type: 'success', text: 'Agendamento excluído com sucesso.' });
            await refreshData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Nao foi possivel excluir o agendamento.',
            });
        } finally {
            setIsSubmitting(false);
        }
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