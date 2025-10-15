import type { Database } from '@/types/supabase'

export type UserRole = Database['public']['Enums']['user_role_enum']

// Constantes de roles
export const ROLES = {
  ESTUDIANTE_APODERADO: 'ESTUDIANTE_APODERADO' as UserRole,
  PROFESOR: 'PROFESOR' as UserRole,
  ADMINISTRATIVO: 'ADMINISTRATIVO' as UserRole,
  DIRECTOR: 'DIRECTOR' as UserRole,
  ADMINISTRADOR: 'ADMINISTRADOR' as UserRole, 
} as const

// Jerarquía de permisos (de menor a mayor)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ESTUDIANTE_APODERADO: 1,
  DIRECTOR: 2,
  PROFESOR: 3,
  ADMINISTRATIVO: 4,
  ADMINISTRADOR: 5, 
}

// Helper para verificar si un rol tiene permisos suficientes
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Helper para verificar si un usuario tiene uno de los roles permitidos
export const hasAnyRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole)
}
