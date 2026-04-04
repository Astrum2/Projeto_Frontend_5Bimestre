import { useEffect, useState } from "react";
import "../estilo/Serviços.css";
import { getLoggedUser, authChangedEvent } from "../utils/auth";
import { requestJson } from "../utils/api";
import MessageBanner from "../componentes/MessageBanner";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(/\/$/, "");

function Serviços() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [loggedUser, setLoggedUser] = useState(getLoggedUser());
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    name: "",
    description: "",
    duration_minutes: "",
    price: ""
  });

  useEffect(() => {
    const syncAuthState = () => setLoggedUser(getLoggedUser());
    window.addEventListener(authChangedEvent, syncAuthState);
    return () => window.removeEventListener(authChangedEvent, syncAuthState);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function buscarServicos() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch(`${API_BASE_URL}/services`, {
          signal: controller.signal,
        });

        if (!resposta.ok) {
          throw new Error("Nao foi possivel carregar os servicos.");
        }

        const dados = await resposta.json();
        setServicos(Array.isArray(dados) ? dados : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro("Falha ao conectar com o backend. Confira a URL e o CORS da API.");
        }
      } finally {
        setCarregando(false);
      }
    }

    buscarServicos();

    return () => {
      controller.abort();
    };
  }, []);

  const handleEditClick = (servico) => {
    setEditingId(servico.id);
    setEditForm({
      name: servico.name,
      description: servico.description || servico.descrption || "",
      duration_minutes: servico.duration_minutes || "",
      price: servico.price || ""
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = loggedUser?.token;
      await requestJson(`/services/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setServicos(servicos.map(s =>
        s.id === editingId
          ? { ...s, ...editForm }
          : s
      ));

      setMessage({ type: "success", text: "Serviço atualizado com sucesso!" });
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao atualizar serviço." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setEditingId(null);
    setDeleteConfirmId(id);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleDeleteConfirm = async () => {
    const idToDelete = deleteConfirmId;
    setDeleteConfirmId(null);
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = loggedUser?.token;
      await requestJson(`/services/${idToDelete}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setServicos(servicos.filter(s => s.id !== idToDelete));
      setMessage({ type: "success", text: "Serviço deletado com sucesso!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao deletar serviço." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setNewServiceForm({
      name: "",
      description: "",
      duration_minutes: "",
      price: ""
    });
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = loggedUser?.token;
      const response = await requestJson("/services", {
        method: "POST",
        body: JSON.stringify(newServiceForm),
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setServicos([...servicos, response]);
      setMessage({ type: "success", text: "Serviço criado com sucesso!" });
      setIsCreating(false);
      setNewServiceForm({ name: "",  description: "",  duration_minutes: "",  price: "" });
      setTimeout(() => window.location.reload());
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao criar serviço." });
    } finally {
      setIsSubmitting(false);
    }
  };

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
