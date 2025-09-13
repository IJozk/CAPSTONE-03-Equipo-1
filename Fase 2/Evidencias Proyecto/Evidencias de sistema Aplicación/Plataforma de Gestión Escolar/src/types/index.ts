export type UserRole = 'apoderado' | 'docente' | 'coordinador';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firstLogin?: boolean;
}

export interface Student {
  id: string;
  name: string;
  rut: string;
  grade: string;
  section: string;
  guardianId: string;
  avatar?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  present: boolean;
  classId: string;
  teacherId: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  value: number;
  maxValue: number;
  type: 'prueba' | 'tarea' | 'examen' | 'trabajo';
  date: string;
  teacherId: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'asistencia' | 'nota' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
  studentId?: string;
}

export interface Survey {
  id: string;
  title: string;
  type: 'socioeconomica' | 'evaluacion';
  questions: SurveyQuestion[];
  mandatory: boolean;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  studentId?: string;
  responses: Record<string, string>;
  completedAt: string;
}

export interface Class {
  id: string;
  subject: string;
  teacherId: string;
  grade: string;
  section: string;
  schedule: string;
}

export interface Annotation {
  id: string;
  studentId: string;
  teacherId: string;
  type: 'positiva' | 'negativa' | 'observacion';
  content: string;
  date: string;
}