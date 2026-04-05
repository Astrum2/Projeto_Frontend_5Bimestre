import { useEffect, useState } from 'react';
import { authChangedEvent, getLoggedUser } from '../utils/auth';
import { createService, deleteService, fetchServices, updateService } from '../services/servicesApi';

const INITIAL_SERVICE_FORM = {
  name: '',
  description: '',
  duration_minutes: '',
  price: '',
};

function mapServiceToEditForm(servico) {
  return {
    name: servico.name,
    description: servico.description || servico.descrption || '',
    duration_minutes: servico.duration_minutes || '',
    price: servico.price || '',
  };
}

export function useServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [loggedUser, setLoggedUser] = useState(getLoggedUser());
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState(INITIAL_SERVICE_FORM);

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
        setErro('');

        const dados = await fetchServices(controller.signal);
        setServicos(dados);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErro('Falha ao conectar com o backend. Confira a URL e o CORS da API.');
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
    setEditForm(mapServiceToEditForm(servico));
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = loggedUser?.token;
      await updateService(editingId, editForm, token);

      setServicos((prev) =>
        prev.map((servico) =>
          servico.id === editingId
            ? { ...servico, ...editForm }
            : servico
        )
      );

      setMessage({ type: 'success', text: 'Serviço atualizado com sucesso!' });
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar serviço.' });
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
      await deleteService(idToDelete, token);

      setServicos((prev) => prev.filter((servico) => servico.id !== idToDelete));
      setMessage({ type: 'success', text: 'Serviço deletado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao deletar serviço.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setNewServiceForm(INITIAL_SERVICE_FORM);
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setNewServiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = loggedUser?.token;
      const response = await createService(newServiceForm, token);

      setServicos((prev) => [...prev, response]);
      setMessage({ type: 'success', text: 'Serviço criado com sucesso!' });
      setIsCreating(false);
      setNewServiceForm(INITIAL_SERVICE_FORM);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao criar serviço.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}