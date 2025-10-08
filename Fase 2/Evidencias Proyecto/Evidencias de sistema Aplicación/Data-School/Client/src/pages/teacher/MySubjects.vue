<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mis Asignaturas</h1>
          <p class="text-gray-600 mt-1">Gestiona las asignaturas que impartes</p>
        </div>
        <div class="flex space-x-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar asignatura..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="teacherStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Subjects Grid -->
      <div v-else-if="filteredSubjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="subject in filteredSubjects"
          :key="subject.asignatura_id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
          @click="goToSubjectDetail(subject.asignatura_id)"
        >
          <!-- Subject Header -->
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {{ subject.nombre }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">{{ subject.codigo }}</p>
              </div>
              <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Subject Info -->
          <div class="p-6 space-y-3">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{{ subject.curso.nombre }} - {{ subject.curso.nivel }}</span>
            </div>

            <div class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{{ subject.total_estudiantes }} estudiantes</span>
            </div>

            <div class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ subject.horas_semanales }} hrs/semana · {{ subject.sala }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6 flex space-x-2">
            <button
              @click.stop="goToSubjectDetail(subject.asignatura_id)"
              class="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ver Detalle
            </button>
            <button
              @click.stop="goToAttendance(subject.asignatura_id)"
              class="px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
            >
              Asistencia
            </button>
            <button
              @click.stop="goToGrades(subject.asignatura_id)"
              class="px-3 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors"
            >
              Notas
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron asignaturas</h3>
        <p class="text-gray-600">{{ searchQuery ? 'Intenta con otro término de búsqueda' : 'Aún no tienes asignaturas asignadas' }}</p>
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

// Asignaturas filtradas por búsqueda
const filteredSubjects = computed(() => {
  if (!searchQuery.value) {
    return teacherStore.subjects;
  }
  const query = searchQuery.value.toLowerCase();
  return teacherStore.subjects.filter(subject =>
    subject.nombre.toLowerCase().includes(query) ||
    subject.codigo.toLowerCase().includes(query) ||
    subject.curso.nombre.toLowerCase().includes(query)
  );
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
