<template>
  <AuthLayout
    title="Recuperar Contraseña"
    subtitle="Te ayudaremos a restablecer tu contraseña"
  >
    <ForgotPasswordForm />
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue';
</script>
