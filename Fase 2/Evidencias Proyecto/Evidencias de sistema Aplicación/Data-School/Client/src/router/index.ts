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

  // Rutas solo para administradores
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard'); // Redirigir a dashboard si no es admin
    return;
  }

  // Rutas solo para invitados (si está autenticado, redirigir a dashboard)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Permitir navegación
  next();
});

export default router;
