<template>
  <AuthLayout>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Registrar Usuario</h2>
      <p class="text-gray-600 mt-2">Completa el formulario para crear un nuevo usuario en el sistema</p>
    </div>

    <RegisterForm />
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
</script>
