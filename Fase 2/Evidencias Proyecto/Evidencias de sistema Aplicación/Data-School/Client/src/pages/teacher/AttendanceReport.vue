<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Reporte de Asistencia</h1>
        <p class="text-gray-600 mt-1">Genera reportes de asistencia por período y asignatura</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Asignatura <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedSubjectId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar asignatura</option>
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }} - {{ subject.curso.nombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio <span class="text-red-500">*</span>
            </label>
            <input
              v-model="startDate"
              type="date"
              required
              :max="today"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin <span class="text-red-500">*</span>
            </label>
            <input
              v-model="endDate"
              type="date"
              required
              :max="today"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="generateReport"
            :disabled="!canGenerate || loading"
            class="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Generando...' : 'Generar Reporte' }}
          </button>
        </div>
      </div>

      <!-- Report -->
      <div v-if="report" class="space-y-6">
        <!-- Summary Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Resumen General</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600">Total Estudiantes</p>
              <p class="text-3xl font-bold text-blue-600">{{ report.estudiantes.length }}</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600">Promedio Asistencia</p>
              <p class="text-3xl font-bold text-green-600">{{ report.promedios.asistencia_curso.toFixed(1) }}%</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <p class="text-sm text-gray-600">Total Clases</p>
              <p class="text-3xl font-bold text-yellow-600">{{ maxClasses }}</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-sm text-gray-600">Período</p>
              <p class="text-sm font-bold text-purple-600">{{ formatDate(startDate) }} - {{ formatDate(endDate) }}</p>
            </div>
          </div>
        </div>

        <!-- Students Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900">Detalle por Estudiante</h2>
            <div class="flex space-x-2">
              <button
                @click="exportToPDF"
                class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              <button
                @click="exportToExcel"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N°</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estudiante</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total Clases</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Presentes</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Ausentes</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Retrasos</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">% Asistencia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(student, index) in report.estudiantes" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ index + 1 }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ student.nombre_completo }}</td>
                  <td class="px-6 py-4 text-center text-sm text-gray-900">{{ student.total_clases }}</td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ student.presentes }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {{ student.ausentes }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {{ student.retrasos }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span
                      :class="getAttendanceClass(student.porcentaje_asistencia)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    >
                      {{ student.porcentaje_asistencia.toFixed(1) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Chart -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Gráfico de Asistencia</h2>
          <div class="h-64 flex items-end justify-around space-x-2">
            <div
              v-for="(student, index) in report.estudiantes.slice(0, 10)"
              :key="index"
              class="flex flex-col items-center flex-1"
            >
              <div
                :style="{ height: student.porcentaje_asistencia + '%' }"
                :class="getBarColorClass(student.porcentaje_asistencia)"
                class="w-full rounded-t-lg transition-all hover:opacity-80"
              ></div>
              <p class="text-xs text-gray-600 mt-2 text-center truncate w-full">
                {{ student.nombre_completo.split(' ')[0] }}
              </p>
            </div>
          </div>
          <p v-if="report.estudiantes.length > 10" class="text-xs text-gray-500 text-center mt-4">
            Mostrando los primeros 10 estudiantes
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay reporte generado</h3>
        <p class="mt-2 text-sm text-gray-600">
          Selecciona una asignatura y un rango de fechas para generar el reporte
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import teacherService from '@/services/teachertools.service';
import type { AttendanceReport } from '@/types/teacher.types';

const teacherStore = useTeacherStore();

const today = new Date().toISOString().split('T')[0];
const selectedSubjectId = ref('');
const startDate = ref('');
const endDate = ref('');
const loading = ref(false);
const report = ref<AttendanceReport | null>(null);

// Computed
const canGenerate = computed(() => {
  return selectedSubjectId.value && startDate.value && endDate.value;
});

const maxClasses = computed(() => {
  if (!report.value) return 0;
  return Math.max(...report.value.estudiantes.map(s => s.total_clases));
});

// Methods
const generateReport = async () => {
  if (!canGenerate.value) return;

  loading.value = true;
  try {
    report.value = await teacherService.getAttendanceReport(
      selectedSubjectId.value,
      startDate.value,
      endDate.value
    );
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    loading.value = false;
  }
};

const getAttendanceClass = (percentage: number): string => {
  if (percentage >= 90) return 'bg-emerald-100 text-emerald-800';
  if (percentage >= 80) return 'bg-green-100 text-green-800';
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
  if (percentage >= 60) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getBarColorClass = (percentage: number): string => {
  if (percentage >= 90) return 'bg-emerald-500';
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 70) return 'bg-yellow-500';
  if (percentage >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const exportToPDF = () => {
  if (!report.value) return;

  // Simulación de exportación
  alert('Funcionalidad de exportación a PDF en desarrollo. Los datos del reporte están listos para ser procesados.');
  console.log('Export to PDF:', report.value);
};

const exportToExcel = () => {
  if (!report.value) return;

  // Simulación de exportación
  alert('Funcionalidad de exportación a Excel en desarrollo. Los datos del reporte están listos para ser procesados.');
  console.log('Export to Excel:', report.value);
};

// Lifecycle
onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }

  // Set default date range (last 30 days)
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  startDate.value = start.toISOString().split('T')[0];
  endDate.value = end.toISOString().split('T')[0];
});
</script>
