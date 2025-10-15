<template>
  <AuthLayout
    title="Restablecer Contraseña"
    subtitle="Ingresa tu nueva contraseña"
  >
    <ResetPasswordForm />
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue';
</script>
