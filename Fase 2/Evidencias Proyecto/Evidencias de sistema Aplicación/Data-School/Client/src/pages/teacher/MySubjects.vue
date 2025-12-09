<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mis Asignaturas</h1>
        <p class="text-gray-600 mt-1">Gestiona las asignaturas que impartes</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre o código..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Curso</label>
            <select
              v-model="filters.curso"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los cursos</option>
              <option v-for="curso in uniqueCourses" :key="curso" :value="curso">{{ curso }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              v-model="sortBy"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="nivel">Nivel (curso)</option>
              <option value="nombre">Nombre</option>
              <option value="codigo">Código</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="teacherStore.loading" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="divide-y divide-gray-200">
          <div v-for="i in 5" :key="i" class="p-6 animate-pulse">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div class="flex space-x-2">
                <div class="h-8 w-20 bg-gray-200 rounded"></div>
                <div class="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subjects List -->
      <div v-else-if="filteredSubjects.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hrs/Semana</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sala</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiantes</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluaciones</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="subject in filteredSubjects"
                :key="subject.asignatura_id"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                @click="goToSubjectDetail(subject.asignatura_id)"
              >
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-bold text-gray-900">{{ subject.nombre }}</div>
                    <div class="text-xs text-gray-500">{{ subject.codigo }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ subject.curso.nivel }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ subject.horas_semanales }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ subject.sala !== 'Sin sala' ? 'Sala ' + subject.sala : '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ subject.total_estudiantes || 0 }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ subject.total_evaluaciones || 0 }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2" @click.stop>
                    <button
                      @click="goToSubjectDetail(subject.asignatura_id)"
                      class="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                      title="Ver detalle"
                    >
                      Ver
                    </button>
                    <button
                      @click="goToAttendance(subject.asignatura_id)"
                      class="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                      title="Registrar asistencia"
                    >
                      Asistencia
                    </button>
                    <button
                      @click="goToGrades(subject.asignatura_id)"
                      class="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors"
                      title="Ver notas"
                    >
                      Notas
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron asignaturas</h3>
        <p class="text-gray-600">{{ searchQuery || filters.curso ? 'Intenta con otro término de búsqueda o filtro' : 'Aún no tienes asignaturas asignadas' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTeacherStore } from '@/store/teacher.store';

const router = useRouter();
const teacherStore = useTeacherStore();

const searchQuery = ref('');
const sortBy = ref('nivel'); // nivel, nombre, codigo
const filters = ref({
  curso: ''
});

// Obtener niveles únicos para el filtro (usamos nivel para agrupar, ej: "1° Básico", "1° Medio")
const uniqueCourses = computed(() => {
  const courses = teacherStore.subjects.map(s => s.curso.nivel);
  return [...new Set(courses)].sort();
});

// Filtrar y ordenar asignaturas
const filteredSubjects = computed(() => {
  let subjects = teacherStore.subjects;

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    subjects = subjects.filter(subject =>
      subject.nombre.toLowerCase().includes(query) ||
      subject.codigo.toLowerCase().includes(query) ||
      subject.curso.nombre.toLowerCase().includes(query)
    );
  }

  // Filtrar por curso
  if (filters.value.curso) {
    subjects = subjects.filter(s => s.curso.nivel === filters.value.curso);
  }

  // Ordenar
  subjects = [...subjects].sort((a, b) => {
    switch (sortBy.value) {
      case 'nivel':
        // Ordenar por nivel de curso (1° Básico, 2° Básico, etc.)
        return a.curso.nivel.localeCompare(b.curso.nivel);
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'codigo':
        return a.codigo.localeCompare(b.codigo);
      default:
        return 0;
    }
  });

  return subjects;
});

// Navegación
const goToSubjectDetail = (subjectId: string) => {
  router.push(`/teacher/subjects/${subjectId}`);
};

const goToAttendance = (subjectId: string) => {
  router.push({ path: '/teacher/attendance', query: { subject: subjectId } });
};

const goToGrades = (subjectId: string) => {
  router.push({ path: '/teacher/grades', query: { subject: subjectId } });
};

// Cargar asignaturas al montar
onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }
});
</script>
