import { useEffect, useMemo, useState } from 'react';
import { authChangedEvent, getLoggedUser } from '../utils/auth';
import { fetchAppointmentDetails, fetchBarberSchedules, fetchBarbers, fetchServices } from '../services/appointmentsApi';

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

function buildServiceDurationById(services) {
  return services.reduce((accumulator, service) => {
    const duration = Number(service.duration_minutes ?? service.duration);

    if (Number.isFinite(duration) && duration > 0) {
      accumulator[String(service.id)] = duration;
    }

    return accumulator;
  }, {});
}

function resolveServiceDuration(appointment, serviceDurationById) {
  const embeddedDuration = Number(
    appointment?.service?.duration_minutes ??
      appointment?.service?.duration ??
      appointment?.service_duration_minutes ??
      appointment?.duration_minutes
  );

  if (Number.isFinite(embeddedDuration) && embeddedDuration > 0) {
    return embeddedDuration;
  }

  const serviceId = appointment?.service_id ?? appointment?.serviceId ?? appointment?.service?.id;

  if (serviceId) {
    return serviceDurationById[String(serviceId)] || null;
  }

  return null;
}

export function useAgendaBarbeiroPage() {
  const [loggedUser, setLoggedUser] = useState(getLoggedUser());
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [loggedBarberId, setLoggedBarberId] = useState(null);
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
    let active = true;

    async function carregarAgenda() {
      try {
        setCarregando(true);
        setErro('');

        if (!loggedUser?.token || !loggedUser?.admin || !loggedUser?.id) {
          if (!active) {
            return;
          }

          setErro('Acesso restrito para administradores autenticados.');
          return;
        }

        const [schedulesResult, servicesResult, barbersResult] = await Promise.allSettled([
          fetchBarberSchedules(loggedUser.token, controller.signal),
          fetchServices(controller.signal),
          fetchBarbers(controller.signal),
        ]);

        if (barbersResult.status === 'fulfilled') {
          const matchedBarber = barbersResult.value.find((barber) => {
            const barberUserId = barber?.user_id ?? barber?.userId ?? barber?.user?.id;
            return Number(barberUserId) === Number(loggedUser.id);
          });

          if (!active) {
            return;
          }

          if (!matchedBarber?.id) {
            setErro('Nenhum barbeiro vinculado ao usuario logado foi encontrado.');
            setSchedules([]);
            setAppointmentDetailsById({});
            setLoggedBarberId(null);
            return;
          }

          const resolvedBarberId = Number(matchedBarber.id);
          setLoggedBarberId(Number.isFinite(resolvedBarberId) ? resolvedBarberId : null);
        } else {
          if (!active || barbersResult.reason?.name === 'AbortError') {
            return;
          }

          setErro('Nao foi possivel validar o barbeiro logado.');
          return;
        }

        if (schedulesResult.status === 'fulfilled') {
          if (!active) {
            return;
          }

          const matchedBarber = barbersResult.value.find((barber) => {
            const barberUserId = barber?.user_id ?? barber?.userId ?? barber?.user?.id;
            return Number(barberUserId) === Number(loggedUser.id);
          });
          const matchedBarberId = Number(matchedBarber?.id);

          const filteredSchedules = schedulesResult.value.filter((slot) => {
            const slotBarberId = slot?.barber_id ?? slot?.barberId ?? slot?.barber?.id;
            return Number(slotBarberId) === matchedBarberId;
          });

          setSchedules(filteredSchedules);
        } else {
          if (!active || schedulesResult.reason?.name === 'AbortError') {
            return;
          }

          setErro('Nao foi possivel carregar a agenda do barbeiro.');
          return;
        }

        if (servicesResult.status === 'fulfilled') {
          if (!active) {
            return;
          }

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
            if (active && result.status === 'fulfilled') {
              nextAppointmentDetailsById[String(appointmentIds[index])] = result.value;
            }
          });

          if (active) {
            setAppointmentDetailsById(nextAppointmentDetailsById);
          }
        } else {
          if (active) {
            setAppointmentDetailsById({});
          }
        }
      } catch (error) {
        if (active && error.name !== 'AbortError') {
          setErro(error.message || 'Falha ao carregar a agenda do barbeiro.');
        }
      } finally {
        if (active) {
          setCarregando(false);
        }
      }
    }

    carregarAgenda();

    return () => {
      active = false;
      controller.abort('useAgendaBarbeiroPage cleanup');
    };
  }, [loggedUser?.token, loggedUser?.admin, loggedUser?.id]);

  const serviceNameById = useMemo(() => buildServiceNameById(services), [services]);
  const serviceDurationById = useMemo(() => buildServiceDurationById(services), [services]);

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

    return Object.values(groupedSchedules)
      .map((group) => {
        const appointment = group.appointment_id ? appointmentDetailsById[String(group.appointment_id)] : null;
        const sortedSlots = [...group.slots].sort((a, b) => String(a.start || '').localeCompare(String(b.start || '')));

        return {
          ...group,
          slots: sortedSlots,
          serviceName: resolveServiceName(appointment, serviceNameById),
          serviceDuration: resolveServiceDuration(appointment, serviceDurationById),
        };
      })
      .sort((a, b) => {
        const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return String(a.slots[0]?.start || '').localeCompare(String(b.slots[0]?.start || ''));
      });
  }, [appointmentDetailsById, schedules, serviceDurationById, serviceNameById]);

  return {
    scheduleList,
    carregando,
    erro,
    loggedUser,
    loggedBarberId,
  };
}