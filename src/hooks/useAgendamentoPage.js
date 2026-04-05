import { useEffect, useState } from 'react';
import { getLoggedUser } from '../utils/auth';
import { createAppointment, fetchBarbers, fetchServices } from '../services/appointmentsApi';

const INITIAL_APPOINTMENT_FORM = {
  user_id: '',
  service_id: '',
  barber_id: '',
  notes: '',
};

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