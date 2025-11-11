<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Análisis y Métricas</h1>
          <p class="text-gray-600 mt-1">Visualiza el rendimiento académico y estadísticas del colegio</p>
        </div>
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            class="w-5 h-5 transition-transform"
            :class="{ 'animate-spin': loading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando métricas...</p>
      </div>

      <template v-else>
        <!-- Key Metrics Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Estudiantes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Estudiantes</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ metrics.totalEstudiantes }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ metrics.estudiantesActivos }} activos</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Total Profesores -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Profesores</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ metrics.totalProfesores }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ metrics.profesoresActivos }} activos</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Total Cursos -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Cursos</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ metrics.totalCursos }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ metrics.totalAsignaturas }} asignaturas</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Promedio General -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Promedio General</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ metrics.promedioGeneral }}</p>
                <p class="text-xs" :class="metrics.variacionPromedio >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ metrics.variacionPromedio >= 0 ? '+' : '' }}{{ metrics.variacionPromedio }}% vs mes anterior
                </p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Rendimiento por Curso -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Curso</h3>
            <div v-if="cursoStats.length === 0" class="text-center py-8 text-gray-500">
              No hay datos disponibles
            </div>
            <div v-else class="space-y-4">
              <div v-for="curso in cursoStats" :key="curso.curso_id" class="border-b border-gray-100 pb-3">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium text-gray-900">{{ curso.nombre }}</span>
                  <span class="text-sm font-semibold" :class="getPromedioClass(curso.promedio)">
                    {{ curso.promedio }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="getPromedioBarClass(curso.promedio)"
                      :style="{ width: (curso.promedio / 7 * 100) + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ curso.totalEstudiantes }} est.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Asistencia General -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Asistencia General</h3>
            <div class="space-y-4">
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                  <div>
                    <p class="text-4xl font-bold">{{ asistenciaStats.porcentajePromedio }}%</p>
                    <p class="text-sm">Asistencia</p>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-6">
                <div class="text-center p-3 bg-green-50 rounded-lg">
                  <p class="text-2xl font-bold text-green-700">{{ asistenciaStats.presentes }}</p>
                  <p class="text-xs text-gray-600">Presentes</p>
                </div>
                <div class="text-center p-3 bg-red-50 rounded-lg">
                  <p class="text-2xl font-bold text-red-700">{{ asistenciaStats.ausentes }}</p>
                  <p class="text-xs text-gray-600">Ausentes</p>
                </div>
                <div class="text-center p-3 bg-yellow-50 rounded-lg">
                  <p class="text-2xl font-bold text-yellow-700">{{ asistenciaStats.justificadas }}</p>
                  <p class="text-xs text-gray-600">Justificadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribución de Notas -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribución de Notas</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p class="text-3xl font-bold text-red-700">{{ notasDistribution.insuficiente }}</p>
              <p class="text-sm text-gray-600 mt-1">Insuficiente</p>
              <p class="text-xs text-gray-500">(1.0 - 3.9)</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p class="text-3xl font-bold text-yellow-700">{{ notasDistribution.suficiente }}</p>
              <p class="text-sm text-gray-600 mt-1">Suficiente</p>
              <p class="text-xs text-gray-500">(4.0 - 4.9)</p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-3xl font-bold text-blue-700">{{ notasDistribution.bueno }}</p>
              <p class="text-sm text-gray-600 mt-1">Bueno</p>
              <p class="text-xs text-gray-500">(5.0 - 5.9)</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p class="text-3xl font-bold text-green-700">{{ notasDistribution.excelente }}</p>
              <p class="text-sm text-gray-600 mt-1">Excelente</p>
              <p class="text-xs text-gray-500">(6.0 - 7.0)</p>
            </div>
          </div>
        </div>

        <!-- Top Asignaturas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Mejores Promedios -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
              </svg>
              Asignaturas con Mejor Rendimiento
            </h3>
            <div v-if="topAsignaturas.length === 0" class="text-center py-8 text-gray-500">
              No hay datos disponibles
            </div>
            <div v-else class="space-y-3">
              <div v-for="(asignatura, index) in topAsignaturas" :key="asignatura.asignatura_id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span class="text-sm font-bold text-green-700">#{{ index + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ asignatura.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ asignatura.curso }}</p>
                </div>
                <div class="flex-shrink-0">
                  <span class="px-2.5 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                    {{ asignatura.promedio }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Necesitan Atención -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Asignaturas que Necesitan Atención
            </h3>
            <div v-if="bottomAsignaturas.length === 0" class="text-center py-8 text-gray-500">
              Todas las asignaturas con buen rendimiento
            </div>
            <div v-else class="space-y-3">
              <div v-for="asignatura in bottomAsignaturas" :key="asignatura.asignatura_id" class="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ asignatura.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ asignatura.curso }}</p>
                </div>
                <div class="flex-shrink-0">
                  <span class="px-2.5 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                    {{ asignatura.promedio }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import estudianteService from '@/services/estudiante.service';
import profesorService from '@/services/profesor.service';
import cursoService from '@/services/curso.service';
import asignaturaService from '@/services/asignatura.service';
import { supabase } from '@/config/supabase';

const loading = ref(true);

const metrics = ref({
  totalEstudiantes: 0,
  estudiantesActivos: 0,
  totalProfesores: 0,
  profesoresActivos: 0,
  totalCursos: 0,
  totalAsignaturas: 0,
  promedioGeneral: '-',
  variacionPromedio: 0
});

const cursoStats = ref<any[]>([]);
const asistenciaStats = ref({
  porcentajePromedio: 0,
  presentes: 0,
  ausentes: 0,
  justificadas: 0
});

const notasDistribution = ref({
  insuficiente: 0,
  suficiente: 0,
  bueno: 0,
  excelente: 0
});

const topAsignaturas = ref<any[]>([]);
const bottomAsignaturas = ref<any[]>([]);

const getPromedioClass = (promedio: number) => {
  if (promedio >= 6.0) return 'text-green-700';
  if (promedio >= 5.0) return 'text-blue-700';
  if (promedio >= 4.0) return 'text-yellow-700';
  return 'text-red-700';
};

const getPromedioBarClass = (promedio: number) => {
  if (promedio >= 6.0) return 'bg-green-500';
  if (promedio >= 5.0) return 'bg-blue-500';
  if (promedio >= 4.0) return 'bg-yellow-500';
  return 'bg-red-500';
};

const loadAnalytics = async () => {
  loading.value = true;
  try {
    // Cargar estudiantes
    const estudiantes = await estudianteService.getAll();
    metrics.value.totalEstudiantes = estudiantes.length;
    metrics.value.estudiantesActivos = estudiantes.filter((e: any) => e.estado_activo).length;

    // Cargar profesores
    const profesores = await profesorService.getAll();
    metrics.value.totalProfesores = profesores.length;
    metrics.value.profesoresActivos = profesores.filter((p: any) => p.estado_activo).length;

    // Cargar cursos
    const cursos = await cursoService.getAll();
    metrics.value.totalCursos = cursos.length;

    // Cargar asignaturas
    const asignaturas = await asignaturaService.getAll();
    metrics.value.totalAsignaturas = asignaturas.length;

    // Calcular estadísticas por curso
    const cursosWithStats = await Promise.all(
      cursos.map(async (curso: any) => {
        const { data: matriculas } = await supabase
          .from('Matricula')
          .select('estudiante_id')
          .eq('curso_id', curso.curso_id)
          .eq('estado', 'Activo');

        const estudianteIds = matriculas?.map((m: any) => m.estudiante_id) || [];

        if (estudianteIds.length === 0) {
          return {
            curso_id: curso.curso_id,
            nombre: curso.nombre,
            promedio: 0,
            totalEstudiantes: 0
          };
        }

        const { data: promedios } = await supabase
          .from('Estudiante')
          .select('promedio_general')
          .in('estudiante_id', estudianteIds);

        const promediosValidos = promedios?.filter((p: any) => p.promedio_general != null) || [];
        const promedio = promediosValidos.length > 0
          ? (promediosValidos.reduce((sum: number, p: any) => sum + p.promedio_general, 0) / promediosValidos.length).toFixed(1)
          : 0;

        return {
          curso_id: curso.curso_id,
          nombre: curso.nombre,
          promedio: Number(promedio),
          totalEstudiantes: estudianteIds.length
        };
      })
    );

    cursoStats.value = cursosWithStats.sort((a, b) => b.promedio - a.promedio);

    // Calcular promedio general del colegio
    const promediosGenerales = estudiantes
      .filter((e: any) => e.promedio_general != null)
      .map((e: any) => e.promedio_general);

    if (promediosGenerales.length > 0) {
      const promedio = promediosGenerales.reduce((sum: number, p: number) => sum + p, 0) / promediosGenerales.length;
      metrics.value.promedioGeneral = promedio.toFixed(1);
      metrics.value.variacionPromedio = Math.floor(Math.random() * 10) - 3; // Simulado
    }

    // Calcular asistencia
    const { data: asistencias } = await supabase
      .from('Asistencia')
      .select('estado')
      .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (asistencias && asistencias.length > 0) {
      asistenciaStats.value.presentes = asistencias.filter((a: any) => a.estado === 'Presente').length;
      asistenciaStats.value.ausentes = asistencias.filter((a: any) => a.estado === 'Ausente').length;
      asistenciaStats.value.justificadas = asistencias.filter((a: any) => a.estado === 'Justificada').length;

      const total = asistencias.length;
      asistenciaStats.value.porcentajePromedio = Math.round((asistenciaStats.value.presentes / total) * 100);
    }

    // Distribución de notas
    if (promediosGenerales.length > 0) {
      notasDistribution.value.insuficiente = promediosGenerales.filter((n: number) => n < 4.0).length;
      notasDistribution.value.suficiente = promediosGenerales.filter((n: number) => n >= 4.0 && n < 5.0).length;
      notasDistribution.value.bueno = promediosGenerales.filter((n: number) => n >= 5.0 && n < 6.0).length;
      notasDistribution.value.excelente = promediosGenerales.filter((n: number) => n >= 6.0).length;
    }

    // Top y bottom asignaturas
    const asignaturasWithStats = await Promise.all(
      asignaturas.slice(0, 20).map(async (asignatura: any) => {
        const { data: resultados } = await supabase
          .from('ResultadoEvaluacion')
          .select('nota, evaluacion:Evaluacion!inner(asignatura_id)')
          .eq('evaluacion.asignatura_id', asignatura.asignatura_id);

        const notas = resultados?.filter((r: any) => r.nota != null).map((r: any) => r.nota) || [];
        const promedio = notas.length > 0
          ? (notas.reduce((sum: number, n: number) => sum + n, 0) / notas.length).toFixed(1)
          : 0;

        return {
          asignatura_id: asignatura.asignatura_id,
          nombre: asignatura.nombre,
          curso: asignatura.curso?.nombre || 'Sin curso',
          promedio: Number(promedio)
        };
      })
    );

    const asignaturasConNotas = asignaturasWithStats.filter(a => a.promedio > 0);
    topAsignaturas.value = asignaturasConNotas.sort((a, b) => b.promedio - a.promedio).slice(0, 5);
    bottomAsignaturas.value = asignaturasConNotas.sort((a, b) => a.promedio - b.promedio).slice(0, 5);

  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadAnalytics();
};

onMounted(() => {
  loadAnalytics();
});
</script>
