<template>
  <div
    @click="$emit('click', clase)"
    class="relative bg-white rounded-lg border-l-4 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    :class="borderColorClass"
  >
    <!-- Status badge -->
    <div class="absolute top-2 right-2">
      <span
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        :class="statusBadgeClass"
      >
        <span class="w-2 h-2 rounded-full mr-1" :class="statusDotClass"></span>
        {{ statusText }}
      </span>
    </div>

    <!-- Time -->
    <div class="flex items-center text-sm text-gray-600 mb-2">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-medium">{{ formatTime(clase.hora_inicio) }} - {{ formatTime(clase.hora_termino) }}</span>
    </div>

    <!-- Subject name -->
    <h3 class="text-base font-bold text-gray-900 mb-1 pr-20">
      {{ clase.asignatura_nombre }}
    </h3>

    <!-- Course -->
    <p class="text-sm text-gray-600 mb-2">
      {{ clase.curso_nivel }} {{ clase.curso_nombre }}
    </p>

    <!-- Classroom -->
    <div class="flex items-center text-xs text-gray-500 mb-3">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      {{ clase.sala || 'Sin sala' }}
    </div>

    <!-- Attendance stats (if registered) -->
    <div v-if="clase.asistencia_registrada && clase.total_estudiantes" class="flex items-center space-x-3 text-xs">
      <div class="flex items-center text-green-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">{{ clase.presentes || 0 }}</span>
      </div>
      <div class="flex items-center text-red-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">{{ clase.ausentes || 0 }}</span>
      </div>
      <div class="text-gray-600">
        de {{ clase.total_estudiantes }}
      </div>
    </div>

    <!-- No attendance message -->
    <div v-else-if="!clase.asistencia_registrada && isPast" class="flex items-center text-xs text-orange-600">
      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span>Sin asistencia registrada</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WeeklyClass } from '@/types/teacher.types';

interface Props {
  clase: WeeklyClass;
}

const props = defineProps<Props>();
defineEmits<{
  (e: 'click', clase: WeeklyClass): void;
}>();

const formatTime = (time: string): string => {
  // time format: HH:MM:SS -> HH:MM
  return time.substring(0, 5);
};

const isPast = computed(() => {
  const now = new Date();
  const classDate = new Date(props.clase.fecha);
  const [hours, minutes] = props.clase.hora_termino.split(':').map(Number);
  classDate.setHours(hours, minutes, 0);
  return classDate < now;
});

const isToday = computed(() => {
  const today = new Date();
  const classDate = new Date(props.clase.fecha);
  return today.toDateString() === classDate.toDateString();
});

const isInProgress = computed(() => {
  if (!isToday.value) return false;

  const now = new Date();
  const [startHours, startMinutes] = props.clase.hora_inicio.split(':').map(Number);
  const [endHours, endMinutes] = props.clase.hora_termino.split(':').map(Number);

  const startTime = new Date();
  startTime.setHours(startHours, startMinutes, 0);

  const endTime = new Date();
  endTime.setHours(endHours, endMinutes, 0);

  return now >= startTime && now <= endTime;
});

const statusText = computed(() => {
  if (props.clase.asistencia_registrada) return 'Registrada';
  if (isInProgress.value) return 'En curso';
  if (isPast.value) return 'Pendiente';
  if (isToday.value) return 'Próxima';
  return 'Programada';
});

const statusBadgeClass = computed(() => {
  if (props.clase.asistencia_registrada) return 'bg-green-100 text-green-800';
  if (isInProgress.value) return 'bg-blue-100 text-blue-800';
  if (isPast.value) return 'bg-orange-100 text-orange-800';
  if (isToday.value) return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-600';
});

const statusDotClass = computed(() => {
  if (props.clase.asistencia_registrada) return 'bg-green-500';
  if (isInProgress.value) return 'bg-blue-500 animate-pulse';
  if (isPast.value) return 'bg-orange-500';
  if (isToday.value) return 'bg-purple-500';
  return 'bg-gray-400';
});

const borderColorClass = computed(() => {
  if (props.clase.asistencia_registrada) return 'border-green-500 hover:border-green-600';
  if (isInProgress.value) return 'border-blue-500 hover:border-blue-600';
  if (isPast.value) return 'border-orange-500 hover:border-orange-600';
  if (isToday.value) return 'border-purple-500 hover:border-purple-600';
  return 'border-gray-300 hover:border-gray-400';
});
</script>
