<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
          <p class="text-gray-600 mt-1">Administra los estudiantes del colegio</p>
        </div>
        <router-link
          to="/register"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Estudiante
        </router-link>
      </div>

      <div class="bg-white rounded-lg shadow p-8">
        <div v-if="studentStore.loading" class="text-center py-8">
          <div class="text-gray-600">Cargando estudiantes...</div>
        </div>
        
        <div v-else-if="studentStore.error" class="text-center py-8">
          <div class="text-red-600">Error: {{ studentStore.error }}</div>
        </div>

        <div v-else-if="studentStore.estudiantes.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">No hay estudiantes</h2>
          <p class="text-gray-600">Aún no hay estudiantes registrados en el sistema.</p>
        </div>

        <div v-else>
          <!-- Filtros -->
          <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Filtro por RUT -->
            <div>
              <label for="rut-filter" class="block text-sm font-medium text-gray-700 mb-2">
                Buscar por RUT
              </label>
              <div class="relative">
                <input
                  id="rut-filter"
                  type="text"
                  v-model="rutFilter"
                  @input="currentPage = 1"
                  placeholder="Ej: 12345678-9"
                  class="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  v-if="rutFilter"
                  @click="clearRutFilter"
                  class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Filtro por Estado -->
            <div>
              <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Estado
              </label>
              <select
                id="status-filter"
                v-model="statusFilter"
                @change="currentPage = 1"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>

          <!-- Información de paginación -->
          <div class="mb-4 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ totalFilteredStudents }} estudiantes
              <span v-if="rutFilter || statusFilter" class="font-medium text-primary-600">(filtrado)</span>
            </div>
            <button
              v-if="rutFilter || statusFilter"
              @click="clearAllFilters"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>

          <!-- Tabla de estudiantes -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Genero</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Telefono</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tutores</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="paginatedStudents.length === 0">
                  <td colspan="11" class="px-6 py-8 text-center text-sm text-gray-500">
                    No se encontraron estudiantes con los filtros aplicados
                  </td>
                </tr>
                <tr v-for="student in paginatedStudents" :key="student.user_id">
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                    <span class="font-medium">{{ student.rut }}</span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ student.nombre_completo }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ student.email }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ student.fecha_nacimiento }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ formatDate(student.created_at) }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ student.genero }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ student.direccion }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ student.telefono }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="student.estado_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ student.estado_activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm font-medium">
                    <button
                      @click="openTutoresModal(student)"
                      class="text-purple-600 hover:text-purple-900"
                      title="Gestionar Tutores"
                    >
                      Ver Tutores
                    </button>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm font-medium">
                    <button @click="openEditModal(student)" class="text-blue-600 hover:text-blue-900">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Controles de paginación -->
          <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                Anterior
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="[
                  'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Página <span class="font-medium">{{ currentPage }}</span> de <span class="font-medium">{{ totalPages }}</span>
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    @click="previousPage"
                    :disabled="currentPage === 1"
                    :class="[
                      'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium',
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    <span class="sr-only">Anterior</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <!-- Números de página -->
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>

                  <button
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    :class="[
                      'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium',
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    <span class="sr-only">Siguiente</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Edición -->
      <div v-if="isEditModalOpen" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Overlay -->
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeEditModal"></div>

          <!-- Center modal -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    Editar Estudiante
                  </h3>
                  
                  <form @submit.prevent="saveStudent" class="space-y-4">

                    <!-- Nombre -->
                    <div>
                      <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        id="nombre"
                        v-model="editForm.nombre_completo"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>

                    <!-- Email -->
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        v-model="editForm.email"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>

                    <!-- Género -->
                    <div>
                      <label for="genero" class="block text-sm font-medium text-gray-700">Género</label>
                      <select
                        id="genero"
                        v-model="editForm.genero"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                      </select>
                    </div>

                    <!-- Dirección -->
                    <div>
                      <label for="direccion" class="block text-sm font-medium text-gray-700">Dirección</label>
                      <input
                        type="text"
                        id="direccion"
                        v-model="editForm.direccion"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>

                    <!-- Teléfono -->
                    <div>
                      <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="text"
                        id="telefono"
                        v-model="editForm.telefono"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>

                    <!-- Estado -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <div class="flex items-center space-x-4">
                        <label class="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="estado"
                            :checked="editForm.estado_activo === true"
                            @change="editForm.estado_activo = true"
                            class="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span class="ml-2 text-sm text-gray-700">Activo</span>
                        </label>
                        <label class="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="estado"
                            :checked="editForm.estado_activo === false"
                            @change="editForm.estado_activo = false"
                            class="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span class="ml-2 text-sm text-gray-700">Inactivo</span>
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Botones del modal -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                @click="saveStudent"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                @click="closeEditModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Gestión de Tutores -->
      <div
        v-if="showTutoresModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeTutoresModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Gestionar Tutores - {{ selectedStudent?.nombre_completo }}
                </h2>
                <p class="text-gray-600 mt-1">
                  RUT: {{ selectedStudent?.rut }}
                </p>
              </div>
              <button @click="closeTutoresModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Botón para añadir tutor -->
            <div class="mb-4">
              <button
                @click="showAddTutorSection = !showAddTutorSection"
                :disabled="estudianteTutores.length >= 2"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Añadir Tutor
              </button>
              <p v-if="estudianteTutores.length >= 2" class="text-sm text-red-600 mt-2">
                Máximo 2 tutores por estudiante
              </p>
            </div>

            <!-- Sección para añadir tutor -->
            <div v-if="showAddTutorSection && estudianteTutores.length < 2" class="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Nuevo Tutor</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                    <input
                      v-model="newTutorForm.nombre_completo"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                    <input
                      v-model="newTutorForm.rut"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="12.345.678-9"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      v-model="newTutorForm.telefono"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    v-model="newTutorForm.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="juan@example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    v-model="newTutorForm.direccion"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Calle 123, Comuna"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
                  <input
                    v-model="newTutorForm.ocupacion"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ingeniero, Profesor, etc."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Parentesco *</label>
                  <select
                    v-model="newTutorForm.tipo_parentesco_id"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccione...</option>
                    <option :value="1">Padre</option>
                    <option :value="2">Madre</option>
                    <option :value="3">Abuelo/a</option>
                    <option :value="4">Tío/a</option>
                    <option :value="5">Tutor Legal</option>
                    <option :value="6">Otro</option>
                  </select>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <label class="flex items-center">
                    <input
                      v-model="newTutorForm.es_tutor_titular"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Tutor Titular</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="newTutorForm.es_contacto_emergencia"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Contacto de Emergencia</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="newTutorForm.puede_retirar"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Puede Retirar</span>
                  </label>
                </div>

                <div class="flex justify-end gap-3">
                  <button
                    @click="showAddTutorSection = false"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="createAndAssignTutor"
                    :disabled="!newTutorForm.nombre_completo || !newTutorForm.tipo_parentesco_id || submitting"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {{ submitting ? 'Creando...' : 'Crear Tutor' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Lista de tutores del estudiante -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-900">Tutores Asignados</h3>
              </div>
              <div v-if="loadingTutores" class="p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p class="text-gray-600 mt-2">Cargando tutores...</p>
              </div>
              <div v-else-if="estudianteTutores.length === 0" class="p-8 text-center text-gray-500">
                No hay tutores asignados a este estudiante
              </div>
              <div v-else class="divide-y divide-gray-200">
                <div
                  v-for="parentesco in estudianteTutores"
                  :key="parentesco.tutor_id"
                  class="p-4 hover:bg-gray-50"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="text-lg font-semibold text-gray-900">{{ parentesco.Tutor?.nombre_completo }}</h4>
                      <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div v-if="parentesco.Tutor?.rut">
                          <span class="text-gray-600">RUT:</span>
                          <span class="ml-1 text-gray-900">{{ parentesco.Tutor.rut }}</span>
                        </div>
                        <div v-if="parentesco.Tutor?.telefono">
                          <span class="text-gray-600">Teléfono:</span>
                          <span class="ml-1 text-gray-900">{{ parentesco.Tutor.telefono }}</span>
                        </div>
                        <div v-if="parentesco.Tutor?.email">
                          <span class="text-gray-600">Email:</span>
                          <span class="ml-1 text-gray-900">{{ parentesco.Tutor.email }}</span>
                        </div>
                        <div v-if="parentesco.Tutor?.ocupacion">
                          <span class="text-gray-600">Ocupación:</span>
                          <span class="ml-1 text-gray-900">{{ parentesco.Tutor.ocupacion }}</span>
                        </div>
                      </div>
                      <div class="mt-2 flex gap-2">
                        <span v-if="parentesco.es_tutor_titular" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          Titular
                        </span>
                        <span v-if="parentesco.es_contacto_emergencia" class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          Emergencia
                        </span>
                        <span v-if="parentesco.puede_retirar" class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Puede Retirar
                        </span>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        @click="openEditTutorModal(parentesco)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Editar relación"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmRemoveTutor(parentesco)"
                        class="text-red-600 hover:text-red-900"
                        title="Quitar tutor"
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

      <!-- Modal Editar Relación Tutor -->
      <div
        v-if="showEditTutorModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showEditTutorModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Editar Relación de Parentesco</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Parentesco</label>
              <select
                v-model="editTutorForm.tipo_parentesco_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option :value="1">Padre</option>
                <option :value="2">Madre</option>
                <option :value="3">Abuelo/a</option>
                <option :value="4">Tío/a</option>
                <option :value="5">Tutor Legal</option>
                <option :value="6">Otro</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="editTutorForm.es_tutor_titular"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">Tutor Titular</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="editTutorForm.es_contacto_emergencia"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">Contacto de Emergencia</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="editTutorForm.puede_retirar"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">Puede Retirar</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showEditTutorModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="updateTutorRelation"
              :disabled="submitting"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Quitar Tutor -->
      <div
        v-if="showRemoveTutorModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showRemoveTutorModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas quitar a
            <span class="font-semibold">{{ tutorToRemove?.Tutor?.nombre_completo }}</span>
            como tutor del estudiante?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showRemoveTutorModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="removeTutor"
              :disabled="submitting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Quitando...' : 'Quitar Tutor' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useStudentStore } from '@/store/student.store';
import { onMounted, computed, ref } from 'vue';
import parentescoService from '@/services/parentesco.service';
import type { Parentesco } from '@/services/parentesco.service';

const studentStore = useStudentStore();
const currentPage = ref(1);
const itemsPerPage = 20;
const rutFilter = ref('');
const statusFilter = ref('');

// Estado del modal de edición
const isEditModalOpen = ref(false);
const editingStudent = ref<any>(null);
const editForm = ref<{
  nombre_completo: string;
  email: string;
  genero: 'M' | 'F' | 'OTRO';
  direccion: string;
  telefono: string;
  estado_activo: boolean;
}>({
  nombre_completo: '',
  email: '',
  genero: 'M',
  direccion: '',
  telefono: '',
  estado_activo: true
});

// Estado del modal de tutores
const showTutoresModal = ref(false);
const showAddTutorSection = ref(false);
const showEditTutorModal = ref(false);
const showRemoveTutorModal = ref(false);
const selectedStudent = ref<any>(null);
const loadingTutores = ref(false);
const estudianteTutores = ref<Parentesco[]>([]);
const submitting = ref(false);
const tutorToRemove = ref<Parentesco | null>(null);
const editingParentesco = ref<Parentesco | null>(null);

// Formulario para nuevo tutor
const newTutorForm = ref({
  nombre_completo: '',
  rut: '',
  telefono: '',
  email: '',
  direccion: '',
  ocupacion: '',
  tipo_parentesco_id: '' as string | number,
  es_tutor_titular: false,
  es_contacto_emergencia: false,
  puede_retirar: false
});

// Formulario para editar relación de parentesco
const editTutorForm = ref({
  tipo_parentesco_id: 1,
  es_tutor_titular: false,
  es_contacto_emergencia: false,
  puede_retirar: false
});

// Normalizar RUT para comparación (quita puntos y guiones)
const normalizeRut = (rut: string) => {
  return rut.replace(/[.-]/g, '').toLowerCase();
};

// Estudiantes filtrados
const filteredStudents = computed(() => {
  let students = studentStore.estudiantes;

  // Filtrar por RUT
  if (rutFilter.value) {
    const normalizedFilter = normalizeRut(rutFilter.value);
    students = students.filter(student => {
      const normalizedRut = normalizeRut(student.rut || '');
      return normalizedRut.includes(normalizedFilter);
    });
  }

  // Filtrar por estado
  if (statusFilter.value !== '') {
    const isActive = statusFilter.value === 'true';
    students = students.filter(student => {
      return (student.estado_activo === isActive || 
              student.estado_activo === Boolean(isActive));
    });
  }

  return students;
});

// Computed properties para la paginación
const totalFilteredStudents = computed(() => filteredStudents.value.length);

const totalPages = computed(() => Math.ceil(totalFilteredStudents.value / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);

const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalFilteredStudents.value));

const paginatedStudents = computed(() => {
  return filteredStudents.value.slice(startIndex.value, endIndex.value);
});

// Páginas visibles en la paginación
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Funciones de filtrado
const clearRutFilter = () => {
  rutFilter.value = '';
  currentPage.value = 1;
};

const clearAllFilters = () => {
  rutFilter.value = '';
  statusFilter.value = '';
  currentPage.value = 1;
};

// Métodos de navegación
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
};

// Formatear fecha
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Funciones del modal de edición
const openEditModal = (student: any) => {
  editingStudent.value = student;
  editForm.value = {
    nombre_completo: student.nombre_completo,
    email: student.email,
    genero: student.genero as 'M' | 'F' | 'OTRO',
    direccion: student.direccion,
    telefono: student.telefono,
    estado_activo: student.estado_activo === true || student.estado_activo === 'true'
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingStudent.value = null;
  editForm.value = {
    nombre_completo: '',
    email: '',
    genero: 'M',
    direccion: '',
    telefono: '',
    estado_activo: true
  };
};

const saveStudent = async () => {
  try {
    await studentStore.updateEstudiantes(editingStudent.value.user_id, editForm.value);
    closeEditModal();
    alert('Estudiante actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    alert('Error al actualizar el estudiante');
  }
};

// Funciones para gestionar tutores
const openTutoresModal = async (student: any) => {
  selectedStudent.value = student;
  showTutoresModal.value = true;
  showAddTutorSection.value = false;

  // Cargar tutores del estudiante
  await loadEstudianteTutores();
};

const closeTutoresModal = () => {
  showTutoresModal.value = false;
  selectedStudent.value = null;
  estudianteTutores.value = [];
  showAddTutorSection.value = false;
  resetNewTutorForm();
};

const loadEstudianteTutores = async () => {
  if (!selectedStudent.value) return;

  loadingTutores.value = true;
  try {
    const tutores = await parentescoService.getTutoresByEstudiante(selectedStudent.value.estudiante_id);
    estudianteTutores.value = tutores;
  } catch (error) {
    console.error('Error cargando tutores del estudiante:', error);
    alert('Error al cargar los tutores del estudiante');
  } finally {
    loadingTutores.value = false;
  }
};

const resetNewTutorForm = () => {
  newTutorForm.value = {
    nombre_completo: '',
    rut: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacion: '',
    tipo_parentesco_id: '',
    es_tutor_titular: false,
    es_contacto_emergencia: false,
    puede_retirar: false
  };
};

const createAndAssignTutor = async () => {
  if (!selectedStudent.value || !newTutorForm.value.nombre_completo || !newTutorForm.value.tipo_parentesco_id) {
    alert('Por favor complete los campos requeridos');
    return;
  }

  submitting.value = true;
  try {
    await parentescoService.createTutorAndAssign({
      ...newTutorForm.value,
      estudiante_id: selectedStudent.value.estudiante_id,
      tipo_parentesco_id: Number(newTutorForm.value.tipo_parentesco_id)
    });

    alert('Tutor creado y asignado exitosamente');
    resetNewTutorForm();
    showAddTutorSection.value = false;
    await loadEstudianteTutores();
  } catch (error: any) {
    console.error('Error creando tutor:', error);
    alert(`Error: ${error.message || 'Error al crear el tutor'}`);
  } finally {
    submitting.value = false;
  }
};

const openEditTutorModal = (parentesco: Parentesco) => {
  editingParentesco.value = parentesco;
  editTutorForm.value = {
    tipo_parentesco_id: parentesco.tipo_parentesco_id,
    es_tutor_titular: parentesco.es_tutor_titular,
    es_contacto_emergencia: parentesco.es_contacto_emergencia,
    puede_retirar: parentesco.puede_retirar
  };
  showEditTutorModal.value = true;
};

const updateTutorRelation = async () => {
  if (!editingParentesco.value || !selectedStudent.value) return;

  submitting.value = true;
  try {
    await parentescoService.update(
      selectedStudent.value.estudiante_id,
      editingParentesco.value.tutor_id,
      editTutorForm.value
    );

    alert('Relación de parentesco actualizada exitosamente');
    showEditTutorModal.value = false;
    editingParentesco.value = null;
    await loadEstudianteTutores();
  } catch (error: any) {
    console.error('Error actualizando relación:', error);
    alert(`Error: ${error.message || 'Error al actualizar la relación'}`);
  } finally {
    submitting.value = false;
  }
};

const confirmRemoveTutor = (parentesco: Parentesco) => {
  tutorToRemove.value = parentesco;
  showRemoveTutorModal.value = true;
};

const removeTutor = async () => {
  if (!tutorToRemove.value || !selectedStudent.value) return;

  submitting.value = true;
  try {
    await parentescoService.delete(
      selectedStudent.value.estudiante_id,
      tutorToRemove.value.tutor_id
    );

    alert('Tutor quitado exitosamente');
    showRemoveTutorModal.value = false;
    tutorToRemove.value = null;
    await loadEstudianteTutores();
  } catch (error: any) {
    console.error('Error quitando tutor:', error);
    alert(`Error: ${error.message || 'Error al quitar el tutor'}`);
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    await studentStore.fetchEstudiantes();
  } catch (error) {
    console.error('Error fetching students:', error);
  }
});
</script>