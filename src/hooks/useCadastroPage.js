import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedUser, setLoggedUser } from '../utils/auth';
import { formatCPF, formatTelefone, isValidEmail, normalizeTelefone, validarCPF, validarSenha } from '../utils/validators';
import { loginAfterRegistration, registerUser, uploadRegistrationImage } from '../services/registrationApi';

const INITIAL_FORM_DATA = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  cpf: '',
  telefone: '',
  imagem: null,
  imagemNome: '',
  ativo: true,
};

export function useCadastroPage() {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);
  const [authUser] = useState(getLoggedUser());
  const isAdmin = useMemo(() => authUser?.admin === true, [authUser?.admin]);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (type === 'file') {
      const file = files?.[0];
      setFormData((prev) => ({
        ...prev,
        imagem: file || null,
        imagemNome: file?.name || '',
      }));
      return;
    }

    let newValue = value;
    if (name === 'cpf') {
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
    const newErrors = {};
    setMessage(null);

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (!validarSenha(formData.senha)) {
      newErrors.senha =
        'A senha deve conter no mínimo 7 caracteres, uma letra maiúscula, um número e um caractere especial';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      let photoName = '';
      if (isAdmin && formData.imagem) {
        const uploadResponse = await uploadRegistrationImage(formData.imagem, authUser?.token);
        photoName = uploadResponse?.fileName || '';
      }

      const payload = {
        name: formData.nome.trim(),
        email: formData.email.trim(),
        password: formData.senha,
        cpf: formData.cpf,
      };

      if (isAdmin) {
        payload.admin = true;
        payload.phone = normalizeTelefone(formData.telefone);
        payload.active = formData.ativo;
        if (photoName) {
          payload.photo = photoName;
        }
      }

      await registerUser(payload);

      if (isAdmin) {
        setMessage({ type: 'success', text: 'Novo barbeiro criado com sucesso!' });
        setFormData(INITIAL_FORM_DATA);
      } else {
        const loginResponse = await loginAfterRegistration(formData.email.trim(), formData.senha);

        setLoggedUser({
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          token: loginResponse?.token,
        });

        setMessage({ type: 'success', text: 'Cadastro realizado com sucesso!' });
        redirectTimeoutRef.current = window.setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Nao foi possivel finalizar o cadastro.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    message,
    isSubmitting,
    isAdmin,
    handleChange,
    handleSubmit,
  };
}