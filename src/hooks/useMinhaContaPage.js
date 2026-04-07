import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedUser, setLoggedUser } from '../utils/auth';
import { formatCPF, formatTelefone, isValidEmail, normalizeTelefone, validarCPF, validarSenha } from '../utils/validators';
import { fetchUserProfile, updateUserProfile, uploadUserProfileImage } from '../services/profileApi';

function buildInitialFormData(isAdmin) {
  return {
    nome: '',
    email: '',
    cpf: '',
    senha: '',
    confirmarSenha: '',
    admin: '',
    ...(isAdmin && {
      telefone: '',
      imagem: null,
      imagemNome: '',
      ativo: true,
    }),
  };
}

export function useMinhaContaPage() {
  const navigate = useNavigate();
  const [authUser] = useState(getLoggedUser());
  const [lockedEmail, setLockedEmail] = useState('');
  const isAdmin = useMemo(() => authUser?.admin === true, [authUser?.admin]);

  const [formData, setFormData] = useState(buildInitialFormData(isAdmin));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [backendMessage, setBackendMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authUser?.id || !authUser?.token) {
      navigate('/Login');
      return;
    }

    const carregarPerfil = async () => {
      try {
        const profile = await fetchUserProfile(authUser.id, authUser.token);

        const newFormData = {
          nome: profile?.name || authUser.nome || '',
          email: profile?.email || authUser.email || '',
          cpf: formatCPF(profile?.cpf || authUser.cpf || ''),
        };

        if (isAdmin) {
          newFormData.telefone = formatTelefone(profile?.phone || authUser.telefone || '');
          newFormData.imagem = null;
          newFormData.imagemNome = profile?.photo || '';
          newFormData.ativo = profile?.active !== undefined ? profile?.active : true;
        }

        setFormData((prev) => ({
          ...prev,
          ...newFormData,
        }));

        setLockedEmail(profile?.email || authUser.email || '');
      } catch (error) {
        setBackendMessage(error.message || 'Nao foi possivel carregar seus dados.');
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [authUser, isAdmin, navigate]);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    if (name === 'email') {
      return;
    }

    let newValue = value;

    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      const file = files?.[0];
      setFormData((prev) => ({
        ...prev,
        imagem: file || null,
        imagemNome: file?.name || '',
      }));
      return;
    } else if (name === 'cpf') {
      newValue = formatCPF(value);
    } else if (name === 'telefone') {
      newValue = formatTelefone(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!authUser?.id || !authUser?.token) {
      navigate('/Login');
      return;
    }

    const newErrors = {};
    setBackendMessage('');

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (formData.senha && !validarSenha(formData.senha)) {
      newErrors.senha =
        'A senha deve conter no mínimo 7 caracteres, uma letra maiúscula, um número e um caractere especial';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      let photoName = formData.imagemNome;
      if (isAdmin && formData.imagem) {
        const uploadResponse = await uploadUserProfileImage(formData.imagem, authUser.token);
        photoName = uploadResponse?.fileName || photoName;
      }

      const payload = {
        name: formData.nome.trim(),
        email: lockedEmail,
        cpf: formData.cpf,
      };

      if (isAdmin) {
        payload.phone = normalizeTelefone(formData.telefone);
        if (photoName) {
          payload.photo = photoName;
        }
        payload.active = formData.ativo;
      }

      if (formData.senha) {
        payload.password = formData.senha;
      }

      const updatedProfile = await updateUserProfile(authUser.id, payload, authUser.token);

      setLoggedUser({
        id: authUser.id,
        token: authUser.token,
        admin: authUser.admin,
        nome: updatedProfile?.name || formData.nome.trim(),
        email: updatedProfile?.email || lockedEmail,
        cpf: updatedProfile?.cpf || formData.cpf,
        ...(isAdmin && {
          telefone: formatTelefone(updatedProfile?.phone || formData.telefone),
          imagem: null,
          imagemNome: updatedProfile?.photo || formData.imagemNome,
          ativo: updatedProfile?.active !== undefined ? updatedProfile.active : formData.ativo,
        }),
      });

      setFormData((prev) => ({
        ...prev,
        senha: '',
        confirmarSenha: '',
      }));

      setBackendMessage('Informações atualizadas com sucesso!');
    } catch (error) {
      setBackendMessage(error.message || 'Nao foi possivel atualizar suas informações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    backendMessage,
    isSubmitting,
    isAdmin,
    handleChange,
    handleSubmit,
  };
}