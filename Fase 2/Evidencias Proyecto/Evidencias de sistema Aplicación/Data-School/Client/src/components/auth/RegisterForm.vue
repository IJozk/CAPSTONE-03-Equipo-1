<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- Rol (primero) -->
    <div>
      <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
        Rol *
      </label>
      <select
        id="role"
        v-model="formData.role"
        :class="inputClass('role')"
        @blur="validateField('role')"
        @change="onRoleChange"
      >
        <option value="">Seleccionar rol</option>
        <option v-for="roleOption in filteredRoleOptions" :key="roleOption.value" :value="roleOption.value">
          {{ roleOption.label }}
        </option>
      </select>
      <p v-if="formData.role && selectedRoleDescription" class="mt-1 text-xs text-gray-500">
        {{ selectedRoleDescription }}
      </p>
      <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
        Correo Electrónico *
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        autocomplete="email"
        :class="inputClass('email')"
        placeholder="usuario@ejemplo.com"
        @blur="validateField('email')"
        @input="clearFieldError('email')"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
    </div>

    <!-- Nombre Completo -->
    <div>
      <label for="nombre_completo" class="block text-sm font-medium text-gray-700 mb-2">
        Nombre Completo *
      </label>
      <input
        id="nombre_completo"
        v-model="formData.nombre_completo"
        type="text"
        autocomplete="name"
        :class="inputClass('nombre_completo')"
        placeholder="Juan Pérez González"
        @blur="validateField('nombre_completo')"
        @input="clearFieldError('nombre_completo')"
      />
      <p v-if="errors.nombre_completo" class="mt-1 text-sm text-red-600">{{ errors.nombre_completo }}</p>
    </div>

    <!-- RUT -->
    <div>
      <label for="rut" class="block text-sm font-medium text-gray-700 mb-2">
        RUT *
      </label>
      <input
        id="rut"
        v-model="formData.rut"
        type="text"
        :class="inputClass('rut')"
        placeholder="12.345.678-9"
        maxlength="12"
        @input="handleRutInput"
        @blur="validateField('rut')"
      />
      <p v-if="errors.rut" class="mt-1 text-sm text-red-600">{{ errors.rut }}</p>
    </div>

    <!-- Contraseña -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
        Contraseña *
      </label>
      <div class="relative">
        <input
          id="password"
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :class="inputClass('password')"
          placeholder="••••••••"
          @blur="validateField('password')"
          @input="handlePasswordInput"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabindex="-1"
        >
          <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>

      <!-- Indicador de fortaleza -->
      <div v-if="formData.password" class="mt-2">
        <div class="flex gap-1">
          <div
            v-for="i in 4"
            :key="i"
            :class="['h-1 flex-1 rounded-full transition-colors', getStrengthColor(i)]"
          ></div>
        </div>
        <p :class="['text-xs mt-1', getStrengthTextColor()]">{{ getStrengthText() }}</p>
      </div>
      <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
    </div>

    <!-- Confirmar Contraseña -->
    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
        Confirmar Contraseña *
      </label>
      <div class="relative">
        <input
          id="confirmPassword"
          v-model="formData.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :class="inputClass('confirmPassword')"
          placeholder="••••••••"
          @blur="validateField('confirmPassword')"
          @input="clearFieldError('confirmPassword')"
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabindex="-1"
        >
          <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
      <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
    </div>

    <!-- Campos dinámicos según rol -->
    <!-- Profesor -->
    <div v-if="formData.role === UserRole.PROFESOR" class="space-y-4">
      <div>
        <label for="titulo_profesional" class="block text-sm font-medium text-gray-700 mb-2">Título Profesional *</label>
        <input id="titulo_profesional" v-model="formData.titulo_profesional" type="text" :class="inputClass('titulo_profesional')" @blur="validateField('titulo_profesional')" />
        <p v-if="errors.titulo_profesional" class="mt-1 text-sm text-red-600">{{ errors.titulo_profesional }}</p>
      </div>

      <div>
        <label for="especialidad" class="block text-sm font-medium text-gray-700 mb-2">Especialidad *</label>
        <input id="especialidad" v-model="formData.especialidad" type="text" :class="inputClass('especialidad')" @blur="validateField('especialidad')" />
        <p v-if="errors.especialidad" class="mt-1 text-sm text-red-600">{{ errors.especialidad }}</p>
      </div>

      <div>
        <label for="fecha_contratacion" class="block text-sm font-medium text-gray-700 mb-2">Fecha de Contratación *</label>
        <input id="fecha_contratacion" v-model="formData.fecha_contratacion" type="date" :class="inputClass('fecha_contratacion')" @blur="validateField('fecha_contratacion')" />
        <p v-if="errors.fecha_contratacion" class="mt-1 text-sm text-red-600">{{ errors.fecha_contratacion }}</p>
      </div>
    </div>

    <!-- Estudiante / Apoderado -->
    <div v-if="formData.role === UserRole.ESTUDIANTE_APODERADO" class="space-y-4">
      <div>
        <label for="fecha_nacimiento" class="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento *</label>
        <input id="fecha_nacimiento" v-model="formData.fecha_nacimiento" type="date" :class="inputClass('fecha_nacimiento')" @blur="validateField('fecha_nacimiento')" />
        <p v-if="errors.fecha_nacimiento" class="mt-1 text-sm text-red-600">{{ errors.fecha_nacimiento }}</p>
      </div>

      <div>
        <label for="direccion" class="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
        <input id="direccion" v-model="formData.direccion" type="text" :class="inputClass('direccion')" @blur="validateField('direccion')" />
        <p v-if="errors.direccion" class="mt-1 text-sm text-red-600">{{ errors.direccion }}</p>
      </div>

      <div>
        <label for="genero" class="block text-sm font-medium text-gray-700 mb-2">Género *</label>
        <select id="genero" v-model="formData.genero" :class="inputClass('genero')" @blur="validateField('genero')">
          <option value="">Seleccionar</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro</option>
        </select>
        <p v-if="errors.genero" class="mt-1 text-sm text-red-600">{{ errors.genero }}</p>
      </div>
    </div>

    <!-- Admin / Administrativo (comparten campos) -->
    <div v-if="formData.role === UserRole.ADMINISTRADOR || formData.role === UserRole.ADMINISTRATIVO" class="space-y-4">
      <div>
        <label for="cargo" class="block text-sm font-medium text-gray-700 mb-2">Cargo *</label>
        <input id="cargo" v-model="formData.cargo" type="text" :class="inputClass('cargo')" @blur="validateField('cargo')" />
        <p v-if="errors.cargo" class="mt-1 text-sm text-red-600">{{ errors.cargo }}</p>
      </div>

      <div>
        <label for="area_id" class="block text-sm font-medium text-gray-700 mb-2">Área ID *</label>
        <input id="area_id" v-model="formData.area_id" type="text" :class="inputClass('area_id')" @blur="validateField('area_id')" placeholder="UUID del área" />
        <p v-if="errors.area_id" class="mt-1 text-sm text-red-600">{{ errors.area_id }}</p>
      </div>

      <div>
        <label for="fecha_contratacion_admin" class="block text-sm font-medium text-gray-700 mb-2">Fecha de Contratación *</label>
        <input id="fecha_contratacion_admin" v-model="formData.fecha_contratacion" type="date" :class="inputClass('fecha_contratacion')" @blur="validateField('fecha_contratacion')" />
        <p v-if="errors.fecha_contratacion" class="mt-1 text-sm text-red-600">{{ errors.fecha_contratacion }}</p>
      </div>
    </div>

    <!-- Teléfono (opcional) -->
    <div>
      <label for="telefono" class="block text-sm font-medium text-gray-700 mb-2">
        Teléfono (opcional)
      </label>
      <input
        id="telefono"
        v-model="formData.telefono"
        type="tel"
        :class="inputClass('telefono')"
        placeholder="+56912345678"
        @blur="validateField('telefono')"
        @input="clearFieldError('telefono')"
      />
      <p v-if="errors.telefono" class="mt-1 text-sm text-red-600">{{ errors.telefono }}</p>
    </div>

    <!-- Error general -->
    <div v-if="registerError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-red-800">{{ registerError }}</p>
      </div>
    </div>

    <!-- Success message -->
    <div v-if="registerSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-green-800">Usuario registrado exitosamente</p>
          <p class="text-sm text-green-700 mt-1">
            <strong>{{ authStore.registerState.registeredUser?.email }}</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex gap-3">
      <button
        type="submit"
        :disabled="isLoading || !isFormValid"
        :class="[
          'flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all',
          isLoading || !isFormValid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
        ]"
      >
        <span v-if="!isLoading">Registrar Usuario</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Registrando...
        </span>
      </button>

      <button
        v-if="registerSuccess"
        type="button"
        @click="resetForm"
        class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        Registrar Otro
      </button>
    </div>

    <!-- Link para volver -->
    <div class="text-center">
      <router-link
        to="/dashboard"
        class="text-sm text-primary-600 hover:text-primary-700 hover:underline"
      >
        ← Volver al Dashboard
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import {
  validateEmail,
  validateNombreCompleto,
  validateRUT,
  formatRUT,
  validatePasswordStrength,
  validatePasswordMatch,
  validateRole,
  validateTelefono
} from '@/utils/validators';
import type { RegisterDTO, RegisterValidationErrors, RoleOption } from '@/types/auth.types';
import { UserRole } from '@/types/auth.types';
import { useSchoolStore } from '@/store/school.store';
import { before } from 'node:test';

const authStore = useAuthStore();
const schoolStore = useSchoolStore();

// Opciones de roles con descripciones
const roleOptions: RoleOption[] = [
  {
    value: UserRole.PROFESOR,
    label: 'Profesor',
    description: 'Gestión de clases, evaluaciones, asistencia y notas'
  },
  {
    value: UserRole.ADMINISTRATIVO,
    label: 'Administrativo',
    description: 'Tareas administrativas y soporte del colegio'
  },
  {
    value: UserRole.ADMINISTRADOR,
    label: 'Admin',
    description: 'Acceso total al sistema, gestión de usuarios y configuración'
  },
  {
    value: UserRole.ESTUDIANTE_APODERADO,
    label: 'Estudiante/Apoderado',
    description: 'Visualización de notas, asistencia y comunicaciones'
  }
];

// Form data
const formData = ref<RegisterDTO>({
  email: '',
  password: '',
  confirmPassword: '',
  role: '' as UserRole,
  nombre_completo: '',
  rut: '',
  colegio_id: '',
  telefono: '',
  // campos opcionales
  titulo_profesional: undefined,
  especialidad: undefined,
  fecha_contratacion: undefined,
  fecha_nacimiento: undefined,
  direccion: undefined,
  genero: undefined,
  cargo: undefined,
  area_id: undefined
});

// UI state
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errors = ref<RegisterValidationErrors>({});
const passwordStrength = ref<'weak' | 'medium' | 'strong'>('weak');

// Computed
const isLoading = computed(() => authStore.registerState.loading);
const registerError = computed(() => authStore.registerState.error);
const registerSuccess = computed(() => authStore.registerState.success);

const isFormValid = computed(() => {
  const hasAllRequired =
    formData.value.email &&
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.nombre_completo &&
    formData.value.rut &&
    formData.value.role &&
    formData.value.colegio_id &&
    // campos específicos según rol
    (formData.value.role === UserRole.PROFESOR
      ? !!(formData.value.titulo_profesional && formData.value.especialidad && formData.value.fecha_contratacion)
      : true) &&
    (formData.value.role === UserRole.ESTUDIANTE_APODERADO
      ? !!(formData.value.fecha_nacimiento && formData.value.direccion && formData.value.genero)
      : true) &&
    (formData.value.role === UserRole.ADMINISTRADOR || formData.value.role === UserRole.ADMINISTRATIVO
      ? !!(formData.value.cargo && formData.value.area_id && formData.value.fecha_contratacion)
      : true);

  const hasNoErrors = Object.keys(errors.value).length === 0;

  return hasAllRequired && hasNoErrors;
});

function verify_data(){
  console.log(schoolStore.schoolInfo);
  console.log(formData)
}

const selectedRoleDescription = computed(() => {
  const role = roleOptions.find(r => r.value === formData.value.role);
  return role?.description || '';
});

// Clase dinámica para inputs
const inputClass = (field: keyof RegisterValidationErrors) => {
  const baseClass = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors';
  const errorClass = errors.value[field] ? 'border-red-500' : 'border-gray-300';
  return `${baseClass} ${errorClass}`;
};

// Validar campo individual
const validateField = (field: keyof RegisterDTO) => {
  switch (field) {
    case 'email': {
      const error = validateEmail(formData.value.email);
      if (error) {
        errors.value.email = error;
      } else {
        delete errors.value.email;
      }
      break;
    }
    case 'nombre_completo': {
      const error = validateNombreCompleto(formData.value.nombre_completo);
      if (error) {
        errors.value.nombre_completo = error;
      } else {
        delete errors.value.nombre_completo;
      }
      break;
    }
    case 'rut': {
      const error = validateRUT(formData.value.rut);
      if (error) {
        errors.value.rut = error;
      } else {
        delete errors.value.rut;
      }
      break;
    }
    case 'password': {
      const validation = validatePasswordStrength(formData.value.password);
      passwordStrength.value = validation.strength;
      if (!validation.isValid) {
        errors.value.password = validation.errors.join(', ');
      } else {
        delete errors.value.password;
      }
      // Re-validar confirmación si existe
      if (formData.value.confirmPassword) {
        validateField('confirmPassword');
      }
      break;
    }
    case 'confirmPassword': {
      const error = validatePasswordMatch(formData.value.password, formData.value.confirmPassword || '');
      if (error) {
        errors.value.confirmPassword = error;
      } else {
        delete errors.value.confirmPassword;
      }
      break;
    }
    case 'role': {
      const error = validateRole(formData.value.role);
      if (error) {
        errors.value.role = error;
      } else {
        delete errors.value.role;
      }
      break;
    }
    case 'colegio_id': {
      if (!formData.value.colegio_id || formData.value.colegio_id.trim().length === 0) {
        errors.value.colegio_id = 'El ID del colegio es requerido';
      } else {
        delete errors.value.colegio_id;
      }
      break;
    }
    case 'telefono': {
      if (formData.value.telefono) {
        const error = validateTelefono(formData.value.telefono);
        if (error) {
          errors.value.telefono = error;
        } else {
          delete errors.value.telefono;
        }
      } else {
        delete errors.value.telefono;
      }
      break;
    }
    case 'titulo_profesional': {
      if (formData.value.role === UserRole.PROFESOR) {
        if (!formData.value.titulo_profesional) errors.value.titulo_profesional = 'El título profesional es requerido';
        else delete errors.value.titulo_profesional;
      }
      break;
    }
    case 'especialidad': {
      if (formData.value.role === UserRole.PROFESOR) {
        if (!formData.value.especialidad) errors.value.especialidad = 'La especialidad es requerida';
        else delete errors.value.especialidad;
      }
      break;
    }
    case 'fecha_contratacion': {
      if (formData.value.role === UserRole.PROFESOR || formData.value.role === UserRole.ADMINISTRADOR || formData.value.role === UserRole.ADMINISTRATIVO) {
        if (!formData.value.fecha_contratacion) errors.value.fecha_contratacion = 'Fecha de contratación requerida';
        else delete errors.value.fecha_contratacion;
      }
      break;
    }
    case 'fecha_nacimiento': {
      if (formData.value.role === UserRole.ESTUDIANTE_APODERADO) {
        if (!formData.value.fecha_nacimiento) errors.value.fecha_nacimiento = 'Fecha de nacimiento requerida';
        else delete errors.value.fecha_nacimiento;
      }
      break;
    }
    case 'direccion': {
      if (formData.value.role === UserRole.ESTUDIANTE_APODERADO) {
        if (!formData.value.direccion) errors.value.direccion = 'Dirección requerida';
        else delete errors.value.direccion;
      }
      break;
    }
    case 'genero': {
      if (formData.value.role === UserRole.ESTUDIANTE_APODERADO) {
        if (!formData.value.genero) errors.value.genero = 'Género requerido';
        else delete errors.value.genero;
      }
      break;
    }
    case 'cargo': {
      if (formData.value.role === UserRole.ADMINISTRADOR || formData.value.role === UserRole.ADMINISTRATIVO) {
        if (!formData.value.cargo) errors.value.cargo = 'Cargo requerido';
        else delete errors.value.cargo;
      }
      break;
    }
    case 'area_id': {
      if (formData.value.role === UserRole.ADMINISTRADOR || formData.value.role === UserRole.ADMINISTRATIVO) {
        if (!formData.value.area_id) errors.value.area_id = 'Área requerida';
        else delete errors.value.area_id;
      }
      break;
    }
  }
};

// Limpiar error de campo
const clearFieldError = (field: keyof RegisterValidationErrors) => {
  delete errors.value[field];
  authStore.clearRegisterState();
  verify_data();
};

// Manejar input de RUT (formateo automático)
const handleRutInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const formatted = formatRUT(input.value);
  formData.value.rut = formatted;
  clearFieldError('rut');
};

// Cuando cambia el rol, limpiar errores y algunos campos no relevantes
const onRoleChange = () => {
  // limpiar errores de campos específicos
  delete errors.value.titulo_profesional;
  delete errors.value.especialidad;
  delete errors.value.fecha_contratacion;
  delete errors.value.fecha_nacimiento;
  delete errors.value.direccion;
  delete errors.value.genero;
  delete errors.value.cargo;
  delete errors.value.area_id;

  // resetear campos que no aplican
  if (formData.value.role !== UserRole.PROFESOR) {
    formData.value.titulo_profesional = undefined;
    formData.value.especialidad = undefined;
    formData.value.fecha_contratacion = undefined;
  }

  if (formData.value.role !== UserRole.ESTUDIANTE_APODERADO) {
    formData.value.fecha_nacimiento = undefined;
    formData.value.direccion = undefined;
    formData.value.genero = undefined;
  }

  if (!(formData.value.role === UserRole.ADMINISTRADOR || formData.value.role === UserRole.ADMINISTRATIVO)) {
    formData.value.cargo = undefined;
    formData.value.area_id = undefined;
    formData.value.fecha_contratacion = undefined;
  }
};

// Manejar input de password (calcular fortaleza)
const handlePasswordInput = () => {
  if (formData.value.password) {
    const validation = validatePasswordStrength(formData.value.password);
    passwordStrength.value = validation.strength;
  }
  clearFieldError('password');
};

// Obtener color de barra de fortaleza
const getStrengthColor = (index: number): string => {
  const strength = passwordStrength.value;
  const password = formData.value.password;

  if (!password) return 'bg-gray-200';

  if (strength === 'weak' && index <= 1) return 'bg-red-500';
  if (strength === 'medium' && index <= 2) return 'bg-yellow-500';
  if (strength === 'strong' && index <= 4) return 'bg-green-500';

  return 'bg-gray-200';
};

// Obtener texto de fortaleza
const getStrengthText = (): string => {
  const strength = passwordStrength.value;
  if (strength === 'weak') return 'Contraseña débil';
  if (strength === 'medium') return 'Contraseña media';
  return 'Contraseña fuerte';
};

// Obtener color del texto de fortaleza
const getStrengthTextColor = (): string => {
  const strength = passwordStrength.value;
  if (strength === 'weak') return 'text-red-600';
  if (strength === 'medium') return 'text-yellow-600';
  return 'text-green-600';
};

// Manejar submit
const handleSubmit = async () => {
  // Validar todos los campos
  validateField('role');
  validateField('email');
  validateField('nombre_completo');
  validateField('rut');
  validateField('password');
  validateField('confirmPassword');
  validateField('colegio_id');
  // Validaciones específicas según rol
  if (formData.value.role === UserRole.PROFESOR) {
    validateField('titulo_profesional');
    validateField('especialidad');
    validateField('fecha_contratacion');
  }
  if (formData.value.role === UserRole.ESTUDIANTE_APODERADO) {
    validateField('fecha_nacimiento');
    validateField('direccion');
    validateField('genero');
  }
  if (formData.value.role === UserRole.ADMINISTRADOR || formData.value.role === UserRole.ADMINISTRATIVO) {
    validateField('cargo');
    validateField('area_id');
    validateField('fecha_contratacion');
  }
  if (formData.value.telefono) {
    validateField('telefono');
  }

  if (!isFormValid.value) return;

  try {
    await authStore.register(formData.value);
    // Éxito - el mensaje se muestra automáticamente
  } catch (error) {
    // Error - el mensaje se muestra automáticamente desde el store
    console.error('Error al registrar:', error);
  }
};

// Resetear formulario
const resetForm = () => {
  formData.value = {
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole,
    nombre_completo: '',
    rut: '',
    colegio_id: '',
    telefono: ''
  ,
    titulo_profesional: undefined,
    especialidad: undefined,
    fecha_contratacion: undefined,
    fecha_nacimiento: undefined,
    direccion: undefined,
    genero: undefined,
    cargo: undefined,
    area_id: undefined
  };
  errors.value = {};
  passwordStrength.value = 'weak';
  authStore.clearRegisterState();
};

onMounted(() => {
  // Inicializar colegio_id si está disponible en el store
  if (schoolStore.schoolInfo?.colegio_id) {
    formData.value.colegio_id = schoolStore.schoolInfo.colegio_id;
    console.log("Colegio ID seteado:", formData.value.colegio_id);
  }
});

onBeforeMount(() => {
  // Limpiar estado de registro al montar el componente
  authStore.clearRegisterState();
  // Inicializar colegio_id si está disponible en el store
  if (schoolStore.schoolInfo?.colegio_id) {
    formData.value.colegio_id = schoolStore.schoolInfo.colegio_id;
    console.log("Colegio ID seteado:", formData.value.colegio_id);
  }
});

// Filtrar opciones (mostrar en el orden solicitado por el usuario)
const filteredRoleOptions = roleOptions;
</script>
