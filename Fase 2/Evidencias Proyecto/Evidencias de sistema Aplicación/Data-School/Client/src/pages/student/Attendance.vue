<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Mi Asistencia</h1>
      <select v-model="selectedMonth" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="01">Enero</option>
        <option value="02">Febrero</option>
        <option value="03">Marzo</option>
        <option value="04">Abril</option>
        <option value="05">Mayo</option>
        <option value="06">Junio</option>
        <option value="07">Julio</option>
        <option value="08">Agosto</option>
        <option value="09">Septiembre</option>
        <option value="10">Octubre</option>
        <option value="11">Noviembre</option>
        <option value="12">Diciembre</option>
      </select>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Porcentaje de Asistencia"
        :value="`${summary.porcentaje}%`"
        icon="📊"
        color="blue"
      />
      <StatCard
        title="Días Presente"
        :value="summary.diasPresente"
        icon="✅"
        color="green"
      />
      <StatCard
        title="Ausencias"
        :value="summary.ausencias"
        icon="❌"
        color="red"
      />
      <StatCard
        title="Atrasos"
        :value="summary.atrasos"
        icon="⏰"
        color="yellow"
      />
    </div>

    <!-- Alerts -->
    <div v-if="alerts.length > 0" class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Alertas de Asistencia</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <ul class="list-disc list-inside space-y-1">
              <li v-for="alert in alerts" :key="alert">{{ alert }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Historial de Asistencia</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignatura
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Observación
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in attendanceRecords" :key="record.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ record.fecha }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ record.asignatura }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(record.estado)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ record.estado }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ record.observacion }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '@/store/student.store'
import StatCard from '@/components/student/StatCard.vue'

const studentStore = useStudentStore()
const selectedMonth = ref('10')
const loading = ref(false)

// Mock attendance data
const mockAttendanceRecords = [
  { id: 1, fecha: '2025-10-22', asignatura: 'Matemáticas', estado: 'PRESENTE', observacion: '-' },
  { id: 2, fecha: '2025-10-22', asignatura: 'Lenguaje', estado: 'PRESENTE', observacion: '-' },
  { id: 3, fecha: '2025-10-21', asignatura: 'Ciencias', estado: 'ATRASADO', observacion: 'Llegó 10 minutos tarde' },
  { id: 4, fecha: '2025-10-21', asignatura: 'Historia', estado: 'PRESENTE', observacion: '-' },
  { id: 5, fecha: '2025-10-20', asignatura: 'Inglés', estado: 'PRESENTE', observacion: '-' },
  { id: 6, fecha: '2025-10-20', asignatura: 'Matemáticas', estado: 'PRESENTE', observacion: '-' },
  { id: 7, fecha: '2025-10-19', asignatura: 'Ed. Física', estado: 'AUSENTE', observacion: 'Ausencia médica' },
  { id: 8, fecha: '2025-10-19', asignatura: 'Artes', estado: 'JUSTIFICADO', observacion: 'Certificado médico presentado' },
  { id: 9, fecha: '2025-10-18', asignatura: 'Música', estado: 'PRESENTE', observacion: '-' },
  { id: 10, fecha: '2025-10-18', asignatura: 'Lenguaje', estado: 'PRESENTE', observacion: '-' },
  { id: 11, fecha: '2025-10-17', asignatura: 'Matemáticas', estado: 'ATRASADO', observacion: 'Llegó 5 minutos tarde' },
  { id: 12, fecha: '2025-10-17', asignatura: 'Ciencias', estado: 'PRESENTE', observacion: '-' },
  { id: 13, fecha: '2025-10-16', asignatura: 'Historia', estado: 'PRESENTE', observacion: '-' },
  { id: 14, fecha: '2025-10-16', asignatura: 'Inglés', estado: 'PRESENTE', observacion: '-' },
  { id: 15, fecha: '2025-10-15', asignatura: 'Matemáticas', estado: 'PRESENTE', observacion: '-' },
  { id: 16, fecha: '2025-10-15', asignatura: 'Ed. Física', estado: 'PRESENTE', observacion: '-' },
  { id: 17, fecha: '2025-10-14', asignatura: 'Artes', estado: 'AUSENTE', observacion: 'Sin justificación' },
  { id: 18, fecha: '2025-10-14', asignatura: 'Música', estado: 'PRESENTE', observacion: '-' },
  { id: 19, fecha: '2025-10-13', asignatura: 'Lenguaje', estado: 'PRESENTE', observacion: '-' },
  { id: 20, fecha: '2025-10-13', asignatura: 'Ciencias', estado: 'ATRASADO', observacion: 'Llegó 15 minutos tarde' }
]

const mockAttendanceSummary = {
  porcentaje: 85,
  diasPresente: 15,
  ausencias: 2,
  atrasos: 3
}

const mockAttendanceAlerts = [
  'Has tenido 3 atrasos este mes',
  'Tienes 1 ausencia sin justificar'
]

const summary = computed(() => {
  // El store tiene 'attendance' que es un array, no 'attendanceSummary'
  // Calculamos el resumen desde los datos de attendance
  if (studentStore.attendance && studentStore.attendance.length > 0) {
    const records = studentStore.attendance
    const presente = records.filter(r => r.estado === 'PRESENTE').length
    const ausente = records.filter(r => r.estado === 'AUSENTE').length
    const atrasado = records.filter(r => r.estado === 'ATRASADO').length
    const total = records.length
    const porcentaje = total > 0 ? Math.round(((presente + atrasado * 0.5) / total) * 100) : 0

    return {
      porcentaje,
      diasPresente: presente,
      ausencias: ausente,
      atrasos: atrasado
    }
  }
  return mockAttendanceSummary
})

const attendanceRecords = computed(() => {
  if (studentStore.attendance && studentStore.attendance.length > 0) {
    return studentStore.attendance.map(a => ({
      id: a.id,
      fecha: new Date(a.fecha).toLocaleDateString('es-CL'),
      asignatura: a.asignatura_nombre,
      estado: a.estado,
      observacion: a.observacion || '-'
    }))
  }
  return mockAttendanceRecords
})

const alerts = computed(() => {
  // Generar alertas basadas en los datos reales si existen
  if (studentStore.attendance && studentStore.attendance.length > 0) {
    const atrasos = studentStore.attendance.filter(r => r.estado === 'ATRASADO').length
    const ausenciasSinJustificar = studentStore.attendance.filter(r => r.estado === 'AUSENTE').length

    const alertas: string[] = []
    if (atrasos > 0) alertas.push(`Has tenido ${atrasos} atrasos este mes`)
    if (ausenciasSinJustificar > 0) alertas.push(`Tienes ${ausenciasSinJustificar} ausencia(s) sin justificar`)

    return alertas.length > 0 ? alertas : []
  }
  return mockAttendanceAlerts
})

const getStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'PRESENTE':
      return 'bg-green-100 text-green-800'
    case 'AUSENTE':
      return 'bg-red-100 text-red-800'
    case 'ATRASADO':
      return 'bg-yellow-100 text-yellow-800'
    case 'JUSTIFICADO':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch attendance data from store
    if (studentStore.fetchAttendance) {
      await studentStore.fetchAttendance()
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error)
  } finally {
    loading.value = false
  }
})
</script>
