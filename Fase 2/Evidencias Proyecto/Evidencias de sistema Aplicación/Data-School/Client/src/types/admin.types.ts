/**
 * admin.types.ts
 * Tipos TypeScript para el dashboard y funcionalidades del administrador
 *
 * Incluye interfaces para:
 * - Estadísticas del dashboard
 * - Actividad reciente
 * - Alertas del sistema
 * - Resumen de cursos
 * - Estado del store
 */

// Estadísticas principales del dashboard
export interface DashboardStats {
  total_usuarios: number;
  total_estudiantes: number;
  total_profesores: number;
  total_cursos: number;
  total_asignaturas: number;
  estudiantes_activos: number;
  asistencia_promedio: number;
  promedio_general_colegio: number;
  alertas_pendientes: number;
}

// Estadísticas rápidas para accesos directos
export interface QuickStats {
  usuarios_total: number;
  usuarios_nuevos_mes: number;
  cursos_total: number;
  asignaturas_total: number;
  talleres_activos: number;
  eventos_proximos: number;
}

// Actividad reciente en el sistema
export interface RecentActivity {
  id: number;
  tipo: 'usuario_creado' | 'usuario_modificado' | 'usuario_eliminado' |
        'curso_creado' | 'curso_modificado' | 'asignatura_creada' |
        'evento_creado' | 'sistema';
  descripcion: string;
  usuario: string;
  fecha: string;
}

// Alertas del sistema con prioridades
export interface SystemAlert {
  alerta_id: number;
  tipo_alerta: 'asistencia_baja' | 'rendimiento_bajo' |
               'riesgo_academico' | 'administrativo' | 'sistema';
  titulo: string;
  mensaje: string;
  prioridad: 1 | 2 | 3 | 4 | 5; // 1-5, siendo 5 crítica
  fecha_creacion: string;
  estado: 'PENDIENTE' | 'RESUELTA' | 'IGNORADA';
}

// Resumen de un curso
export interface CourseSummary {
  curso_id: string;
  nombre: string;
  nivel: string;
  total_estudiantes: number;
  capacidad_maxima: number;
  promedio_curso: number;
  asistencia_promedio: number;
}

// Acción rápida del dashboard
export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string; // Clase de Tailwind: bg-blue-100, bg-green-100, etc.
  iconColor: string; // Clase de Tailwind para el color del ícono
}

// Estado completo del store de administrador
export interface AdminState {
  dashboardStats: DashboardStats | null;
  recentActivity: RecentActivity[];
  systemAlerts: SystemAlert[];
  courseSummary: CourseSummary[];
  quickStats: QuickStats | null;
  loading: boolean;
  error: string | null;
}

// Configuración de tipo de actividad
export interface ActivityTypeConfig {
  icon: string;
  color: string;
  bgColor: string;
}

// Configuración de prioridad de alerta
export interface AlertPriorityConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Tipo para grupos del menú del sidebar
export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number | string | null;
}
