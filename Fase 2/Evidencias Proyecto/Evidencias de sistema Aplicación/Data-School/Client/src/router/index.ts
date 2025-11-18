import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';

// Definición de rutas
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: {
      requiresGuest: true, // Solo accesible sin autenticación
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/ForgotPassword.vue'),
    meta: {
      requiresGuest: true, // Solo accesible sin autenticación
    },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/pages/ResetPassword.vue'),
    meta: {
      requiresGuest: true, // Solo accesible sin autenticación
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: {
      requiresAuth: true, // Requiere autenticación
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/Register.vue'),
    meta: {
      requiresAuth: true, // Requiere autenticación
      requiresAdmin: true // Solo administradores
    },
  },
  // RUTA TEMPORAL DE DESARROLLO - Para revisar el formulario sin autenticación
  // TODO: ELIMINAR en producción
  {
    path: '/register-preview',
    name: 'RegisterPreview',
    component: () => import('@/pages/Register.vue'),
    meta: {
      // Sin guards - acceso público para desarrollo
    },
  },

  // ==========================================
  // RUTAS DEL ADMINISTRADOR
  // ==========================================
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR']
    }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/pages/admin/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Panel de Administración'
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/pages/admin/Users.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Usuarios'
    }
  },
  {
    path: '/admin/courses',
    name: 'AdminCourses',
    component: () => import('@/pages/admin/Courses.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Cursos'
    }
  },
  {
    path: '/admin/subjects',
    name: 'AdminSubjects',
    component: () => import('@/pages/admin/Subjects.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Asignaturas'
    }
  },
  {
    path: '/admin/schedules',
    name: 'AdminSchedules',
    component: () => import('@/pages/admin/Schedules.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Horarios'
    }
  },
  {
    path: '/admin/calendar',
    name: 'AdminCalendar',
    component: () => import('@/pages/admin/Calendar.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Calendario Académico'
    }
  },
  {
    path: '/admin/workshops',
    name: 'AdminWorkshops',
    component: () => import('@/pages/admin/Workshops.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Talleres'
    }
  },
  {
    path: '/admin/events',
    name: 'AdminEvents',
    component: () => import('@/pages/admin/Events.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Eventos'
    }
  },
  {
    path: '/admin/surveys',
    name: 'AdminSurveys',
    component: () => import('@/pages/admin/Surveys.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Encuestas'
    }
  },
  {
    path: '/admin/teachers',
    name: 'AdminTeachers',
    component: () => import('@/pages/admin/Teachers.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Profesores'
    }
  },
  {
    path: '/admin/students',
    name: 'AdminStudents',
    component: () => import('@/pages/admin/Students.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Estudiantes'
    }
  },
    {
    path: '/admin/administrativos',
    name: 'AdminAdministrativos',
    component: () => import('@/pages/admin/Adminis.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Gestión de Administradores'
    }
  },
  {
    path: '/admin/analytics',
    name: 'AdminAnalytics',
    component: () => import('@/pages/admin/Analytics.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Dashboards Analíticos'
    }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('@/pages/admin/Reports.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Reportes'
    }
  },
  {
    path: '/admin/config',
    name: 'AdminSchoolConfig',
    component: () => import('@/pages/admin/SchoolConfig.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Configuración del Colegio'
    }
  },
  {
    path: '/admin/kpis',
    name: 'AdminKPIs',
    component: () => import('@/pages/admin/KPIs.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'KPIs'
    }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('@/pages/admin/Settings.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Configuración'
    }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('@/pages/admin/Profile.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMINISTRADOR'],
      title: 'Mi Perfil'
    }
  },

  // ==========================================
  // RUTAS DEL PROFESOR (accesibles también para ADMINISTRADOR)
  // ==========================================
  {
    path: '/teacher',
    component: () => import('@/layouts/TeacherLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['PROFESOR', 'ADMINISTRADOR']
    },
    children: [
      {
        path: '',
        redirect: '/teacher/dashboard'
      },
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('@/pages/teacher/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Panel del Profesor'
        }
      },
      {
        path: 'subjects',
        name: 'TeacherSubjects',
        component: () => import('@/pages/teacher/MySubjects.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Mis Asignaturas'
        }
      },
      {
        path: 'subjects/:id',
        name: 'TeacherSubjectDetail',
        component: () => import('@/pages/teacher/SubjectDetail.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Detalle de Asignatura'
        }
      },
      {
        path: 'mi-curso-jefe',
        name: 'TeacherMyCursoJefe',
        component: () => import('@/pages/teacher/MyCursoJefe.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Mi Curso como Profesor Jefe'
        }
      },
      {
        path: 'evaluations',
        name: 'TeacherEvaluations',
        component: () => import('@/pages/teacher/Evaluations.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Gestión de Evaluaciones'
        }
      },
      {
        path: 'evaluations/new',
        name: 'TeacherEvaluationNew',
        component: () => import('@/pages/teacher/EvaluationForm.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Nueva Evaluación'
        }
      },
      {
        path: 'evaluations/:id/edit',
        name: 'TeacherEvaluationEdit',
        component: () => import('@/pages/teacher/EvaluationForm.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Editar Evaluación'
        }
      },
      {
        path: 'grades',
        name: 'TeacherGrades',
        component: () => import('@/pages/teacher/GradeEntry.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Registro de Notas'
        }
      },
      {
        path: 'attendance',
        name: 'TeacherAttendance',
        component: () => import('@/pages/teacher/Attendance.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Registro de Asistencia'
        }
      },
      {
        path: 'anotaciones',
        name: 'TeacherAnotaciones',
        component: () => import('@/pages/teacher/Anotaciones.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Anotaciones'
        }
      },
      {
        path: 'students/:id',
        name: 'TeacherStudentProfile',
        component: () => import('@/pages/teacher/StudentProfile.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Perfil del Estudiante'
        }
      },
      {
        path: 'schedule',
        name: 'TeacherSchedule',
        component: () => import('@/pages/teacher/WeeklySchedule.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Mi Horario'
        }
      },
      {
        path: 'calendar',
        name: 'TeacherCalendar',
        component: () => import('@/pages/teacher/Schedule.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Calendario'
        }
      },
      {
        path: 'reports/attendance',
        name: 'TeacherAttendanceReport',
        component: () => import('@/pages/teacher/AttendanceReport.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Reporte de Asistencia'
        }
      },
      {
        path: 'reports/grades',
        name: 'TeacherGradesReport',
        component: () => import('@/pages/teacher/AttendanceReport.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Reporte de Notas'
        }
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('@/pages/teacher/Profile.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Mi Perfil'
        }
      },
      {
        path: 'settings',
        name: 'TeacherSettings',
        component: () => import('@/pages/teacher/Profile.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['PROFESOR', 'ADMINISTRADOR'],
          title: 'Configuración'
        }
      }
    ]
  },

  // ==========================================
  // RUTAS DEL ESTUDIANTE/APODERADO
  // ==========================================
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR']
    },
    children: [
      {
        path: '',
        redirect: '/student/dashboard'
      },
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('@/pages/student/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Mi Panel'
        }
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: () => import('@/pages/student/Grades.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Mis Notas'
        }
      },
      {
        path: 'attendance',
        name: 'StudentAttendance',
        component: () => import('@/pages/student/Attendance.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Mi Asistencia'
        }
      },
      {
        path: 'schedule',
        name: 'StudentSchedule',
        component: () => import('@/pages/student/Schedule.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Mi Horario'
        }
      },
      {
        path: 'notifications',
        name: 'StudentNotifications',
        component: () => import('@/pages/student/Notifications.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Notificaciones'
        }
      },
      {
        path: 'events',
        name: 'StudentEvents',
        component: () => import('@/pages/student/Events.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Eventos'
        }
      },
      {
        path: 'calendar',
        name: 'StudentCalendar',
        component: () => import('@/pages/student/Calendar.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Calendario'
        }
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('@/pages/student/Profile.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Mi Perfil'
        }
      },
      {
        path: 'settings',
        name: 'StudentSettings',
        component: () => import('@/pages/student/Settings.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['ESTUDIANTE_APODERADO', 'ADMINISTRADOR'],
          title: 'Configuración'
        }
      }
    ]
  },

  // Ruta 404 - cualquier ruta no definida redirige a login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

// Crear instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Navigation Guard global
 * Se ejecuta antes de cada navegación para verificar autenticación y permisos
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Restaurar sesión desde localStorage si no está cargada
  if (!authStore.isAuthenticated) {

    authStore.restoreSession();

  }

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  // Verificar rol específico (puede ser string o array)
  if (to.meta.requiresRole) {
    const requiredRoles = Array.isArray(to.meta.requiresRole)
      ? to.meta.requiresRole
      : [to.meta.requiresRole];

    const userRole = authStore.userRole;

    if (!requiredRoles.includes(userRole as string)) {

      // Redirigir al dashboard correcto según rol
      if (userRole === 'ESTUDIANTE_APODERADO') {
        next('/student/dashboard');
      } else if (userRole === 'ADMINISTRADOR') {
        next('/admin/dashboard');
      } else if (userRole === 'PROFESOR') {
        next('/teacher/dashboard');
      } else if (userRole === 'ADMINISTRATIVO') {
        next('/administrativo/dashboard');
      } else if (userRole === 'DIRECTOR') {
        next('/director/dashboard');
      } else {
        next('/dashboard');
      }
      return;
    }
  }

  // Rutas solo para administradores (backward compatibility)
  if (to.meta.requiresAdmin && !authStore.isAdmin) {

    next('/dashboard');
    return;
  }

  // Rutas solo para invitados (si está autenticado, redirigir a dashboard correspondiente)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('ℹ️ Usuario ya autenticado en ruta de invitado, redirigiendo a dashboard');
    const userRole = authStore.userRole;
    if (userRole === 'ESTUDIANTE_APODERADO') {
      next('/student/dashboard');
    } else if (userRole === 'ADMINISTRADOR') {
      next('/admin/dashboard');
    } else if (userRole === 'PROFESOR') {
      next('/teacher/dashboard');
    } else if (userRole === 'ADMINISTRATIVO') {
      next('/administrativo/dashboard');
    } else if (userRole === 'DIRECTOR') {
      next('/director/dashboard');
    } else {
      next('/dashboard');
    }
    return;
  }

  next();
});

export default router;
