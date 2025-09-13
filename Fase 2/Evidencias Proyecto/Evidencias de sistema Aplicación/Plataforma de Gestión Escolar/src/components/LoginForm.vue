<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-foreground">
          Sistema Académico
        </h2>
        <p class="mt-2 text-muted-foreground">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-foreground mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label for="password" class="block text-foreground mb-2">
              Contraseña
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="error" class="text-destructive text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="authStore.isLoading" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Iniciando sesión...
          </span>
          <span v-else>Iniciar sesión</span>
        </button>

        <div class="mt-6 text-center">
          <div class="text-sm text-muted-foreground">
            <p class="mb-2">Cuentas de prueba:</p>
            <div class="space-y-1 text-xs">
              <p><strong>Coordinador:</strong> coordinador@colegio.cl / admin123</p>
              <p><strong>Docente:</strong> docente@colegio.cl / docente123</p>
              <p><strong>Apoderado:</strong> apoderado@colegio.cl / apoderado123</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  
  const result = await authStore.login(form.value.email, form.value.password)
  
  if (!result.success) {
    error.value = result.error
  }
}
</script>