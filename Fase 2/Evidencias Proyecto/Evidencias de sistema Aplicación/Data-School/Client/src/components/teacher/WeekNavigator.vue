<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <!-- Previous week button -->
      <button
        @click="previousWeek"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Semana anterior"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Week info -->
      <div class="text-center">
        <h2 class="text-lg font-bold text-gray-900">{{ weekTitle }}</h2>
        <p class="text-sm text-gray-600">{{ weekRange }}</p>
      </div>

      <!-- Next week button -->
      <button
        @click="nextWeek"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Semana siguiente"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Today button -->
    <div class="mt-3 flex justify-center">
      <button
        v-if="!isCurrentWeek"
        @click="goToToday"
        class="px-4 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
      >
        Ir a hoy
      </button>
      <span v-else class="px-4 py-2 text-sm text-primary-600 font-medium">
        Semana actual
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentDate: Date;
}

interface Emits {
  (e: 'update:currentDate', value: Date): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Get Monday of the week
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

// Get Sunday of the week
const getSunday = (date: Date): Date => {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
};

const mondayOfWeek = computed(() => getMonday(props.currentDate));
const sundayOfWeek = computed(() => getSunday(props.currentDate));

const weekTitle = computed(() => {
  const monday = mondayOfWeek.value;
  const monthName = monday.toLocaleDateString('es-CL', { month: 'long' });
  const year = monday.getFullYear();
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
});

const weekRange = computed(() => {
  const monday = mondayOfWeek.value;
  const sunday = sundayOfWeek.value;

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

  return `${formatDay(monday)} - ${formatDay(sunday)}`;
});

const isCurrentWeek = computed(() => {
  const today = new Date();
  const currentMonday = getMonday(today);
  const selectedMonday = getMonday(props.currentDate);

  return currentMonday.getTime() === selectedMonday.getTime();
});

const previousWeek = () => {
  const newDate = new Date(props.currentDate);
  newDate.setDate(newDate.getDate() - 7);
  emit('update:currentDate', newDate);
};

const nextWeek = () => {
  const newDate = new Date(props.currentDate);
  newDate.setDate(newDate.getDate() + 7);
  emit('update:currentDate', newDate);
};

const goToToday = () => {
  emit('update:currentDate', new Date());
};
</script>
