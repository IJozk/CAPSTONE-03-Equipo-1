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

  // Limpiar espacios dobles
  const clean = nombre.trim().replace(/\s+/g, ' ');

  if (clean.length < 5) {
    return 'El nombre es demasiado corto';
  }

  // Debe tener al menos nombre y apellido
  const parts = clean.split(' ');
  if (parts.length < 2) {
    return 'Debe ingresar al menos nombre y apellido';
  }

  // Regex que acepta nombres reales en Chile
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;

  if (!nameRegex.test(clean)) {
    return 'El nombre solo puede contener letras, espacios, guiones o apóstrofes';
  }

  return null;
};

/**
 * Valida RUT chileno con algoritmo módulo 11
 * Acepta RUTs desde 1-9 hasta 99.999.999-X
 * @param rut - RUT a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateRUT = (rut: string): string | null => {
  if (!rut || rut.trim().length === 0) {
    return 'El RUT es requerido';
  }

  // Limpiar RUT (quitar puntos y guión)
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');

  // Verificar formato básico (mínimo 2 caracteres: número + verificador)
  if (cleanRut.length < 2) {
    return 'RUT inválido';
  }

  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1).toUpperCase();

  // Validar que el número sea válido
  if (!/^\d+$/.test(rutNumber)) {
    return 'RUT debe contener solo números';
  }

  // Validar rango: desde 1 hasta 99.999.999
  const rutValue = parseInt(rutNumber);
  if (rutValue < 1 || rutValue > 99999999) {
    return 'RUT fuera del rango válido';
  }

  // Calcular dígito verificador usando algoritmo módulo 11
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
  
  // Si solo hay un carácter, devolverlo sin formato
  if (clean.length === 1) return clean;

  // Separar número y verificador
  const number = clean.slice(0, -1);
  const verifier = clean.slice(-1);

  // Formatear número con puntos
  let formatted = '';
  let counter = 0;

  for (let i = number.length - 1; i >= 0; i--) {
    if (counter === 3 && number.length > 3) {
      formatted = '.' + formatted;
      counter = 0;
    }
    formatted = number[i] + formatted;
    counter++;
  }

  // Agregar guión y verificador
  formatted += '-' + verifier.toUpperCase();

  return formatted;
};

/**
 * Valida teléfono chileno
 * Acepta formato +56912345678 o 912345678
 * @param telefono - Teléfono a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateTelefono = (telefono: string): string | null => {
  if (!telefono || telefono.trim().length === 0) {
    return null; // Opcional
  }

  // Remover espacios, guiones y paréntesis
  const clean = telefono.replace(/[\s\-\(\)]/g, '');

  // Validar formato: +56912345678 o 912345678
  const phoneRegex = /^(\+?56)?9\d{8}$/;
  
  if (!phoneRegex.test(clean)) {
    return 'Formato inválido. Use +56912345678 o 912345678';
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

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Al menos un carácter especial');
  }

  // Calcular fortaleza
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
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

  const validRoles = ['ADMINISTRADOR', 'ADMINISTRATIVO', 'PROFESOR', 'ESTUDIANTE_APODERADO'];
  if (!validRoles.includes(role)) {
    return 'Rol inválido';
  }

  return null;
};

/**
 * Valida fecha de nacimiento
 * - No puede ser futura
 * - Debe tener entre 3 y 22 años de edad
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns Mensaje de error o null si es válido
 */
export const validateFechaNacimiento = (fecha: string): string | null => {
  if (!fecha || fecha.trim().length === 0) {
    return 'La fecha de nacimiento es requerida';
  }

  const fechaNacimiento = new Date(fecha);
  const hoy = new Date();
  
  // Resetear horas para comparar solo fechas
  hoy.setHours(0, 0, 0, 0);
  fechaNacimiento.setHours(0, 0, 0, 0);

  // Validar que sea una fecha válida
  if (isNaN(fechaNacimiento.getTime())) {
    return 'Fecha inválida';
  }

  // Validar que no sea fecha futura
  if (fechaNacimiento > hoy) {
    return 'La fecha de nacimiento no puede ser futura';
  }

  // Calcular edad exacta considerando mes y día
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();
  
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  // Validar rango de edad: 3 a 22 años
  if (edad < 3) {
    return 'La edad mínima es 3 años';
  }

  if (edad > 22) {
    return 'La edad máxima es 22 años';
  }

  return null;
};

/**
 * Valida fecha de contratación
 * - No puede ser futura
 * - No puede ser más de 3 meses en el pasado
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns Mensaje de error o null si es válido
 */
export const validateFechaContratacion = (fecha: string): string | null => {
  if (!fecha || fecha.trim().length === 0) {
    return 'La fecha de contratación es requerida';
  }

  const fechaContratacion = new Date(fecha);
  const hoy = new Date();
  
  // Resetear horas para comparar solo fechas
  hoy.setHours(0, 0, 0, 0);
  fechaContratacion.setHours(0, 0, 0, 0);

  // Validar que sea una fecha válida
  if (isNaN(fechaContratacion.getTime())) {
    return 'Fecha inválida';
  }

  // Validar que no sea fecha futura
  if (fechaContratacion > hoy) {
    return 'La fecha de contratación no puede ser futura';
  }

  // Calcular fecha límite (3 meses atrás)
  const tresMesesAtras = new Date(hoy);
  tresMesesAtras.setMonth(hoy.getMonth() - 3);

  // Validar que no sea más antigua de 3 meses
  if (fechaContratacion < tresMesesAtras) {
    return 'La fecha de contratación no puede ser anterior a 3 meses';
  }

  return null;
};

/**
 * Obtiene la fecha mínima permitida para fecha de contratación (3 meses atrás)
 * @returns Fecha en formato YYYY-MM-DD
 */
export const getMinContratacionDate = (): string => {
  const hoy = new Date();
  const tresMesesAtras = new Date(hoy);
  tresMesesAtras.setMonth(hoy.getMonth() - 3);
  return tresMesesAtras.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha máxima permitida para fecha de contratación (hoy)
 * @returns Fecha en formato YYYY-MM-DD
 */
export const getMaxContratacionDate = (): string => {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha mínima permitida para fecha de nacimiento (22 años atrás)
 * @returns Fecha en formato YYYY-MM-DD
 */
export const getMinNacimientoDate = (): string => {
  const hoy = new Date();
  const veintidosAniosAtras = new Date(hoy);
  veintidosAniosAtras.setFullYear(hoy.getFullYear() - 22);
  return veintidosAniosAtras.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha máxima permitida para fecha de nacimiento (3 años atrás)
 * @returns Fecha en formato YYYY-MM-DD
 */
export const getMaxNacimientoDate = (): string => {
  const hoy = new Date();
  const tresAniosAtras = new Date(hoy);
  tresAniosAtras.setFullYear(hoy.getFullYear() - 3);
  return tresAniosAtras.toISOString().split('T')[0];
};