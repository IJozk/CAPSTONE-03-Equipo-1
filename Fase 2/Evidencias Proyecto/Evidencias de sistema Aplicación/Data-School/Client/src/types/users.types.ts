/**
 * Tipos TypeScript para CRUD de usuarios del sistema
 */

// ============= PROFESOR =============
export interface Profesor {
  profesor_id: string;
  user_id: string;
  nombre_completo: string;
  rut: string;
  especialidad?: string;
  titulo_profesional?: string;
  telefono?: string;
  fecha_contratacion?: string;
  estado_activo: boolean;
  created_at: string;
  updated_at: string;
  User?: {
    email_address: string;
    is_active: boolean;
  };
}

export interface CreateProfesorDTO {
  user_id: string;
  nombre_completo: string;
  rut?: string;
  especialidad?: string;
  titulo_profesional?: string;
  telefono?: string;
  fecha_contratacion?: string;
}

export interface UpdateProfesorDTO {
  nombre_completo?: string;
  rut?: string;
  especialidad?: string;
  titulo_profesional?: string;
  telefono?: string;
  fecha_contratacion?: string;
}

// ============= ESTUDIANTE =============
export interface Estudiante {
  estudiante_id: string;
  user_id?: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  rut?: string;
  genero?: 'M' | 'F' | 'OTRO';
  direccion?: string;
  telefono?: string;
  email?: string;
  estado_activo: boolean;
  created_at: string;
  updated_at: string;
  User?: {
    email_address: string;
    is_active: boolean;
  };
}

export interface CreateEstudianteDTO {
  user_id?: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  rut?: string;
  genero?: 'M' | 'F' | 'OTRO';
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface UpdateEstudianteDTO {
  nombre_completo?: string;
  fecha_nacimiento?: string;
  rut?: string;
  genero?: 'M' | 'F' | 'OTRO';
  direccion?: string;
  telefono?: string;
  email?: string;
}

// ============= ADMINISTRATIVO =============
export interface Administrativo {
  administrativo_id: string;
  user_id: string;
  nombre_completo: string;
  rut?: string;
  area_id: number;
  cargo?: string;
  telefono?: string;
  fecha_contratacion?: string;
  estado_activo: boolean;
  created_at: string;
  updated_at: string;
  User?: {
    email_address: string;
    is_active: boolean;
  };
  Area?: {
    nombre_area: string;
  };
}

export interface CreateAdministrativoDTO {
  user_id: string;
  nombre_completo: string;
  rut?: string;
  area_id: number;
  cargo?: string;
  telefono?: string;
  fecha_contratacion?: string;
}

export interface UpdateAdministrativoDTO {
  nombre_completo?: string;
  rut?: string;
  area_id?: number;
  cargo?: string;
  telefono?: string;
  fecha_contratacion?: string;
}

// ============= TUTOR =============
export interface Tutor {
  tutor_id: string;
  user_id?: string;
  nombre_completo: string;
  rut?: string;
  telefono?: string;
  telefono_emergencia?: string;
  direccion?: string;
  ocupacion?: string;
  email?: string;
  estado_activo: boolean;
  created_at: string;
  updated_at: string;
  User?: {
    email_address: string;
    is_active: boolean;
  };
}

export interface CreateTutorDTO {
  user_id?: string;
  nombre_completo: string;
  rut?: string;
  telefono?: string;
  telefono_emergencia?: string;
  direccion?: string;
  ocupacion?: string;
  email?: string;
}

export interface UpdateTutorDTO {
  nombre_completo?: string;
  rut?: string;
  telefono?: string;
  telefono_emergencia?: string;
  direccion?: string;
  ocupacion?: string;
  email?: string;
}

export interface LinkUserDTO {
  user_id: string;
}

// ============= QUERY PARAMS =============
export interface UserQueryParams {
  incluir_inactivos?: boolean;
  con_cuenta?: boolean; // Solo para tutores
}

// ============= RESPONSES =============
export interface MessageResponse {
  message: string;
}
