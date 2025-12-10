<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mis Notas</h1>
        <p class="text-gray-600 mt-1">Consulta tus notas por asignatura o descarga reportes</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
            <select v-model="selectedAsignatura" class="w-full px-4 py-2 border rounded-lg">
              <option value="ALL">Todas las asignaturas</option>
              <option v-for="s in subjectsList" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="generateReport"
              :disabled="loading"
              class="w-full px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Generando...' : 'Generar Reporte' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Report -->
      <div v-if="report" class="space-y-6">
        <!-- Summary Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Resumen General</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600">Total Evaluaciones</p>
              <p class="text-3xl font-bold text-blue-600">{{ report.total_evaluaciones }}</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600">Promedio General</p>
              <p class="text-3xl font-bold text-green-600">{{ report.promedio_general.toFixed(1) }}</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <p class="text-sm text-gray-600">Con Calificación</p>
              <p class="text-3xl font-bold text-yellow-600">{{ report.evaluaciones_con_nota }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900">Detalle de Evaluaciones</h2>
            <div class="flex space-x-2">
              <button
                @click="exportGradesCSV"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button
                @click="exportGradesPDF"
                class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <!-- If mode all subjects, show one-row table with subject columns like teacher report -->
                <tr v-if="report && report.mode === 'ALL_SUBJECTS'">
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N°</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estudiante</th>
                  <th v-for="asig in report.asignaturas" :key="asig" class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ asig }}</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-blue-50">Promedio</th>
                </tr>

                <!-- If mode subject evaluations, show evaluations list -->
                <tr v-else>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N°</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Evaluación</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Nota</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <template v-if="report && report.mode === 'ALL_SUBJECTS'">
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-900">1</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">Mis Notas</td>
                    <td v-for="asig in report.asignaturas" :key="`val-${asig}`" class="px-4 py-4 text-center">
                      <span v-if="report.notas && report.notas[asig] !== undefined && report.notas[asig] !== null" :class="getGradeClass(report.notas[asig])" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">{{ report.notas[asig].toFixed(1) }}</span>
                      <span v-else class="text-xs text-gray-400">-</span>
                    </td>
                    <td class="px-6 py-4 text-center bg-blue-50">
                      <span :class="getGradeClass(report.promedio)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold">{{ report.promedio.toFixed(1) }}</span>
                    </td>
                  </tr>
                </template>

                <template v-else>
                  <tr v-for="(ev, index) in report.evaluaciones" :key="ev.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-900">{{ index + 1 }}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ ev.nombre }}</td>
                    <td class="px-6 py-4 text-center text-sm text-gray-900">{{ ev.tipo }}</td>
                    <td class="px-6 py-4 text-center text-sm text-gray-900">{{ ev.fecha }}</td>
                    <td class="px-6 py-4 text-center">
                      <span v-if="ev.nota !== null && ev.nota !== undefined" :class="getGradeClass(ev.nota)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {{ ev.nota.toFixed(1) }}
                      </span>
                      <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Aún no realizada
                      </span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay reporte generado</h3>
        <p class="mt-2 text-sm text-gray-600">Selecciona filtros y haz clic en "Generar Reporte"</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import evaluacionService from '@/services/evaluacion.service'
import studentService from '@/services/student.service'

const authStore = useAuthStore()
const loading = ref(false)
const grades = ref<any[]>([])
const selectedAsignatura = ref('ALL')
const enrolledAsignaturas = ref<Array<{ asignatura_id?: string; nombre: string }>>([])
const report = ref<any | null>(null)

const estudianteId = computed(() => authStore.user?.estudiante_profile?.estudiante_id)

const summary = computed(() => {
  const promedioGeneral = grades.value.length > 0
    ? grades.value.reduce((acc, g) => acc + g.promedio, 0) / grades.value.length
    : 0

  const totalEvaluaciones = grades.value.reduce((acc, g) => acc + g.evaluaciones.length, 0)

  return {
    promedio: promedioGeneral.toFixed(1),
    asignaturas: grades.value.length,
    evaluacionesPendientes: 0, // Por implementar
    ultimaActualizacion: new Date().toLocaleDateString('es-CL')
  }
})

const subjectsList = computed(() => {
  // Priorizar asignaturas matriculadas
  const fromEnroll = enrolledAsignaturas.value.map(s => s.nombre)
  const fromGrades = grades.value.map(g => g.asignatura)
  // Combine both, prioritizing enrolled subjects
  const combined = [...fromEnroll, ...fromGrades.filter(g => !fromEnroll.includes(g))]
  return Array.from(new Set(combined))
})

const filteredGrades = computed(() => {
  if (selectedAsignatura.value === 'ALL') return grades.value
  return grades.value.filter(g => g.asignatura === selectedAsignatura.value)
})

const getGradeColor = (nota: number) => {
  if (nota >= 6.0) return 'text-green-600'
  if (nota >= 5.0) return 'text-blue-600'
  if (nota >= 4.0) return 'text-yellow-600'
  return 'text-red-600'
}

const getGradeClass = (nota: number): string => {
  if (nota >= 6.0) return 'bg-green-100 text-green-800'
  if (nota >= 5.0) return 'bg-blue-100 text-blue-800'
  if (nota >= 4.0) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const loadGrades = async () => {
  console.log('🔍 Cargando notas...')
  console.log('👤 Estudiante ID:', estudianteId.value)
  console.log('👤 Auth user completo:', authStore.user)

  if (!estudianteId.value) {
    console.warn('❌ No se encontró el ID del estudiante')
    return
  }

  loading.value = true

  try {
    console.log('📞 Llamando a evaluacionService.getNotasEstudiante con ID:', estudianteId.value)
    const notasData = await evaluacionService.getNotasEstudiante(estudianteId.value)
    console.log('✅ Notas recibidas:', notasData)

    // Transformar datos para el template
    grades.value = notasData.map(asig => ({
      asignatura: asig.nombre_asignatura,
      asignatura_id: asig.asignatura_id,
      profesor: asig.profesor_nombre,
      promedio: asig.promedio,
      evaluaciones: asig.notas.map(nota => ({
        id: nota.nota_id,
        nombre: nota.evaluacion_nombre,
        tipo: nota.tipo_evaluacion,
        fecha: new Date(nota.fecha).toLocaleDateString('es-CL'),
        fecha_iso: nota.fecha, // raw ISO date for filtering
        nota: nota.nota,
        ponderacion: nota.ponderacion
      }))
    }))
    console.log('✅ Grades procesadas:', grades.value)

  } catch (error) {
    console.error('❌ Error loading grades:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadGrades()

  // Cargar TODAS las asignaturas desde el dashboard del estudiante
  if (estudianteId.value) {
    try {
      const dashboard = await studentService.getDashboard(estudianteId.value)
      console.log('📊 Dashboard recibido:', dashboard)

      if (dashboard.asignaturas && Array.isArray(dashboard.asignaturas)) {
        enrolledAsignaturas.value = dashboard.asignaturas.map((asig: any) => ({
          asignatura_id: asig.asignatura_id,
          nombre: asig.nombre
        }))
        console.log('✅ Asignaturas matriculadas cargadas:', enrolledAsignaturas.value)
      }
    } catch (error) {
      console.error('❌ Error cargando asignaturas del dashboard:', error)
      // Fallback: usar asignaturas de grades
      if (grades.value && grades.value.length > 0) {
        enrolledAsignaturas.value = grades.value.map((g: any) => ({
          asignatura_id: g.asignatura_id,
          nombre: g.asignatura
        }))
        console.log('⚠️ Usando asignaturas de grades como fallback:', enrolledAsignaturas.value)
      }
    }
  }
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateString
  }
}

const generateReport = async () => {
  if (!estudianteId.value) {
    alert('No se encontró el estudiante')
    return
  }

  loading.value = true
  try {
    // Ensure grades are loaded
    if (!grades.value || grades.value.length === 0) {
      await loadGrades()
    }

    if (selectedAsignatura.value && selectedAsignatura.value !== 'ALL') {
      // SUBJECT_EVALS mode: evaluations of the selected subject
      // Try to find asignatura_id from enrolled subjects first
      let asignaturaId = enrolledAsignaturas.value.find(s => s.nombre === selectedAsignatura.value)?.asignatura_id

      // If not found in enrolled, try to find it from grades data
      if (!asignaturaId) {
        const gradeData = grades.value.find((g: any) => g.asignatura === selectedAsignatura.value)
        asignaturaId = gradeData?.asignatura_id
      }

      if (!asignaturaId) {
        alert('No se encontró información de la asignatura seleccionada')
        loading.value = false
        return
      }

      // Get ALL evaluations for this subject (including unrealized ones)
      const allEvaluations = await evaluacionService.getByAsignatura(asignaturaId)

      // Si no hay evaluaciones creadas para esta asignatura
      if (!allEvaluations || allEvaluations.length === 0) {
        alert('Esta asignatura no tiene evaluaciones creadas aún')
        loading.value = false
        return
      }

      // Get the student's results for this subject
      const studentResults = await evaluacionService.getResultadosEstudiante(estudianteId.value, asignaturaId)

      // Create a map of evaluation_id to nota
      const notasMap = new Map<number, number>()
      studentResults.forEach(r => {
        if (r.nota !== null && r.nota !== undefined) {
          notasMap.set(r.evaluacion_id, r.nota)
        }
      })

      // Build evaluations list with all evaluations
      const evs = allEvaluations.map(ev => ({
        id: ev.evaluacion_id,
        nombre: ev.nombre,
        tipo: ev.tipo,
        fecha: new Date(ev.fecha_evaluacion).toLocaleDateString('es-CL'),
        nota: notasMap.get(ev.evaluacion_id) || null
      }))

      const notasConVal = evs.filter(e => e.nota !== null && e.nota !== undefined).map(e => e.nota as number)
      const promedio_general = notasConVal.length > 0 ? notasConVal.reduce((a: number, b: number) => a + b, 0) / notasConVal.length : 0

      // Si hay evaluaciones pero ninguna tiene nota colocada
      if (notasConVal.length === 0) {
        console.log('⚠️ La asignatura tiene evaluaciones pero ninguna con nota colocada')
      }

      report.value = {
        mode: 'SUBJECT_EVALS',
        evaluaciones: evs,
        total_evaluaciones: evs.length,
        evaluaciones_con_nota: notasConVal.length,
        promedio_general
      }

    } else {
      // ALL_SUBJECTS mode: columns per subject, show per-subject average
      const subjectNames = subjectsList.value
      const notasMap: Record<string, number | null> = {}
      const promValues: number[] = []

      subjectNames.forEach(sn => {
        // find the subject in grades.value (which only has subjects with grades)
        const subj = grades.value.find((g:any) => g.asignatura === sn)
        if (!subj || !subj.evaluaciones || subj.evaluaciones.length === 0) {
          notasMap[sn] = null
          return
        }

        // Calculate average for all grades (no date filtering)
        const notasArr = subj.evaluaciones
          .map((ev:any) => ev.nota)
          .filter((n:number|null) => n !== null && n !== undefined)

        if (notasArr.length === 0) {
          notasMap[sn] = null
        } else {
          const avg = notasArr.reduce((a:number,b:number)=>a+b,0) / notasArr.length
          notasMap[sn] = avg
          promValues.push(avg)
        }
      })

      const promedio_general = promValues.length > 0 ? promValues.reduce((a,b)=>a+b,0)/promValues.length : 0

      report.value = {
        mode: 'ALL_SUBJECTS',
        asignaturas: subjectNames,
        notas: notasMap,
        promedio: promedio_general,
        total_evaluaciones: Object.values(notasMap).filter(v=>v!==null).length,
        evaluaciones_con_nota: Object.values(notasMap).filter(v=>v!==null).length
      }
    }

  } catch (error) {
    console.error('Error generando reporte:', error)
    alert('Error generando reporte')
  } finally {
    loading.value = false
  }
}

// Export CSV
const exportGradesCSV = () => {
  const dataToExport = filteredGrades.value
  if (!dataToExport || dataToExport.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  const headers = ['Asignatura', 'Profesor', 'Evaluación', 'Tipo', 'Fecha', 'Nota', 'Ponderación']
  const lines = [headers.join(',')]

  dataToExport.forEach(g => {
    g.evaluaciones.forEach((ev: any) => {
      const row = [
        g.asignatura,
        g.profesor,
        ev.nombre,
        ev.tipo,
        ev.fecha,
        ev.nota !== null && ev.nota !== undefined ? ev.nota : '-',
        ev.ponderacion
      ]
      lines.push(row.map(String).map(v => v.includes(',') || v.includes('"') ? `"${v.replace(/"/g,'""')}"` : v).join(','))
    })
  })

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `notas_${selectedAsignatura.value.replace(/\s+/g,'_')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export PDF (simple HTML print)
const exportGradesPDF = () => {
  const dataToExport = filteredGrades.value
  if (!dataToExport || dataToExport.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  const html = `
    <!doctype html>
    <html>
    <head><meta charset="utf-8"><title>Reporte Notas</title></head>
    <body>
      <h1>Reporte de Notas - ${selectedAsignatura.value}</h1>
      ${dataToExport.map(g => `
        <h2>${g.asignatura} - ${g.profesor}</h2>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead><tr><th>Evaluación</th><th>Tipo</th><th>Fecha</th><th>Nota</th><th>Ponderación</th></tr></thead>
          <tbody>
            ${g.evaluaciones.map((ev:any) => `<tr><td>${ev.nombre}</td><td>${ev.tipo}</td><td>${ev.fecha}</td><td>${ev.nota !== null && ev.nota !== undefined ? ev.nota : '-'}</td><td>${ev.ponderacion}</td></tr>`).join('')}
          </tbody>
        </table>
      `).join('')}
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => printWindow.print()
  } else {
    alert('Por favor permite ventanas emergentes para exportar PDF')
  }
}
</script>
