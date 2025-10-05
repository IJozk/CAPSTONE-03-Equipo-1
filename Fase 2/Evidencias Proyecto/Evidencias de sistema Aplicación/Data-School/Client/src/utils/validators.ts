/**
 * Valida que el email tenga un formato correcto
 * @param email - Email a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'El email es requerido';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }

  return null;
};

/**
 * Valida que la contraseña cumpla los requisitos mínimos
 * @param password - Contraseña a validar
 * @returns Mensaje de error o null si es válida
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'La contraseña es requerida';
  }

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  return null;
};

/**
 * Valida el formulario de login completo
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Objeto con validez del formulario y errores
 */
export const validateLoginForm = (email: string, password: string) => {
  const errors: { email?: string; password?: string } = {};

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
