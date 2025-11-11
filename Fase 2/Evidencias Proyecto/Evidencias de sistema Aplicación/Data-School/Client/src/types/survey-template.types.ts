/**
 * survey-template.types.ts
 * Definiciones de tipos para templates de encuestas
 */

export type QuestionType =
  | 'text' // Respuesta de texto corto
  | 'textarea' // Respuesta de texto largo
  | 'radio' // Opción única (radio buttons)
  | 'checkbox' // Opción múltiple (checkboxes)
  | 'select' // Menú desplegable
  | 'rating' // Escala de calificación (1-5, 1-10, etc.)
  | 'yesno' // Sí/No
  | 'date' // Selector de fecha
  | 'number'; // Número

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[]; // Para radio, checkbox, select
  ratingConfig?: {
    min: number;
    max: number;
    step?: number;
    minLabel?: string; // Etiqueta para el valor mínimo
    maxLabel?: string; // Etiqueta para el valor máximo
  };
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SurveyTemplate {
  version: string; // Versión del schema (e.g., "1.0")
  title: string;
  description?: string;
  sections?: Section[]; // Opcional: agrupar preguntas en secciones
  questions: Question[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questionIds: string[]; // Referencias a IDs de preguntas
}

// Respuesta de un estudiante a una encuesta
export interface SurveyResponse {
  encuesta_id: string;
  responses: {
    [questionId: string]: any; // El valor puede ser string, number, array, etc.
  };
  completed_at: string;
}

// Tipos para el builder
export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  icon: string;
  description: string;
  hasOptions: boolean;
  hasRating: boolean;
}

export const QUESTION_TYPES: QuestionTypeConfig[] = [
  {
    type: 'text',
    label: 'Texto Corto',
    icon: 'text',
    description: 'Respuesta de texto en una línea',
    hasOptions: false,
    hasRating: false
  },
  {
    type: 'textarea',
    label: 'Texto Largo',
    icon: 'align-left',
    description: 'Respuesta de texto multilínea',
    hasOptions: false,
    hasRating: false
  },
  {
    type: 'radio',
    label: 'Opción Única',
    icon: 'check-circle',
    description: 'Selección de una opción',
    hasOptions: true,
    hasRating: false
  },
  {
    type: 'checkbox',
    label: 'Opción Múltiple',
    icon: 'check-square',
    description: 'Selección de múltiples opciones',
    hasOptions: true,
    hasRating: false
  },
  {
    type: 'select',
    label: 'Menú Desplegable',
    icon: 'chevron-down',
    description: 'Lista desplegable de opciones',
    hasOptions: true,
    hasRating: false
  },
  {
    type: 'rating',
    label: 'Calificación',
    icon: 'star',
    description: 'Escala de calificación',
    hasOptions: false,
    hasRating: true
  },
  {
    type: 'yesno',
    label: 'Sí/No',
    icon: 'toggle-left',
    description: 'Pregunta de Sí o No',
    hasOptions: false,
    hasRating: false
  },
  {
    type: 'date',
    label: 'Fecha',
    icon: 'calendar',
    description: 'Selector de fecha',
    hasOptions: false,
    hasRating: false
  },
  {
    type: 'number',
    label: 'Número',
    icon: 'hash',
    description: 'Entrada numérica',
    hasOptions: false,
    hasRating: false
  }
];
