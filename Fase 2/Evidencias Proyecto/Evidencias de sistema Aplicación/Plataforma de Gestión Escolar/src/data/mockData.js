// Mock users
export const mockUsers = [
  {
    id: '1',
    email: 'coordinador@colegio.cl',
    password: 'admin123',
    role: 'coordinador',
    name: 'María González',
    firstLogin: false
  },
  {
    id: '2',
    email: 'docente@colegio.cl',
    password: 'docente123',
    role: 'docente',
    name: 'Carlos Rodríguez',
    firstLogin: false
  },
  {
    id: '3',
    email: 'apoderado@colegio.cl',
    password: 'apoderado123',
    role: 'apoderado',
    name: 'Ana Martínez',
    firstLogin: true
  }
]

// Mock students
export const mockStudents = [
  {
    id: '1',
    name: 'Sofía Martínez',
    course: '7° Básico A',
    parentId: '3',
    grades: [
      { subject: 'Matemáticas', grade: 6.5, date: '2024-03-15' },
      { subject: 'Lenguaje', grade: 7.0, date: '2024-03-14' },
      { subject: 'Ciencias', grade: 6.8, date: '2024-03-13' }
    ],
    attendance: [
      { date: '2024-03-18', status: 'presente' },
      { date: '2024-03-17', status: 'presente' },
      { date: '2024-03-16', status: 'ausente' },
      { date: '2024-03-15', status: 'presente' }
    ]
  },
  {
    id: '2',
    name: 'Diego Rodríguez',
    course: '8° Básico B',
    parentId: '3',
    grades: [
      { subject: 'Matemáticas', grade: 7.2, date: '2024-03-15' },
      { subject: 'Lenguaje', grade: 6.9, date: '2024-03-14' },
      { subject: 'Historia', grade: 7.5, date: '2024-03-13' }
    ],
    attendance: [
      { date: '2024-03-18', status: 'presente' },
      { date: '2024-03-17', status: 'presente' },
      { date: '2024-03-16', status: 'presente' },
      { date: '2024-03-15', status: 'tarde' }
    ]
  }
]

// Mock notifications
export const mockNotifications = [
  {
    id: '1',
    userId: '3',
    title: 'Ausencia registrada',
    message: 'Su hijo/a Sofía Martínez no asistió a clases el día de hoy.',
    type: 'attendance',
    read: false,
    timestamp: '2024-03-16T09:00:00Z'
  },
  {
    id: '2',
    userId: '3',
    title: 'Nueva calificación',
    message: 'Se ha registrado una nueva calificación en Matemáticas para Sofía Martínez.',
    type: 'grade',
    read: false,
    timestamp: '2024-03-15T14:30:00Z'
  },
  {
    id: '3',
    userId: '2',
    title: 'Reunión programada',
    message: 'Se ha programado una reunión con apoderados para el día 25 de marzo.',
    type: 'meeting',
    read: true,
    timestamp: '2024-03-14T10:00:00Z'
  },
  {
    id: '4',
    userId: '1',
    title: 'Reporte mensual disponible',
    message: 'El reporte de asistencia mensual está listo para revisión.',
    type: 'report',
    read: false,
    timestamp: '2024-03-13T08:00:00Z'
  }
]

// Mock courses
export const mockCourses = [
  {
    id: '1',
    name: '7° Básico A',
    students: 28,
    teacher: 'Carlos Rodríguez',
    teacherId: '2'
  },
  {
    id: '2',
    name: '8° Básico B',
    students: 25,
    teacher: 'Ana López',
    teacherId: '4'
  },
  {
    id: '3',
    name: '1° Medio A',
    students: 30,
    teacher: 'Pedro Sánchez',
    teacherId: '5'
  }
]

// Socioeconomic survey
export const socioeconomicSurvey = {
  id: 'socioeconomic-2024',
  title: 'Encuesta Socioeconómica',
  description: 'Esta encuesta nos ayuda a conocer mejor la situación de nuestros estudiantes.',
  questions: [
    {
      id: 'income',
      text: '¿Cuál es el ingreso familiar mensual aproximado?',
      type: 'multiple-choice',
      options: [
        'Menos de $500.000',
        'Entre $500.000 y $1.000.000',
        'Entre $1.000.000 y $2.000.000',
        'Más de $2.000.000'
      ]
    },
    {
      id: 'education',
      text: '¿Cuál es el nivel educacional más alto alcanzado por los padres?',
      type: 'multiple-choice',
      options: [
        'Educación básica',
        'Educación media',
        'Educación técnica',
        'Educación universitaria'
      ]
    },
    {
      id: 'housing',
      text: '¿Cuál es la situación habitacional de la familia?',
      type: 'multiple-choice',
      options: [
        'Casa propia',
        'Casa arrendada',
        'Casa familiar',
        'Otra situación'
      ]
    }
  ]
}

// Mock survey responses
export const mockSurveyResponses = [
  {
    id: '1',
    surveyId: 'socioeconomic-2024',
    userId: '2',
    responses: {
      income: 'Entre $1.000.000 y $2.000.000',
      education: 'Educación universitaria',
      housing: 'Casa propia'
    },
    timestamp: '2024-03-01T10:00:00Z'
  }
]

// Mock post-evaluation surveys
export const mockPostEvaluationSurveys = [
  {
    id: 'eval-math-march-2024',
    title: 'Evaluación de Matemáticas - Marzo 2024',
    description: 'Cuéntanos tu experiencia con la evaluación de matemáticas.',
    questions: [
      {
        id: 'difficulty',
        text: '¿Cómo calificarías la dificultad de la evaluación?',
        type: 'multiple-choice',
        options: ['Muy fácil', 'Fácil', 'Normal', 'Difícil', 'Muy difícil']
      },
      {
        id: 'time',
        text: '¿El tiempo asignado fue suficiente?',
        type: 'multiple-choice',
        options: ['Sí, sobró tiempo', 'Sí, fue justo', 'No, faltó poco', 'No, faltó mucho']
      },
      {
        id: 'preparation',
        text: '¿Te sentiste preparado/a para la evaluación?',
        type: 'multiple-choice',
        options: ['Muy preparado/a', 'Preparado/a', 'Poco preparado/a', 'Nada preparado/a']
      }
    ]
  }
]

// Dashboard stats for different roles
export const mockDashboardStats = {
  coordinador: {
    totalStudents: 156,
    totalTeachers: 12,
    averageAttendance: 92,
    averageGrades: 6.8,
    recentAlerts: 3
  },
  docente: {
    myStudents: 28,
    pendingGrades: 5,
    averageGrades: 6.9,
    todayAttendance: 26
  },
  apoderado: {
    children: 2,
    unreadNotifications: 2,
    upcomingEvents: 1,
    lastGrades: 3
  }
}