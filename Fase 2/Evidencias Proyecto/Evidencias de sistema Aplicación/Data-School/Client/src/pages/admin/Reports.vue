<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Informes y Reportes</h1>
        <p class="text-gray-600 mt-1">Dashboard interactivo de análisis y reportes del sistema</p>
      </div>

      <!-- Looker Studio Embedded Report -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="text-lg font-semibold text-gray-900">Dashboard de Análisis</h2>
          <p class="text-sm text-gray-600 mt-1">Visualización interactiva de datos y métricas institucionales</p>
        </div>
        <div class="p-4 bg-gray-50">
          <div class="w-full rounded-lg overflow-hidden shadow-sm bg-white" style="min-height: 450px;">
            <iframe
              width="100%"
              height="650"
              src="https://lookerstudio.google.com/embed/reporting/38653662-1d16-4851-ba0e-427b8116faa7/page/Nd0fF"
              frameborder="0"
              style="border:0"
              allowfullscreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          </div>
        </div>
      </div>

      <!-- Additional Info Card -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Acerca de este informe</h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>Este dashboard interactivo proporciona visualizaciones en tiempo real de las métricas clave del sistema educativo. Puedes interactuar con los gráficos y filtros para explorar los datos en profundidad.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue';
</script>
