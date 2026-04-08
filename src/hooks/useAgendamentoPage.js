import { useEffect, useMemo, useState } from 'react';
import { getLoggedUser } from '../utils/auth';
import {
  createAppointment,
  fetchAppointmentsByBarberAndDate,
  fetchBarbers,
  fetchServices,
} from '../services/appointmentsApi';
import { toDateInputValue, toTimeInputValue } from '../utils/appointments';

const INITIAL_APPOINTMENT_FORM = {
  user_id: '',
  service_id: '',
  barber_id: '',
  notes: '',
};

function toMinutes(timeValue) {
  if (!timeValue) {
    return null;
  }

  const [hours, minutes] = String(timeValue).split(':').map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return (hours * 60) + minutes;
}

function toTimeLabel(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  const hh = String(Math.floor(safeMinutes / 60)).padStart(2, '0');
  const mm = String(safeMinutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function isCancelledStatus(status) {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'cancelled' || normalized === 'canceled';
}

function resolveAppointmentDurationMinutes(appointment, serviceDurationById) {
  const directDuration = Number(
    appointment?.duration_minutes ??
      appointment?.service_duration_minutes ??
      appointment?.service?.duration_minutes ??
      appointment?.duration
  );

  if (Number.isFinite(directDuration) && directDuration > 0) {
    return directDuration;
  }

  const serviceId = appointment?.service_id ?? appointment?.serviceId ?? appointment?.service?.id;

  if (!serviceId) {
    return null;
  }

  return serviceDurationById[String(serviceId)] || null;
}

function isSameBarber(appointment, barberId) {
  const candidateBarberId = appointment?.barber_id ?? appointment?.barberId ?? appointment?.barber?.id;
  return Number(candidateBarberId) === Number(barberId);
}

export function useAgendamentoPage() {
  const [appointmentForm, setAppointmentForm] = useState(INITIAL_APPOINTMENT_FORM);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [servicos, setServicos] = useState([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [erroServicos, setErroServicos] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [barbeiros, setBarbeiros] = useState([]);
  const [carregandoBarbeiros, setCarregandoBarbeiros] = useState(true);
  const [erroBarbeiros, setErroBarbeiros] = useState('');

  const serviceDurationById = useMemo(() => {
    return servicos.reduce((accumulator, service) => {
      const duration = Number(service.duration_minutes ?? service.duration);

      if (Number.isFinite(duration) && duration > 0) {
        accumulator[String(service.id)] = duration;
      }

      return accumulator;
    }, {});
  }, [servicos]);

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
        setErroServicos('');

        const lista = await fetchServices(controller.signal);
        setServicos(lista);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErroServicos('Nao foi possivel carregar a lista de servicos.');
        }
      } finally {
        setCarregandoServicos(false);
      }
    }

    async function buscarBarbeiros() {
      try {
        setCarregandoBarbeiros(true);
        setErroBarbeiros('');

        const lista = await fetchBarbers(controller.signal);
        setBarbeiros(lista);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErroBarbeiros('Nao foi possivel carregar a lista de barbeiros.');
        }
      } finally {
        setCarregandoBarbeiros(false);
      }
    }

    buscarServicos();
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
  }

  function atualizarHorario(evento) {
    const nextTimeSlot = evento.target.value;
    setSelectedTimeSlot(nextTimeSlot);
  }

  async function enviarAgendamento(evento) {
    evento.preventDefault();
    const authUser = getLoggedUser();

    if (!authUser?.token) {
      setErro(true);
      setMensagem('Faca login para realizar o agendamento.');
      return;
    }

    try {
      setEnviando(true);
      setMensagem('');
      setErro(false);

      const selectedServiceDuration = serviceDurationById[String(appointmentForm.service_id)];

      if (!Number.isFinite(selectedServiceDuration) || selectedServiceDuration <= 0) {
        setErro(true);
        setMensagem('Nao foi possivel identificar a duracao do servico selecionado.');
        return;
      }

      let existingAppointments = [];

      try {
        existingAppointments = await fetchAppointmentsByBarberAndDate(
          Number(appointmentForm.barber_id),
          selectedDate,
          authUser.token
        );
      } catch (_validationError) {
        setErro(true);
        setMensagem('Nao foi possivel validar a disponibilidade do horario. Tente novamente.');
        return;
      }

      const selectedStart = toMinutes(selectedTimeSlot);
      const selectedEnd = selectedStart + selectedServiceDuration;

      const conflictingAppointment = existingAppointments.find((appointment) => {
        if (isCancelledStatus(appointment?.status)) {
          return false;
        }

        if (!isSameBarber(appointment, appointmentForm.barber_id)) {
          return false;
        }

        const appointmentDate = toDateInputValue(
          appointment?.date || appointment?.appointment_date || appointment?.created_at
        );

        if (appointmentDate !== selectedDate) {
          return false;
        }

        const appointmentTime = toTimeInputValue(
          appointment?.time || appointment?.appointment_time_slot || appointment?.time_slot || appointment?.created_at
        );
        const appointmentStart = toMinutes(appointmentTime);

        if (!Number.isFinite(appointmentStart)) {
          return false;
        }

        const appointmentDuration = resolveAppointmentDurationMinutes(appointment, serviceDurationById);

        if (!Number.isFinite(appointmentDuration) || appointmentDuration <= 0) {
          return false;
        }

        const appointmentEnd = appointmentStart + appointmentDuration;
        return selectedStart < appointmentEnd && appointmentStart < selectedEnd;
      });

      if (conflictingAppointment) {
        const conflictStart = toMinutes(
          toTimeInputValue(
            conflictingAppointment?.time ||
              conflictingAppointment?.appointment_time_slot ||
              conflictingAppointment?.time_slot ||
              conflictingAppointment?.created_at
          )
        );
        const conflictDuration = resolveAppointmentDurationMinutes(conflictingAppointment, serviceDurationById);
        const conflictEnd = conflictStart + conflictDuration;

        setErro(true);
        setMensagem(
          `Horario indisponivel. Este barbeiro ja possui agendamento das ${toTimeLabel(conflictStart)} as ${toTimeLabel(conflictEnd)} nessa data.`
        );
        return;
      }

      await createAppointment(
        {
          user_id: Number(appointmentForm.user_id),
          service_id: Number(appointmentForm.service_id),
          barber_id: Number(appointmentForm.barber_id),
          date: selectedDate,
          time: selectedTimeSlot,
          status: 'scheduled',
          notes: appointmentForm.notes || null,
        },
        authUser.token
      );

      setMensagem('Agendamento enviado com sucesso!');
      setAppointmentForm((estadoAnterior) => ({
        ...estadoAnterior,
        service_id: '',
        barber_id: '',
        notes: '',
      }));
      setSelectedDate('');
      setSelectedTimeSlot('');
    } catch (_error) {
      setErro(true);
      setMensagem('Falha ao enviar agendamento. Verifique o backend e tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return {
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
  };
}