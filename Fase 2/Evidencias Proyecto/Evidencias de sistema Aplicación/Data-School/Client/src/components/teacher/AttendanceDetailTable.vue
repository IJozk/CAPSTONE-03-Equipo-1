<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-lg font-semibold text-gray-900">Detalle de Asistencia por Día</h3>
      <p class="text-sm text-gray-600 mt-1">Registro completo de asistencia de cada estudiante</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Cargando registros de asistencia...</p>
    </div>

    <!-- Tabla de asistencia detallada -->
    <div v-else-if="fechasClases.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
              #
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-10 min-w-[200px]">
              Estudiante
            </th>
            <th
              v-for="fecha in fechasClases"
              :key="fecha"
              class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
            >
              <div>{{ formatFecha(fecha) }}</div>
              <div class="text-xs font-normal text-gray-400 normal-case">{{ getDiaSemana(fecha) }}</div>
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
              Total
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(estudiante, index) in estudiantes" :key="estudiante.estudiante_id" class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-white z-10">
              {{ index + 1 }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap sticky left-12 bg-white z-10">
              <div class="text-sm font-medium text-gray-900">{{ estudiante.nombre_completo }}</div>
              <div class="text-xs text-gray-500">{{ estudiante.rut }}</div>
            </td>
            <td
              v-for="fecha in fechasClases"
              :key="`${estudiante.estudiante_id}-${fecha}`"
              class="px-3 py-3 text-center whitespace-nowrap"
            >
              <span v-html="getAsistenciaIcon(estudiante.estudiante_id, fecha)"></span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap bg-gray-50">
              <span class="text-sm font-semibold" :class="getTotalClass(estudiante.estudiante_id)">
                {{ getTotalPresentes(estudiante.estudiante_id) }}/{{ fechasClases.length }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="p-8 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-600">No hay registros de asistencia aún</p>
      <p class="text-sm text-gray-500 mt-1">Los registros aparecerán aquí una vez que se registren las asistencias</p>
    </div>

    <!-- Leyenda -->
    <div v-if="fechasClases.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center gap-6 text-sm">
        <div class="flex items-center">
          <span class="text-2xl text-green-600 mr-2">✓</span>
          <span class="text-gray-700">Presente</span>
        </div>
        <div class="flex items-center">
          <span class="text-2xl text-red-600 mr-2">✗</span>
          <span class="text-gray-700">Ausente</span>
        </div>
        <div class="flex items-center">
          <span class="text-2xl text-blue-600 mr-2">—</span>
          <span class="text-gray-700">Justificado</span>
        </div>
        <div class="flex items-center">
          <span class="text-2xl text-gray-400 mr-2">○</span>
          <span class="text-gray-700">Sin registrar</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/services/api.config';

interface Props {
  asignaturaId: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const asistencias = ref<any[]>([]);
const estudiantes = ref<any[]>([]);

// Obtener fechas únicas de clases (ordenadas)
const fechasClases = computed(() => {
  const fechas = [...new Set(asistencias.value.map(a => a.fecha))];
  return fechas.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
});

onMounted(async () => {
  await loadAsistencias();
});

const loadAsistencias = async () => {
  loading.value = true;
  try {
    // Obtener todos los registros de asistencia de esta asignatura
    const response = await apiClient.get('/asistencias', {
      params: { asignatura_id: props.asignaturaId }
    });

    asistencias.value = response.data.data || response.data || [];

    // Obtener lista única de estudiantes
    const estudiantesMap = new Map();
    asistencias.value.forEach(asistencia => {
      if (asistencia.Estudiante && !estudiantesMap.has(asistencia.estudiante_id)) {
        estudiantesMap.set(asistencia.estudiante_id, {
          estudiante_id: asistencia.estudiante_id,
          nombre_completo: asistencia.Estudiante.nombre_completo,
          rut: asistencia.Estudiante.rut
        });
      }
    });

    estudiantes.value = Array.from(estudiantesMap.values()).sort((a, b) =>
      a.nombre_completo.localeCompare(b.nombre_completo)
    );
  } catch (error) {
    console.error('Error cargando asistencias:', error);
  } finally {
    loading.value = false;
  }
};

const getAsistenciaIcon = (estudianteId: string, fecha: string): string => {
  const registro = asistencias.value.find(
    a => a.estudiante_id === estudianteId && a.fecha === fecha
  );

  if (!registro) {
    // Sin registrar
    return '<span class="text-2xl text-gray-300">○</span>';
  }

  if (registro.presente) {
    // Presente
    return '<span class="text-2xl text-green-600 font-bold">✓</span>';
  } else if (registro.justificado) {
    // Justificado
    return '<span class="text-2xl text-blue-600 font-bold">—</span>';
  } else {
    // Ausente
    return '<span class="text-2xl text-red-600 font-bold">✗</span>';
  }
};

const getTotalPresentes = (estudianteId: string): number => {
  return asistencias.value.filter(
    a => a.estudiante_id === estudianteId && a.presente
  ).length;
};

const getTotalClass = (estudianteId: string): string => {
  const total = getTotalPresentes(estudianteId);
  const percentage = (total / fechasClases.value.length) * 100;

  if (percentage >= 85) return 'text-green-600';
  if (percentage >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const formatFecha = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
};

const getDiaSemana = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-CL', { weekday: 'short' }).toUpperCase();
};
</script>

<style scoped>
/* Hacer que las primeras columnas sean sticky */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th.sticky, td.sticky {
  position: sticky;
  background-color: inherit;
}

/* Asegurar que el z-index funcione correctamente */
thead th.sticky {
  z-index: 20;
}

tbody td.sticky {
  z-index: 10;
}
</style>
