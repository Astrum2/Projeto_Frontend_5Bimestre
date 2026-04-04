export function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function normalizeCPF(value) {
  return value?.replace(/\D/g, '') ?? '';
}

export function formatCPF(cpf) {
  const digits = normalizeCPF(cpf).slice(0, 11);
  const parts = [];

  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 9));

  let formatted = '';
  if (parts.length > 0) formatted = parts[0];
  if (parts.length > 1) formatted += '.' + parts[1];
  if (parts.length > 2) formatted += '.' + parts[2];
  if (digits.length > 9) formatted += '-' + digits.slice(9, 11);

  return formatted;
}

export function validarCPF(cpf) {
  const normalizedCpf = normalizeCPF(cpf);

  if (!normalizedCpf || normalizedCpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(normalizedCpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(normalizedCpf[i], 10) * (10 - i);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(normalizedCpf[9], 10)) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(normalizedCpf[i], 10) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(normalizedCpf[10], 10)) {
    return false;
  }

  return true;
}

export function validarSenha(senha) {
  const hasUpperCase = /[A-Z]/.test(senha);
  const hasNumber = /\d/.test(senha);
  const hasSpecial = /[^A-Za-z0-9]/.test(senha);

  return senha.length >= 7 && hasUpperCase && hasNumber && hasSpecial;
}