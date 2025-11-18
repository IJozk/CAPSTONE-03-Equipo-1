<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Mi Asistencia</h1>
      <select
        v-model="selectedMonth"
        @change="loadAttendance"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
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

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="mt-2 text-gray-600">Cargando asistencia...</p>
    </div>

    <!-- Attendance Table -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Historial de Asistencia</h2>
      </div>

      <div v-if="attendanceRecords.length === 0" class="p-8 text-center text-gray-500">
        No hay registros de asistencia para este mes
      </div>

      <div v-else class="overflow-x-auto">
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
import { useAuthStore } from '@/store/auth.store'
import asistenciaService from '@/services/asistencia.service'
import type { AsistenciaRecord } from '@/services/asistencia.service'
import StatCard from '@/components/student/StatCard.vue'

const authStore = useAuthStore()
const selectedMonth = ref(new Date().getMonth().toString().padStart(2, '0'))
const currentYear = ref(new Date().getFullYear())
const loading = ref(false)
const asistencias = ref<AsistenciaRecord[]>([])
const resumenData = ref<any>(null)

const estudianteId = computed(() => authStore.user?.estudiante_profile?.estudiante_id)

const summary = computed(() => {
  if (resumenData.value) {
    return {
      porcentaje: resumenData.value.porcentaje_asistencia || 0,
      diasPresente: resumenData.value.presentes || 0,
      ausencias: resumenData.value.ausentes || 0,
      atrasos: resumenData.value.retrasos || 0
    }
  }

  // Calcular desde asistencias si no hay resumen
  if (asistencias.value.length > 0) {
    const presentes = asistencias.value.filter(a => a.presente).length
    const ausentes = asistencias.value.filter(a => !a.presente).length
    const retrasos = asistencias.value.filter(a => a.retraso_minutos && a.retraso_minutos > 0).length
    const total = asistencias.value.length
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0

    return {
      porcentaje,
      diasPresente: presentes,
      ausencias: ausentes,
      atrasos: retrasos
    }
  }

  return {
    porcentaje: 0,
    diasPresente: 0,
    ausencias: 0,
    atrasos: 0
  }
})

const attendanceRecords = computed(() => {
  return asistencias.value.map(a => {
    let estado = 'PRESENTE'
    if (!a.presente && a.justificado) {
      estado = 'JUSTIFICADO'
    } else if (!a.presente) {
      estado = 'AUSENTE'
    } else if (a.retraso_minutos && a.retraso_minutos > 0) {
      estado = 'ATRASADO'
    }

    let observacion = a.observaciones || '-'
    if (a.retraso_minutos && a.retraso_minutos > 0) {
      observacion = `Llegó ${a.retraso_minutos} minutos tarde${a.observaciones ? ' - ' + a.observaciones : ''}`
    }

    return {
      id: a.asistencia_id,
      fecha: new Date(a.fecha).toLocaleDateString('es-CL'),
      asignatura: a.Asignatura?.nombre || 'Sin asignatura',
      estado,
      observacion
    }
  })
})

const alerts = computed(() => {
  const alertas: string[] = []

  if (summary.value.atrasos > 2) {
    alertas.push(`Has tenido ${summary.value.atrasos} atrasos este mes`)
  }

  const ausenciasSinJustificar = asistencias.value.filter(a => !a.presente && !a.justificado).length
  if (ausenciasSinJustificar > 0) {
    alertas.push(`Tienes ${ausenciasSinJustificar} ausencia(s) sin justificar`)
  }

  return alertas
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

const loadAttendance = async () => {
  console.log('🔍 Cargando asistencia...')
  console.log('👤 Estudiante ID:', estudianteId.value)
  console.log('📅 Mes seleccionado:', selectedMonth.value)

  if (!estudianteId.value) {
    console.warn('❌ No se encontró el ID del estudiante')
    return
  }

  loading.value = true

  try {
    // Obtener asistencias del mes
    console.log('📞 Llamando a asistenciaService.getByMonth')
    const asistenciasData = await asistenciaService.getByMonth(
      estudianteId.value,
      currentYear.value,
      selectedMonth.value
    )
    console.log('✅ Asistencias recibidas:', asistenciasData)
    asistencias.value = asistenciasData

    // Obtener resumen del mes
    console.log('📞 Llamando a asistenciaService.getResumenEstudiante')
    const fecha_inicio = `${currentYear.value}-${selectedMonth.value}-01`
    const lastDay = new Date(currentYear.value, parseInt(selectedMonth.value), 0).getDate()
    const fecha_fin = `${currentYear.value}-${selectedMonth.value}-${lastDay.toString().padStart(2, '0')}`

    const resumen = await asistenciaService.getResumenEstudiante(estudianteId.value, {
      fecha_inicio,
      fecha_fin
    })
    console.log('✅ Resumen recibido:', resumen)
    resumenData.value = resumen

  } catch (error) {
    console.error('❌ Error loading attendance:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadAttendance()
})
</script>
