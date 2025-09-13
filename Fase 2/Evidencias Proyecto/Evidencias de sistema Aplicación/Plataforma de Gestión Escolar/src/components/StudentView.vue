<template>
  <div class="p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-foreground">
        {{ getViewTitle() }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ getViewDescription() }}
      </p>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="students.length === 0" class="text-center py-8">
      <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <UsersIcon class="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium text-foreground mb-2">No hay estudiantes</h3>
      <p class="text-muted-foreground">No se encontraron estudiantes para mostrar.</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Students Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="student in students"
          :key="student.id"
          class="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="selectStudent(student)"
        >
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span class="text-primary-foreground font-medium text-lg">
                {{ student.name.charAt(0) }}
              </span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">{{ student.name }}</h3>
              <p class="text-sm text-muted-foreground">{{ student.course }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <!-- Latest grade -->
            <div v-if="student.grades && student.grades.length > 0" class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Última calificación:</span>
              <span class="font-medium text-foreground">
                {{ student.grades[0].grade }} ({{ student.grades[0].subject }})
              </span>
            </div>

            <!-- Attendance status -->
            <div v-if="student.attendance && student.attendance.length > 0" class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Última asistencia:</span>
              <span 
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="getAttendanceClasses(student.attendance[0].status)"
              >
                {{ getAttendanceLabel(student.attendance[0].status) }}
              </span>
            </div>

            <!-- Average grade -->
            <div v-if="student.grades && student.grades.length > 0" class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Promedio:</span>
              <span class="font-medium text-foreground">
                {{ calculateAverage(student.grades) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected student details modal -->
      <div
        v-if="selectedStudent"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click="closeStudentDetails"
      >
        <div
          class="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          @click.stop
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-foreground">{{ selectedStudent.name }}</h2>
            <button
              @click="closeStudentDetails"
              class="p-2 hover:bg-muted rounded-lg"
            >
              <CloseIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Student info -->
            <div class="bg-muted rounded-lg p-4">
              <h3 class="font-medium text-foreground mb-2">Información General</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-muted-foreground">Curso:</span>
                  <span class="ml-2 text-foreground">{{ selectedStudent.course }}</span>
                </div>
                <div>
                  <span class="text-muted-foreground">ID:</span>
                  <span class="ml-2 text-foreground">{{ selectedStudent.id }}</span>
                </div>
              </div>
            </div>

            <!-- Grades -->
            <div v-if="selectedStudent.grades && selectedStudent.grades.length > 0">
              <h3 class="font-medium text-foreground mb-3">Calificaciones Recientes</h3>
              <div class="space-y-2">
                <div
                  v-for="grade in selectedStudent.grades"
                  :key="`${grade.subject}-${grade.date}`"
                  class="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <span class="font-medium text-foreground">{{ grade.subject }}</span>
                    <span class="text-sm text-muted-foreground ml-2">{{ formatDate(grade.date) }}</span>
                  </div>
                  <span class="text-lg font-bold text-foreground">{{ grade.grade }}</span>
                </div>
              </div>
            </div>

            <!-- Attendance -->
            <div v-if="selectedStudent.attendance && selectedStudent.attendance.length > 0">
              <h3 class="font-medium text-foreground mb-3">Asistencia Reciente</h3>
              <div class="space-y-2">
                <div
                  v-for="attendance in selectedStudent.attendance"
                  :key="attendance.date"
                  class="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span class="text-foreground">{{ formatDate(attendance.date) }}</span>
                  <span 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="getAttendanceClasses(attendance.status)"
                  >
                    {{ getAttendanceLabel(attendance.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { mockStudents } from '../data/mockData'

const authStore = useAuthStore()

// State
const isLoading = ref(false)
const selectedStudent = ref(null)

// Icons
const UsersIcon = {
  template: `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-3 5.197H7v-1a6 6 0 0112 0v1z" />
  </svg>`
}

const CloseIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
  </svg>`
}

// Computed properties
const students = computed(() => {
  const role = authStore.user?.role
  
  if (role === 'apoderado') {
    // Show only children of this parent
    return mockStudents.filter(student => student.parentId === authStore.user.id)
  } else if (role === 'docente') {
    // Show students from teacher's courses (simplified)
    return mockStudents
  } else if (role === 'coordinador') {
    // Show all students
    return mockStudents
  }
  
  return []
})

// Methods
const getViewTitle = () => {
  const role = authStore.user?.role
  const titles = {
    coordinador: 'Gestión de Estudiantes',
    docente: 'Mis Estudiantes',
    apoderado: 'Mis Hijos'
  }
  return titles[role] || 'Estudiantes'
}

const getViewDescription = () => {
  const role = authStore.user?.role
  const descriptions = {
    coordinador: 'Administra y supervisa a todos los estudiantes del colegio',
    docente: 'Gestiona y hace seguimiento a tus estudiantes',
    apoderado: 'Consulta el progreso académico y asistencia de tus hijos'
  }
  return descriptions[role] || ''
}

const selectStudent = (student) => {
  selectedStudent.value = student
}

const closeStudentDetails = () => {
  selectedStudent.value = null
}

const getAttendanceClasses = (status) => {
  const classes = {
    presente: 'bg-green-100 text-green-800',
    ausente: 'bg-red-100 text-red-800',
    tarde: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getAttendanceLabel = (status) => {
  const labels = {
    presente: 'Presente',
    ausente: 'Ausente',
    tarde: 'Tarde'
  }
  return labels[status] || status
}

const calculateAverage = (grades) => {
  if (!grades || grades.length === 0) return 'N/A'
  const sum = grades.reduce((acc, grade) => acc + grade.grade, 0)
  return (sum / grades.length).toFixed(1)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Simulate loading
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})
</script>