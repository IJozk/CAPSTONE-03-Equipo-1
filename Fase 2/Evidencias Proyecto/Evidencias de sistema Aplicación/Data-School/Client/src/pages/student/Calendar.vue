<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mi Calendario</h1>
        <p class="text-gray-600 mt-1">Visualiza tus evaluaciones y eventos programados</p>
      </div>

      <!-- Month Navigation -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center justify-between">
          <button
            @click="previousMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="text-center">
            <h2 class="text-xl font-bold text-gray-900">{{ currentMonthName }} {{ currentYear }}</h2>
            <p class="text-sm text-gray-600">{{ totalItemsThisMonth }} eventos este mes</p>
          </div>

          <button
            @click="nextMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600">Cargando calendario...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Calendar Grid -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Days of week header -->
        <div class="grid grid-cols-7 border-b bg-gray-50">
          <div
            v-for="day in daysOfWeek"
            :key="day"
            class="px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar days -->
        <div class="grid grid-cols-7 divide-x divide-y">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="min-h-32 p-2 transition-colors"
            :class="getDayClass(day)"
          >
            <!-- Day number -->
            <div class="flex justify-between items-start mb-2">
              <span
                class="text-sm font-medium"
                :class="day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'"
              >
                {{ day.day }}
              </span>
              <span
                v-if="isToday(day)"
                class="px-2 py-0.5 text-xs font-semibold bg-primary-600 text-white rounded-full"
              >
                Hoy
              </span>
            </div>

            <!-- Items for this day -->
            <div class="space-y-1">
              <div
                v-for="item in getItemsForDay(day)"
                :key="`${item.tipo}-${item.id}`"
                @click="selectedItem = item"
                class="px-2 py-1 rounded text-xs cursor-pointer transition-all hover:shadow-md"
                :class="getItemColor(item.tipo)"
              >
                <div class="font-semibold truncate">{{ item.titulo }}</div>
                <div class="text-xs opacity-90 truncate">{{ item.asignatura || 'General' }}</div>
              </div>

              <!-- Show "+" if more than 3 items -->
              <div
                v-if="getItemsForDay(day).length > 3"
                class="text-xs text-gray-500 font-medium text-center"
              >
                +{{ getItemsForDay(day).length - 3 }} más
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="px-6 py-4 bg-gray-50 border-t">
          <div class="flex flex-wrap gap-4 text-xs">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-blue-100 border border-blue-300 mr-2"></div>
              <span class="text-gray-700">Evaluación</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-green-100 border border-green-300 mr-2"></div>
              <span class="text-gray-700">Actividad</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-purple-100 border border-purple-300 mr-2"></div>
              <span class="text-gray-700">Reunión</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 mr-2"></div>
              <span class="text-gray-700">Evento</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div
        v-if="selectedItem"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click="selectedItem = null"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold text-gray-900">Detalle</h3>
            <button
              @click="selectedItem = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedItem.titulo }}</p>
            </div>

            <div v-if="selectedItem.asignatura">
              <label class="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
              <p class="text-gray-900">{{ selectedItem.asignatura }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      :class="getItemColor(selectedItem.tipo)">
                  {{ selectedItem.tipo }}
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <p class="text-gray-900">{{ formatDate(selectedItem.fecha) }}</p>
              </div>
            </div>

            <div v-if="selectedItem.descripcion">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <p class="text-gray-700 text-sm">{{ selectedItem.descripcion }}</p>
            </div>

            <!-- Info adicional para evaluaciones -->
            <div v-if="selectedItem.tipo === 'EVALUACION' && selectedItem.detalles" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p class="text-sm text-blue-800 font-medium">📝 Evaluación</p>
              <div class="mt-2 space-y-1 text-sm text-blue-700">
                <p v-if="selectedItem.detalles.ponderacion">Ponderación: {{ selectedItem.detalles.ponderacion }}%</p>
                <p v-if="selectedItem.detalles.tipo_evaluacion">Tipo: {{ selectedItem.detalles.tipo_evaluacion }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="selectedItem = null"
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
import { useAuthStore } from '@/store/auth.store';
import evaluacionService from '@/services/evaluacion.service';
import eventoService from '@/services/evento.service';
import studentService from '@/services/student.service';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const calendarItems = ref<any[]>([]);
const selectedItem = ref<any | null>(null);
const cursoId = ref<string | null>(null);

const estudianteId = computed(() => authStore.user?.estudiante_profile?.estudiante_id);

// Current month/year state
const currentMonth = ref(new Date().getMonth()); // 0-11
const currentYear = ref(new Date().getFullYear());

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Computed
const currentMonthName = computed(() => monthNames[currentMonth.value]);

const totalItemsThisMonth = computed(() => {
  return calendarItems.value.filter(item => {
    const itemDate = new Date(item.fecha);
    return itemDate.getMonth() === currentMonth.value && itemDate.getFullYear() === currentYear.value;
  }).length;
});

interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
}

const calendarDays = computed((): CalendarDay[] => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days: CalendarDay[] = [];

  // Previous month days
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      date: new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      date: new Date(currentYear.value, currentMonth.value, i),
      isCurrentMonth: true
    });
  }

  // Next month days to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      date: new Date(currentYear.value, currentMonth.value + 1, i),
      isCurrentMonth: false
    });
  }

  return days;
});

// Methods
const isToday = (day: CalendarDay): boolean => {
  const today = new Date();
  return (
    day.date.getDate() === today.getDate() &&
    day.date.getMonth() === today.getMonth() &&
    day.date.getFullYear() === today.getFullYear()
  );
};

const getDayClass = (day: CalendarDay): string => {
  const classes = [];

  if (!day.isCurrentMonth) {
    classes.push('bg-gray-50');
  } else {
    classes.push('bg-white hover:bg-gray-50');
  }

  if (isToday(day)) {
    classes.push('ring-2 ring-primary-500 ring-inset');
  }

  return classes.join(' ');
};

const getItemsForDay = (day: CalendarDay): any[] => {
  return calendarItems.value.filter(item => {
    const itemDate = new Date(item.fecha);
    return (
      itemDate.getDate() === day.date.getDate() &&
      itemDate.getMonth() === day.date.getMonth() &&
      itemDate.getFullYear() === day.date.getFullYear()
    );
  }).slice(0, 3); // Show max 3 items per day
};

const getItemColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    EVALUACION: 'bg-blue-100 text-blue-800 border-blue-300',
    ACTIVIDAD: 'bg-green-100 text-green-800 border-green-300',
    REUNION: 'bg-purple-100 text-purple-800 border-purple-300',
    EVENTO: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    OTRO: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return colors[tipo] || colors.OTRO;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

// Load calendar data
const loadCalendarData = async () => {
  if (!estudianteId.value) {
    console.warn('⚠️ No se encontró el ID del estudiante');
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    console.log('📅 Cargando calendario para estudiante:', estudianteId.value);

    // Obtener el curso desde el dashboard (método confiable)
    const dashboard = await studentService.getDashboard(estudianteId.value);
    console.log('📊 Dashboard recibido:', dashboard);

    // El curso_id está en dashboard.curso.curso_id
    const cursoIdFromBackend = dashboard.curso?.curso_id;

    console.log('📚 Curso del estudiante encontrado:', cursoIdFromBackend);

    if (!cursoIdFromBackend) {
      console.error('❌ No se pudo obtener el curso_id');
      error.value = 'No tienes un curso asignado. Contacta con administración.';
      return;
    }

    cursoId.value = cursoIdFromBackend;

    // Cargar todas las evaluaciones y eventos
    const [todasEvaluaciones, eventos] = await Promise.all([
      evaluacionService.getAll({ estado_activo: true }).catch((err) => {
        console.error('Error cargando evaluaciones:', err);
        return [];
      }),
      eventoService.getAll().catch((err) => {
        console.error('Error cargando eventos:', err);
        return [];
      })
    ]);

    console.log('📋 Total de evaluaciones en sistema:', todasEvaluaciones.length);
    console.log('🎉 Total de eventos en sistema:', eventos.length);

    // Filtrar solo las evaluaciones del curso del estudiante
    const evaluacionesDelCurso = todasEvaluaciones.filter(ev => {
      // Verificar si la asignatura pertenece al curso del estudiante
      const asignatura = ev.asignatura || (ev as any).Asignatura;

      // El backend devuelve Asignatura con la relación Curso anidada
      const curso = asignatura?.Curso || (asignatura as any)?.curso;
      const asignaturaCursoId = curso?.curso_id || asignatura?.curso_id;

      console.log('🔍 Evaluación:', ev.nombre, '| Asignatura:', asignatura?.nombre, '| Curso ID:', asignaturaCursoId);

      return asignaturaCursoId === cursoIdFromBackend;
    });

    console.log('✅ Evaluaciones filtradas del curso:', evaluacionesDelCurso.length);

    // Procesar evaluaciones del curso
    const evaluacionesItems = evaluacionesDelCurso.map(ev => ({
      id: ev.evaluacion_id,
      tipo: 'EVALUACION',
      titulo: ev.nombre,
      descripcion: ev.descripcion || 'Evaluación programada',
      fecha: ev.fecha_evaluacion,
      asignatura: ev.asignatura?.nombre || (ev as any).Asignatura?.nombre || 'Sin asignatura',
      detalles: {
        ponderacion: ev.porcentaje_nota,
        tipo_evaluacion: ev.tipo,
        puntaje_maximo: ev.puntaje_maximo
      }
    }));

    // Procesar eventos (todos los eventos son visibles para todos)
    const eventosItems = eventos.map(ev => ({
      id: ev.evento_id,
      tipo: 'EVENTO',
      titulo: ev.nombre || 'Sin título',
      descripcion: `Evento en ${ev.lugar || 'ubicación por definir'}`,
      fecha: ev.fecha_inicio || new Date().toISOString(),
      asignatura: null
    }));

    // Combinar y ordenar por fecha
    calendarItems.value = [...evaluacionesItems, ...eventosItems].sort((a, b) => {
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });

    console.log('📅 Total de items en calendario:', calendarItems.value.length);

  } catch (err: any) {
    error.value = err.message || 'Error al cargar el calendario';
    console.error('❌ Error loading calendar:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCalendarData();
});
</script>
