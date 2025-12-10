<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div
      v-if="isOpen"
      @click="$emit('close')"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
    />
  </Transition>

  <!-- Side Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 overflow-y-auto"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-primary-600 text-white p-6 shadow-lg z-10">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-1">{{ clase?.asignatura_nombre }}</h2>
            <p class="text-primary-100">{{ clase?.curso_nivel }} {{ clase?.curso_nombre }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex items-center space-x-4 text-sm">
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(clase?.fecha || '') }}
          </div>
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formatTime(clase?.hora_inicio || '') }} - {{ formatTime(clase?.hora_termino || '') }}
          </div>
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {{ clase?.sala || 'Sin sala' }}
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Loading state -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse">
            <div class="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <!-- Quick actions -->
        <div v-else class="mb-6 flex flex-wrap gap-2">
          <button
            @click="markAllPresent"
            class="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Marcar todos presentes
          </button>
          <button
            @click="markAllAbsent"
            class="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            Marcar todos ausentes
          </button>
          <button
            @click="clearAll"
            class="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar
          </button>
        </div>

        <!-- Stats -->
        <div class="mb-6 grid grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-blue-600">{{ stats.total }}</p>
            <p class="text-sm text-blue-700">Total</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-green-600">{{ stats.presentes }}</p>
            <p class="text-sm text-green-700">Presentes</p>
          </div>
          <div class="bg-red-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-red-600">{{ stats.ausentes }}</p>
            <p class="text-sm text-red-700">Ausentes</p>
          </div>
        </div>

        <!-- Student list -->
        <div class="space-y-2">
          <div
            v-for="student in attendanceRecords"
            :key="student.estudiante_id"
            class="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div class="flex items-center justify-between">
              <!-- Student info -->
              <div class="flex items-center flex-1">
                <span class="text-sm font-bold text-gray-500 w-8">{{ student.numero_lista }}</span>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ student.nombre_completo }}</p>
                  <p class="text-xs text-gray-500">{{ student.rut }}</p>
                </div>
              </div>

              <!-- Attendance toggle -->
              <div class="flex items-center space-x-2">
                <button
                  @click="toggleAttendance(student)"
                  class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :class="student.presente ? 'bg-green-500' : 'bg-red-500'"
                >
                  <span
                    class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                    :class="student.presente ? 'translate-x-7' : 'translate-x-1'"
                  />
                </button>
                <button
                  @click="expandStudent(student)"
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  :title="expandedStudentId === student.estudiante_id ? 'Ocultar detalles' : 'Más opciones'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Expanded details -->
            <Transition name="expand">
              <div v-if="expandedStudentId === student.estudiante_id" class="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Retraso (min)</label>
                    <input
                      v-model.number="student.retraso_minutos"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Retiro (min)</label>
                    <input
                      v-model.number="student.retiro_anticipado_minutos"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label class="flex items-center text-sm">
                    <input
                      v-model="student.justificado"
                      type="checkbox"
                      class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span class="ml-2 text-gray-700">Justificado</span>
                  </label>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    v-model="student.observaciones"
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Observaciones adicionales..."
                  ></textarea>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Save button -->
        <div class="sticky bottom-0 bg-white pt-6 pb-2 border-t border-gray-200 mt-6">
          <button
            @click="saveAttendance"
            :disabled="saving"
            class="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
          >
            <svg v-if="!saving" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Guardando...' : 'Guardar Asistencia' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { WeeklyClass, AttendanceRecord } from '@/types/teacher.types';

interface Props {
  isOpen: boolean;
  clase: WeeklyClass | null;
  students: AttendanceRecord[];
  loading?: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: { clase: WeeklyClass; attendance: AttendanceRecord[] }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const attendanceRecords = ref<AttendanceRecord[]>([]);
const expandedStudentId = ref<string | null>(null);
const saving = ref(false);

// Initialize attendance records when students change
watch(() => props.students, (newStudents) => {
  attendanceRecords.value = JSON.parse(JSON.stringify(newStudents));
}, { immediate: true });

const stats = computed(() => {
  const total = attendanceRecords.value.length;
  const presentes = attendanceRecords.value.filter(s => s.presente).length;
  const ausentes = total - presentes;

  return { total, presentes, ausentes };
});

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (time: string): string => {
  return time.substring(0, 5);
};

const toggleAttendance = (student: AttendanceRecord) => {
  student.presente = !student.presente;
};

const expandStudent = (student: AttendanceRecord) => {
  if (expandedStudentId.value === student.estudiante_id) {
    expandedStudentId.value = null;
  } else {
    expandedStudentId.value = student.estudiante_id;
  }
};

const markAllPresent = () => {
  attendanceRecords.value.forEach(student => {
    student.presente = true;
  });
};

const markAllAbsent = () => {
  attendanceRecords.value.forEach(student => {
    student.presente = false;
  });
};

const clearAll = () => {
  attendanceRecords.value.forEach(student => {
    student.presente = false;
    student.retraso_minutos = 0;
    student.retiro_anticipado_minutos = 0;
    student.justificado = false;
    student.observaciones = '';
  });
  expandedStudentId.value = null;
};

const saveAttendance = async () => {
  if (!props.clase) return;

  saving.value = true;
  try {
    emit('save', {
      clase: props.clase,
      attendance: attendanceRecords.value
    });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
/* Overlay transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
