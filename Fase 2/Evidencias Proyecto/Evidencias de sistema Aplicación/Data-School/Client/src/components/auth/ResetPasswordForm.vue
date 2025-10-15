<template>
  <div>
    <!-- Validating Token State -->
    <div v-if="isValidating" class="text-center py-12">
      <div class="mx-auto w-16 h-16 mb-4">
        <svg class="animate-spin h-16 w-16 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p class="text-gray-600 text-sm">Validando enlace de recuperación...</p>
    </div>

    <!-- Invalid Token State -->
    <div v-else-if="tokenValid === false" class="text-center py-8">
      <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Enlace Inválido o Expirado
      </h3>
      <p class="text-sm text-gray-600 mb-6">
        Este enlace de recuperación no es válido o ha expirado.
      </p>
      <router-link
        to="/forgot-password"
        class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Solicitar Nuevo Enlace
      </router-link>
    </div>

    <!-- Reset Password Form -->
    <form v-else-if="!isSuccess" @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Instructions -->
      <div class="text-center mb-6">
        <p class="text-gray-600 text-sm">
          Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
        </p>
      </div>

      <!-- New Password Input -->
      <div>
        <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
          Nueva Contraseña
        </label>
        <div class="relative">
          <input
            id="newPassword"
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :disabled="isLoading"
            :class="[
              'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
              passwordError ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Mínimo 8 caracteres"
            @blur="validatePassword"
            @input="clearError"
          />
          <button
            type="button"
            @click="showNewPassword = !showNewPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabindex="-1"
          >
            <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
        <p v-if="passwordError" class="mt-1 text-sm text-red-600">
          {{ passwordError }}
        </p>
      </div>

      <!-- Password Strength Indicator -->
      <div v-if="newPassword" class="space-y-2">
        <div class="flex gap-1">
          <div
            v-for="i in 4"
            :key="i"
            :class="[
              'h-1 flex-1 rounded transition-all',
              i <= passwordStrengthBars
                ? passwordStrength === 'strong'
                  ? 'bg-green-500'
                  : passwordStrength === 'medium'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                : 'bg-gray-200'
            ]"
          ></div>
        </div>
        <p
          :class="[
            'text-xs font-medium',
            passwordStrength === 'strong'
              ? 'text-green-600'
              : passwordStrength === 'medium'
              ? 'text-yellow-600'
              : 'text-red-600'
          ]"
        >
          {{
            passwordStrength === 'strong'
              ? 'Contraseña fuerte'
              : passwordStrength === 'medium'
              ? 'Contraseña media'
              : 'Contraseña débil'
          }}
        </p>
        <ul v-if="passwordRequirements.length > 0" class="text-xs text-gray-600 space-y-1">
          <li v-for="req in passwordRequirements" :key="req" class="flex items-start gap-1">
            <span class="text-red-500 mt-0.5">•</span>
            <span>{{ req }}</span>
          </li>
        </ul>
      </div>

      <!-- Confirm Password Input -->
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Contraseña
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :disabled="isLoading"
            :class="[
              'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
              confirmPasswordError ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Confirma tu contraseña"
            @blur="validateConfirmPassword"
            @input="clearConfirmPasswordError"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
        <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">
          {{ confirmPasswordError }}
        </p>
      </div>

      <!-- Server Error Message -->
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
        type="submit"
        :disabled="isLoading || !isFormValid"
        :class="[
          'w-full py-3 px-4 rounded-lg font-medium text-white transition-all',
          isLoading || !isFormValid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
        ]"
      >
        <span v-if="!isLoading">Restablecer Contraseña</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Restableciendo...
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

    <!-- Success State with Countdown -->
    <div v-else class="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
      <!-- Success Icon -->
      <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        ¡Contraseña Restablecida!
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Tu contraseña ha sido actualizada exitosamente.
      </p>
      <p class="text-sm text-gray-500">
        Redirigiendo al inicio de sesión en <span class="font-semibold text-primary-600">{{ redirectCountdown }}</span> segundo{{ redirectCountdown !== 1 ? 's' : '' }}...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';
import { validatePassword, validatePasswordMatch, validatePasswordStrength } from '@/utils/validators';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Form data
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref<string | null>(null);
const confirmPasswordError = ref<string | null>(null);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const token = ref<string>('');
const isValidating = ref(true);

// Computed
const isLoading = computed(() => authStore.resetPasswordState.loading);
const isSuccess = computed(() => authStore.resetPasswordState.success);
const serverError = computed(() => authStore.resetPasswordState.error);
const tokenValid = computed(() => authStore.resetPasswordState.tokenValid);
const redirectCountdown = computed(() => authStore.resetPasswordState.redirectCountdown);

const passwordStrengthResult = computed(() => {
  if (!newPassword.value) return { strength: 'weak', requirements: [] };
  return validatePasswordStrength(newPassword.value);
});

const passwordStrength = computed(() => passwordStrengthResult.value.strength);
const passwordRequirements = computed(() => passwordStrengthResult.value.requirements);

const passwordStrengthBars = computed(() => {
  switch (passwordStrength.value) {
    case 'strong':
      return 4;
    case 'medium':
      return 2;
    default:
      return 1;
  }
});

const isFormValid = computed(() => {
  return (
    newPassword.value &&
    confirmPassword.value &&
    !passwordError.value &&
    !confirmPasswordError.value &&
    passwordStrength.value === 'strong'
  );
});

// Validate password
const validatePasswordField = () => {
  const error = validatePassword(newPassword.value);
  passwordError.value = error;
};

// Validate confirm password
const validateConfirmPassword = () => {
  const error = validatePasswordMatch(newPassword.value, confirmPassword.value);
  confirmPasswordError.value = error;
};

// Clear errors
const clearError = () => {
  passwordError.value = null;
  authStore.clearResetPasswordState();
};

const clearConfirmPasswordError = () => {
  confirmPasswordError.value = null;
};

// Validate on password change
watch(newPassword, () => {
  if (confirmPassword.value) {
    validateConfirmPassword();
  }
});

// Submit
const handleSubmit = async () => {
  validatePasswordField();
  validateConfirmPassword();

  if (!isFormValid.value) return;

  try {
    await authStore.resetPassword(token.value, newPassword.value);
    // Success state is now showing, countdown started
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
  }
};

// Watch for redirect countdown completion
watch(redirectCountdown, (newValue) => {
  if (newValue === 0 && isSuccess.value) {
    router.push('/login');
  }
});

// On mount: extract token and validate
onMounted(async () => {
  const queryToken = route.query.token as string;

  if (!queryToken) {
    authStore.resetPasswordState.tokenValid = false;
    isValidating.value = false;
    return;
  }

  token.value = queryToken;

  // Validate token
  const isValid = await authStore.validateResetToken(queryToken);
  isValidating.value = false;

  if (!isValid) {
    // Token invalid state is now showing
  }
});
</script>
