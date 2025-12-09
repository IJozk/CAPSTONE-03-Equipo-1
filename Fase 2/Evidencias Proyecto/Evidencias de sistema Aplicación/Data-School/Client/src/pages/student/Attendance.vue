<template>
  <div class="space-y-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mi Asistencia</h1>
      <p class="text-gray-600 mt-1">Consulta tu asistencia por período y asignatura</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
          <select v-model="selectedAsignatura" class="w-full px-4 py-2 border rounded-lg">
            <option value="ALL">Todas las asignaturas</option>
            <option v-for="s in subjectsInRecords" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
          <input type="date" v-model="startDate" :max="today" class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
          <input type="date" v-model="endDate" :max="today" class="w-full px-4 py-2 border rounded-lg" />
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          @click="generateReport"
          :disabled="loading"
          class="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Generando...' : 'Generar Reporte' }}
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Resumen General</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-gray-600">% Asistencia</p>
          <p class="text-3xl font-bold text-blue-600">{{ summary.porcentaje }}%</p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <p class="text-sm text-gray-600">Días Presente</p>
          <p class="text-3xl font-bold text-green-600">{{ summary.diasPresente }}</p>
        </div>
        <div class="text-center p-4 bg-red-50 rounded-lg">
          <p class="text-sm text-gray-600">Ausencias</p>
          <p class="text-3xl font-bold text-red-600">{{ summary.ausencias }}</p>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <p class="text-sm text-gray-600">Atrasos</p>
          <p class="text-3xl font-bold text-yellow-600">{{ summary.atrasos }}</p>
        </div>
      </div>
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
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-lg font-bold text-gray-900">Historial de Asistencia</h2>
        <div class="flex space-x-2">
          <button
            @click="exportAttendancePDF"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
          <button
            @click="exportAttendanceCSV"
            class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
        </div>
      </div>

      <div v-if="attendanceRecords.length === 0" class="p-12 text-center text-gray-500">
        No hay registros de asistencia para este período
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Asignatura</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Observación</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="record in attendanceRecords" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.fecha }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.asignatura }}</td>
              <td class="px-6 py-4 text-center">
                <span :class="getStatusBadgeClass(record.estado)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ record.estado }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.observacion }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import asistenciaService from '@/services/asistencia.service'
import studentService from '@/services/student.service'
import type { AsistenciaRecord } from '@/services/asistencia.service'

const authStore = useAuthStore()
const selectedMonth = ref(new Date().getMonth().toString().padStart(2, '0'))
const currentYear = ref(new Date().getFullYear())
const loading = ref(false)
const asistencias = ref<AsistenciaRecord[]>([])
const resumenData = ref<any>(null)
const selectedAsignatura = ref('ALL')
const filteredAsistencias = ref<AsistenciaRecord[]>([])
const enrolledAsignaturas = ref<Array<{ asignatura_id?: string; nombre: string }>>([])
const today = new Date().toISOString().split('T')[0]
const endDate = ref(today)
const startDate = ref(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])

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
  return (filteredAsistencias.value.length > 0 ? filteredAsistencias.value : asistencias.value).map(a => {
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

const subjectsInRecords = computed(() => {
  const set = new Set<string>()
  console.log('🔍 Calculando subjectsInRecords...')
  console.log('📚 enrolledAsignaturas:', enrolledAsignaturas.value)
  console.log('📋 asistencias:', asistencias.value)

  // include enrolled asignaturas
  enrolledAsignaturas.value.forEach(s => set.add(s.nombre))
  asistencias.value.forEach(a => {
    const nombre = a.Asignatura?.nombre || 'Sin asignatura'
    set.add(nombre)
  })

  const result = Array.from(set)
  console.log('✅ Asignaturas en el filtro:', result)
  return result
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
    // reset filtered
    filteredAsistencias.value = []

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

// Function to extract asignaturas from attendance data
const updateEnrolledAsignaturas = () => {
  if (asistencias.value && asistencias.value.length > 0) {
    const asignaturasMap = new Map<string, string>()

    asistencias.value.forEach(a => {
      const nombre = a.Asignatura?.nombre
      const id = a.Asignatura?.asignatura_id || a.asignatura_id
      if (nombre && id) {
        asignaturasMap.set(nombre, id)
      }
    })

    enrolledAsignaturas.value = Array.from(asignaturasMap.entries()).map(([nombre, id]) => ({
      nombre,
      asignatura_id: id
    }))

    console.log('✅ Asignaturas actualizadas desde asistencias:', enrolledAsignaturas.value)
  }
}

// Watch for changes in asistencias to update enrolled subjects
watch(asistencias, () => {
  updateEnrolledAsignaturas()
}, { deep: true })

onMounted(async () => {
  // Cargar TODAS las asignaturas desde el dashboard del estudiante
  if (estudianteId.value) {
    try {
      const dashboard = await studentService.getDashboard(estudianteId.value)
      console.log('📊 Dashboard recibido (Attendance):', dashboard)

      if (dashboard.asignaturas && Array.isArray(dashboard.asignaturas)) {
        enrolledAsignaturas.value = dashboard.asignaturas.map((asig: any) => ({
          asignatura_id: asig.asignatura_id,
          nombre: asig.nombre
        }))
        console.log('✅ Asignaturas matriculadas cargadas (Attendance):', enrolledAsignaturas.value)
      }
    } catch (error) {
      console.error('❌ Error cargando asignaturas del dashboard:', error)
    }
  }

  // Default to last 30 days and generate initial report
  await generateReport()
})

const generateReport = async () => {
  if (!estudianteId.value) return
  loading.value = true
  try {
    const params: any = {
      fecha_inicio: startDate.value,
      fecha_fin: endDate.value
    }

    // Request resumen from server (without subject filter to ensure we get detalle with IDs)
    const resumen = await asistenciaService.getResumenEstudiante(estudianteId.value, params)
    resumenData.value = resumen
    asistencias.value = resumen.detalle || []

    // Apply subject filter client-side if needed
    if (selectedAsignatura.value && selectedAsignatura.value !== 'ALL') {
      filteredAsistencias.value = asistencias.value.filter(a => (a.Asignatura?.nombre || 'Sin asignatura') === selectedAsignatura.value)
      // Recalculate resumenData from filtered
      const presentes = filteredAsistencias.value.filter(a => a.presente).length
      const ausentes = filteredAsistencias.value.filter(a => !a.presente).length
      const retrasos = filteredAsistencias.value.filter(a => a.retraso_minutos && a.retraso_minutos > 0).length
      const total = filteredAsistencias.value.length
      const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0
      resumenData.value = {
        total,
        presentes,
        ausentes,
        justificadas: filteredAsistencias.value.filter(a => !a.presente && a.justificado).length,
        retrasos,
        porcentaje_asistencia: porcentaje,
        detalle: filteredAsistencias.value
      }
    } else {
      filteredAsistencias.value = []
    }
  } catch (error) {
    console.error('Error generando resumen de asistencia:', error)
    alert('Error al generar el reporte de asistencia')
  } finally {
    loading.value = false
  }
}

const applySubjectFilter = () => {
  if (selectedAsignatura.value === 'ALL') {
    filteredAsistencias.value = []
    return
  }
  filteredAsistencias.value = asistencias.value.filter(a => (a.Asignatura?.nombre || 'Sin asignatura') === selectedAsignatura.value)
}

const exportAttendanceCSV = () => {
  const data = attendanceRecords.value
  if (!data || data.length === 0) { alert('No hay datos para exportar'); return }
  const headers = ['Fecha','Asignatura','Estado','Observación']
  const lines = [headers.join(',')]
  data.forEach(r => {
    const row = [r.fecha, r.asignatura, r.estado, r.observacion]
    lines.push(row.map(String).map(v => v.includes(',') || v.includes('"') ? `"${v.replace(/"/g,'""')}"` : v).join(','))
  })
  const BOM='\uFEFF'
  const blob = new Blob([BOM + lines.join('\n')], { type:'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  const subjPart = selectedAsignatura.value === 'ALL' ? 'todas_asignaturas' : selectedAsignatura.value.replace(/\s+/g, '_')
  link.download = `asistencia_${subjPart}_${startDate.value}_to_${endDate.value}.csv`
  document.body.appendChild(link); link.click(); document.body.removeChild(link)
}

const exportAttendancePDF = () => {
  const data = attendanceRecords.value
  if (!data || data.length === 0) { alert('No hay datos para exportar'); return }
  const subjTitle = selectedAsignatura.value === 'ALL' ? 'Todas las asignaturas' : selectedAsignatura.value
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Reporte Asistencia</title></head><body><h1>Asistencia - ${subjTitle}</h1><p>Período: ${startDate.value} - ${endDate.value}</p><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Fecha</th><th>Asignatura</th><th>Estado</th><th>Observación</th></tr></thead><tbody>${data.map(d=>`<tr><td>${d.fecha}</td><td>${d.asignatura}</td><td>${d.estado}</td><td>${d.observacion}</td></tr>`).join('')}</tbody></table></body></html>`
  const w=window.open('','_blank')
  if (w) { w.document.write(html); w.document.close(); w.onload = ()=> w.print() } else alert('Por favor permite ventanas emergentes para exportar PDF')
}
</script>
