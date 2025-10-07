<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-900">Resumen de Cursos</h2>
      <router-link
        to="/admin/courses"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        Ver todos
      </router-link>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="animate-pulse">
      <div class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-16 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Tabla de cursos -->
    <div v-else-if="courses.length > 0" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Curso
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Estudiantes
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Promedio
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Asistencia
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="course in courses"
            :key="course.curso_id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="goToCourseDetail(course.curso_id)"
          >
            <!-- Curso -->
            <td class="px-4 py-4">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ course.nombre }}</p>
                <p class="text-xs text-gray-500">{{ course.nivel }}</p>
              </div>
            </td>

            <!-- Estudiantes -->
            <td class="px-4 py-4">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">
                  {{ course.total_estudiantes }} / {{ course.capacidad_maxima }}
                </span>
                <!-- Barra de progreso de capacidad -->
                <div class="w-24 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getCapacityColor(course)"
                    :style="{ width: getCapacityPercentage(course) + '%' }"
                  ></div>
                </div>
              </div>
            </td>

            <!-- Promedio -->
            <td class="px-4 py-4">
              <div class="flex items-center">
                <span
                  class="text-sm font-semibold px-2 py-1 rounded"
                  :class="getGradeColor(course.promedio_curso)"
                >
                  {{ course.promedio_curso.toFixed(1) }}
                </span>
              </div>
            </td>

            <!-- Asistencia -->
            <td class="px-4 py-4">
              <div class="flex items-center">
                <span
                  class="text-sm font-semibold px-2 py-1 rounded"
                  :class="getAttendanceColor(course.asistencia_promedio)"
                >
                  {{ course.asistencia_promedio.toFixed(1) }}%
                </span>
              </div>
            </td>

            <!-- Estado -->
            <td class="px-4 py-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusBadge(course)"
              >
                {{ getStatusText(course) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-8">
      <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <p class="text-gray-600 text-sm">No hay cursos registrados</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { CourseSummary } from '@/types/admin.types';

// Props
interface Props {
  courses: CourseSummary[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false
});

// Router
const router = useRouter();

// Calcular porcentaje de capacidad
const getCapacityPercentage = (course: CourseSummary): number => {
  return Math.round((course.total_estudiantes / course.capacidad_maxima) * 100);
};

// Color de la barra de capacidad
const getCapacityColor = (course: CourseSummary): string => {
  const percentage = getCapacityPercentage(course);
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Color del promedio
const getGradeColor = (promedio: number): string => {
  if (promedio >= 6.0) return 'bg-green-100 text-green-800';
  if (promedio >= 5.5) return 'bg-blue-100 text-blue-800';
  if (promedio >= 5.0) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Color de asistencia
const getAttendanceColor = (asistencia: number): string => {
  if (asistencia >= 90) return 'bg-green-100 text-green-800';
  if (asistencia >= 80) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Badge de estado
const getStatusBadge = (course: CourseSummary): string => {
  const percentage = getCapacityPercentage(course);
  if (percentage >= 100) return 'bg-red-100 text-red-800';
  if (percentage >= 90) return 'bg-green-100 text-green-800';
  if (percentage >= 70) return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
};

// Texto del estado
const getStatusText = (course: CourseSummary): string => {
  const percentage = getCapacityPercentage(course);
  if (percentage >= 100) return 'Completo';
  if (percentage >= 90) return 'Casi lleno';
  if (percentage >= 70) return 'Disponible';
  return 'Baja ocupación';
};

// Navegar a detalle del curso
const goToCourseDetail = (cursoId: string) => {
  router.push(`/admin/courses/${cursoId}`);
};
</script>
