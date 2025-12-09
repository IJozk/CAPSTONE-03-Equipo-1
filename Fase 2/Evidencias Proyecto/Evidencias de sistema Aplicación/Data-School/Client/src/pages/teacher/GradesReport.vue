<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Reporte de Notas</h1>
        <p class="text-gray-600 mt-1">Genera reportes de notas por curso</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Curso <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedCurso"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar curso</option>
              <option v-for="curso in uniqueCourses" :key="curso" :value="curso">
                {{ curso }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Asignatura
            </label>
            <select
              v-model="selectedAsignaturaId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">Todas las asignaturas</option>
              <option
                v-for="subj in subjectsInSelectedCourse"
                :key="subj.asignatura_id"
                :value="subj.asignatura_id"
              >
                {{ subj.nombre }}
              </option>
            </select>
          </div>

          <div class="flex items-end">
            <!-- placeholder para alineación -->
            <div></div>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="generateReport"
            :disabled="!canGenerate || loading"
            class="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Generando...' : 'Generar Reporte' }}
          </button>
        </div>
      </div>

      <!-- Report -->
      <div v-if="report" class="space-y-6">
        <!-- Summary Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Resumen General - {{ selectedCurso }}</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600">Total Estudiantes</p>
              <p class="text-3xl font-bold text-blue-600">{{ report.estudiantes.length }}</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600">Promedio General</p>
              <p class="text-3xl font-bold text-green-600">{{ report.promedio_general.toFixed(1) }}</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <p class="text-sm text-gray-600">Aprobados</p>
              <p class="text-3xl font-bold text-yellow-600">{{ report.aprobados }}</p>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <p class="text-sm text-gray-600">Reprobados</p>
              <p class="text-3xl font-bold text-red-600">{{ report.reprobados }}</p>
            </div>
          </div>
        </div>

        <!-- Students Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900">Detalle por Estudiante</h2>
            <div class="flex space-x-2">
              <button
                @click="exportToCSV"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button
                @click="exportToPDF"
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
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase sticky left-0 bg-gray-50">N°</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase sticky left-0 bg-gray-50">Estudiante</th>
                  <th
                    v-for="asignatura in report.asignaturas"
                    :key="asignatura"
                    class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase"
                  >
                    {{ asignatura }}
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-blue-50">Promedio</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(student, index) in report.estudiantes" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ index + 1 }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ student.nombre_completo }}</td>
                  <td
                    v-for="asignatura in report.asignaturas"
                    :key="`${index}-${asignatura}`"
                    class="px-4 py-4 text-center"
                  >
                    <span
                      v-if="student.notas[asignatura] !== undefined && student.notas[asignatura] !== null"
                      :class="getGradeClass(student.notas[asignatura])"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    >
                      {{ student.notas[asignatura].toFixed(1) }}
                    </span>
                    <span v-else class="text-xs text-gray-400">-</span>
                  </td>
                  <td class="px-6 py-4 text-center bg-blue-50">
                    <span
                      :class="getGradeClass(student.promedio)"
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                    >
                      {{ student.promedio.toFixed(1) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay reporte generado</h3>
        <p class="mt-2 text-sm text-gray-600">
          Selecciona un curso para generar el reporte de notas
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import teacherService from '@/services/teachertools.service';

const teacherStore = useTeacherStore();

const selectedCurso = ref('');
const selectedAsignaturaId = ref('ALL');
const loading = ref(false);
const report = ref<{
  estudiantes: Array<{
    nombre_completo: string;
    notas: Record<string, number>;
    promedio: number;
  }>;
  asignaturas: string[];
  promedio_general: number;
  aprobados: number;
  reprobados: number;
} | null>(null);

// Computed
const uniqueCourses = computed(() => {
  const courses = teacherStore.subjects.map(s => s.curso.nombre);
  return [...new Set(courses)].sort();
});

const subjectsInSelectedCourse = computed(() => {
  if (!selectedCurso.value) return [];
  return teacherStore.subjects.filter(s => s.curso.nombre === selectedCurso.value);
});

const canGenerate = computed(() => {
  return selectedCurso.value !== '';
});

// Methods
const generateReport = async () => {
  if (!canGenerate.value) return;

  loading.value = true;
  try {
    // Obtener asignaturas del curso seleccionado
    const asignaturasDelCurso = teacherStore.subjects.filter(s => s.curso.nombre === selectedCurso.value);

    if (asignaturasDelCurso.length === 0) {
      alert('No tienes asignaturas en este curso');
      return;
    }

    // Obtener estudiantes del curso usando la primera asignatura como referencia
    const primeraAsignatura = asignaturasDelCurso[0];
    await teacherStore.fetchSubjectStudents(primeraAsignatura.asignatura_id);
    const estudiantes = teacherStore.currentSubjectStudents;

    // Si se seleccionó una asignatura específica -> mostrar evaluaciones como columnas
    if (selectedAsignaturaId.value && selectedAsignaturaId.value !== 'ALL') {
      const asignaturaSeleccionada = asignaturasDelCurso.find(a => a.asignatura_id === selectedAsignaturaId.value);
      if (!asignaturaSeleccionada) {
        alert('Asignatura seleccionada no encontrada en este curso');
        return;
      }

      // Obtener evaluaciones de la asignatura seleccionada
      const evaluaciones = await teacherService.getSubjectEvaluations(asignaturaSeleccionada.asignatura_id);

      if (!evaluaciones || evaluaciones.length === 0) {
        alert('No hay evaluaciones registradas para esta asignatura');
        return;
      }

      // Para cada evaluación obtener notas y construir columnas por evaluación
      const notasPorEvaluacion = new Map<string, Map<string, number>>();

      for (const ev of evaluaciones) {
        const notas = await teacherService.getEvaluationGrades(ev.evaluacion_id);
        const mapNotas = new Map<string, number>();
        notas.forEach(n => {
          if (n.nota !== undefined && n.nota !== null) {
            mapNotas.set(n.estudiante.estudiante_id, n.nota);
          }
        });
        // Usar el nombre de la evaluación como columna (puedes ajustar a `ev.nombre` + fecha si hace falta)
        notasPorEvaluacion.set(ev.nombre, mapNotas);
      }

      const evaluacionesNombres = evaluaciones.map(e => e.nombre);

      const estudiantesReporte = estudiantes.map(estudiante => {
        const notas: Record<string, number> = {};
        const notasArray: number[] = [];

        evaluacionesNombres.forEach(evName => {
          const mapNotas = notasPorEvaluacion.get(evName);
          if (mapNotas && mapNotas.has(estudiante.estudiante_id)) {
            const nota = mapNotas.get(estudiante.estudiante_id)!;
            notas[evName] = nota;
            notasArray.push(nota);
          }
        });

        const promedio = notasArray.length > 0 ? notasArray.reduce((a, b) => a + b, 0) / notasArray.length : 0;

        return { nombre_completo: estudiante.nombre_completo, notas, promedio };
      });

      // Estadísticas
      const promedios = estudiantesReporte.map(e => e.promedio).filter(p => p > 0);
      const promedio_general = promedios.length > 0 ? promedios.reduce((a, b) => a + b, 0) / promedios.length : 0;
      const aprobados = promedios.filter(p => p >= 4.0).length;
      const reprobados = promedios.filter(p => p < 4.0 && p > 0).length;

      report.value = {
        estudiantes: estudiantesReporte,
        asignaturas: evaluacionesNombres,
        promedio_general,
        aprobados,
        reprobados
      };

    } else {
      // Modo "Todas las asignaturas": columnas = asignaturas, valor = promedio por asignatura
      const notasPorAsignatura = new Map<string, Map<string, number>>();

      for (const asignatura of asignaturasDelCurso) {
        const evaluaciones = await teacherService.getSubjectEvaluations(asignatura.asignatura_id);
        const notasMap = new Map<string, number[]>();

        for (const evaluacion of evaluaciones) {
          const notas = await teacherService.getEvaluationGrades(evaluacion.evaluacion_id);
          notas.forEach(nota => {
            if (!notasMap.has(nota.estudiante.estudiante_id)) {
              notasMap.set(nota.estudiante.estudiante_id, []);
            }
            if (nota.nota !== null && nota.nota !== undefined) {
              notasMap.get(nota.estudiante.estudiante_id)!.push(nota.nota);
            }
          });
        }

        const promediosAsignatura = new Map<string, number>();
        notasMap.forEach((notasArr, estudianteId) => {
          if (notasArr.length > 0) {
            const promedio = notasArr.reduce((a, b) => a + b, 0) / notasArr.length;
            promediosAsignatura.set(estudianteId, promedio);
          }
        });

        notasPorAsignatura.set(asignatura.nombre, promediosAsignatura);
      }

      const asignaturasNombres = asignaturasDelCurso.map(a => a.nombre);
      const estudiantesReporte = estudiantes.map(estudiante => {
        const notas: Record<string, number> = {};
        const notasArray: number[] = [];

        asignaturasNombres.forEach(asignaturaName => {
          const notasAsignatura = notasPorAsignatura.get(asignaturaName);
          if (notasAsignatura && notasAsignatura.has(estudiante.estudiante_id)) {
            const nota = notasAsignatura.get(estudiante.estudiante_id)!;
            notas[asignaturaName] = nota;
            notasArray.push(nota);
          }
        });

        const promedio = notasArray.length > 0 ? notasArray.reduce((a, b) => a + b, 0) / notasArray.length : 0;
        return { nombre_completo: estudiante.nombre_completo, notas, promedio };
      });

      const promedios = estudiantesReporte.map(e => e.promedio).filter(p => p > 0);
      const promedio_general = promedios.length > 0 ? promedios.reduce((a, b) => a + b, 0) / promedios.length : 0;
      const aprobados = promedios.filter(p => p >= 4.0).length;
      const reprobados = promedios.filter(p => p < 4.0 && p > 0).length;

      report.value = {
        estudiantes: estudiantesReporte,
        asignaturas: asignaturasNombres,
        promedio_general,
        aprobados,
        reprobados
      };
    }

  } catch (error) {
    console.error('Error generating report:', error);
    alert('Error al generar el reporte');
  } finally {
    loading.value = false;
  }
};

const getGradeClass = (grade: number): string => {
  if (grade >= 6.0) return 'bg-emerald-100 text-emerald-800';
  if (grade >= 5.0) return 'bg-green-100 text-green-800';
  if (grade >= 4.0) return 'bg-blue-100 text-blue-800';
  return 'bg-red-100 text-red-800';
};

const exportToCSV = () => {
  if (!report.value) return;

  try {
    // Preparar encabezados
    const headers = ['N°', 'Estudiante', ...report.value.asignaturas, 'Promedio'];

    // Preparar datos
    const data = report.value.estudiantes.map((student, index) => {
      const row: any = {
        'N°': index + 1,
        'Estudiante': student.nombre_completo
      };

      report.value!.asignaturas.forEach(asignatura => {
        const nota = student.notas[asignatura];
        row[asignatura] = nota !== undefined && nota !== null ? nota.toFixed(1) : '-';
      });

      row['Promedio'] = student.promedio.toFixed(1);
      return row;
    });

    // Crear CSV con información del curso
    const csvLines = [
      `Reporte de Notas - ${selectedCurso.value}`,
      `Promedio General: ${report.value.promedio_general.toFixed(1)}`,
      `Aprobados: ${report.value.aprobados} | Reprobados: ${report.value.reprobados}`,
      '',
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(','))
    ];

    const csvContent = csvLines.join('\n');

    // Crear BOM para UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_notas_${selectedCurso.value.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV exportado exitosamente');
  } catch (error) {
    console.error('Error exportando CSV:', error);
    alert('Error al exportar CSV');
  }
};

const exportToPDF = () => {
  if (!report.value) return;

  try {
    // Crear contenido HTML para el PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Notas</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #2563eb;
            text-align: center;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 5px 0;
            font-size: 12px;
            color: #6b7280;
            font-weight: normal;
          }
          .summary-card p {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
          }
          th {
            background-color: #2563eb;
            color: white;
            padding: 8px 4px;
            text-align: center;
            font-weight: bold;
            font-size: 9px;
          }
          td {
            padding: 8px 4px;
            border-bottom: 1px solid #ddd;
            text-align: center;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .student-name {
            text-align: left;
            font-weight: 500;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .badge {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 8px;
            font-size: 9px;
            font-weight: bold;
          }
          .badge-emerald { background-color: #d1fae5; color: #065f46; }
          .badge-green { background-color: #d1fae5; color: #065f46; }
          .badge-blue { background-color: #dbeafe; color: #1e40af; }
          .badge-red { background-color: #fee2e2; color: #991b1b; }
          .promedio-col { background-color: #eff6ff; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Reporte de Notas</h1>
        <div class="subtitle">
          <strong>${selectedCurso.value}</strong><br>
          Generado el ${new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Total Estudiantes</h3>
            <p>${report.value.estudiantes.length}</p>
          </div>
          <div class="summary-card">
            <h3>Promedio General</h3>
            <p>${report.value.promedio_general.toFixed(1)}</p>
          </div>
          <div class="summary-card">
            <h3>Aprobados</h3>
            <p style="color: #059669;">${report.value.aprobados}</p>
          </div>
          <div class="summary-card">
            <h3>Reprobados</h3>
            <p style="color: #dc2626;">${report.value.reprobados}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th style="text-align: left;">Estudiante</th>
              ${report.value.asignaturas.map(asig => `<th>${asig}</th>`).join('')}
              <th style="background-color: #1e40af;">Promedio</th>
            </tr>
          </thead>
          <tbody>
            ${report.value.estudiantes.map((student, index) => {
              const getGradeColor = (grade: number) => {
                if (grade >= 6.0) return 'badge-emerald';
                if (grade >= 5.0) return 'badge-green';
                if (grade >= 4.0) return 'badge-blue';
                return 'badge-red';
              };

              return `
              <tr>
                <td>${index + 1}</td>
                <td class="student-name">${student.nombre_completo}</td>
                ${report.value!.asignaturas.map(asig => {
                  const nota = student.notas[asig];
                  if (nota !== undefined && nota !== null) {
                    return `<td><span class="badge ${getGradeColor(nota)}">${nota.toFixed(1)}</span></td>`;
                  }
                  return '<td>-</td>';
                }).join('')}
                <td class="promedio-col"><span class="badge ${getGradeColor(student.promedio)}">${student.promedio.toFixed(1)}</span></td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Data-School - Sistema de Gestión Escolar</p>
        </div>
      </body>
      </html>
    `;

    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Esperar a que se cargue el contenido antes de imprimir
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert('Por favor, permite ventanas emergentes para exportar a PDF');
    }

    console.log('✅ PDF generado exitosamente');
  } catch (error) {
    console.error('Error exportando PDF:', error);
    alert('Error al exportar PDF');
  }
};

// Lifecycle
onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }
});
</script>
