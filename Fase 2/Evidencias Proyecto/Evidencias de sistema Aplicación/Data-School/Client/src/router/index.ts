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
      } else if (userRole === 'DIRECTOR' || userRole === 'UTP') {
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
    const userRole = authStore.userRole;
    if (userRole === 'ESTUDIANTE_APODERADO') {
      next('/student/dashboard');
    } else if (userRole === 'ADMINISTRADOR') {
      next('/admin/dashboard');
    } else if (userRole === 'PROFESOR') {
      next('/teacher/dashboard');
    } else if (userRole === 'DIRECTOR' || userRole === 'UTP') {
      next('/director/dashboard');
    } else {
      next('/dashboard');
    }
    return;
  }

  // Permitir navegación
  next();
});

export default router;
