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

/**
 * Valida nombre completo
 * @param nombre - Nombre completo del usuario
 * @returns Mensaje de error o null si es válido
 */
export const validateNombreCompleto = (nombre: string): string | null => {
  if (!nombre || nombre.trim().length === 0) {
    return 'El nombre completo es requerido';
  }

  if (nombre.trim().length < 3) {
    return 'El nombre debe tener al menos 3 caracteres';
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nameRegex.test(nombre)) {
    return 'El nombre solo puede contener letras y espacios';
  }

  return null;
};

/**
 * Valida RUT chileno con algoritmo módulo 11
 * @param rut - RUT a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateRUT = (rut: string): string | null => {
  if (!rut || rut.trim().length === 0) {
    return 'El RUT es requerido';
  }

  // Limpiar RUT (quitar puntos y guión)
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');

  // Verificar formato básico
  if (cleanRut.length < 8 || cleanRut.length > 9) {
    return 'RUT inválido';
  }

  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1).toUpperCase();

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedVerifier = 11 - (sum % 11);
  let calculatedVerifier: string;

  if (expectedVerifier === 11) {
    calculatedVerifier = '0';
  } else if (expectedVerifier === 10) {
    calculatedVerifier = 'K';
  } else {
    calculatedVerifier = expectedVerifier.toString();
  }

  if (verifier !== calculatedVerifier) {
    return 'RUT inválido (dígito verificador incorrecto)';
  }

  return null;
};

/**
 * Formatea RUT chileno mientras se escribe
 * @param rut - RUT sin formato
 * @returns RUT formateado (XX.XXX.XXX-X)
 */
export const formatRUT = (rut: string): string => {
  // Quitar todo excepto números y K
  const clean = rut.replace(/[^0-9kK]/g, '');

  if (clean.length === 0) return '';

  // Separar número y verificador
  const number = clean.slice(0, -1);
  const verifier = clean.slice(-1);

  // Formatear número con puntos
  let formatted = '';
  let counter = 0;

  for (let i = number.length - 1; i >= 0; i--) {
    if (counter === 3) {
      formatted = '.' + formatted;
      counter = 0;
    }
    formatted = number[i] + formatted;
    counter++;
  }

  // Agregar guión y verificador si existe
  if (verifier) {
    formatted += '-' + verifier.toUpperCase();
  }

  return formatted;
};

/**
 * Valida teléfono chileno
 * @param telefono - Teléfono a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateTelefono = (telefono: string): string | null => {
  if (!telefono || telefono.trim().length === 0) {
    return null; // Opcional
  }

  const phoneRegex = /^\+?56[0-9]{9}$/;
  if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
    return 'Formato inválido. Debe ser +56XXXXXXXXX';
  }

  return null;
};

/**
 * Valida confirmación de contraseña
 * @param password - Contraseña original
 * @param confirmPassword - Confirmación de contraseña
 * @returns Mensaje de error o null si es válido
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword || confirmPassword.length === 0) {
    return 'Debes confirmar la contraseña';
  }

  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }

  return null;
};

/**
 * Valida fortaleza de contraseña (extendido para registro)
 * @param password - Contraseña a validar
 * @returns Objeto con validez, errores y fortaleza
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Al menos un número');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Al menos un símbolo (@$!%*?&)');
  }

  // Calcular fortaleza
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    if (password.length >= 12) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

/**
 * Valida rol de usuario
 * @param role - Rol a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateRole = (role: string): string | null => {
  if (!role || role.trim().length === 0) {
    return 'Debes seleccionar un rol';
  }

  const validRoles = ['ADMINISTRADOR', 'DIRECTOR', 'UTP', 'PROFESOR', 'ESTUDIANTE_APODERADO'];
  if (!validRoles.includes(role)) {
    return 'Rol inválido';
  }

  return null;
};
