import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedUser } from '../utils/auth';
import { fetchBarbers, fetchServices } from '../services/appointmentsApi';
import {
  deleteUserAppointment,
  fetchUserAppointments,
  updateUserAppointment,
} from '../services/userAppointmentsApi';
import { toDateInputValue, toTimeInputValue } from '../utils/appointments';

const INITIAL_FORM_DATA = {
  service_id: '',
  barber_id: '',
  notes: '',
  status: 'scheduled',
};

function isAppointmentFromUser(appointment, userId) {
  const normalizedUserId = Number(userId);

  return [
    appointment?.user_id,
    appointment?.userId,
    appointment?.user?.id,
  ].some((candidateId) => Number(candidateId) === normalizedUserId);
}

export function useAgendamentoUsuarioPage() {
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
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

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

  const loadReferenceData = async () => {
    const [servicesResult, barbersResult] = await Promise.allSettled([
      fetchServices(),
      fetchBarbers(),
    ]);

    if (servicesResult.status === 'fulfilled') {
      setServices(servicesResult.value);
    } else {
      setMessage({ type: 'error', text: 'Nao foi possivel carregar os servicos.' });
    }

    if (barbersResult.status === 'fulfilled') {
      setBarbers(barbersResult.value);
    } else {
      setMessage({ type: 'error', text: 'Nao foi possivel carregar os barbeiros.' });
    }
  };

  const refreshData = async () => {
    setIsLoading(true);

    try {
      const [appointmentsResult] = await Promise.all([
        fetchUserAppointments(authUser.id, authUser.token),
        loadReferenceData(),
      ]);

      const filteredAppointments = appointmentsResult.filter((appointment) =>
        isAppointmentFromUser(appointment, authUser.id)
      );

      setAppointments(filteredAppointments);
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
    setFormData(INITIAL_FORM_DATA);
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
      date: selectedDate,
      time: selectedTimeSlot,
      status: formData.status || 'scheduled',
    };

    try {
      setIsSubmitting(true);
      setMessage(null);

      await updateUserAppointment(editingAppointmentId, payload, authUser.token);

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
    setSelectedDate(toDateInputValue(appointment.date || appointment.appointment_date || appointment.created_at));
    setSelectedTimeSlot(
      toTimeInputValue(
        appointment.time || appointment.appointment_time_slot || appointment.time_slot || appointment.created_at
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

      await deleteUserAppointment(appointmentId, authUser.token);

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

  return {
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
  };
}