import { useAgendaBarbeiroPage } from '../hooks/useAgendaBarbeiroPage';
import '../estilo/AgendaBarbeiro.css';

export default function AgendaBarbeiro() {
  const { scheduleList, carregando, erro } = useAgendaBarbeiroPage();

  if (carregando) return <div className="container"><p>Carregando agenda...</p></div>;

  if (erro) return <div className="container"><p className="error">Erro: {erro}</p></div>;

  const getStatusLabel = (status) => {
    const labels = {
      available: '✓ Disponível',
      blocked: '✗ Bloqueado',
      booked: '⊙ Agendado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#4CAF50',
      blocked: '#FF9800',
      booked: '#2196F3',
    };
    return colors[status] || '#666';
  };

  return (
    <div className="container">
      <h1>Agenda do Barbeiro</h1>

      {scheduleList.length === 0 ? (
        <p>Nenhuma agenda disponível.</p>
      ) : (
        <div className="schedule-list">
          {scheduleList.map((group) => {
            const firstSlot = group.slots[0];
            const lastSlot = group.slots[group.slots.length - 1];
            const duration = group.serviceDuration;

            return (
              <div
                key={group.slot_group || group.id}
                className="schedule-card"
                style={{
                  borderLeft: `4px solid ${getStatusColor(group.status)}`,
                }}
              >
                <div className="schedule-header">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(group.status) }}
                  >
                    {getStatusLabel(group.status)}
                  </span>
                </div>

                <div className="schedule-info">
                  <div className="info-item">
                    <strong>Data:</strong>
                    <span>{new Date(group.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="info-item">
                    <strong>Horário:</strong>
                    <span>
                      {firstSlot.start} às {lastSlot.end}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Duração:</strong>
                    <span>{duration ? `${duration} min` : 'Nao informado'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Serviço:</strong>
                    <span>{group.serviceName}</span>
                  </div>
                  {group.notes && (
                    <div className="info-item">
                      <strong>Notas:</strong>
                      <span>{group.notes}</span>
                    </div>
                  )}
                </div>

                {group.slots.length > 1 && (
                  <div className="schedule-slots">
                    <details>
                      <summary>Ver {group.slots.length} slots</summary>
                      <div className="slots-grid">
                        {group.slots.map((slot, idx) => (
                          <div key={idx} className="slot">
                            {slot.start} - {slot.end}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
