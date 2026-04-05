import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setLoggedUser } from '../utils/auth';
import { isValidEmail } from '../utils/validators';
import { loginWithEmailAndPassword } from '../services/authApi';

const INITIAL_FORM_DATA = {
  email: '',
  senha: '',
};

export function useLoginPage() {
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
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    setMessage(null);

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const loginResponse = await loginWithEmailAndPassword(formData.email, formData.senha);

      setLoggedUser({
        nome: formData.email.split('@')[0],
        email: formData.email,
        token: loginResponse?.token,
      });

      setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Nao foi possivel realizar login.',
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