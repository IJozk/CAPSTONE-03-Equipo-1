<template>
  <AuthLayout>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
      <p class="text-gray-600 mt-2">Ingresa tus credenciales para acceder</p>
    </div>

    <LoginForm />
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
</script>
