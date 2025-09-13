import { Student, Grade, Attendance, Notification, Survey, Class, Annotation, SurveyResponse } from '../types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Pedro González',
    rut: '12.345.678-9',
    grade: '8°',
    section: 'A',
    guardianId: '1'
  },
  {
    id: '2',
    name: 'Sofia García',
    rut: '23.456.789-0',
    grade: '7°',
    section: 'B',
    guardianId: '1'
  },
  {
    id: '3',
    name: 'Diego Martínez',
    rut: '34.567.890-1',
    grade: '8°',
    section: 'A',
    guardianId: '4'
  }
];

export const mockGrades: Grade[] = [
  {
    id: '1',
    studentId: '1',
    subject: 'Matemáticas',
    value: 6.5,
    maxValue: 7.0,
    type: 'prueba',
    date: '2024-01-15',
    teacherId: '2'
  },
  {
    id: '2',
    studentId: '1',
    subject: 'Lenguaje',
    value: 5.8,
    maxValue: 7.0,
    type: 'tarea',
    date: '2024-01-12',
    teacherId: '2'
  },
  {
    id: '3',
    studentId: '2',
    subject: 'Ciencias',
    value: 6.8,
    maxValue: 7.0,
    type: 'examen',
    date: '2024-01-10',
    teacherId: '2'
  }
];

export const mockAttendance: Attendance[] = [
  {
    id: '1',
    studentId: '1',
    date: '2024-01-15',
    present: true,
    classId: '1',
    teacherId: '2'
  },
  {
    id: '2',
    studentId: '1',
    date: '2024-01-14',
    present: false,
    classId: '1',
    teacherId: '2'
  },
  {
    id: '3',
    studentId: '2',
    date: '2024-01-15',
    present: true,
    classId: '2',
    teacherId: '2'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'asistencia',
    title: 'Ausencia registrada',
    message: 'Pedro González no asistió a clases hoy (15 enero)',
    date: '2024-01-15T10:30:00Z',
    read: false,
    studentId: '1'
  },
  {
    id: '2',
    userId: '1',
    type: 'nota',
    title: 'Nueva calificación',
    message: 'Pedro González recibió nota 6.5 en Matemáticas',
    date: '2024-01-15T14:20:00Z',
    read: false,
    studentId: '1'
  }
];

export const mockClasses: Class[] = [
  {
    id: '1',
    subject: 'Matemáticas',
    teacherId: '2',
    grade: '8°',
    section: 'A',
    schedule: 'Lunes 8:00-9:30'
  },
  {
    id: '2',
    subject: 'Lenguaje',
    teacherId: '2',
    grade: '7°',
    section: 'B',
    schedule: 'Martes 10:00-11:30'
  }
];

export const mockAnnotations: Annotation[] = [
  {
    id: '1',
    studentId: '1',
    teacherId: '2',
    type: 'positiva',
    content: 'Excelente participación en clase',
    date: '2024-01-15'
  },
  {
    id: '2',
    studentId: '1',
    teacherId: '2',
    type: 'observacion',
    content: 'Llegó tarde a clases',
    date: '2024-01-14'
  }
];

export const socioeconomicSurvey: Survey = {
  id: 'socio-1',
  title: 'Encuesta Socioeconómica',
  type: 'socioeconomica',
  mandatory: true,
  questions: [
    {
      id: 'q1',
      question: '¿Cuál es el nivel educacional más alto alcanzado por el apoderado?',
      type: 'multiple_choice',
      options: ['Educación Básica', 'Educación Media', 'Técnico', 'Universitario', 'Postgrado'],
      required: true
    },
    {
      id: 'q2',
      question: '¿Cuál es el ingreso familiar mensual aproximado?',
      type: 'multiple_choice',
      options: ['Menos de $500.000', '$500.000 - $1.000.000', '$1.000.000 - $2.000.000', 'Más de $2.000.000'],
      required: true
    },
    {
      id: 'q3',
      question: '¿Con cuántas personas vive el estudiante?',
      type: 'multiple_choice',
      options: ['1-2 personas', '3-4 personas', '5-6 personas', 'Más de 6 personas'],
      required: true
    },
    {
      id: 'q4',
      question: '¿El estudiante tiene acceso a internet en casa?',
      type: 'multiple_choice',
      options: ['Sí, siempre', 'Sí, ocasionalmente', 'No'],
      required: true
    }
  ]
};

export const postEvaluationSurvey: Survey = {
  id: 'eval-1',
  title: 'Encuesta Post-Evaluación',
  type: 'evaluacion',
  mandatory: false,
  questions: [
    {
      id: 'q1',
      question: '¿Cómo califica la dificultad de la evaluación?',
      type: 'multiple_choice',
      options: ['Muy fácil', 'Fácil', 'Adecuada', 'Difícil', 'Muy difícil'],
      required: true
    },
    {
      id: 'q2',
      question: '¿Su hijo/a se preparó adecuadamente para la evaluación?',
      type: 'multiple_choice',
      options: ['Sí, muy bien', 'Sí, adecuadamente', 'Parcialmente', 'No'],
      required: true
    },
    {
      id: 'q3',
      question: '¿Necesita su hijo/a apoyo adicional en esta materia?',
      type: 'multiple_choice',
      options: ['Sí, mucho apoyo', 'Sí, algo de apoyo', 'No necesita apoyo'],
      required: true
    }
  ]
};

export const mockSurveyResponses: SurveyResponse[] = [
  {
    id: '1',
    surveyId: 'socio-1',
    userId: '1',
    responses: {
      'q1': 'Universitario',
      'q2': '$1.000.000 - $2.000.000',
      'q3': '3-4 personas',
      'q4': 'Sí, siempre'
    },
    completedAt: '2024-01-10T10:00:00Z'
  }
];