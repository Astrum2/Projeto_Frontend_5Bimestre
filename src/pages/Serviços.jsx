import "../estilo/Serviços.css";
import MessageBanner from "../componentes/MessageBanner";
import { useServicosPage } from "../hooks/useServicosPage";

function Serviços() {
  const {
    servicos,
    carregando,
    erro,
    loggedUser,
    message,
    editingId,
    editForm,
    isSubmitting,
    deleteConfirmId,
    isCreating,
    newServiceForm,
    handleEditClick,
    handleEditCancel,
    handleEditChange,
    handleEditSubmit,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleCreateClick,
    handleCreateCancel,
    handleCreateChange,
    handleCreateSubmit,
  } = useServicosPage();

  return (
    <div className="servicos-container">
      <h1>Nossos Servicos</h1>

      <MessageBanner type={message?.type}>{message?.text}</MessageBanner>

      {carregando && <p className="status-servicos">Carregando servicos...</p>}
      {!carregando && erro && <p className="status-servicos erro">{erro}</p>}

      {!carregando && !erro && (
        <div className="servicos-grid">
          {loggedUser?.admin && (
            <div className="servico-card add-service-card">
              {isCreating ? (
                <form onSubmit={handleCreateSubmit} className="servico-form">
                  <input type="text" name="name" value={newServiceForm.name} onChange={handleCreateChange} placeholder="Nome do serviço" required />
                  <textarea name="description" value={newServiceForm.description} onChange={handleCreateChange} placeholder="Descrição" />
                  <input type="number" name="duration_minutes" value={newServiceForm.duration_minutes} onChange={handleCreateChange} placeholder="Duração (minutos)" />
                  <input type="number" name="price" value={newServiceForm.price} onChange={handleCreateChange} placeholder="Preço" step="0.01" />
                  <div className="form-buttons">
                    <button type="submit" className="btn-save" disabled={isSubmitting}>
                      {isSubmitting ? "Criando..." : "Criar Serviço"}
                    </button>
                    <button type="button" className="btn-cancel-edit" onClick={handleCreateCancel} disabled={isSubmitting}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button className="btn-add-service" onClick={handleCreateClick}>
                  <span className="add-icon">+</span>
                  <span className="add-text">Novo Serviço</span>
                </button>
              )}
            </div>
          )}
          {servicos.length > 0 ? (
            servicos.map((servico) => {
              const preco = Number(servico.price);
              const isEditing = editingId === servico.id;
              const isDeleting = deleteConfirmId === servico.id;

              return (
                <div key={servico.id || `${servico.name}-${servico.price}`} className="servico-card">
                  {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="servico-form">
                      <input type="text" name="name" value={editForm.name} onChange={handleEditChange} placeholder="Nome" required />
                      <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Descrição" />
                      <input type="number" name="duration_minutes" value={editForm.duration_minutes} onChange={handleEditChange} placeholder="Duração (minutos)" />
                      <input type="number" name="price" value={editForm.price} onChange={handleEditChange} placeholder="Preço" step="0.01" />
                      <div className="form-buttons">
                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                          {isSubmitting ? "Salvando..." : "Salvar"}
                        </button>
                        <button type="button" className="btn-cancel-edit" onClick={handleEditCancel} disabled={isSubmitting}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : isDeleting ? (
                    <div className="servico-form">
                      <h3>Confirmar exclusão</h3>
                      <p>Tem certeza que deseja deletar este serviço? Esta ação não pode ser desfeita.</p>
                      <div className="form-buttons">
                        <button type="button" className="btn-delete" onClick={handleDeleteConfirm} disabled={isSubmitting}>
                          {isSubmitting ? "Deletando..." : "Deletar"}
                        </button>
                        <button type="button" className="btn-cancel-edit" onClick={handleDeleteCancel} disabled={isSubmitting}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2>{servico.name}</h2>
                      <p className="descricao">
                        {servico.description || servico.descrption || "Sem descricao"}
                      </p>
                      <p className="tempo">
                        Tempo: {servico.duration_minutes ? `${servico.duration_minutes} min` : "Nao informado"}
                      </p>
                      <p className="preco">
                        Preco: {Number.isFinite(preco) ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Nao informado"}
                      </p>

                      {loggedUser?.admin && (
                        <div className="admin-actions">
                          <button className="btn-edit" onClick={() => handleEditClick(servico)}>
                            ✏️ Editar
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteClick(servico.id)}>
                            🗑️ Deletar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p className="status-servicos">Nenhum servico encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Serviços;
