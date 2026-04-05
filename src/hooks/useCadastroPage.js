import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setLoggedUser } from '../utils/auth';
import { formatCPF, isValidEmail, validarCPF, validarSenha } from '../utils/validators';
import { loginAfterRegistration, registerUser } from '../services/registrationApi';

const INITIAL_FORM_DATA = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  cpf: '',
};

export function useCadastroPage() {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);

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
    const { name, value } = event.target;
    const newValue = name === 'cpf' ? formatCPF(value) : value;

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

      await registerUser({
        name: formData.nome.trim(),
        email: formData.email.trim(),
        password: formData.senha,
        cpf: formData.cpf,
      });

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
    handleChange,
    handleSubmit,
  };
}