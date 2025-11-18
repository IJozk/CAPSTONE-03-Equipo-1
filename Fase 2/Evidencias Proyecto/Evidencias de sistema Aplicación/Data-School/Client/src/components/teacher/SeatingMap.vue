<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200">
    <!-- Header con controles -->
    <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Mapa de Asientos</h2>
          <p class="text-sm text-gray-600 mt-1">{{ curso?.nombre }} - Sala {{ sala?.nombre || 'No asignada' }}</p>
        </div>

        <!-- Controles de visualización -->
        <div class="flex items-center gap-3">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
            <button
              v-for="mode in viewModes"
              :key="mode.id"
              @click="currentViewMode = mode.id"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                currentViewMode === mode.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center gap-2">
                <component :is="mode.icon" class="w-4 h-4" />
                <span>{{ mode.label }}</span>
              </div>
            </button>
          </div>

          <button
            @click="toggleEditMode"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
              editMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {{ editMode ? 'Modo Edición' : 'Editar Asientos' }}
          </button>
        </div>
      </div>

      <!-- Leyenda según modo -->
      <div v-if="currentViewMode !== 'normal'" class="mt-4 p-3 bg-white rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{{ getLegendTitle }}</span>
          <div class="flex items-center gap-2">
            <template v-if="currentViewMode === 'performance'">
              <div class="flex items-center gap-1">
                <div class="w-6 h-6 rounded bg-red-500"></div>
                <span class="text-xs text-gray-600">Bajo (&lt;4.0)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-6 h-6 rounded bg-yellow-500"></div>
                <span class="text-xs text-gray-600">Medio (4.0-5.5)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-6 h-6 rounded bg-green-500"></div>
                <span class="text-xs text-gray-600">Alto (&gt;5.5)</span>
              </div>
            </template>
            <template v-else-if="currentViewMode === 'behavior'">
              <div class="flex items-center gap-1">
                <div class="w-6 h-6 rounded bg-green-500"></div>
                <span class="text-xs text-gray-600">Bueno (0-2)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-6 h-6 rounded bg-yellow-500"></div>
                <span class="text-xs text-gray-600">Regular (3-5)</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-6 h-6 rounded bg-red-500"></div>
                <span class="text-xs text-gray-600">Malo (&gt;5)</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Área de la sala -->
    <div class="p-6">
      <!-- Indicador de pizarra -->
      <div class="mb-6">
        <div class="h-16 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg shadow-inner flex items-center justify-center">
          <span class="text-white font-semibold text-lg">PIZARRA</span>
        </div>
      </div>

      <!-- Grid de asientos -->
      <div class="relative">
        <div
          class="grid gap-4"
          :style="{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
          }"
        >
          <div
            v-for="(seat, index) in seats"
            :key="index"
            @drop="handleDrop($event, index)"
            @dragover.prevent
            @dragenter.prevent
            :class="[
              'relative aspect-square rounded-lg border-2 transition-all duration-200 cursor-pointer',
              getSeatClasses(seat),
              editMode && !seat.student ? 'hover:border-primary-400 hover:bg-primary-50' : '',
              draggedStudent && !seat.student ? 'border-dashed' : ''
            ]"
            @click="handleSeatClick(seat, index)"
          >
            <!-- Asiento vacío -->
            <div v-if="!seat.student" class="flex items-center justify-center h-full">
              <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <!-- Estudiante asignado -->
            <div
              v-else
              :draggable="editMode"
              @dragstart="handleDragStart($event, seat.student, index)"
              @dragend="handleDragEnd"
              class="flex flex-col items-center justify-center h-full p-2"
              :class="editMode ? 'cursor-move' : ''"
            >
              <!-- Avatar con iniciales -->
              <div
                :class="[
                  'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg mb-2',
                  getStudentColor(seat.student)
                ]"
              >
                {{ getInitials(seat.student.nombre_completo) }}
              </div>

              <!-- Nombre -->
              <div class="text-center">
                <p class="text-xs font-semibold text-gray-900 line-clamp-1">
                  {{ getFirstName(seat.student.nombre_completo) }}
                </p>
                <p class="text-xs text-gray-500">
                  #{{ seat.student.numero_lista }}
                </p>
              </div>

              <!-- Indicadores de métricas -->
              <div class="flex gap-1 mt-2">
                <div
                  v-if="seat.student.promedio_asignatura"
                  class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="getGradeBadgeClass(seat.student.promedio_asignatura)"
                >
                  {{ seat.student.promedio_asignatura.toFixed(1) }}
                </div>
                <div
                  v-if="seat.student.total_anotaciones_negativas > 0"
                  class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"
                >
                  {{ seat.student.total_anotaciones_negativas }} ⚠
                </div>
              </div>

              <!-- Botón para remover (solo en modo edición) -->
              <button
                v-if="editMode"
                @click.stop="removeStudent(index)"
                class="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Número de asiento -->
            <div class="absolute bottom-1 left-1 text-xs text-gray-400 font-mono">
              {{ index + 1 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div v-if="editMode" class="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="text-sm text-gray-600">
          <span class="font-semibold">{{ assignedCount }}</span> de <span class="font-semibold">{{ totalStudents }}</span> estudiantes asignados
        </div>
        <div class="flex gap-3">
          <button
            @click="clearAllSeats"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpiar Todo
          </button>
          <button
            @click="autoAssignSeats"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Asignar Automático
          </button>
          <button
            @click="saveSeatingArrangement"
            :disabled="saving"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {{ saving ? 'Guardando...' : 'Guardar Distribución' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sidebar con lista de estudiantes (solo en modo edición) -->
    <transition name="slide">
      <div v-if="editMode" class="border-t border-gray-200 bg-gray-50 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Estudiantes sin asignar</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
          <div
            v-for="student in unassignedStudents"
            :key="student.estudiante_id"
            :draggable="true"
            @dragstart="handleDragStart($event, student, null)"
            @dragend="handleDragEnd"
            class="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all cursor-move"
          >
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold mb-2">
                {{ getInitials(student.nombre_completo) }}
              </div>
              <p class="text-xs font-semibold text-gray-900 text-center line-clamp-2">
                {{ student.nombre_completo }}
              </p>
              <p class="text-xs text-gray-500">#{{ student.numero_lista }}</p>
            </div>
          </div>
        </div>
        <div v-if="unassignedStudents.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="font-medium">Todos los estudiantes están asignados</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import type { Student } from '@/types/teacher.types';
import apiClient from '@/services/api.config';

interface Seat {
  student: Student | null;
}

interface Props {
  cursoId: string;
  students: Student[];
  sala?: {
    sala_id: string;
    nombre: string;
  };
  curso?: {
    curso_id: string;
    nombre: string;
  };
}

const props = defineProps<Props>();

// Estados
const editMode = ref(false);
const saving = ref(false);
const currentViewMode = ref<'normal' | 'performance' | 'behavior'>('normal');
const draggedStudent = ref<Student | null>(null);
const draggedFromIndex = ref<number | null>(null);

// Configuración de la sala
const rows = ref(5);
const columns = ref(6);
const totalSeats = computed(() => rows.value * columns.value);

// Asientos
const seats = ref<Seat[]>([]);

// Modos de visualización
const viewModes = [
  {
    id: 'normal',
    label: 'Normal',
    icon: h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' })
    ])
  },
  {
    id: 'performance',
    label: 'Rendimiento',
    icon: h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
    ])
  },
  {
    id: 'behavior',
    label: 'Comportamiento',
    icon: h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
    ])
  }
];

// Computed
const assignedCount = computed(() => seats.value.filter(s => s.student !== null).length);
const totalStudents = computed(() => props.students.length);

const unassignedStudents = computed(() => {
  const assignedIds = new Set(seats.value.filter(s => s.student).map(s => s.student!.estudiante_id));
  return props.students.filter(student => !assignedIds.has(student.estudiante_id));
});

const getLegendTitle = computed(() => {
  if (currentViewMode.value === 'performance') return 'Rendimiento Académico';
  if (currentViewMode.value === 'behavior') return 'Comportamiento (Anotaciones Negativas)';
  return '';
});

// Inicializar asientos
onMounted(() => {
  initializeSeats();
  loadSeatingArrangement();
});

const initializeSeats = () => {
  seats.value = Array.from({ length: totalSeats.value }, () => ({ student: null }));
};

// Funciones de drag & drop
const handleDragStart = (event: DragEvent, student: Student, fromIndex: number | null) => {
  draggedStudent.value = student;
  draggedFromIndex.value = fromIndex;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};

const handleDragEnd = () => {
  draggedStudent.value = null;
  draggedFromIndex.value = null;
};

const handleDrop = (event: DragEvent, toIndex: number) => {
  event.preventDefault();
  if (!draggedStudent.value || !editMode.value) return;

  // Si el asiento está ocupado, no hacer nada
  if (seats.value[toIndex].student) return;

  // Si viene de otro asiento, liberar ese asiento
  if (draggedFromIndex.value !== null) {
    seats.value[draggedFromIndex.value].student = null;
  }

  // Asignar al nuevo asiento
  seats.value[toIndex].student = draggedStudent.value;

  handleDragEnd();
};

const handleSeatClick = (seat: Seat, index: number) => {
  if (!editMode.value || seat.student) return;

  // Si hay estudiantes sin asignar, asignar el primero
  if (unassignedStudents.value.length > 0) {
    seats.value[index].student = unassignedStudents.value[0];
  }
};

const removeStudent = (index: number) => {
  seats.value[index].student = null;
};

const clearAllSeats = () => {
  if (confirm('¿Estás seguro de que quieres limpiar todos los asientos?')) {
    initializeSeats();
  }
};

const autoAssignSeats = () => {
  // Limpiar asientos actuales
  initializeSeats();

  // Asignar estudiantes en orden de número de lista
  const sortedStudents = [...props.students].sort((a, b) => a.numero_lista - b.numero_lista);
  sortedStudents.forEach((student, index) => {
    if (index < totalSeats.value) {
      seats.value[index].student = student;
    }
  });
};

// Funciones de visualización
const getSeatClasses = (seat: Seat) => {
  if (!seat.student) {
    return 'bg-gray-50 border-gray-200';
  }

  if (currentViewMode.value === 'performance') {
    const grade = seat.student.promedio_asignatura || 0;
    if (grade >= 5.5) return 'bg-green-100 border-green-400';
    if (grade >= 4.0) return 'bg-yellow-100 border-yellow-400';
    return 'bg-red-100 border-red-400';
  }

  if (currentViewMode.value === 'behavior') {
    const negatives = seat.student.total_anotaciones_negativas || 0;
    if (negatives === 0) return 'bg-green-100 border-green-400';
    if (negatives <= 2) return 'bg-green-100 border-green-400';
    if (negatives <= 5) return 'bg-yellow-100 border-yellow-400';
    return 'bg-red-100 border-red-400';
  }

  return 'bg-white border-gray-300';
};

const getStudentColor = (student: Student) => {
  // Color basado en el hash del ID para consistencia
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500'
  ];
  const hash = student.estudiante_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const getFirstName = (name: string) => {
  return name.split(' ')[0];
};

const getGradeBadgeClass = (grade: number) => {
  if (grade >= 6.0) return 'bg-green-100 text-green-700';
  if (grade >= 5.0) return 'bg-blue-100 text-blue-700';
  if (grade >= 4.0) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

// Guardar y cargar distribución
const saveSeatingArrangement = async () => {
  saving.value = true;
  try {
    // Preparar datos para guardar
    const arrangement = seats.value.map((seat, index) => ({
      position: index,
      estudiante_id: seat.student?.estudiante_id || null
    }));

    // Llamar al endpoint para guardar
    await apiClient.post(`/cursos/${props.cursoId}/asientos`, {
      asientos: arrangement,
      sala_id: props.sala?.sala_id || null
    });

    alert('Distribución de asientos guardada correctamente');
    editMode.value = false; // Salir del modo edición después de guardar
  } catch (error) {
    console.error('Error guardando distribución:', error);
    alert('Error al guardar la distribución. Por favor, intenta nuevamente.');
  } finally {
    saving.value = false;
  }
};

const loadSeatingArrangement = async () => {
  try {
    // Cargar distribución actual desde el servidor
    const response = await apiClient.get(`/cursos/${props.cursoId}/asientos`);
    const asignaciones = response.data.data || [];

    // Limpiar asientos
    initializeSeats();

    // Aplicar asignaciones guardadas
    asignaciones.forEach((asignacion: any) => {
      const seatIndex = asignacion.num_asiento;
      const student = props.students.find(s => s.estudiante_id === asignacion.estudiante_id);

      if (student && seatIndex !== null && seatIndex < totalSeats.value) {
        seats.value[seatIndex].student = student;
      }
    });

    console.log(`Distribución cargada: ${asignaciones.length} asientos asignados`);
  } catch (error: any) {
    // Si no hay distribución guardada (error 404 o similar), simplemente inicializar vacío
    if (error?.response?.status === 404 || error?.response?.status === 400) {
      console.log('No hay distribución guardada previamente');
    } else {
      console.error('Error cargando distribución:', error);
    }
  }
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
