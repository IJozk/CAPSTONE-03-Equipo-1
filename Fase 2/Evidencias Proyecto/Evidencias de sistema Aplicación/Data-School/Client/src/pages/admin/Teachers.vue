<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Profesores</h1>
          <p class="text-gray-600 mt-1">Administra el personal docente</p>
        </div>
        <router-link
          to="/register"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Profesor
        </router-link>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Búsqueda -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, RUT, teléfono..."
                @input="currentPage = 1"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Filtro por Profesión -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Profesión</label>
            <select
              v-model="profesionFilter"
              @change="currentPage = 1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las profesiones</option>
              <option v-for="prof in allProfesiones" :key="prof.id_profesion" :value="prof.nombre">
                {{ prof.nombre }}
              </option>
            </select>
          </div>

          <!-- Filtro por Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Opciones de visualización</label>
            <div class="flex items-center h-10">
              <input
                id="show-inactive"
                type="checkbox"
                v-model="showInactive"
                @change="currentPage = 1"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label for="show-inactive" class="ml-2 text-sm text-gray-700 cursor-pointer">
                Mostrar profesores inactivos
              </label>
            </div>
          </div>
        </div>

        <!-- Botón para limpiar filtros -->
        <div class="mt-4 flex justify-between items-center">
          <button
            @click="clearAllFilters"
            class="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Limpiar filtros
          </button>
          <p class="text-sm text-gray-600">
            Mostrando <span class="font-semibold">{{ filteredTeachers.length }}</span> de <span class="font-semibold">{{ teacherStore.profesores.length }}</span> profesores
          </p>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div v-if="selectedTeachers.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-blue-900">
              {{ selectedTeachers.length }} profesor(es) seleccionado(s)
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="deselectAll" class="px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium">
              Deseleccionar todos
            </button>
            <button @click="confirmBulkDisable" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              Desactivar seleccionados
            </button>
            <button @click="confirmBulkEnable" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Activar seleccionados
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="teacherStore.loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando profesores...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="teacherStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-800">{{ teacherStore.error }}</p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    @change="toggleSelectAll"
                    :checked="allPageSelected"
                    :indeterminate="someSelected"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesión</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidades</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="paginatedTeachers.length === 0">
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                  {{ searchQuery || profesionFilter ? 'No se encontraron profesores con los filtros aplicados' : 'No hay profesores registrados' }}
                </td>
              </tr>
              <tr
                v-for="teacher in paginatedTeachers"
                :key="teacher.profesor_id"
                class="hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50': isSelected(teacher.profesor_id) }"
              >
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="isSelected(teacher.profesor_id)"
                    @change="toggleTeacher(teacher.profesor_id)"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ teacher.rut }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ teacher.nombre_completo }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ teacher.telefono || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span v-if="teacher.contrato?.Profesion?.nombre" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {{ teacher.contrato.Profesion.nombre }}
                  </span>
                  <span v-else class="text-gray-400">Sin profesión</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <div v-if="teacher.especialidades && teacher.especialidades.length > 0" class="flex flex-wrap gap-1">
                    <span v-for="esp in teacher.especialidades" :key="esp.especialidad_id"
                      class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                      {{ esp.Especialidad?.nombre_especialidad }}
                    </span>
                  </div>
                  <span v-else class="text-gray-400">Sin especialidades</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="teacher.estado_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ teacher.estado_activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button
                    @click="openContratoModal(teacher)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Gestionar Contrato/Profesión"
                  >
                    Profesión
                  </button>
                  <button
                    @click="openEspecialidadesModal(teacher)"
                    class="text-purple-600 hover:text-purple-900"
                    title="Gestionar Especialidades"
                  >
                    Especialidades
                  </button>
                  <button
                    v-if="teacher.estado_activo"
                    @click="teacherStore.disableProfesor(teacher.profesor_id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Desactivar
                  </button>
                  <button
                    v-else
                    @click="teacherStore.enableProfesor(teacher.profesor_id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Activar
                  </button>
                </td>              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span>
                a
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredTeachers.length) }}</span>
                de
                <span class="font-medium">{{ filteredTeachers.length }}</span>
                resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Desactivar en Lote -->
      <div v-if="showBulkDisableModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-medium text-gray-900">Desactivar profesores</h3>
              <p class="mt-2 text-sm text-gray-600">
                ¿Estás seguro de que deseas desactivar {{ selectedTeachers.length }} profesor(es)?
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button @click="showBulkDisableModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button @click="handleBulkDisable" :disabled="bulkActionInProgress" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">
              {{ bulkActionInProgress ? 'Desactivando...' : 'Desactivar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Activar en Lote -->
      <div v-if="showBulkEnableModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-medium text-gray-900">Activar profesores</h3>
              <p class="mt-2 text-sm text-gray-600">
                ¿Estás seguro de que deseas activar {{ selectedTeachers.length }} profesor(es)?
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button @click="showBulkEnableModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button @click="handleBulkEnable" :disabled="bulkActionInProgress" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
              {{ bulkActionInProgress ? 'Activando...' : 'Activar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Gestión de Contrato/Profesión -->
      <div
        v-if="showContratoModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeContratoModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Gestionar Profesión - {{ selectedProfesor?.nombre_completo }}
                </h2>
                <p class="text-gray-600 mt-1">RUT: {{ selectedProfesor?.rut }}</p>
              </div>
              <button @click="closeContratoModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Contrato Activo -->
            <div v-if="contratoActivo" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Contrato Activo</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Profesión:</span>
                  <span class="font-semibold text-gray-900">{{ contratoActivo.Profesion?.nombre }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Fecha de inicio:</span>
                  <span class="text-gray-900">{{ new Date(contratoActivo.inicio_contrato).toLocaleDateString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tipo:</span>
                  <span class="text-gray-900">{{ contratoActivo.de_planta ? 'De Planta' : 'A Contrata' }}</span>
                </div>
              </div>
              <div class="mt-4 flex gap-3">
                <button
                  @click="showFinalizarContratoSection = true"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Finalizar Contrato
                </button>
              </div>
            </div>

            <!-- Sección para finalizar contrato -->
            <div v-if="showFinalizarContratoSection" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 class="text-md font-semibold text-gray-900 mb-3">Finalizar Contrato Activo</h4>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Término *</label>
                <input
                  v-model="fechaTerminoContrato"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div class="mt-4 flex gap-3">
                <button
                  @click="showFinalizarContratoSection = false"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  @click="finalizarContratoActual"
                  :disabled="!fechaTerminoContrato || submitting"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Finalizando...' : 'Confirmar Finalización' }}
                </button>
              </div>
            </div>

            <!-- Botón para crear nuevo contrato -->
            <div v-if="!contratoActivo || showFinalizarContratoSection" class="mb-4">
              <button
                @click="showAddContratoSection = !showAddContratoSection"
                :disabled="contratoActivo && !showFinalizarContratoSection"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ contratoActivo ? 'Crear Nuevo Contrato' : 'Asignar Profesión' }}
              </button>
              <p v-if="contratoActivo && !showFinalizarContratoSection" class="text-sm text-gray-600 mt-2">
                Debe finalizar el contrato actual antes de crear uno nuevo
              </p>
            </div>

            <!-- Sección para crear nuevo contrato -->
            <div v-if="showAddContratoSection" class="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ contratoActivo ? 'Nuevo Contrato' : 'Asignar Profesión' }}</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Profesión *</label>
                  <select
                    v-model="newContratoForm.id_profesion"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccione una profesión...</option>
                    <option v-for="prof in todasProfesiones" :key="prof.id_profesion" :value="prof.id_profesion">
                      {{ prof.nombre }}
                    </option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
                    <input
                      v-model="newContratoForm.inicio_contrato"
                      type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                    <select
                      v-model="newContratoForm.de_planta"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option :value="true">De Planta</option>
                      <option :value="false">A Contrata</option>
                    </select>
                  </div>
                </div>

                <div class="flex justify-end gap-3">
                  <button
                    @click="showAddContratoSection = false"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="crearContrato"
                    :disabled="!newContratoForm.id_profesion || !newContratoForm.inicio_contrato || submitting"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {{ submitting ? 'Creando...' : 'Crear Contrato' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Gestión de Especialidades -->
      <div
        v-if="showEspecialidadesModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeEspecialidadesModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Gestionar Especialidades - {{ selectedProfesor?.nombre_completo }}
                </h2>
                <p class="text-gray-600 mt-1">
                  RUT: {{ selectedProfesor?.rut }}
                </p>
                <p v-if="selectedProfesor?.contrato?.Profesion" class="text-gray-600 mt-1">
                  Profesión: <span class="font-semibold">{{ selectedProfesor.contrato.Profesion.nombre }}</span>
                </p>
              </div>
              <button @click="closeEspecialidadesModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Botón para añadir especialidad -->
            <div class="mb-4">
              <button
                @click="showAddEspecialidadSection = !showAddEspecialidadSection"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Añadir Especialidad
              </button>
            </div>

            <!-- Sección para añadir especialidad -->
            <div v-if="showAddEspecialidadSection" class="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Nueva Especialidad</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                  <select
                    v-model="newEspecialidadForm.especialidad_id"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccione una especialidad...</option>
                    <optgroup v-for="tipo in especialidadesPorTipo" :key="tipo.tipo" :label="tipo.tipo">
                      <option v-for="esp in tipo.especialidades" :key="esp.id" :value="esp.id">
                        {{ esp.nombre_especialidad }}
                      </option>
                    </optgroup>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Certificación</label>
                    <input
                      v-model="newEspecialidadForm.fecha_certificacion"
                      type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">URL del Certificado</label>
                    <input
                      v-model="newEspecialidadForm.certificado_url"
                      type="url"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div class="flex justify-end gap-3">
                  <button
                    @click="showAddEspecialidadSection = false"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="assignEspecialidad"
                    :disabled="!newEspecialidadForm.especialidad_id || submitting"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {{ submitting ? 'Asignando...' : 'Asignar Especialidad' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Lista de especialidades del profesor -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-900">Especialidades Asignadas</h3>
              </div>
              <div v-if="loadingEspecialidades" class="p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p class="text-gray-600 mt-2">Cargando especialidades...</p>
              </div>
              <div v-else-if="profesorEspecialidades.length === 0" class="p-8 text-center text-gray-500">
                No hay especialidades asignadas a este profesor
              </div>
              <div v-else class="divide-y divide-gray-200">
                <div
                  v-for="esp in profesorEspecialidades"
                  :key="esp.especialidad_id"
                  class="p-4 hover:bg-gray-50"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <h4 class="text-lg font-semibold text-gray-900">{{ esp.Especialidad?.nombre_especialidad }}</h4>
                        <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                          {{ esp.Especialidad?.tipo_especialidad }}
                        </span>
                      </div>
                      <div class="mt-2 text-sm space-y-1">
                        <div v-if="esp.fecha_certificacion">
                          <span class="text-gray-600">Fecha de certificación:</span>
                          <span class="ml-1 text-gray-900">{{ new Date(esp.fecha_certificacion).toLocaleDateString() }}</span>
                        </div>
                        <div v-if="esp.certificado_url">
                          <span class="text-gray-600">Certificado:</span>
                          <a :href="esp.certificado_url" target="_blank" class="ml-1 text-blue-600 hover:text-blue-800 underline">
                            Ver certificado
                          </a>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        @click="confirmRemoveEspecialidad(esp)"
                        class="text-red-600 hover:text-red-900"
                        title="Quitar especialidad"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Quitar Especialidad -->
      <div
        v-if="showRemoveEspecialidadModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showRemoveEspecialidadModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas quitar la especialidad
            <span class="font-semibold">{{ especialidadToRemove?.Especialidad?.nombre_especialidad }}</span>
            del profesor?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showRemoveEspecialidadModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="removeEspecialidad"
              :disabled="submitting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Quitando...' : 'Quitar Especialidad' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useTeacherStore } from '@/store/teacher.store';
import { onMounted, computed, ref } from 'vue';
import especialidadService from '@/services/especialidad.service';
import type { ProfesorEspecialidad, Especialidad } from '@/services/especialidad.service';
import contratoService from '@/services/contrato.service';
import type { Contrato, Profesion } from '@/services/contrato.service';

const teacherStore = useTeacherStore();

// Búsqueda y filtros
const searchQuery = ref('');
const profesionFilter = ref('');
const showInactive = ref(false);
const currentPage = ref(1);
const itemsPerPage = 20;

// Catálogo de profesiones (ya existe más abajo, voy a usar la misma variable)
const allProfesiones = todasProfesiones;

// Selección múltiple
const selectedTeachers = ref<string[]>([]);
const showBulkDisableModal = ref(false);
const showBulkEnableModal = ref(false);
const bulkActionInProgress = ref(false);

// Estado del modal de especialidades
const showEspecialidadesModal = ref(false);
const showAddEspecialidadSection = ref(false);
const showRemoveEspecialidadModal = ref(false);
const selectedProfesor = ref<any>(null);
const loadingEspecialidades = ref(false);
const profesorEspecialidades = ref<ProfesorEspecialidad[]>([]);
const submitting = ref(false);
const especialidadToRemove = ref<ProfesorEspecialidad | null>(null);

// Catálogo de especialidades
const todasEspecialidades = ref<Especialidad[]>([]);

// Formulario para nueva especialidad
const newEspecialidadForm = ref({
  especialidad_id: '' as string | number,
  fecha_certificacion: '',
  certificado_url: ''
});

// Estado del modal de contrato/profesión
const showContratoModal = ref(false);
const showAddContratoSection = ref(false);
const showFinalizarContratoSection = ref(false);
const contratoActivo = ref<Contrato | null>(null);
const fechaTerminoContrato = ref('');

// Catálogo de profesiones
const todasProfesiones = ref<Profesion[]>([]);

// Formulario para nuevo contrato
const newContratoForm = ref({
  id_profesion: '' as string | number,
  inicio_contrato: '',
  de_planta: true
});

// Funciones para gestionar contrato/profesión
const openContratoModal = async (profesor: any) => {
  selectedProfesor.value = profesor;
  showContratoModal.value = true;
  showAddContratoSection.value = false;
  showFinalizarContratoSection.value = false;

  // Cargar contrato activo del profesor
  await loadContratoActivo();
};

const closeContratoModal = () => {
  showContratoModal.value = false;
  selectedProfesor.value = null;
  contratoActivo.value = null;
  showAddContratoSection.value = false;
  showFinalizarContratoSection.value = false;
  resetNewContratoForm();
};

const loadContratoActivo = async () => {
  if (!selectedProfesor.value) return;

  try {
    contratoActivo.value = await contratoService.getContratoByEmpleado(selectedProfesor.value.profesor_id);
  } catch (error) {
    console.error('Error cargando contrato:', error);
  }
};

const resetNewContratoForm = () => {
  newContratoForm.value = {
    id_profesion: '',
    inicio_contrato: '',
    de_planta: true
  };
};

const crearContrato = async () => {
  if (!selectedProfesor.value || !newContratoForm.value.id_profesion || !newContratoForm.value.inicio_contrato) {
    alert('Por favor complete los campos requeridos');
    return;
  }

  submitting.value = true;
  try {
    await contratoService.create({
      id_empleado: selectedProfesor.value.profesor_id,
      id_profesion: Number(newContratoForm.value.id_profesion),
      inicio_contrato: newContratoForm.value.inicio_contrato,
      de_planta: newContratoForm.value.de_planta
    });

    alert('Contrato creado exitosamente');
    resetNewContratoForm();
    showAddContratoSection.value = false;
    await loadContratoActivo();
    await teacherStore.fetchProfesores();
  } catch (error: any) {
    console.error('Error creando contrato:', error);
    alert(`Error: ${error.message || 'Error al crear el contrato'}`);
  } finally {
    submitting.value = false;
  }
};

const finalizarContratoActual = async () => {
  if (!contratoActivo.value || !fechaTerminoContrato.value) return;

  submitting.value = true;
  try {
    await contratoService.finalizarContrato(
      contratoActivo.value.id_contrato,
      fechaTerminoContrato.value
    );

    alert('Contrato finalizado exitosamente');
    showFinalizarContratoSection.value = false;
    fechaTerminoContrato.value = '';
    await loadContratoActivo();
    await teacherStore.fetchProfesores();
  } catch (error: any) {
    console.error('Error finalizando contrato:', error);
    alert(`Error: ${error.message || 'Error al finalizar el contrato'}`);
  } finally {
    submitting.value = false;
  }
};

// Computed: profesores filtrados
const filteredTeachers = computed(() => {
  let teachers = [...teacherStore.profesores];

  // Filtrar por estado
  if (!showInactive.value) {
    teachers = teachers.filter(t => t.estado_activo === true);
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    teachers = teachers.filter(t =>
      t.nombre_completo.toLowerCase().includes(query) ||
      t.rut.toLowerCase().includes(query) ||
      (t.telefono && t.telefono.toLowerCase().includes(query))
    );
  }

  // Filtrar por profesión
  if (profesionFilter.value) {
    teachers = teachers.filter(t =>
      t.contrato?.Profesion?.nombre === profesionFilter.value
    );
  }

  return teachers;
});

// Computed: paginación
const totalPages = computed(() => Math.ceil(filteredTeachers.value.length / itemsPerPage));

const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTeachers.value.slice(start, end);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxPages - 1);

  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// Computed: selección
const isSelected = (profesorId: string) => {
  return selectedTeachers.value.includes(profesorId);
};

const allPageSelected = computed(() => {
  if (paginatedTeachers.value.length === 0) return false;
  return paginatedTeachers.value.every(t => isSelected(t.profesor_id));
});

const someSelected = computed(() => {
  if (paginatedTeachers.value.length === 0) return false;
  const selectedCount = paginatedTeachers.value.filter(t => isSelected(t.profesor_id)).length;
  return selectedCount > 0 && selectedCount < paginatedTeachers.value.length;
});

// Funciones de selección
const toggleTeacher = (profesorId: string) => {
  const index = selectedTeachers.value.indexOf(profesorId);
  if (index > -1) {
    selectedTeachers.value.splice(index, 1);
  } else {
    selectedTeachers.value.push(profesorId);
  }
};

const toggleSelectAll = () => {
  if (allPageSelected.value) {
    // Deseleccionar todos de la página actual
    paginatedTeachers.value.forEach(t => {
      const index = selectedTeachers.value.indexOf(t.profesor_id);
      if (index > -1) {
        selectedTeachers.value.splice(index, 1);
      }
    });
  } else {
    // Seleccionar todos de la página actual
    paginatedTeachers.value.forEach(t => {
      if (!isSelected(t.profesor_id)) {
        selectedTeachers.value.push(t.profesor_id);
      }
    });
  }
};

const deselectAll = () => {
  selectedTeachers.value = [];
};

const confirmBulkDisable = () => {
  showBulkDisableModal.value = true;
};

const confirmBulkEnable = () => {
  showBulkEnableModal.value = true;
};

const handleBulkDisable = async () => {
  bulkActionInProgress.value = true;
  try {
    for (const profesorId of selectedTeachers.value) {
      await teacherStore.disableProfesor(profesorId);
    }
    selectedTeachers.value = [];
    showBulkDisableModal.value = false;
    await teacherStore.fetchProfesores();
  } catch (error) {
    console.error('Error al desactivar profesores:', error);
    alert('Error al desactivar los profesores seleccionados');
  } finally {
    bulkActionInProgress.value = false;
  }
};

const handleBulkEnable = async () => {
  bulkActionInProgress.value = true;
  try {
    for (const profesorId of selectedTeachers.value) {
      await teacherStore.enableProfesor(profesorId);
    }
    selectedTeachers.value = [];
    showBulkEnableModal.value = false;
    await teacherStore.fetchProfesores();
  } catch (error) {
    console.error('Error al activar profesores:', error);
    alert('Error al activar los profesores seleccionados');
  } finally {
    bulkActionInProgress.value = false;
  }
};

const clearAllFilters = () => {
  searchQuery.value = '';
  profesionFilter.value = '';
  showInactive.value = false;
  currentPage.value = 1;
};

// Computed: especialidades agrupadas por tipo
const especialidadesPorTipo = computed(() => {
  const grouped = todasEspecialidades.value.reduce((acc, esp) => {
    const tipo = esp.tipo_especialidad;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(esp);
    return acc;
  }, {} as Record<string, Especialidad[]>);

  return Object.keys(grouped).map(tipo => ({
    tipo,
    especialidades: grouped[tipo]
  }));
});

// Funciones para gestionar especialidades
const openEspecialidadesModal = async (profesor: any) => {
  selectedProfesor.value = profesor;
  showEspecialidadesModal.value = true;
  showAddEspecialidadSection.value = false;

  // Cargar especialidades del profesor
  await loadProfesorEspecialidades();
};

const closeEspecialidadesModal = () => {
  showEspecialidadesModal.value = false;
  selectedProfesor.value = null;
  profesorEspecialidades.value = [];
  showAddEspecialidadSection.value = false;
  resetNewEspecialidadForm();
};

const loadProfesorEspecialidades = async () => {
  if (!selectedProfesor.value) return;

  loadingEspecialidades.value = true;
  try {
    const especialidades = await especialidadService.getByProfesor(selectedProfesor.value.profesor_id);
    profesorEspecialidades.value = especialidades;
  } catch (error) {
    console.error('Error cargando especialidades del profesor:', error);
    alert('Error al cargar las especialidades del profesor');
  } finally {
    loadingEspecialidades.value = false;
  }
};

const resetNewEspecialidadForm = () => {
  newEspecialidadForm.value = {
    especialidad_id: '',
    fecha_certificacion: '',
    certificado_url: ''
  };
};

const assignEspecialidad = async () => {
  if (!selectedProfesor.value || !newEspecialidadForm.value.especialidad_id) {
    alert('Por favor seleccione una especialidad');
    return;
  }

  submitting.value = true;
  try {
    await especialidadService.assignToProfesor({
      profesor_id: selectedProfesor.value.profesor_id,
      especialidad_id: Number(newEspecialidadForm.value.especialidad_id),
      fecha_certificacion: newEspecialidadForm.value.fecha_certificacion || undefined,
      certificado_url: newEspecialidadForm.value.certificado_url || undefined
    });

    alert('Especialidad asignada exitosamente');
    resetNewEspecialidadForm();
    showAddEspecialidadSection.value = false;
    await loadProfesorEspecialidades();

    // Recargar profesores para actualizar la vista principal
    await teacherStore.fetchProfesores();
  } catch (error: any) {
    console.error('Error asignando especialidad:', error);
    alert(`Error: ${error.message || 'Error al asignar la especialidad'}`);
  } finally {
    submitting.value = false;
  }
};

const confirmRemoveEspecialidad = (especialidad: ProfesorEspecialidad) => {
  especialidadToRemove.value = especialidad;
  showRemoveEspecialidadModal.value = true;
};

const removeEspecialidad = async () => {
  if (!especialidadToRemove.value || !selectedProfesor.value) return;

  submitting.value = true;
  try {
    await especialidadService.removeFromProfesor(
      selectedProfesor.value.profesor_id,
      especialidadToRemove.value.especialidad_id
    );

    alert('Especialidad eliminada exitosamente');
    showRemoveEspecialidadModal.value = false;
    especialidadToRemove.value = null;
    await loadProfesorEspecialidades();

    // Recargar profesores para actualizar la vista principal
    await teacherStore.fetchProfesores();
  } catch (error: any) {
    console.error('Error quitando especialidad:', error);
    alert(`Error: ${error.message || 'Error al quitar la especialidad'}`);
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    await teacherStore.fetchProfesores();

    // Cargar catálogo de especialidades
    todasEspecialidades.value = await especialidadService.getAll();

    // Cargar catálogo de profesiones
    todasProfesiones.value = await contratoService.getAllProfesiones();
  } catch (error) {
    console.error('Error loading teachers:', error);
  }
});
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>
