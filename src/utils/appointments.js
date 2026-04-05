export const TIME_SLOT_START_HOUR = 8;
export const TIME_SLOT_END_HOUR = 20;
export const TIME_SLOT_INTERVAL_MINUTES = 15;

export function buildTimeSlots() {
  const slots = [];

  for (let hour = TIME_SLOT_START_HOUR; hour <= TIME_SLOT_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL_MINUTES) {
      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }

  return slots;
}

export const TIME_SLOTS = buildTimeSlots();

export function formatAppointmentDate(appointment) {
  const rawValue = appointment?.date && appointment?.time
    ? `${appointment.date}T${appointment.time}`
    : appointment?.created_at || appointment?.appointment_date || appointment?.date;
  if (!rawValue) {
    return 'Data não informada';
  }

  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) {
    return String(rawValue);
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function toDateInputValue(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}