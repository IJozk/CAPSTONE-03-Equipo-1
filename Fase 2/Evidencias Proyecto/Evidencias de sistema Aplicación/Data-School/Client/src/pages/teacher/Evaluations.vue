<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Evaluaciones</h1>
        <router-link
          to="/teacher/evaluations/new"
          class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
        >
          + Nueva Evaluación
        </router-link>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Página en Construcción</h3>
        <p class="text-gray-600">La gestión de evaluaciones estará disponible próximamente.</p>
        <p class="text-sm text-gray-500 mt-2">Por ahora, puedes ingresar notas desde la página de Registro de Notas.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Placeholder component
</script>
