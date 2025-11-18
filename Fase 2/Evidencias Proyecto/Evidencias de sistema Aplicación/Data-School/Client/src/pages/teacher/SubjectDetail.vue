<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header con navegación -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Mis Asignaturas
        </button>

        <!-- Loading state for header -->
        <div v-if="loading && !currentSubject" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        <!-- Header con información de la asignatura -->
        <div v-else-if="currentSubject" class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg text-white p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-3xl font-bold mb-2">{{ currentSubject.nombre }}</h1>
              <p class="text-primary-100 text-lg mb-4">{{ currentSubject.codigo }}</p>
              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{{ currentSubject.curso.nivel }}</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ currentSubject.horas_semanales }} hrs/semana</span>
                </div>
                <div v-if="currentSubject.sala" class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Sala {{ currentSubject.sala }}</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Período {{ currentSubject.periodo }}</span>
                </div>
              </div>
            </div>
            <div class="w-20 h-20 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-red-800">No se pudo cargar la información de la asignatura</p>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div v-if="currentSubject" class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <component :is="tab.icon" class="w-5 h-5 mr-2" />
              {{ tab.label }}
              <span
                v-if="tab.count !== undefined"
                :class="[
                  'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                ]"
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Tab: Estudiantes -->
          <div v-if="activeTab === 'students'">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900">Estudiantes de la Asignatura</h2>
              <input
                v-model="studentSearchQuery"
                type="text"
                placeholder="Buscar estudiante..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <!-- Loading state -->
            <div v-if="loadingStudents" class="space-y-3">
              <div v-for="i in 5" :key="i" class="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>

            <!-- Students table -->
            <div v-else-if="filteredStudents.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anotaciones</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="student in filteredStudents" :key="student.estudiante_id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ student.numero_lista }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ student.nombre_completo }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ student.rut }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getGradeClass(student.promedio_asignatura)" class="text-sm font-semibold">
                        {{ student.promedio_asignatura ? student.promedio_asignatura.toFixed(1) : 'S/N' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <span :class="getAttendanceClass(student.asistencia_porcentaje)" class="text-sm font-semibold">
                          {{ student.asistencia_porcentaje ? student.asistencia_porcentaje.toFixed(0) : '0' }}%
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center space-x-2">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          +{{ student.total_anotaciones_positivas || 0 }}
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          -{{ student.total_anotaciones_negativas || 0 }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        @click="viewStudentProfile(student.estudiante_id)"
                        class="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        Ver Perfil
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
              <p class="text-gray-600">{{ studentSearchQuery ? 'No se encontraron estudiantes con ese criterio' : 'Esta asignatura no tiene estudiantes inscritos' }}</p>
            </div>
          </div>

          <!-- Tab: Evaluaciones -->
          <div v-if="activeTab === 'evaluations'">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900">Evaluaciones</h2>
              <button
                @click="goToCreateEvaluation"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva Evaluación
              </button>
            </div>

            <!-- Loading state -->
            <div v-if="loadingEvaluations" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div class="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>

            <!-- Evaluations grid -->
            <div v-else-if="evaluations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="evaluation in evaluations"
                :key="evaluation.evaluacion_id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-bold text-gray-900">{{ evaluation.nombre }}</h3>
                  <span :class="getEvaluationTypeBadge(evaluation.tipo)" class="px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2">
                    {{ evaluation.tipo }}
                  </span>
                </div>
                <p v-if="evaluation.descripcion" class="text-sm text-gray-600 mb-3 line-clamp-2">
                  {{ evaluation.descripcion }}
                </p>
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(evaluation.fecha_evaluacion) }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Puntaje: {{ evaluation.puntaje_maximo }} pts · {{ evaluation.porcentaje_nota }}%
                  </div>
                  <div v-if="evaluation.total_estudiantes" class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ evaluation.total_estudiantes_evaluados || 0 }} / {{ evaluation.total_estudiantes }} evaluados
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="goToGradeEntry(evaluation.evaluacion_id)"
                    class="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Calificar
                  </button>
                  <button
                    @click="editEvaluation(evaluation.evaluacion_id)"
                    class="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones</h3>
              <p class="text-gray-600 mb-4">Aún no has creado evaluaciones para esta asignatura</p>
              <button
                @click="goToCreateEvaluation"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Crear Primera Evaluación
              </button>
            </div>
          </div>

          <!-- Tab: Asistencia -->
          <div v-if="activeTab === 'attendance'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-gray-900">Resumen de Asistencia</h2>
              <button
                @click="goToAttendance"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Registrar Asistencia
              </button>
            </div>

            <!-- Attendance Detail Table - Day by Day View -->
            <div v-if="students.length > 0" class="mb-6">
              <AttendanceDetailTable :asignaturaId="subjectId" />
            </div>

            <!-- Summary Stats Table -->
            <div v-if="students.length > 0" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-semibold text-gray-900">Resumen por Estudiante</h3>
                <p class="text-sm text-gray-600 mt-1">Estadísticas generales de asistencia</p>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clases Totales</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presentes</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ausentes</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Asistencia</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="student in students" :key="student.estudiante_id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ student.numero_lista }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ student.nombre_completo }}</div>
                        <div class="text-xs text-gray-500">{{ student.rut }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ student.total_clases || 0 }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {{ student.clases_presentes || 0 }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {{ student.clases_ausentes || 0 }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-1 mr-2">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                              <div
                                :class="getAttendanceBarClass(student.asistencia_porcentaje)"
                                class="h-2 rounded-full"
                                :style="{ width: `${student.asistencia_porcentaje || 0}%` }"
                              ></div>
                            </div>
                          </div>
                          <span :class="getAttendanceClass(student.asistencia_porcentaje)" class="text-sm font-semibold min-w-[3rem] text-right">
                            {{ student.asistencia_porcentaje ? student.asistencia_porcentaje.toFixed(1) : '0.0' }}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <svg class="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
              <p class="text-gray-600 mb-4">Esta asignatura no tiene estudiantes inscritos</p>
            </div>
          </div>

          <!-- Tab: Estadísticas -->
          <div v-if="activeTab === 'statistics'">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Estadísticas de la Asignatura</h2>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-blue-100 text-sm">Total Estudiantes</p>
                    <p class="text-3xl font-bold mt-1">{{ studentStats.total }}</p>
                  </div>
                  <svg class="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              <div class="bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-6 text-white">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-green-100 text-sm">Promedio General</p>
                    <p class="text-3xl font-bold mt-1">{{ studentStats.averageGrade.toFixed(1) }}</p>
                  </div>
                  <svg class="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg p-6 text-white">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-purple-100 text-sm">Asistencia Promedio</p>
                    <p class="text-3xl font-bold mt-1">{{ studentStats.averageAttendance.toFixed(0) }}%</p>
                  </div>
                  <svg class="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>

              <div class="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg p-6 text-white">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-orange-100 text-sm">Total Evaluaciones</p>
                    <p class="text-3xl font-bold mt-1">{{ evaluations.length }}</p>
                  </div>
                  <svg class="w-12 h-12 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Grades Chart -->
            <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Notas Promedio por Evaluación</h3>
              <div v-if="evaluations.length > 0" class="space-y-4">
                <div v-for="evaluation in evaluations" :key="evaluation.evaluacion_id" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ evaluation.nombre }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(evaluation.fecha_evaluacion) }}</p>
                    </div>
                    <div class="flex items-center ml-4">
                      <span :class="getGradeClass(evaluation.promedio_nota)" class="text-lg font-bold min-w-[3rem] text-right">
                        {{ evaluation.promedio_nota ? evaluation.promedio_nota.toFixed(1) : 'S/N' }}
                      </span>
                    </div>
                  </div>
                  <div class="relative w-full bg-gray-200 rounded-full h-3">
                    <div
                      v-if="evaluation.promedio_nota"
                      :class="getGradeBarClass(evaluation.promedio_nota)"
                      class="h-3 rounded-full transition-all"
                      :style="{ width: `${(evaluation.promedio_nota / 7.0) * 100}%` }"
                    >
                      <span class="absolute right-2 top-0 text-xs text-white font-semibold">
                        {{ evaluation.total_estudiantes_evaluados || 0 }}/{{ evaluation.total_estudiantes || 0 }} estudiantes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                <p>No hay evaluaciones para mostrar</p>
              </div>
            </div>

            <!-- Performance Distribution -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Distribución de Rendimiento</h3>
                <div class="space-y-3">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">Excelente (6.0 - 7.0)</span>
                      <span class="text-sm font-semibold text-gray-900">{{ studentStats.gradeDistribution.excellent }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-green-500 h-2 rounded-full"
                        :style="{ width: `${(studentStats.gradeDistribution.excellent / studentStats.total * 100)}%` }"
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">Bueno (5.0 - 5.9)</span>
                      <span class="text-sm font-semibold text-gray-900">{{ studentStats.gradeDistribution.good }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-500 h-2 rounded-full"
                        :style="{ width: `${(studentStats.gradeDistribution.good / studentStats.total * 100)}%` }"
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">Suficiente (4.0 - 4.9)</span>
                      <span class="text-sm font-semibold text-gray-900">{{ studentStats.gradeDistribution.sufficient }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-yellow-500 h-2 rounded-full"
                        :style="{ width: `${(studentStats.gradeDistribution.sufficient / studentStats.total * 100)}%` }"
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">Insuficiente (< 4.0)</span>
                      <span class="text-sm font-semibold text-gray-900">{{ studentStats.gradeDistribution.insufficient }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-red-500 h-2 rounded-full"
                        :style="{ width: `${(studentStats.gradeDistribution.insufficient / studentStats.total * 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Resumen de Anotaciones</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <div>
                        <p class="text-sm text-gray-600">Anotaciones Positivas</p>
                        <p class="text-2xl font-bold text-green-700">{{ studentStats.totalPositiveNotes }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      <div>
                        <p class="text-sm text-gray-600">Anotaciones Negativas</p>
                        <p class="text-2xl font-bold text-red-700">{{ studentStats.totalNegativeNotes }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTeacherStore } from '@/store/teacher.store';
import type { Subject } from '@/types/teacher.types';
import AttendanceDetailTable from '@/components/teacher/AttendanceDetailTable.vue';

const router = useRouter();
const route = useRoute();
const teacherStore = useTeacherStore();

type TabType = 'students' | 'evaluations' | 'attendance' | 'statistics';
const activeTab = ref<TabType>('students');
const studentSearchQuery = ref('');
const loading = ref(false);
const loadingStudents = ref(false);
const loadingEvaluations = ref(false);

// Icon components para los tabs
const StudentsIcon = h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  })
]);

const EvaluationsIcon = h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  })
]);

const AttendanceIcon = h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  })
]);

const StatisticsIcon = h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  })
]);

// Tabs configuration
const tabs = computed(() => [
  {
    id: 'students' as TabType,
    label: 'Estudiantes',
    icon: StudentsIcon,
    count: students.value.length
  },
  {
    id: 'evaluations' as TabType,
    label: 'Evaluaciones',
    icon: EvaluationsIcon,
    count: evaluations.value.length
  },
  {
    id: 'attendance' as TabType,
    label: 'Asistencia',
    icon: AttendanceIcon
  },
  {
    id: 'statistics' as TabType,
    label: 'Estadísticas',
    icon: StatisticsIcon
  }
]);

// Get subject ID from route
const subjectId = computed(() => route.params.id as string);

// Current subject
const currentSubject = computed((): Subject | null => {
  return teacherStore.subjects.find(s => s.asignatura_id === subjectId.value) || null;
});

// Students data
const students = computed(() => teacherStore.currentSubjectStudents);

// Filtered students
const filteredStudents = computed(() => {
  if (!studentSearchQuery.value) {
    return students.value;
  }
  const query = studentSearchQuery.value.toLowerCase();
  return students.value.filter(student =>
    student.nombre_completo.toLowerCase().includes(query) ||
    student.rut.toLowerCase().includes(query) ||
    student.numero_lista.toString().includes(query)
  );
});

// Evaluations data
const evaluations = computed(() => teacherStore.evaluations);

// Student statistics
const studentStats = computed(() => {
  const total = students.value.length;
  if (total === 0) {
    return {
      total: 0,
      averageGrade: 0,
      averageAttendance: 0,
      totalPositiveNotes: 0,
      totalNegativeNotes: 0,
      gradeDistribution: {
        excellent: 0,
        good: 0,
        sufficient: 0,
        insufficient: 0
      }
    };
  }

  const sumGrades = students.value.reduce((sum, s) => sum + (s.promedio_asignatura || 0), 0);
  const sumAttendance = students.value.reduce((sum, s) => sum + (s.asistencia_porcentaje || 0), 0);
  const totalPositive = students.value.reduce((sum, s) => sum + (s.total_anotaciones_positivas || 0), 0);
  const totalNegative = students.value.reduce((sum, s) => sum + (s.total_anotaciones_negativas || 0), 0);

  const distribution = {
    excellent: students.value.filter(s => s.promedio_asignatura >= 6.0).length,
    good: students.value.filter(s => s.promedio_asignatura >= 5.0 && s.promedio_asignatura < 6.0).length,
    sufficient: students.value.filter(s => s.promedio_asignatura >= 4.0 && s.promedio_asignatura < 5.0).length,
    insufficient: students.value.filter(s => s.promedio_asignatura < 4.0).length
  };

  return {
    total,
    averageGrade: sumGrades / total,
    averageAttendance: sumAttendance / total,
    totalPositiveNotes: totalPositive,
    totalNegativeNotes: totalNegative,
    gradeDistribution: distribution
  };
});

// Helper functions
const getGradeClass = (grade: number | null) => {
  if (!grade) return 'text-gray-400';
  if (grade >= 6.0) return 'text-green-700';
  if (grade >= 5.0) return 'text-blue-700';
  if (grade >= 4.0) return 'text-yellow-700';
  return 'text-red-700';
};

const getGradeBarClass = (grade: number | null) => {
  if (!grade) return 'bg-gray-400';
  if (grade >= 6.0) return 'bg-green-500';
  if (grade >= 5.0) return 'bg-blue-500';
  if (grade >= 4.0) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getAttendanceClass = (percentage: number | null) => {
  if (!percentage) return 'text-gray-400';
  if (percentage >= 90) return 'text-green-700';
  if (percentage >= 80) return 'text-blue-700';
  if (percentage >= 70) return 'text-yellow-700';
  return 'text-red-700';
};

const getAttendanceBarClass = (percentage: number | null) => {
  if (!percentage) return 'bg-gray-400';
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 80) return 'bg-blue-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getEvaluationTypeBadge = (tipo: string) => {
  const badges: Record<string, string> = {
    'PRUEBA': 'bg-blue-100 text-blue-800',
    'TRABAJO': 'bg-purple-100 text-purple-800',
    'TAREA': 'bg-green-100 text-green-800',
    'PROYECTO': 'bg-orange-100 text-orange-800',
    'PRESENTACION': 'bg-pink-100 text-pink-800',
    'OTROS': 'bg-gray-100 text-gray-800'
  };
  return badges[tipo] || badges['OTROS'];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Navigation functions
const goBack = () => {
  router.push('/teacher/subjects');
};

const viewStudentProfile = (studentId: string) => {
  router.push(`/teacher/students/${studentId}`);
};

const goToCreateEvaluation = () => {
  router.push({ path: '/teacher/evaluations/new', query: { subject: subjectId.value } });
};

const goToGradeEntry = (evaluationId: number) => {
  router.push({ path: '/teacher/grades', query: { evaluation: evaluationId } });
};

const editEvaluation = (evaluationId: number) => {
  router.push(`/teacher/evaluations/${evaluationId}/edit`);
};

const goToAttendance = () => {
  router.push({ path: '/teacher/attendance', query: { subject: subjectId.value } });
};

const goToAttendanceReport = () => {
  router.push({ path: '/teacher/reports/attendance', query: { subject: subjectId.value } });
};

// Load data
onMounted(async () => {
  loading.value = true;

  try {
    // Si no hay asignaturas cargadas, cargarlas primero
    if (teacherStore.subjects.length === 0) {
      await teacherStore.fetchMySubjects();
    }

    // Cargar estudiantes de la asignatura
    loadingStudents.value = true;
    await teacherStore.fetchSubjectStudents(subjectId.value);
    loadingStudents.value = false;

    // Cargar evaluaciones de la asignatura
    loadingEvaluations.value = true;
    await teacherStore.fetchEvaluations(subjectId.value);
    loadingEvaluations.value = false;

  } catch (error) {
    console.error('Error loading subject data:', error);
  } finally {
    loading.value = false;
  }
});
</script>
