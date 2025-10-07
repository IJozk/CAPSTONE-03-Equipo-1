<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Mensaje de instrucciones -->
    <div class="text-center mb-6" v-if="!isSuccess">
      <p class="text-gray-600 text-sm">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>
    </div>

    <!-- Email Input -->
    <div v-if="!isSuccess">
      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
        Correo Electrónico
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        autocomplete="email"
        :disabled="isLoading"
        :class="[
          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
          emailError ? 'border-red-500' : 'border-gray-300'
        ]"
        placeholder="correo@ejemplo.com"
        @blur="validateEmail"
        @input="clearError"
      />
      <p v-if="emailError" class="mt-1 text-sm text-red-600">
        {{ emailError }}
      </p>
    </div>

    <!-- Success Message -->
    <div v-if="isSuccess" class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <!-- Icono de email -->
      <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        ¡Correo Enviado!
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.
      </p>
      <p class="text-xs text-gray-500">
        Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="serverError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-red-800">{{ serverError }}</p>
      </div>
    </div>

    <!-- Submit Button -->
    <button
      v-if="!isSuccess"
      type="submit"
      :disabled="isLoading || !isEmailValid || hasCooldown"
      :class="[
        'w-full py-3 px-4 rounded-lg font-medium text-white transition-all',
        isLoading || !isEmailValid || hasCooldown
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
      ]"
    >
      <span v-if="!isLoading && !hasCooldown">Enviar Enlace de Recuperación</span>
      <span v-else-if="hasCooldown">Espera {{ cooldownSeconds }}s para reenviar</span>
      <span v-else class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Enviando...
      </span>
    </button>

    <!-- Back to Login -->
    <div class="text-center">
      <router-link
        to="/login"
        class="text-sm text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio de sesión
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import { validateEmail as validateEmailUtil } from '@/utils/validators';

const authStore = useAuthStore();

// Form data
const email = ref('');
const emailError = ref<string | null>(null);

// Computed
const isLoading = computed(() => authStore.forgotPasswordState.loading);
const isSuccess = computed(() => authStore.forgotPasswordState.success);
const serverError = computed(() => authStore.forgotPasswordState.error);
const cooldownSeconds = computed(() => authStore.forgotPasswordState.cooldownSeconds);
const hasCooldown = computed(() => cooldownSeconds.value > 0);
const isEmailValid = computed(() => email.value && !emailError.value);

// Validar email
const validateEmail = () => {
  const error = validateEmailUtil(email.value);
  emailError.value = error;
};

// Limpiar error
const clearError = () => {
  emailError.value = null;
  authStore.clearForgotPasswordState();
};

// Submit
const handleSubmit = async () => {
  validateEmail();
  if (!isEmailValid.value) return;

  try {
    await authStore.forgotPassword(email.value);
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
  }
};
</script>
