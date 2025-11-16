<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mi Horario</h1>
        <p class="text-gray-600 mt-1">Visualiza tu horario semanal de clases</p>
      </div>

      <!-- Week Navigation -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center justify-between">
          <button
            @click="previousWeek"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="text-center">
            <h2 class="text-xl font-bold text-gray-900">{{ weekRangeText }}</h2>
            <p class="text-sm text-gray-600">{{ totalClassesThisWeek }} clases esta semana</p>
          </div>

          <button
            @click="nextWeek"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="flex justify-center mt-3">
          <button
            @click="goToCurrentWeek"
            class="px-4 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Ir a semana actual
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600">Cargando horario...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Weekly Schedule Grid -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24 sticky left-0 bg-gray-50 z-10">
                  Hora
                </th>
                <th
                  v-for="day in daysOfWeek"
                  :key="day.number"
                  class="px-4 py-3 text-center text-xs font-semibold uppercase border-l"
                  :class="isToday(day.number) ? 'bg-primary-50 text-primary-700' : 'text-gray-600'"
                >
                  <div>{{ day.name }}</div>
                  <div class="text-xs font-normal mt-1" :class="isToday(day.number) ? 'text-primary-600' : 'text-gray-500'">
                    {{ formatDayDate(day.number) }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="timeSlot in timeSlots" :key="timeSlot.start" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap sticky left-0 bg-white border-r">
                  {{ timeSlot.start }} - {{ timeSlot.end }}
                </td>
                <td
                  v-for="day in daysOfWeek"
                  :key="`${day.number}-${timeSlot.start}`"
                  class="px-2 py-2 border-l align-top"
                  :class="isToday(day.number) ? 'bg-primary-50/30' : ''"
                >
                  <div
                    v-for="classItem in getClassForSlot(day.number, timeSlot.start)"
                    :key="classItem.horario_id"
                    class="p-3 rounded-lg mb-2 last:mb-0 cursor-pointer transition-all hover:shadow-md"
                    :class="getClassColor(classItem)"
                    @click="selectedClass = classItem"
                  >
                    <div class="font-semibold text-sm mb-1">{{ classItem.asignatura.nombre }}</div>
                    <div class="text-xs opacity-90 mb-1">{{ classItem.asignatura.curso }}</div>
                    <div class="text-xs opacity-75 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {{ classItem.asignatura.sala }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="schedule.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay clases programadas</h3>
          <p class="text-gray-600">Aún no tienes clases asignadas en tu horario</p>
        </div>
      </div>

      <!-- Class Detail Modal -->
      <div
        v-if="selectedClass"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click="selectedClass = null"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold text-gray-900">Detalle de Clase</h3>
            <button
              @click="selectedClass = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedClass.asignatura.nombre }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <p class="text-gray-900">{{ selectedClass.asignatura.curso }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Día</label>
                <p class="text-gray-900">{{ getDayName(selectedClass.dia_semana) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                <p class="text-gray-900">{{ selectedClass.asignatura.sala }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Horario</label>
              <p class="text-gray-900">{{ selectedClass.hora_inicio }} - {{ selectedClass.hora_termino }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="selectedClass = null"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import teacherService from '@/services/teachertools.service';
import type { Schedule } from '@/types/teacher.types';

const loading = ref(false);
const error = ref('');
const schedule = ref<Schedule[]>([]);
const selectedClass = ref<Schedule | null>(null);

// Week state - start from Sunday
const currentWeekStart = ref<Date>(getWeekStart(new Date()));

// Days of week starting from Sunday
const daysOfWeek = [
  { number: 7, name: 'Dom' }, // Domingo
  { number: 1, name: 'Lun' }, // Lunes
  { number: 2, name: 'Mar' }, // Martes
  { number: 3, name: 'Mié' }, // Miércoles
  { number: 4, name: 'Jue' }, // Jueves
  { number: 5, name: 'Vie' }, // Viernes
  { number: 6, name: 'Sáb' }  // Sábado
];

// Time slots for the schedule (8:00 AM to 6:00 PM in 1-hour blocks)
const timeSlots = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' }
];

// Helper function to get the Sunday of the current week
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day; // Days since Sunday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Computed
const weekRangeText = computed(() => {
  const start = new Date(currentWeekStart.value);
  const end = new Date(currentWeekStart.value);
  end.setDate(end.getDate() + 6);

  const startStr = start.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });

  return `${startStr} - ${endStr}`;
});

const totalClassesThisWeek = computed(() => {
  return schedule.value.length;
});

// Methods
const isToday = (dayNumber: number): boolean => {
  const today = new Date();
  const todayDay = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7

  // Check if we're viewing the current week
  const weekStart = getWeekStart(today);
  const isCurrentWeek = currentWeekStart.value.getTime() === weekStart.getTime();

  return isCurrentWeek && todayDay === dayNumber;
};

const formatDayDate = (dayNumber: number): string => {
  const date = new Date(currentWeekStart.value);
  // dayNumber: 7=Dom, 1=Lun, ..., 6=Sáb
  const offset = dayNumber === 7 ? 0 : dayNumber;
  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
};

const getDayName = (dayNumber: number): string => {
  const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return dayNames[dayNumber] || '';
};

const getClassForSlot = (dayNumber: number, timeStart: string): Schedule[] => {
  return schedule.value.filter(item => {
    if (item.dia_semana !== dayNumber) return false;

    // Check if the class time overlaps with this slot
    const classStart = item.hora_inicio.substring(0, 5); // Get HH:MM format
    return classStart === timeStart;
  });
};

const getClassColor = (classItem: Schedule): string => {
  // Color based on the subject (you can customize this logic)
  const colors = [
    'bg-blue-100 text-blue-800 border border-blue-300',
    'bg-green-100 text-green-800 border border-green-300',
    'bg-purple-100 text-purple-800 border border-purple-300',
    'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'bg-pink-100 text-pink-800 border border-pink-300',
    'bg-indigo-100 text-indigo-800 border border-indigo-300'
  ];

  // Use subject name hash to consistently assign colors
  const hash = classItem.asignatura.nombre.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const previousWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() - 7);
  currentWeekStart.value = newDate;
};

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() + 7);
  currentWeekStart.value = newDate;
};

const goToCurrentWeek = () => {
  currentWeekStart.value = getWeekStart(new Date());
};

// Load schedule
const loadSchedule = async () => {
  loading.value = true;
  error.value = '';

  try {
    console.log('Cargando horario semanal del profesor...');
    schedule.value = await teacherService.getMySchedule();
    console.log('Horario cargado:', schedule.value.length, 'clases');
  } catch (err: any) {
    error.value = err.message || 'Error al cargar el horario';
    console.error('Error loading schedule:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSchedule();
});
</script>
