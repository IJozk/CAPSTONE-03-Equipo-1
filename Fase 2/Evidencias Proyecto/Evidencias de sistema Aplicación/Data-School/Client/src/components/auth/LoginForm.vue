<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Email Input -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
        Correo Electrónico
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        autocomplete="email"
        :class="[
          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
          errors.email ? 'border-red-500' : 'border-gray-300'
        ]"
        placeholder="ejemplo@correo.com"
        @blur="validateField('email')"
        @input="clearFieldError('email')"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">
        {{ errors.email }}
      </p>
    </div>

    <!-- Password Input -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
        Contraseña
      </label>
      <div class="relative">
        <input
          id="password"
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          :class="[
            'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors pr-12',
            errors.password ? 'border-red-500' : 'border-gray-300'
          ]"
          placeholder="••••••••"
          @blur="validateField('password')"
          @input="clearFieldError('password')"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabindex="-1"
        >
          <!-- Ojo abierto (mostrar contraseña) -->
          <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <!-- Ojo cerrado (ocultar contraseña) -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
      <p v-if="errors.password" class="mt-1 text-sm text-red-600">
        {{ errors.password }}
      </p>
    </div>

    <!-- Error general del login -->
    <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-red-800">{{ loginError }}</p>
      </div>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading || !isFormValid"
      :class="[
        'w-full py-3 px-4 rounded-lg font-medium text-white transition-all',
        isLoading || !isFormValid
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
      ]"
    >
      <span v-if="!isLoading">Iniciar Sesión</span>
      <span v-else class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Iniciando sesión...
      </span>
    </button>

    <!-- Forgot Password Link -->
    <div class="text-center">
      <a
        href="#"
        @click.prevent="handleForgotPassword"
        class="text-sm text-primary-600 hover:text-primary-700 hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';
import { validateEmail, validatePassword } from '@/utils/validators';
import type { LoginCredentials, ValidationErrors } from '@/types/auth.types';

const router = useRouter();
const authStore = useAuthStore();

// Datos del formulario
const formData = ref<LoginCredentials>({
  email: '',
  password: '',
});

// Estado de la UI
const showPassword = ref(false);
const errors = ref<ValidationErrors>({});
const loginError = ref<string | null>(null);

// Propiedades computadas
const isLoading = computed(() => authStore.loading);
const isFormValid = computed(() => {
  return formData.value.email && formData.value.password && Object.keys(errors.value).length === 0;
});

/**
 * Validar un campo específico del formulario
 */
const validateField = (field: 'email' | 'password') => {
  if (field === 'email') {
    const error = validateEmail(formData.value.email);
    if (error) {
      errors.value.email = error;
    } else {
      delete errors.value.email;
    }
  }

  if (field === 'password') {
    const error = validatePassword(formData.value.password);
    if (error) {
      errors.value.password = error;
    } else {
      delete errors.value.password;
    }
  }
};

/**
 * Limpiar el error de un campo cuando el usuario empieza a escribir
 */
const clearFieldError = (field: 'email' | 'password') => {
  delete errors.value[field];
  loginError.value = null;
};

/**
 * Manejar el submit del formulario de login
 */
const handleSubmit = async () => {
  // Validar todos los campos antes de enviar
  validateField('email');
  validateField('password');

  if (!isFormValid.value) return;

  loginError.value = null;

  try {
    await authStore.login(formData.value);

    // Redireccionar según el rol del usuario
    const role = authStore.userRole;
    if (role === 'ADMINISTRADOR' || role === 'DIRECTOR') {
      router.push('/dashboard');
    } else if (role === 'PROFESOR') {
      router.push('/dashboard/profesor');
    } else if (role === 'ESTUDIANTE_APODERADO') {
      router.push('/dashboard/estudiante');
    } else {
      router.push('/dashboard');
    }
  } catch (error: any) {
    loginError.value = error.message || 'Error al iniciar sesión';
    // Limpiar contraseña en caso de error de seguridad
    formData.value.password = '';
  }
};

/**
 * Manejar clic en "Olvidaste tu contraseña"
 */
const handleForgotPassword = () => {
  router.push('/forgot-password');
};
</script>
