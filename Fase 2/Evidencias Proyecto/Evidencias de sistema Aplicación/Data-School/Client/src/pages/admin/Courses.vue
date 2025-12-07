<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
          <p class="text-gray-600 mt-1">Administra todos los cursos del colegio</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Curso
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              v-model.number="filters.nivel_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option :value="undefined">Todos los niveles</option>
              <option v-for="nivel in NIVELES" :key="nivel.id" :value="nivel.id">
                {{ nivel.display }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Año Académico</label>
            <input
              v-model.number="filters.anio_academico"
              type="number"
              placeholder="Ej: 2024"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="applyFilters"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Filtrar
            </button>
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="cursoStore.loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando cursos...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="cursoStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-800">{{ cursoStore.error }}</p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letra</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año Académico</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor Jefe</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumnos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="cursoStore.cursos.length === 0">
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                  No hay cursos registrados
                </td>
              </tr>
              <tr v-for="curso in cursoStore.cursos" :key="curso.curso_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getNivelDisplay(curso.nivel_id) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ curso.nombre }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ curso.anio_academico }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ curso.generacion }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    @click="openProfesorJefeModal(curso)"
                    class="text-primary-600 hover:text-primary-900 font-medium flex items-center gap-1"
                    title="Asignar Profesor Jefe"
                  >
                    <span v-if="curso.profesor_jefe">{{ curso.profesor_jefe.nombre_completo }}</span>
                    <span v-else class="text-gray-400 italic">Sin asignar</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ curso.capacidad_maxima || 'Sin límite' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    @click="openStudentsModal(curso)"
                    class="text-blue-600 hover:text-blue-900 font-medium"
                    title="Gestionar Alumnos"
                  >
                    Ver Alumnos
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="goToSchedules(curso)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Gestionar Horarios"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    @click="openEditModal(curso)"
                    class="text-primary-600 hover:text-primary-900"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(curso)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ isEditing ? 'Editar Curso' : 'Nuevo Curso' }}
              </h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Nombre y Nivel -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nivel <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.nivel_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option v-for="nivel in NIVELES" :key="nivel.id" :value="nivel.id">
                      {{ nivel.display }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Letra <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.nombre"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option v-for="letra in letras" :key="letra" :value="letra">
                      {{ letra }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Año y Generación -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Año Académico <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="formData.anio_academico"
                    type="number"
                    required
                    placeholder="Ej: 2024"
                    step="1"
                    @keypress="onlyNumbers"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Generación <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="formData.generacion"
                    type="number"
                    required
                    placeholder="Ej: 2024"
                    step="1"
                    @keypress="onlyNumbers"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Capacidad Máxima -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad Máxima</label>
                <input
                  v-model.number="formData.capacidad_maxima"
                  type="number"
                  min="1"
                  placeholder="Dejar vacío para sin límite"
                  @keypress="onlyNumbers"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Botones -->
              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Eliminación -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar el curso
            <span class="font-semibold">{{ cursoToDelete?.nombre }}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleDelete"
              :disabled="submitting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Gestionar Alumnos -->
      <div
        v-if="showStudentsModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeStudentsModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Gestionar Alumnos - {{ selectedCurso?.nombre }}
                </h2>
                <p class="text-gray-600 mt-1">
                  {{ getNivelDisplay(selectedCurso?.nivel_id || 1) }} - Año {{ selectedCurso?.anio_academico }}
                </p>
              </div>
              <button @click="closeStudentsModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Botón para añadir alumno -->
            <div class="mb-4">
              <button
                @click="showAddStudentSection = !showAddStudentSection"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Añadir Alumno
              </button>
            </div>

            <!-- Sección para añadir alumno -->
            <div v-if="showAddStudentSection" class="bg-gray-50 rounded-lg p-4 mb-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Seleccionar Alumnos</h3>
                <button
                  @click="showAddStudentSection = false"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>

              <!-- Filtros -->
              <div class="mb-4 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por RUT o Nombre</label>
                    <input
                      v-model="studentSearchFilter"
                      type="text"
                      placeholder="Buscar..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div class="flex items-end">
                    <label class="flex items-center">
                      <input
                        v-model="showOnlyActiveStudents"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Solo estudiantes activos</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Botones de acción masiva -->
              <div v-if="selectedStudentsToAdd.length > 0" class="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span class="text-sm font-medium text-blue-900">
                  {{ selectedStudentsToAdd.length }} estudiante(s) seleccionado(s)
                </span>
                <button
                  @click="addMultipleStudentsToCurso"
                  :disabled="submitting"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {{ submitting ? 'Añadiendo...' : 'Añadir Seleccionados' }}
                </button>
                <button
                  @click="selectedStudentsToAdd = []"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Limpiar Selección
                </button>
              </div>

              <!-- Tabla de estudiantes -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto max-h-96">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 sticky top-0">
                      <tr>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            :checked="selectedStudentsToAdd.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0"
                            @change="toggleSelectAll"
                            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-if="filteredAvailableStudents.length === 0">
                        <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">
                          No hay estudiantes disponibles
                        </td>
                      </tr>
                      <tr
                        v-for="estudiante in filteredAvailableStudents"
                        :key="estudiante.estudiante_id"
                        class="hover:bg-gray-50"
                        :class="{ 'bg-blue-50': selectedStudentsToAdd.includes(estudiante.estudiante_id) }"
                      >
                        <td class="px-4 py-3 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            :checked="selectedStudentsToAdd.includes(estudiante.estudiante_id)"
                            @change="toggleStudentSelection(estudiante.estudiante_id)"
                            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {{ estudiante.rut }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{ estudiante.nombre_completo }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {{ estudiante.email || '-' }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {{ estudiante.telefono || '-' }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">
                          <span
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            :class="estudiante.estado_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          >
                            {{ estudiante.estado_activo ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Lista de alumnos del curso -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-900">Alumnos Matriculados</h3>
              </div>
              <div v-if="loadingStudents" class="p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p class="text-gray-600 mt-2">Cargando alumnos...</p>
              </div>
              <div v-else-if="cursoStudents.length === 0" class="p-8 text-center text-gray-500">
                No hay alumnos matriculados en este curso
              </div>
              <ul v-else class="divide-y divide-gray-200">
                <li
                  v-for="estudiante in cursoStudents"
                  :key="estudiante.estudiante_id"
                  class="px-4 py-3 hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ estudiante.nombre_completo }}</p>
                    <p class="text-sm text-gray-500">RUT: {{ estudiante.rut }}</p>
                  </div>
                  <button
                    @click="confirmRemoveStudent(estudiante)"
                    class="text-red-600 hover:text-red-900"
                    title="Quitar del curso"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Quitar Alumno -->
      <div
        v-if="showRemoveStudentModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showRemoveStudentModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas quitar a
            <span class="font-semibold">{{ studentToRemove?.nombre_completo }}</span>
            del curso?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showRemoveStudentModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="removeStudentFromCurso"
              :disabled="submitting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Quitando...' : 'Quitar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Asignar Profesor Jefe -->
      <div
        v-if="showProfesorJefeModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeProfesorJefeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Asignar Profesor Jefe</h2>
            <button @click="closeProfesorJefeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">
              Curso: <span class="font-semibold">{{ selectedCursoForProfesor?.nombre }}</span> - {{ getNivelDisplay(selectedCursoForProfesor?.nivel_id || 1) }}
            </p>
            <p class="text-sm text-gray-600">
              Profesor Jefe Actual:
              <span class="font-semibold">{{ selectedCursoForProfesor?.profesor_jefe?.nombre_completo || 'Sin asignar' }}</span>
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Profesor Jefe</label>
            <select
              v-model="selectedProfesorJefeId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option :value="null">Sin profesor jefe</option>
              <option v-for="profesor in profesores" :key="profesor.profesor_id" :value="profesor.profesor_id">
                {{ profesor.nombre_completo }} - {{ profesor.rut }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="closeProfesorJefeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleAsignarProfesorJefe"
              :disabled="submitting"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Guardando...' : 'Asignar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useCursoStore } from '@/store/curso.store'
import { useStudentStore } from '@/store/student.store'
import { useTutorStore } from '@/store/tutor.store'
import type { Curso, CreateCursoDTO, FilterCursoDTO } from '@/types/curso.types'
import type { Estudiante, Profesor } from '@/types/users.types'
import { NIVELES, getNivelDisplay } from '@/constants/niveles.constants'
import matriculaService from '@/services/matricula.service'
import type { Matricula } from '@/services/matricula.service'
import profesorService from '@/services/profesor.service'

const router = useRouter()
import parentescoService from '@/services/parentesco.service'
import { validateAgeForNivel } from '@/constants/validations.constants'

const cursoStore = useCursoStore()
const studentStore = useStudentStore()
const tutorStore = useTutorStore()

// Letras disponibles para los cursos
const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Estados del modal
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const cursoToDelete = ref<Curso | null>(null)

// Estados del modal de alumnos
const showStudentsModal = ref(false)
const showAddStudentSection = ref(false)
const showRemoveStudentModal = ref(false)
const selectedCurso = ref<Curso | null>(null)
const selectedStudentId = ref<string>('')
const studentToRemove = ref<Estudiante | null>(null)
const loadingStudents = ref(false)
const cursoStudents = ref<Estudiante[]>([])

// Filtros de estudiantes
const studentSearchFilter = ref('')
const showOnlyActiveStudents = ref(true)
const selectedStudentsToAdd = ref<string[]>([])

// Estados del modal de profesor jefe
const showProfesorJefeModal = ref(false)
const selectedCursoForProfesor = ref<Curso | null>(null)
const selectedProfesorJefeId = ref<string | null>(null)
const profesores = ref<Profesor[]>([])

// Computed: estudiantes disponibles (sin curso asignado o no en el curso actual)
const availableStudents = computed(() => {
  if (!selectedCurso.value) return []

  const cursoStudentIds = new Set(cursoStudents.value.map(s => s.estudiante_id))
  return studentStore.estudiantes.filter(
    estudiante => !cursoStudentIds.has(estudiante.estudiante_id)
  )
})

// Computed: estudiantes filtrados por búsqueda y estado
const filteredAvailableStudents = computed(() => {
  let students = availableStudents.value

  // Filtrar por estado activo
  if (showOnlyActiveStudents.value) {
    students = students.filter(s => s.estado_activo)
  }

  // Filtrar por búsqueda (RUT o nombre)
  if (studentSearchFilter.value.trim()) {
    const search = studentSearchFilter.value.toLowerCase().trim()
    students = students.filter(s =>
      s.nombre_completo.toLowerCase().includes(search) ||
      s.rut?.toLowerCase().includes(search)
    )
  }

  return students
})

// Datos del formulario
const formData = ref<CreateCursoDTO>({
  nombre: '',
  nivel_id: 1, // Por defecto Pre-Kinder
  anio_academico: new Date().getFullYear(),
  generacion: new Date().getFullYear(),
  capacidad_maxima: null
})

const editingId = ref<string | null>(null)

// Filtros
const filters = ref<FilterCursoDTO>({
  nivel_id: undefined,
  anio_academico: undefined,
  generacion: undefined
})

// Cargar cursos al montar
onMounted(() => {
  loadCursos()
})

const loadCursos = async () => {
  try {
    await cursoStore.fetchAll()
  } catch (error) {
    console.error('Error cargando cursos:', error)
  }
}

const applyFilters = async () => {
  try {
    const activeFilters: FilterCursoDTO = {}
    if (filters.value.nivel_id) activeFilters.nivel_id = filters.value.nivel_id
    if (filters.value.anio_academico) activeFilters.anio_academico = filters.value.anio_academico

    await cursoStore.fetchAll(activeFilters)
  } catch (error) {
    console.error('Error aplicando filtros:', error)
  }
}

const clearFilters = async () => {
  filters.value = {
    nivel_id: undefined,
    anio_academico: undefined,
    generacion: undefined
  }
  cursoStore.clearFilters()
  await loadCursos()
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    nombre: '',
    nivel_id: 1, // Por defecto Pre-Kinder
    anio_academico: new Date().getFullYear(),
    generacion: new Date().getFullYear(),
    capacidad_maxima: null
  }
  showModal.value = true
}

const openEditModal = (curso: Curso) => {
  isEditing.value = true
  editingId.value = curso.curso_id

  // Asegurar que nivel_id sea un número
  const nivelId = typeof curso.nivel_id === 'object' ? curso.nivel_obj.id : curso.nivel_id

  formData.value = {
    nombre: curso.nombre,
    nivel_id: nivelId,
    anio_academico: curso.anio_academico,
    generacion: curso.generacion,
    capacidad_maxima: curso.capacidad_maxima
  }
  showModal.value = true
}

const goToSchedules = (curso: Curso) => {
  router.push({
    path: '/admin/schedules',
    query: { curso_id: curso.curso_id }
  })
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      console.log(formData.value)
      await cursoStore.update(editingId.value, formData.value)
      alert('Curso actualizado exitosamente')
    } else {
      await cursoStore.create(formData.value)
      alert('Curso creado exitosamente')
    }
    closeModal()
  } catch (error: any) {
    console.log(formData.value)
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (curso: Curso) => {
  cursoToDelete.value = curso
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!cursoToDelete.value) return

  submitting.value = true
  try {
    await cursoStore.delete(cursoToDelete.value.curso_id)
    alert('Curso eliminado exitosamente')
    showDeleteModal.value = false
    cursoToDelete.value = null
  } catch (error: any) {
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

// Funciones para gestionar alumnos
const openStudentsModal = async (curso: Curso) => {
  selectedCurso.value = curso
  showStudentsModal.value = true
  showAddStudentSection.value = false
  selectedStudentId.value = ''

  // Cargar estudiantes del curso
  await loadCursoStudents()

  // Cargar todos los estudiantes disponibles
  if (studentStore.estudiantes.length === 0) {
    await studentStore.fetchEstudiantes()
  }
}

const closeStudentsModal = () => {
  showStudentsModal.value = false
  selectedCurso.value = null
  cursoStudents.value = []
  showAddStudentSection.value = false
  selectedStudentId.value = ''
}

const loadCursoStudents = async () => {
  if (!selectedCurso.value) return

  loadingStudents.value = true
  try {
    // Obtener las matrículas del curso
    const matriculas = await matriculaService.getAll({
      curso_id: selectedCurso.value.curso_id,
      estado_matricula_id: 1 // Solo matrículas activas
    })

    // Cargar todos los estudiantes si no están cargados
    if (studentStore.estudiantes.length === 0) {
      await studentStore.fetchEstudiantes()
    }

    // Filtrar los estudiantes que están matriculados en este curso
    const estudianteIds = matriculas.map((m: Matricula) => m.estudiante_id)
    cursoStudents.value = studentStore.estudiantes.filter(
      estudiante => estudianteIds.includes(estudiante.estudiante_id)
    )
  } catch (error) {
    console.error('Error cargando alumnos del curso:', error)
    alert('Error al cargar los alumnos del curso')
  } finally {
    loadingStudents.value = false
  }
}

const addStudentToCurso = async (estudianteId?: string) => {
  // Usar el parámetro si se proporciona, sino usar selectedStudentId
  const estudianteIdToUse = estudianteId || selectedStudentId.value

  if (!estudianteIdToUse || !selectedCurso.value) return

  submitting.value = true
  try {
    // Obtener el estudiante seleccionado
    const estudiante = studentStore.estudiantes.find(
      e => e.estudiante_id === estudianteIdToUse
    )

    if (!estudiante) {
      alert('Estudiante no encontrado')
      submitting.value = false
      return
    }

    // Validación: estudiante activo
    if (!estudiante.estado_activo) {
      alert(`No se puede matricular a ${estudiante.nombre_completo} porque está inactivo`)
      submitting.value = false
      return
    }

    // Validación: edad apropiada para el nivel del curso
    if (estudiante.fecha_nacimiento) {
      const ageValidation = validateAgeForNivel(estudiante.fecha_nacimiento, selectedCurso.value.nivel_id)
      if (!ageValidation.valid) {
        alert(`${estudiante.nombre_completo}: ${ageValidation.message}`)
        submitting.value = false
        return
      }
    } else {
      const confirmar = confirm(
        `${estudiante.nombre_completo} no tiene fecha de nacimiento registrada. ¿Deseas continuar de todos modos?`
      )
      if (!confirmar) {
        submitting.value = false
        return
      }
    }

    // Verificar si el estudiante ya tiene una matrícula activa en otro curso
    const matriculasEstudiante = await matriculaService.getByEstudiante(estudianteIdToUse)
    const matriculaActiva = matriculasEstudiante.find((m: Matricula) => m.estado_matricula_id === 1)

    if (matriculaActiva && matriculaActiva.curso_id !== selectedCurso.value.curso_id) {
      alert(`${estudiante.nombre_completo} ya tiene una matrícula activa en otro curso`)
      submitting.value = false
      return
    }

    // Obtener tutor titular
    const tutor_titular = await parentescoService.getTutorTitular(estudianteIdToUse)
    const periodo = `${selectedCurso.value.anio_academico}`

    // Crear la matrícula
    await matriculaService.create({
      estudiante_id: estudianteIdToUse,
      curso_id: selectedCurso.value.curso_id,
      tutor_titular_id: tutor_titular?.tutor_id,
      periodo,
      estado_matricula_id: 1 // Activa
    })

    alert('Alumno matriculado en el curso exitosamente')
    selectedStudentId.value = ''
    await loadCursoStudents()
  } catch (error: any) {
    console.error('Error añadiendo alumno:', error)
    alert(`Error: ${error.response?.data?.message || error.message}`)
  } finally {
    submitting.value = false
  }
}

// Función para seleccionar/deseleccionar un estudiante
const toggleStudentSelection = (estudianteId: string) => {
  const index = selectedStudentsToAdd.value.indexOf(estudianteId)
  if (index === -1) {
    selectedStudentsToAdd.value.push(estudianteId)
  } else {
    selectedStudentsToAdd.value.splice(index, 1)
  }
}

// Función para seleccionar/deseleccionar todos
const toggleSelectAll = () => {
  if (selectedStudentsToAdd.value.length === filteredAvailableStudents.value.length) {
    selectedStudentsToAdd.value = []
  } else {
    selectedStudentsToAdd.value = filteredAvailableStudents.value.map(e => e.estudiante_id)
  }
}

// Función para añadir múltiples estudiantes al curso
const addMultipleStudentsToCurso = async () => {
  if (selectedStudentsToAdd.value.length === 0 || !selectedCurso.value) return

  submitting.value = true
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []
  const warnings: string[] = []

  try {
    for (const estudianteId of selectedStudentsToAdd.value) {
      try {
        // Obtener el estudiante
        const estudiante = studentStore.estudiantes.find(e => e.estudiante_id === estudianteId)
        if (!estudiante) {
          errorCount++
          errors.push(`Estudiante no encontrado`)
          continue
        }

        // Validación: estudiante activo
        if (!estudiante.estado_activo) {
          errorCount++
          errors.push(`${estudiante.nombre_completo}: Estudiante inactivo`)
          continue
        }

        // Validación: edad apropiada para el nivel del curso
        if (estudiante.fecha_nacimiento) {
          const ageValidation = validateAgeForNivel(estudiante.fecha_nacimiento, selectedCurso.value.nivel_id)
          if (!ageValidation.valid) {
            errorCount++
            errors.push(`${estudiante.nombre_completo}: ${ageValidation.message}`)
            continue
          }
        } else {
          warnings.push(`${estudiante.nombre_completo}: No tiene fecha de nacimiento registrada`)
        }

        // Validación: no tiene matrícula activa en otro curso
        const matriculasEstudiante = await matriculaService.getByEstudiante(estudianteId)
        const matriculaActiva = matriculasEstudiante.find((m: Matricula) => m.estado_matricula_id === 1)

        if (matriculaActiva && matriculaActiva.curso_id !== selectedCurso.value.curso_id) {
          errorCount++
          errors.push(`${estudiante.nombre_completo}: Ya tiene matrícula activa en otro curso`)
          continue
        }

        // Obtener tutor titular
        const tutor_titular = await parentescoService.getTutorTitular(estudianteId)
        const periodo = `${selectedCurso.value.anio_academico}`

        // Crear la matrícula
        await matriculaService.create({
          estudiante_id: estudianteId,
          curso_id: selectedCurso.value.curso_id,
          tutor_titular_id: tutor_titular?.tutor_id,
          periodo,
          estado_matricula_id: 1
        })

        successCount++
      } catch (error: any) {
        errorCount++
        const errorMessage = error.response?.data?.message || error.message
        errors.push(`${studentStore.estudiantes.find(e => e.estudiante_id === estudianteId)?.nombre_completo}: ${errorMessage}`)
      }
    }

    // Limpiar selección y recargar
    selectedStudentsToAdd.value = []
    await loadCursoStudents()

    // Mostrar resultado
    let message = `Proceso completado:\n- ${successCount} estudiante(s) añadido(s) exitosamente\n`

    if (errorCount > 0) {
      message += `- ${errorCount} error(es)\n\nErrores:\n${errors.join('\n')}`
    }

    if (warnings.length > 0) {
      message += `\n\nAdvertencias:\n${warnings.join('\n')}`
    }

    if (errorCount === 0 && warnings.length === 0) {
      alert(`${successCount} estudiante(s) añadido(s) exitosamente`)
    } else {
      alert(message)
    }
  } catch (error: any) {
    console.error('Error añadiendo estudiantes:', error)
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

const confirmRemoveStudent = (estudiante: Estudiante) => {
  studentToRemove.value = estudiante
  showRemoveStudentModal.value = true
}

const removeStudentFromCurso = async () => {
  if (!studentToRemove.value || !selectedCurso.value) return

  submitting.value = true
  try {
    // Buscar la matrícula activa del estudiante en este curso
    const matriculas = await matriculaService.getAll({
      curso_id: selectedCurso.value.curso_id,
      estado_matricula_id: 1
    })

    const matricula = matriculas.find(
      (m: Matricula) => m.estudiante_id === studentToRemove.value?.estudiante_id
    )

    if (matricula) {
      // Cambiar el estado de la matrícula a inactiva (estado_matricula_id = 2)
      // O eliminarla si prefieres
      await matriculaService.changeStatus(matricula.matricula_id, 2) // 2 = INACTIVA

      alert('Alumno quitado del curso exitosamente')
      showRemoveStudentModal.value = false
      studentToRemove.value = null
      await loadCursoStudents()
    } else {
      alert('No se encontró la matrícula del estudiante en este curso')
    }
  } catch (error: any) {
    console.error('Error quitando alumno:', error)
    alert(`Error: ${error.response?.data?.message || error.message}`)
  } finally {
    submitting.value = false
  }
}

// Funciones para gestionar profesor jefe
const loadProfesores = async () => {
  try {
    profesores.value = await profesorService.getAll({ estado_activo: true })
  } catch (error) {
    console.error('Error cargando profesores:', error)
    alert('Error al cargar la lista de profesores')
  }
}

const onlyNumbers = (event: KeyboardEvent) => {
  const key = event.key
  if (!/^\d$/.test(key) && !['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(key)) {
    event.preventDefault()
  }
}

const openProfesorJefeModal = async (curso: Curso) => {
  selectedCursoForProfesor.value = curso
  selectedProfesorJefeId.value = curso.profesor_jefe_id || null
  showProfesorJefeModal.value = true

  // Cargar profesores si no están cargados
  if (profesores.value.length === 0) {
    await loadProfesores()
  }
}

const closeProfesorJefeModal = () => {
  showProfesorJefeModal.value = false
  selectedCursoForProfesor.value = null
  selectedProfesorJefeId.value = null
}

const handleAsignarProfesorJefe = async () => {
  if (!selectedCursoForProfesor.value) return

  submitting.value = true
  try {
    await cursoStore.asignarProfesorJefe(selectedCursoForProfesor.value.curso_id, {
      profesor_jefe_id: selectedProfesorJefeId.value
    })

    alert(selectedProfesorJefeId.value ? 'Profesor jefe asignado exitosamente' : 'Profesor jefe removido exitosamente')
    closeProfesorJefeModal()
    await loadCursos() // Recargar cursos para actualizar la vista
  } catch (error: any) {
    console.error('Error asignando profesor jefe:', error)
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}
</script>
