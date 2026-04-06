import { useEffect, useMemo, useState } from 'react';
import { authChangedEvent, getLoggedUser } from '../utils/auth';
import { fetchAppointmentDetails, fetchBarberSchedules, fetchServices } from '../services/appointmentsApi';

function buildServiceNameById(services) {
  return services.reduce((accumulator, service) => {
    accumulator[String(service.id)] = service.name;
    return accumulator;
  }, {});
}

function resolveServiceName(appointment, serviceNameById) {
  if (appointment?.service?.name) {
    return appointment.service.name;
  }

  if (appointment?.service_name) {
    return appointment.service_name;
  }

  const serviceId = appointment?.service_id ?? appointment?.serviceId;

  if (serviceId) {
    return serviceNameById[String(serviceId)] || `Servico #${serviceId}`;
  }

  return 'Servico nao informado';
}

export function useAgendaBarbeiroPage() {
  const [loggedUser, setLoggedUser] = useState(getLoggedUser());
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [appointmentDetailsById, setAppointmentDetailsById] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const syncAuthState = () => setLoggedUser(getLoggedUser());

    window.addEventListener('storage', syncAuthState);
    window.addEventListener(authChangedEvent, syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener(authChangedEvent, syncAuthState);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarAgenda() {
      try {
        setCarregando(true);
        setErro('');

        if (!loggedUser?.token || !loggedUser?.admin) {
          setErro('Acesso restrito para administradores autenticados.');
          return;
        }

        const [schedulesResult, servicesResult] = await Promise.allSettled([
          fetchBarberSchedules(loggedUser.token, controller.signal),
          fetchServices(controller.signal),
        ]);

        if (schedulesResult.status === 'fulfilled') {
          setSchedules(schedulesResult.value);
        } else {
          setErro('Nao foi possivel carregar a agenda do barbeiro.');
          return;
        }

        if (servicesResult.status === 'fulfilled') {
          setServices(servicesResult.value);
        }

        const appointmentIds = [...new Set(
          schedulesResult.value
            .map((slot) => slot.appointment_id)
            .filter(Boolean)
        )];

        if (appointmentIds.length > 0) {
          const appointmentResults = await Promise.allSettled(
            appointmentIds.map((appointmentId) => fetchAppointmentDetails(appointmentId, loggedUser.token))
          );

          const nextAppointmentDetailsById = {};

          appointmentResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              nextAppointmentDetailsById[String(appointmentIds[index])] = result.value;
            }
          });

          setAppointmentDetailsById(nextAppointmentDetailsById);
        } else {
          setAppointmentDetailsById({});
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErro(error.message || 'Falha ao carregar a agenda do barbeiro.');
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarAgenda();

    return () => controller.abort();
  }, [loggedUser?.token, loggedUser?.admin]);

  const serviceNameById = useMemo(() => buildServiceNameById(services), [services]);

  const scheduleList = useMemo(() => {
    const groupedSchedules = schedules.reduce((accumulator, slot) => {
      const key = slot.slot_group || `slot-${slot.id}`;

      if (!accumulator[key]) {
        accumulator[key] = {
          id: slot.id,
          barber_id: slot.barber_id,
          date: slot.date,
          appointment_id: slot.appointment_id,
          slot_group: slot.slot_group,
          status: slot.status,
          slots: [],
          notes: slot.notes,
        };
      }

      accumulator[key].slots.push(slot);
      return accumulator;
    }, {});

    return Object.values(groupedSchedules).map((group) => {
      const appointment = group.appointment_id ? appointmentDetailsById[String(group.appointment_id)] : null;

      return {
        ...group,
        serviceName: resolveServiceName(appointment, serviceNameById),
      };
    });
  }, [appointmentDetailsById, schedules, serviceNameById]);

  return {
    scheduleList,
    carregando,
    erro,
    loggedUser,
  };
}