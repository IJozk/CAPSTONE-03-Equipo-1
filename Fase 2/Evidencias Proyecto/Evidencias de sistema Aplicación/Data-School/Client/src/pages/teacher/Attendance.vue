<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Registro de Asistencia</h1>
        <p class="text-gray-600 mt-1">Visualiza y registra la asistencia de tus clases semanales</p>
      </div>

      <!-- Week Navigator -->
      <div class="mb-6">
        <WeekNavigator
          :current-date="currentDate"
          @update:current-date="currentDate = $event"
        />
      </div>

      <!-- Legend -->
      <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 class="text-sm font-medium text-gray-900 mb-3">Estado de las clases:</h3>
        <div class="flex flex-wrap gap-4 text-xs">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span class="text-gray-700">Asistencia registrada</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span class="text-gray-700">En curso</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span class="text-gray-700">Sin registrar (pasada)</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span class="text-gray-700">Próxima (hoy)</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
            <span class="text-gray-700">Programada (futura)</span>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loadingClasses" class="space-y-4">
        <div v-for="day in 5" :key="day">
          <div class="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="i in 3" :key="i" class="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Weekly schedule grid -->
      <div v-else-if="Object.keys(classesByDay).length > 0" class="space-y-6">
        <div v-for="(classes, day) in classesByDay" :key="day">
          <!-- Day header -->
          <div class="flex items-center mb-3">
            <h2 class="text-lg font-bold text-gray-900">{{ getDayName(Number(day)) }}</h2>
            <span class="ml-3 text-sm text-gray-600">{{ getDayDate(Number(day)) }}</span>
            <span class="ml-auto text-sm font-medium" :class="getDayStatsClass(classes)">
              {{ getDayStats(classes) }}
            </span>
          </div>

          <!-- Classes grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ClassCard
              v-for="clase in classes"
              :key="clase.clase_id || `${clase.horario_id}-${clase.fecha}`"
              :clase="clase"
              @click="openAttendancePanel(clase)"
            />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay clases programadas</h3>
        <p class="text-gray-600">No se encontraron clases para esta semana</p>
      </div>

      <!-- Quick Attendance Panel -->
      <AttendanceQuickPanel
        :is-open="isPanelOpen"
        :clase="selectedClase"
        :students="currentStudents"
        :loading="loadingStudents"
        @close="closeAttendancePanel"
        @save="handleSaveAttendance"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTeacherStore } from '@/store/teacher.store';
import { useAuthStore } from '@/store/auth.store';
import teacherService from '@/services/teachertools.service';
import apiClient from '@/services/api.config';
import WeekNavigator from '@/components/teacher/WeekNavigator.vue';
import ClassCard from '@/components/teacher/ClassCard.vue';
import AttendanceQuickPanel from '@/components/teacher/AttendanceQuickPanel.vue';
import type { WeeklyClass, AttendanceRecord } from '@/types/teacher.types';

const router = useRouter();
const teacherStore = useTeacherStore();
const authStore = useAuthStore();

const currentDate = ref(new Date());
const loadingClasses = ref(false);
const loadingStudents = ref(false);
const weeklyClasses = ref<WeeklyClass[]>([]);
const isPanelOpen = ref(false);
const selectedClase = ref<WeeklyClass | null>(null);
const currentStudents = ref<AttendanceRecord[]>([]);

// Group classes by day of week
const classesByDay = computed(() => {
  const grouped: Record<number, WeeklyClass[]> = {};

  weeklyClasses.value.forEach(clase => {
    if (!grouped[clase.dia_semana]) {
      grouped[clase.dia_semana] = [];
    }
    grouped[clase.dia_semana].push(clase);
  });

  // Sort classes by time within each day
  Object.keys(grouped).forEach(day => {
    grouped[Number(day)].sort((a, b) => {
      return a.hora_inicio.localeCompare(b.hora_inicio);
    });
  });

  // Sort days (Monday to Friday)
  const sortedGrouped: Record<number, WeeklyClass[]> = {};
  [1, 2, 3, 4, 5, 6, 7].forEach(day => {
    if (grouped[day]) {
      sortedGrouped[day] = grouped[day];
    }
  });

  return sortedGrouped;
});

const getDayName = (dayNumber: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayNumber === 7 ? 0 : dayNumber];
};

const getDayDate = (dayNumber: number): string => {
  const monday = getMonday(currentDate.value);
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + (dayNumber - 1));

  return targetDate.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long'
  });
};

const getDayStats = (classes: WeeklyClass[]): string => {
  const total = classes.length;
  const registered = classes.filter(c => c.asistencia_registrada).length;

  if (registered === total) {
    return `✓ ${registered}/${total} registradas`;
  } else if (registered > 0) {
    return `${registered}/${total} registradas`;
  } else {
    return `${total} clases`;
  }
};

const getDayStatsClass = (classes: WeeklyClass[]): string => {
  const total = classes.length;
  const registered = classes.filter(c => c.asistencia_registrada).length;

  if (registered === total) {
    return 'text-green-600';
  } else if (registered > 0) {
    return 'text-orange-600';
  } else {
    return 'text-gray-600';
  }
};

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const openAttendancePanel = async (clase: WeeklyClass) => {
  selectedClase.value = clase;
  isPanelOpen.value = true;

  // Load students for this class
  loadingStudents.value = true;
  try {
    // Fetch students from the subject using existing service
    const students = await teacherService.getSubjectStudents(clase.asignatura_id);

    // Map students to attendance records
    currentStudents.value = students.map(student => ({
      estudiante_id: student.estudiante_id,
      nombre_completo: student.nombre_completo,
      numero_lista: student.numero_lista,
      rut: student.rut,
      presente: false,
      retraso_minutos: 0,
      retiro_anticipado_minutos: 0,
      justificado: false,
      observaciones: ''
    }));

    // If attendance already registered, load existing data
    if (clase.asistencia_registrada) {
      await loadExistingAttendance(clase);
    }
  } catch (error) {
    console.error('Error loading students:', error);
  } finally {
    loadingStudents.value = false;
  }
};

const closeAttendancePanel = () => {
  isPanelOpen.value = false;
  selectedClase.value = null;
  currentStudents.value = [];
};

const handleSaveAttendance = async (data: { clase: WeeklyClass; attendance: AttendanceRecord[] }) => {
  try {
    // Save attendance using existing service
    await teacherService.saveAttendance({
      fecha: data.clase.fecha,
      asignatura_id: data.clase.asignatura_id,
      asistencias: data.attendance
    });

    // Update the class in the list
    const claseIndex = weeklyClasses.value.findIndex(
      c => c.clase_id === data.clase.clase_id ||
      (c.horario_id === data.clase.horario_id && c.fecha === data.clase.fecha)
    );

    if (claseIndex !== -1) {
      weeklyClasses.value[claseIndex].asistencia_registrada = true;
      weeklyClasses.value[claseIndex].presentes = data.attendance.filter(a => a.presente).length;
      weeklyClasses.value[claseIndex].ausentes = data.attendance.filter(a => !a.presente).length;
    }

    closeAttendancePanel();
    alert('Asistencia guardada exitosamente');
  } catch (error) {
    console.error('Error saving attendance:', error);
    alert('Error al guardar la asistencia');
  }
};

const loadExistingAttendance = async (clase: WeeklyClass) => {
  try {
    // TODO: Implement actual API call to load existing attendance for this specific class
    // This would require a new backend endpoint
    console.log('Loading existing attendance for clase:', clase.clase_id);
  } catch (error) {
    console.error('Error loading existing attendance:', error);
  }
};

const loadWeeklyClasses = async () => {
  loadingClasses.value = true;

  try {
    const monday = getMonday(currentDate.value);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fechaInicio = monday.toISOString().split('T')[0];
    const fechaFin = sunday.toISOString().split('T')[0];

    // Obtener ID del profesor desde el authStore
    const profesorId = authStore.user?.profesor_profile?.profesor_id;

    if (!profesorId) {
      console.error('No se encontró el ID del profesor en authStore', authStore.user);
      weeklyClasses.value = [];
      return;
    }

    // Llamar al endpoint usando apiClient (maneja automáticamente la autenticación)
    const response = await apiClient.get(`/clases/teacher/${profesorId}`, {
      params: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }
    });

    weeklyClasses.value = response.data;

  } catch (error) {
    console.error('Error loading weekly classes:', error);
    weeklyClasses.value = [];
  } finally {
    loadingClasses.value = false;
  }
};

// Watch for date changes
watch(currentDate, () => {
  loadWeeklyClasses();
});

// Load initial data
onMounted(() => {
  loadWeeklyClasses();
});
</script>
