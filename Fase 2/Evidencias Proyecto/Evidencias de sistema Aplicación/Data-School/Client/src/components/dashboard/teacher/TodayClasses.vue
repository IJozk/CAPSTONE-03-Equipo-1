<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center">
        <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Clases de Hoy
      </h2>
      <span class="text-sm text-gray-500">
        {{ new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="teacherStore.loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse flex gap-4">
        <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- No Classes -->
    <div v-else-if="!todayClasses.length" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-500">No hay clases programadas para hoy</p>
    </div>

    <!-- Classes Timeline -->
    <div v-else class="relative">
      <!-- Timeline line -->
      <div class="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <!-- Classes -->
      <div class="space-y-6">
        <div
          v-for="(clase, index) in todayClasses"
          :key="index"
          class="relative flex gap-4 group"
        >
          <!-- Time Badge -->
          <div
            class="relative z-10 flex-shrink-0 w-20 h-20 rounded-lg flex flex-col items-center justify-center text-white font-semibold shadow-md"
            :class="getStatusColor(clase.estado).badge"
          >
            <span class="text-xs">{{ formatTime(clase.hora_inicio) }}</span>
            <span class="text-lg">-</span>
            <span class="text-xs">{{ formatTime(clase.hora_termino) }}</span>
          </div>

          <!-- Status dot on timeline -->
          <div
            class="absolute left-10 top-10 w-3 h-3 rounded-full border-4 border-white transform -translate-x-1/2 -translate-y-1/2"
            :class="getStatusColor(clase.estado).dot"
          ></div>

          <!-- Class Info Card -->
          <div
            class="flex-1 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 border-l-4"
            :class="getStatusColor(clase.estado).border"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-bold text-gray-900 text-lg">{{ clase.asignatura }}</h3>
                <p class="text-sm text-gray-600">{{ clase.curso }} - Sala {{ clase.sala }}</p>
              </div>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getStatusColor(clase.estado).badge"
              >
                {{ getStatusText(clase.estado) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 mt-3">
              <!-- Solo mostrar botón si la clase está en progreso o ya pasó -->
              <button
                v-if="clase.estado === 'en_progreso' || clase.estado === 'completada'"
                class="flex items-center gap-1 px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                :class="clase.estado === 'en_progreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'"
                @click="handleRegisterAttendance(clase)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span v-if="clase.estado === 'en_progreso'">Registrar Asistencia (En Curso)</span>
                <span v-else>Registrar Asistencia</span>
              </button>
              <span
                v-else
                class="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Disponible a las {{ formatTime(clase.hora_inicio) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import { useRouter } from 'vue-router';
import type { TodayClass, ClassStatus } from '@/types/teacher.types';

const teacherStore = useTeacherStore();
const router = useRouter();

// Computed que calcula el estado de cada clase basándose en la hora actual
const todayClasses = computed(() => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutos desde medianoche

  return teacherStore.todayClasses.map(clase => {
    const [startHour, startMin] = clase.hora_inicio.split(':').map(Number);
    const [endHour, endMin] = clase.hora_termino.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    let estado: ClassStatus;
    if (currentTime < startTime) {
      estado = 'proxima';
    } else if (currentTime >= startTime && currentTime <= endTime) {
      estado = 'en_progreso';
    } else {
      estado = 'completada';
    }

    return {
      ...clase,
      estado
    };
  });
});

onMounted(async () => {
  if (!teacherStore.upcoming) {
    await teacherStore.fetchUpcoming();
  }
});

const formatTime = (time: string): string => {
  return time.substring(0, 5); // HH:MM
};

const getStatusText = (status?: ClassStatus): string => {
  const statusMap = {
    'en_progreso': 'En Progreso',
    'proxima': 'Próxima',
    'completada': 'Completada'
  };
  return statusMap[status || 'proxima'] || 'Próxima';
};

const getStatusColor = (status?: ClassStatus) => {
  const colorMap = {
    'en_progreso': {
      badge: 'bg-green-500 text-white',
      dot: 'bg-green-500',
      border: 'border-green-500'
    },
    'proxima': {
      badge: 'bg-blue-500 text-white',
      dot: 'bg-blue-500',
      border: 'border-blue-500'
    },
    'completada': {
      badge: 'bg-gray-400 text-white',
      dot: 'bg-gray-400',
      border: 'border-gray-400'
    }
  };
  return colorMap[status || 'proxima'] || colorMap['proxima'];
};

const handleRegisterAttendance = (clase: TodayClass) => {
  if (!clase.asignatura_id) {
    alert('No se puede registrar asistencia: falta información de la asignatura');
    return;
  }

  // Navegar a la página de registro de asistencia con la fecha de hoy
  const today = new Date().toISOString().split('T')[0];
  router.push({
    name: 'TeacherAttendance',
    query: {
      asignatura_id: clase.asignatura_id,
      fecha: today
    }
  });
};
</script>
