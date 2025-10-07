/**
 * Tipos TypeScript para el módulo de Anuncios
 * Define las interfaces para anuncios y noticias del colegio
 */

// Anuncio individual
export interface Announcement {
  id: number;
  titulo: string;
  fecha: string; // ISO 8601 format
  tipo: 'reunion' | 'inscripcion' | 'celebracion' | 'cultural';
  icono?: string;
  read?: boolean; // Indica si fue leído por el usuario
}

// Estado del store de anuncios
export interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

// Configuración de iconos por tipo de anuncio
export interface AnnouncementIconConfig {
  icon: string;
  color: string;
  bg: string;
}
