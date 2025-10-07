import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';

/**
 * Guard para rutas protegidas (requieren autenticación)
 * Redirige a /login si el usuario no está autenticado
 */
export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
};

/**
 * Guard para rutas de invitados (solo accesibles sin autenticación)
 * Redirige a /dashboard si el usuario ya está autenticado
 */
export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
};

/**
 * Guard para rutas que requieren un rol específico
 * @param allowedRoles - Array de roles permitidos
 */
export const roleGuard = (allowedRoles: string[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      next('/login');
      return;
    }

    const userRole = authStore.userRole;
    if (userRole && allowedRoles.includes(userRole)) {
      next();
    } else {
      // Redirigir a dashboard si no tiene el rol adecuado
      next('/dashboard');
    }
  };
};
