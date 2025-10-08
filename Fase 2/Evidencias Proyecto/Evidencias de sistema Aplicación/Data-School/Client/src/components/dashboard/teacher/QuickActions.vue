<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <!-- Header -->
    <div class="flex items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center">
        <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Acciones Rápidas
      </h2>
    </div>

    <!-- Actions Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <!-- Nueva Evaluación -->
      <button
        @click="handleAction('nueva-evaluacion')"
        class="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-blue-300"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-700">Nueva Evaluación</span>
        </div>
      </button>

      <!-- Ingresar Notas -->
      <button
        @click="handleAction('ingresar-notas')"
        class="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-green-300"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-700">Ingresar Notas</span>
        </div>
      </button>

      <!-- Registrar Asistencia -->
      <button
        @click="handleAction('registrar-asistencia')"
        class="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-purple-300"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 bg-purple-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-700">Registrar Asistencia</span>
        </div>
      </button>

      <!-- Nueva Anotación -->
      <button
        @click="handleAction('nueva-anotacion')"
        class="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-orange-300"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-700">Nueva Anotación</span>
        </div>
      </button>

      <!-- Ver Reportes -->
      <button
        @click="handleAction('ver-reportes')"
        class="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-indigo-300"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 bg-indigo-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-700">Ver Reportes</span>
        </div>
      </button>

      <!-- Mis Asignaturas -->
      <button
        @click="handleAction('mis-asignaturas')"
        class="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-teal-300"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-700">Mis Asignaturas</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

type ActionType =
  | 'nueva-evaluacion'
  | 'ingresar-notas'
  | 'registrar-asistencia'
  | 'nueva-anotacion'
  | 'ver-reportes'
  | 'mis-asignaturas';

const handleAction = (action: ActionType) => {
  const routeMap: Record<ActionType, string> = {
    'nueva-evaluacion': '/teacher/evaluations/new',
    'ingresar-notas': '/teacher/grades',
    'registrar-asistencia': '/teacher/attendance',
    'nueva-anotacion': '/teacher/observations/new',
    'ver-reportes': '/teacher/reports',
    'mis-asignaturas': '/teacher/subjects'
  };

  const route = routeMap[action];
  if (route) {
    router.push(route);
  }
};
</script>
