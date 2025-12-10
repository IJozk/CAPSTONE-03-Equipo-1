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
            :disabled="!sala || !sala.sala_id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
              !sala || !sala.sala_id
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : editMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
            ]"
            :title="!sala || !sala.sala_id ? 'No se puede editar: El curso no tiene sala asignada' : ''"
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
      <!-- Alerta cuando no hay sala asignada -->
      <div v-if="!sala || !sala.sala_id" class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              <strong>Sala no asignada:</strong> Este curso no tiene una sala asignada. Para poder gestionar la distribución de asientos, primero debe asignarse una sala al curso. Contacta al administrador para realizar esta configuración.
            </p>
          </div>
        </div>
      </div>

      <!-- Indicador de pizarra -->
      <div class="mb-6">
        <div class="h-16 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg shadow-inner flex items-center justify-center">
          <span class="text-white font-semibold text-lg">PIZARRA</span>
        </div>
      </div>

      <!-- Asiento del profesor (cuando está al frente) -->
      <div v-if="teacherPosition === 'front'" class="mb-4 flex justify-center">
        <div class="bg-primary-100 border-2 border-primary-500 rounded-lg p-4 flex items-center gap-3 shadow-lg">
          <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="font-semibold text-primary-900">Profesor</span>
        </div>
      </div>

      <!-- Grid de asientos -->
      <div class="relative flex gap-4">
        <!-- Asiento del profesor (izquierda) -->
        <div v-if="teacherPosition === 'left'" class="flex items-center">
          <div class="bg-primary-100 border-2 border-primary-500 rounded-lg p-4 flex flex-col items-center gap-2 shadow-lg h-fit">
            <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="font-semibold text-primary-900 text-sm">Profesor</span>
          </div>
        </div>

        <!-- Grid principal de asientos -->
        <div class="flex-1">
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
            @drop="!isBlocked(index) ? handleDrop($event, index) : null"
            @dragover.prevent
            @dragenter.prevent
            :class="[
              'relative aspect-square rounded-lg border-2 transition-all duration-200',
              isBlocked(index)
                ? 'bg-gray-200 border-gray-400 cursor-not-allowed opacity-50'
                : 'cursor-pointer',
              !isBlocked(index) && getSeatClasses(seat),
              editMode && !seat.student && !isBlocked(index) ? 'hover:border-primary-400 hover:bg-primary-50' : '',
              draggedStudent && !seat.student && !isBlocked(index) ? 'border-dashed' : ''
            ]"
            @click="!isBlocked(index) ? handleSeatClick(seat, index) : null"
            @contextmenu.prevent="editMode ? toggleBlockSeat(index) : null"
          >
            <!-- Asiento bloqueado -->
            <div v-if="isBlocked(index)" class="flex items-center justify-center h-full">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <!-- Asiento vacío -->
            <div v-else-if="!seat.student" class="flex items-center justify-center h-full">
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
              @click.stop="!editMode ? showStudentHistory(seat.student) : null"
              class="flex flex-col items-center justify-center h-full p-2"
              :class="editMode ? 'cursor-move' : 'cursor-pointer hover:scale-105 transition-transform'"
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

        <!-- Asiento del profesor (derecha) -->
        <div v-if="teacherPosition === 'right'" class="flex items-center">
          <div class="bg-primary-100 border-2 border-primary-500 rounded-lg p-4 flex flex-col items-center gap-2 shadow-lg h-fit">
            <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="font-semibold text-primary-900 text-sm">Profesor</span>
          </div>
        </div>
      </div>

      <!-- Asiento del profesor (cuando está atrás) -->
      <div v-if="teacherPosition === 'back'" class="mt-4 flex justify-center">
        <div class="bg-primary-100 border-2 border-primary-500 rounded-lg p-4 flex items-center gap-3 shadow-lg">
          <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="font-semibold text-primary-900">Profesor</span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div v-if="editMode" class="mt-6 space-y-4">
        <!-- Info panel -->
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1 text-sm text-blue-800">
              <p class="font-semibold mb-1">Modo de Edición</p>
              <p><strong>Asignar:</strong> Arrastra estudiantes a los asientos o haz clic en un asiento vacío</p>
              <p><strong>Bloquear/Desbloquear:</strong> Clic derecho en un asiento para crear espacios (pasillos, áreas vacías)</p>
              <p class="mt-1 text-xs">Asientos bloqueados: <strong>{{ blockedSeats.size }}</strong> | Estudiantes asignados: <strong>{{ assignedCount }}</strong> de <strong>{{ totalStudents }}</strong></p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
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

    <!-- Sidebar para historial de cambios de asiento -->
    <transition name="slide-right">
      <div
        v-if="selectedStudentForHistory"
        class="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50"
      >
        <div class="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 shadow-lg">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold">Historial de Asientos</h3>
              <p class="text-primary-100 text-sm mt-1">{{ selectedStudentForHistory.nombre_completo }}</p>
            </div>
            <button
              @click="closeHistorySidebar"
              class="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>RUT: {{ selectedStudentForHistory.rut }}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span>#{{ selectedStudentForHistory.numero_lista }}</span>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loadingHistory" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p class="text-gray-600 mt-2 text-sm">Cargando historial...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="historyError" class="p-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ historyError }}</p>
          </div>
        </div>

        <!-- Timeline de cambios -->
        <div v-else class="p-6 space-y-6">
          <!-- Gráfico de Evolución del Rendimiento -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-200">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Evolución del Rendimiento
            </h4>

            <div v-if="loadingPerformance" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-600 mt-2 text-sm">Cargando datos...</p>
            </div>

            <div v-else-if="performanceError" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-800 text-sm">{{ performanceError }}</p>
            </div>

            <!-- Looker Studio Embed -->
            <div v-else class="w-full">
              <!-- Si el estudiante tiene datos de rendimiento, mostrar el embed -->
              <div v-if="performanceData.length > 0" class="looker-embed-container">
                <iframe
                  :src="getLookerStudioUrl(selectedStudentForHistory?.estudiante_id)"
                  :style="lookerEmbedStyle"
                  allowFullScreen
                  allow="fullscreen"
                ></iframe>
              </div>

              <!-- Fallback si no hay datos -->
              <div v-else class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p class="text-sm">No hay datos de rendimiento disponibles</p>
              </div>

              <!-- Resumen de métricas (mantener igual) -->
              <div v-if="performanceData.length > 0" class="mt-4 grid grid-cols-3 gap-3">
                <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <p class="text-xs text-gray-600 mb-1">Promedio Actual</p>
                  <p class="text-2xl font-bold" :class="getGradeColor(currentPerformance.promedio)">
                    {{ currentPerformance.promedio?.toFixed(1) || 'N/A' }}
                  </p>
                </div>
                <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <p class="text-xs text-gray-600 mb-1">Tendencia</p>
                  <div class="flex items-center gap-1">
                    <svg
                      v-if="performanceTrend > 0"
                      class="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <svg
                      v-else-if="performanceTrend < 0"
                      class="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <svg
                      v-else
                      class="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                    </svg>
                    <span class="text-lg font-bold" :class="performanceTrend > 0 ? 'text-green-600' : performanceTrend < 0 ? 'text-red-600' : 'text-gray-600'">
                      {{ performanceTrend > 0 ? '+' : '' }}{{ performanceTrend.toFixed(1) }}
                    </span>
                  </div>
                </div>
                <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <p class="text-xs text-gray-600 mb-1">Períodos</p>
                  <p class="text-2xl font-bold text-gray-900">{{ performanceData.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial de Asientos -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Historial de Asientos</h4>

            <div v-if="seatHistory.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-gray-600">No hay cambios de asiento registrados</p>
            </div>

            <div v-else class="space-y-4">
            <div
              v-for="(entry, index) in seatHistory"
              :key="entry.asignacion_id"
              class="relative"
            >
              <!-- Timeline line -->
              <div
                v-if="index < seatHistory.length - 1"
                class="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"
              ></div>

              <!-- Entry card -->
              <div class="flex gap-4">
                <!-- Timeline dot -->
                <div
                  :class="[
                    'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md',
                    entry.es_actual ? 'bg-green-500' : 'bg-gray-400'
                  ]"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1 bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-900">Asiento #{{ entry.num_asiento + 1 }}</span>
                      <span
                        v-if="entry.es_actual"
                        class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
                      >
                        Actual
                      </span>
                    </div>
                  </div>

                  <div class="space-y-1 text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatDate(entry.fecha_asignacion) }}</span>
                    </div>
                    <div v-if="entry.Sala" class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Sala: {{ entry.Sala.nombre }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    distribucion_asientos_template?: {
      rows: number;
      columns: number;
      teacher_position?: 'front' | 'back' | 'left' | 'right';
      blocked_seats?: number[];
    } | null;
  };
  curso?: {
    curso_id: string;
    nombre: string;
  };
}

// Variable para el embed de Looker
const lookerEmbedStyle = ref({
  width: '300px',
  height: '200px',
  border: 'none',
  borderRadius: '0.5rem'
});

// Función para generar la URL del Looker Studio con filtros
const getLookerStudioUrl = (studentId: string | undefined): string => {
  if (!studentId) return '';

  const reportId = '8c6ffef1-4be7-4be3-8d62-2ffa15927c72/page/sF5hF'; // Reemplaza con tu ID
  const baseUrl = `https://lookerstudio.google.com/embed/reporting/${reportId}`;

  const filtro = {
    "ds2.estudiante_id_param": studentId
  }

  let paramsAsString = JSON.stringify(filtro);
  let encodedParams = encodeURIComponent(paramsAsString)

  console.log(`${encodedParams}`);

  // Solo enviar estudiante_id
  return `${baseUrl}?params=${encodedParams}`;
};

const props = defineProps<Props>();

// Estados
const editMode = ref(false);
const saving = ref(false);
const currentViewMode = ref<'normal' | 'performance' | 'behavior'>('normal');
const draggedStudent = ref<Student | null>(null);
const draggedFromIndex = ref<number | null>(null);

// Estados para historial de asientos
const selectedStudentForHistory = ref<Student | null>(null);
const seatHistory = ref<any[]>([]);
const loadingHistory = ref(false);
const historyError = ref<string | null>(null);

// Estados para evolución de rendimiento
const performanceData = ref<any[]>([]);
const loadingPerformance = ref(false);
const performanceError = ref<string | null>(null);
const performanceChart = ref<HTMLCanvasElement | null>(null);
const currentPerformance = ref({ promedio: 0 });
const performanceTrend = computed(() => {
  if (performanceData.value.length < 2) return 0;
  const first = performanceData.value[0].promedio;
  const last = performanceData.value[performanceData.value.length - 1].promedio;
  return last - first;
});

// Configuración de la sala
const rows = ref(5);
const columns = ref(6);
const totalSeats = computed(() => rows.value * columns.value);
const teacherPosition = ref<'front' | 'back' | 'left' | 'right'>('front');
const blockedSeats = ref<Set<number>>(new Set());

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
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
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
  loadTemplateConfiguration();
  initializeSeats();
  loadSeatingArrangement();
});

const loadTemplateConfiguration = () => {
  // Si la sala tiene una plantilla de distribución, usarla
  if (props.sala?.distribucion_asientos_template) {
    const template = props.sala.distribucion_asientos_template;
    if (template.rows && template.columns) {
      rows.value = template.rows;
      columns.value = template.columns;
      teacherPosition.value = template.teacher_position || 'front';

      // Cargar asientos bloqueados
      if (template.blocked_seats && Array.isArray(template.blocked_seats)) {
        blockedSeats.value = new Set(template.blocked_seats);
      }

      console.log(`Plantilla de distribución cargada: ${rows.value}x${columns.value} = ${totalSeats.value} asientos`);
      console.log(`Posición del profesor: ${teacherPosition.value}`);
      console.log(`Asientos bloqueados: ${blockedSeats.value.size}`);
    }
  }
};

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

  // No permitir drop en asientos bloqueados
  if (isBlocked(toIndex)) return;

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
  if (!editMode.value || seat.student || isBlocked(index)) return;

  // Si hay estudiantes sin asignar, asignar el primero
  if (unassignedStudents.value.length > 0) {
    seats.value[index].student = unassignedStudents.value[0];
  }
};

const isBlocked = (index: number) => {
  return blockedSeats.value.has(index);
};

const toggleBlockSeat = (index: number) => {
  if (!editMode.value) return;

  // No permitir bloquear un asiento ocupado
  if (seats.value[index].student) {
    alert('No puedes bloquear un asiento ocupado. Primero remueve al estudiante.');
    return;
  }

  if (blockedSeats.value.has(index)) {
    blockedSeats.value.delete(index);
  } else {
    blockedSeats.value.add(index);
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
  // Verificar que haya sala asignada antes de permitir edición
  if (!props.sala || !props.sala.sala_id) {
    alert('No se puede editar la distribución de asientos.\n\nEl curso debe tener una sala asignada primero. Por favor, contacta al administrador para asignar una sala a este curso.');
    return;
  }
  editMode.value = !editMode.value;
};

// Funciones para historial de asientos
const showStudentHistory = async (student: Student) => {
  selectedStudentForHistory.value = student;
  loadingHistory.value = true;
  historyError.value = null;
  seatHistory.value = [];

  try {
    // Llamar al endpoint para obtener el historial de asientos del estudiante
    const response = await apiClient.get(`/cursos/${props.cursoId}/estudiantes/${student.estudiante_id}/historial-asientos`);
    seatHistory.value = response.data.data || [];

    // Cargar también la evolución del rendimiento
    await loadPerformanceData(student.estudiante_id);
  } catch (error: any) {
    console.error('Error cargando historial de asientos:', error);
    historyError.value = error?.response?.data?.message || 'Error al cargar el historial de asientos';
  } finally {
    loadingHistory.value = false;
  }
};

const closeHistorySidebar = () => {
  selectedStudentForHistory.value = null;
  seatHistory.value = [];
  historyError.value = null;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función auxiliar para obtener el color según la nota
const getGradeColor = (grade: number | undefined): string => {
  if (!grade) return 'text-gray-600';
  if (grade >= 6.0) return 'text-green-600';
  if (grade >= 5.0) return 'text-blue-600';
  if (grade >= 4.0) return 'text-yellow-600';
  return 'text-red-600';
};

// Cargar datos de evolución del rendimiento
const loadPerformanceData = async (studentId: string) => {
  loadingPerformance.value = true;
  performanceError.value = null;
  performanceData.value = [];

  try {
    console.log('🔄 Cargando evolución de rendimiento para estudiante:', studentId);

    // Llamar al endpoint para obtener la evolución del rendimiento por períodos de asiento
    const response = await apiClient.get(`/cursos/${props.cursoId}/estudiantes/${studentId}/rendimiento-por-asiento`);
    const data = response.data.data || [];

    console.log('✅ Datos de rendimiento cargados:', data);
    performanceData.value = data;

    // Calcular el rendimiento actual (último período)
    if (data.length > 0) {
      currentPerformance.value = data[data.length - 1];
    } else {
      currentPerformance.value = { promedio: 0 };
    }

    // Dibujar el gráfico si hay datos
    if (data.length > 0 && performanceChart.value) {
      drawPerformanceChart();
    }
  } catch (error: any) {
    console.error('❌ Error cargando evolución de rendimiento:', error);
    performanceError.value = error?.response?.data?.message || 'Error al cargar la evolución del rendimiento';
  } finally {
    loadingPerformance.value = false;
  }
};

// Dibujar el gráfico de rendimiento
const drawPerformanceChart = () => {
  if (!performanceChart.value || performanceData.value.length === 0) return;

  const canvas = performanceChart.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Configurar tamaño del canvas
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // Configuración del gráfico
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Escalas
  const maxGrade = 7.0;
  const minGrade = 1.0;
  const data = performanceData.value;

  // Dibujar ejes
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;

  // Eje Y (notas)
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // Eje X (períodos)
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  // Líneas de referencia horizontales (notas)
  ctx.strokeStyle = '#F3F4F6';
  ctx.lineWidth = 1;
  [2, 3, 4, 5, 6, 7].forEach(grade => {
    const y = padding.top + chartHeight - ((grade - minGrade) / (maxGrade - minGrade)) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Etiquetas del eje Y
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(grade.toFixed(1), padding.left - 10, y);
  });

  // Línea de aprobación (4.0)
  const approvalY = padding.top + chartHeight - ((4.0 - minGrade) / (maxGrade - minGrade)) * chartHeight;
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding.left, approvalY);
  ctx.lineTo(width - padding.right, approvalY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dibujar línea de rendimiento
  if (data.length > 1) {
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding.left + (index / (data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.promedio - minGrade) / (maxGrade - minGrade)) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  // Dibujar puntos
  data.forEach((point, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - ((point.promedio - minGrade) / (maxGrade - minGrade)) * chartHeight;

    // Punto
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Borde blanco
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Etiqueta del valor
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(point.promedio.toFixed(1), x, y - 10);
  });

  // Etiquetas del eje X (períodos)
  ctx.fillStyle = '#6B7280';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  data.forEach((point, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const label = `P${index + 1}`;
    ctx.fillText(label, x, height - padding.bottom + 5);

    // Fechas en segunda línea (opcional, más pequeño)
    if (point.fecha_inicio) {
      const date = new Date(point.fecha_inicio);
      const dateLabel = date.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(dateLabel, x, height - padding.bottom + 18);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#6B7280';
    }
  });
};

// Guardar y cargar distribución
const saveSeatingArrangement = async () => {
  // Validar que el curso tenga una sala asignada
  if (!props.sala || !props.sala.sala_id) {
    alert('No se puede guardar la distribución de asientos.\n\nEl curso debe tener una sala asignada primero. Por favor, contacta al administrador para asignar una sala a este curso.');
    return;
  }

  saving.value = true;
  try {
    // Preparar datos para guardar
    const arrangement = seats.value.map((seat, index) => ({
      position: index,
      estudiante_id: seat.student?.estudiante_id || null
    }));

    // Guardar configuración actualizada de asientos bloqueados en la plantilla
    const updatedTemplate = {
      rows: rows.value,
      columns: columns.value,
      teacher_position: teacherPosition.value,
      blocked_seats: Array.from(blockedSeats.value)
    };

    // Llamar al endpoint para guardar
    await apiClient.post(`/cursos/${props.cursoId}/asientos`, {
      asientos: arrangement,
      sala_id: props.sala.sala_id,
      template: updatedTemplate
    });

    alert('Distribución de asientos guardada correctamente');
    editMode.value = false; // Salir del modo edición después de guardar
  } catch (error: any) {
    console.error('Error guardando distribución:', error);

    // Mostrar mensaje de error específico si es por capacidad
    if (error?.response?.data?.capacidad_sala) {
      const { capacidad_sala, estudiantes_asignados } = error.response.data;
      alert(`No se puede guardar la distribución:\n\n${error.response.data.error}\n\nCapacidad de la sala: ${capacidad_sala} estudiantes\nEstudiantes que intentas asignar: ${estudiantes_asignados}\n\nPor favor, reduce el número de estudiantes o contacta al administrador para cambiar la capacidad de la sala.`);
    } else {
      alert('Error al guardar la distribución. Por favor, intenta nuevamente.');
    }
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

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
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
