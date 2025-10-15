/**
 * Utilidades para formateo de fechas en español (Chile)
 * Proporciona funciones para formatear fechas en formato legible
 */

/**
 * Formatea una fecha al estilo "20 Mar, 2024"
 * @param dateString - Fecha en formato ISO 8601
 * @returns Fecha formateada en español
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  const day = date.getDate();
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};

/**
 * Calcula los días hasta una fecha específica
 * @param dateString - Fecha objetivo en formato ISO 8601
 * @returns Número de días (positivo = futuro, negativo = pasado)
 */
export const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a inicio del día

  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Genera texto relativo de fecha ("Hoy", "Mañana", "En 5 días", etc.)
 * @param dateString - Fecha en formato ISO 8601
 * @returns Texto relativo de la fecha
 */
export const getRelativeDate = (dateString: string): string => {
  const days = getDaysUntil(dateString);

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';
  if (days < 0) return 'Pasado';
  if (days <= 7) return `En ${days} días`;

  return formatDate(dateString);
};

/**
 * Formatea una fecha con hora al estilo "20 Mar, 2024 - 14:30"
 * @param dateString - Fecha en formato ISO 8601
 * @returns Fecha y hora formateadas
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  const formattedDate = formatDate(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${formattedDate} - ${hours}:${minutes}`;
};

/**
 * Determina si una fecha es hoy
 * @param dateString - Fecha en formato ISO 8601
 * @returns true si la fecha es hoy
 */
export const isToday = (dateString: string): boolean => {
  return getDaysUntil(dateString) === 0;
};

/**
 * Determina si una fecha está en el pasado
 * @param dateString - Fecha en formato ISO 8601
 * @returns true si la fecha ya pasó
 */
export const isPast = (dateString: string): boolean => {
  return getDaysUntil(dateString) < 0;
};

/**
 * Formatea una fecha para input type="date" (YYYY-MM-DD)
 * @param date - Objeto Date
 * @returns Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};
