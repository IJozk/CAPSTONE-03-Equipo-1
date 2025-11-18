<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Talleres</h1>
          <p class="text-gray-600 mt-1">
            Administra todos los talleres extraescolares del colegio
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Taller
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nombre del taller..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="filters.estado_activo"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option :value="undefined">Todos</option>
              <option :value="true">Activos</option>
              <option :value="false">Inactivos</option>
            </select>
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
      <div v-if="tallerStore.loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"
        ></div>
        <p class="text-gray-600 mt-4">Cargando talleres...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="tallerStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-red-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-red-800">{{ tallerStore.error }}</p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Taller
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Horarios
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sala
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Profesor
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Capacidad
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Costo Adicional
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="filteredTalleres.length === 0">
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                  No hay talleres registrados
                </td>
              </tr>

              <tr
                v-for="taller in filteredTalleres"
                :key="taller.taller_id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ taller.nombre }}
                  </div>
                  <div
                    v-if="taller.descripcion"
                    class="text-sm text-gray-500 max-w-xs truncate"
                  >
                    {{ taller.descripcion }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    <span v-if="taller.fecha_inicio">
                      Desde: {{ taller.fecha_inicio }}
                    </span>
                    <span v-if="taller.fecha_termino">
                      &nbsp;• Hasta: {{ taller.fecha_termino }}
                    </span>
                  </div>
                </td>

                <!-- Horarios -->
                <td class="px-6 py-4">
                  <div
                    v-if="taller.horarios_parsed && taller.horarios_parsed.length > 0"
                    class="space-y-1"
                  >
                    <div
                      v-for="(horario, index) in taller.horarios_parsed"
                      :key="index"
                      class="text-sm"
                    >
                      <span class="font-medium text-gray-900">
                        {{ horario.dia_semana }}
                      </span>
                      <span class="text-gray-600 ml-1">
                        {{ horario.hora_inicio }} - {{ horario.hora_termino }}
                      </span>
                    </div>
                  </div>
                  <span v-else class="text-sm text-gray-400">
                    {{ taller.horario || 'Sin horarios' }}
                  </span>
                </td>

                <!-- Sala -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ taller.Sala?.nombre || 'Sin asignar' }}
                </td>

                <!-- Profesor -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ taller.Profesor?.nombre_completo || 'Sin asignar' }}
                </td>

                <!-- Capacidad -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 mr-1 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {{ taller.inscritos || 0 }} /
                    {{ taller.capacidad_maxima ?? 0 }}
                  </div>
                  <div class="mt-1">
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all"
                        :class="[
                          capacidadRatio(taller) >= 0.9
                            ? 'bg-red-500'
                            : capacidadRatio(taller) >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        ]"
                        :style="{ width: `${capacidadPorcentaje(taller)}%` }"
                      ></div>
                    </div>
                  </div>
                </td>

                <!-- Costo -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{
                    taller.costo_adicional
                      ? `$${taller.costo_adicional.toLocaleString()}`
                      : 'Gratis'
                  }}
                </td>

                <!-- Estado -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                      taller.estado_activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ taller.estado_activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="openEditModal(taller)"
                    class="text-primary-600 hover:text-primary-900"
                    title="Editar"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    v-if="taller.estado_activo"
                    @click="confirmDelete(taller)"
                    class="text-red-600 hover:text-red-900"
                    title="Desactivar"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <button
                    v-else
                    @click="confirmActivate(taller)"
                    class="text-green-600 hover:text-green-900"
                    title="Activar"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
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
        <div
          class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ isEditing ? 'Editar Taller' : 'Nuevo Taller' }}
              </h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Información Básica -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Información Básica</h3>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Taller <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.nombre"
                    type="text"
                    required
                    placeholder="Ej: Fútbol Infantil"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    v-model="formData.descripcion"
                    rows="3"
                    placeholder="Descripción del taller"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  ></textarea>
                </div>

                <!-- Fechas -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.fecha_inicio"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Término
                    </label>
                    <input
                      v-model="formData.fecha_termino"
                      type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                      Puedes dejarlo vacío si el taller es indefinido.
                    </p>
                  </div>
                </div>

                <!-- Sala / Profesor / Capacidad -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Sala -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Sala
                    </label>
                    <select
                      v-model="formData.sala_id"
                      :disabled="salaStore.loading"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option :value="null">Sin asignar</option>
                      <option
                        v-for="sala in salaStore.salas"
                        :key="sala.sala_id"
                        :value="sala.sala_id"
                      >
                        {{ sala.nombre }}
                      </option>
                    </select>
                    <p v-if="salaStore.loading" class="text-xs text-gray-500 mt-1">
                      Cargando salas...
                    </p>
                    <p
                      v-else-if="salaStore.error"
                      class="text-xs text-red-500 mt-1"
                    >
                      {{ salaStore.error }}
                    </p>
                  </div>

                  <!-- Profesor encargado -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Profesor Encargado
                    </label>
                    <select
                      v-model="formData.profesor_encargado_id"
                      :disabled="teacherStore.loading"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option :value="null">Sin asignar</option>
                      <option
                        v-for="prof in teacherStore.profesoresActivos"
                        :key="prof.profesor_id"
                        :value="prof.profesor_id"
                      >
                        {{ prof.nombre_completo }}
                      </option>
                    </select>

                    <p v-if="teacherStore.loading" class="text-xs text-gray-500 mt-1">
                      Cargando profesores...
                    </p>
                    <p
                      v-else-if="teacherStore.error"
                      class="text-xs text-red-500 mt-1"
                    >
                      {{ teacherStore.error }}
                    </p>
                  </div>

                  <!-- Capacidad -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Capacidad Máxima <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="formData.capacidad_maxima"
                      type="number"
                      min="1"
                      required
                      placeholder="Ej: 20"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Costo Adicional
                  </label>
                  <input
                    v-model.number="formData.costo_adicional"
                    type="number"
                    min="0"
                    placeholder="Ej: 15000"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Dejar vacío si es gratuito
                  </p>
                </div>
              </div>

              <!-- Horarios -->
              <div class="space-y-4 border-t pt-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-semibold text-gray-900">Horarios</h3>
                  <button
                    type="button"
                    @click="addHorario"
                    class="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Agregar Horario
                  </button>
                </div>

                <div
                  v-if="formData.horarios.length === 0"
                  class="text-center py-8 bg-gray-50 rounded-lg"
                >
                  <svg
                    class="w-12 h-12 mx-auto text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p class="text-gray-500 text-sm">
                    No hay horarios agregados
                  </p>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="(horario, index) in formData.horarios"
                    :key="index"
                    class="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <span class="text-sm font-medium text-gray-700">
                        Horario {{ index + 1 }}
                      </span>
                      <button
                        type="button"
                        @click="removeHorario(index)"
                        class="text-red-600 hover:text-red-800"
                      >
                        <svg
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label
                          class="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Día de la Semana
                          <span class="text-red-500">*</span>
                        </label>
                        <select
                          v-model="horario.dia_semana"
                          required
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                        </select>
                      </div>

                      <div>
                        <label
                          class="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Hora Inicio <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="horario.hora_inicio"
                          type="time"
                          required
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label
                          class="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Hora Término <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="horario.hora_termino"
                          type="time"
                          required
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex justify-end gap-3 pt-4 border-t">
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
                  {{
                    submitting
                      ? 'Guardando...'
                      : isEditing
                      ? 'Actualizar'
                      : 'Crear'
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Desactivación -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Confirmar Desactivación
          </h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas desactivar el taller
            <span class="font-semibold">{{ tallerToDelete?.nombre }}</span>?
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
              {{ submitting ? 'Desactivando...' : 'Desactivar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Activación -->
      <div
        v-if="showActivateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showActivateModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Confirmar Activación
          </h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas activar el taller
            <span class="font-semibold">{{ tallerToActivate?.nombre }}</span>?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showActivateModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleActivate"
              :disabled="submitting"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Activando...' : 'Activar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useTallerStore } from '@/store/taller.store'
import { useSalaStore } from '../../store/sala.store'
import { useTeacherStore } from '@/store/teacher.store'
import type { Taller, TallerFormData } from '@/types/taller.types'

const tallerStore = useTallerStore()
const salaStore = useSalaStore()
const teacherStore = useTeacherStore()

// Estados del modal
const showModal = ref(false)
const showDeleteModal = ref(false)
const showActivateModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const tallerToDelete = ref<Taller | null>(null)
const tallerToActivate = ref<Taller | null>(null)

// Formulario
const formData = ref<TallerFormData>({
  nombre: '',
  descripcion: null,
  sala_id: null,
  profesor_encargado_id: null,
  capacidad_maxima: 0,
  costo_adicional: null,
  estado_activo: true,
  horarios: [],
  fecha_inicio: null,
  fecha_termino: null
})

// Filtros
const filters = ref({
  search: '',
  estado_activo: undefined as boolean | undefined
})

// Talleres filtrados
const filteredTalleres = computed(() => {
  return tallerStore.talleres.filter((t) => {
    const matchesEstado =
      filters.value.estado_activo === undefined ||
      !!t.estado_activo === filters.value.estado_activo

    const matchesSearch =
      !filters.value.search ||
      t.nombre.toLowerCase().includes(filters.value.search.toLowerCase())

    return matchesEstado && matchesSearch
  })
})

// Helpers de capacidad
const capacidadRatio = (taller: Taller): number => {
  const cap = taller.capacidad_maxima ?? 0
  if (!cap) return 0
  const inscritos = taller.inscritos || 0
  return inscritos / cap
}

const capacidadPorcentaje = (taller: Taller): number => {
  return Math.min(capacidadRatio(taller) * 100, 100)
}

const applyFilters = async () => {
  try {
    await tallerStore.fetchTalleres({
      estado_activo: filters.value.estado_activo
    })
  } catch (error) {
    console.error('Error al aplicar filtros:', error)
  }
}

const clearFilters = async () => {
  filters.value = {
    search: '',
    estado_activo: undefined
  }
  try {
    await tallerStore.fetchTalleres()
  } catch (error) {
    console.error('Error al limpiar filtros:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    nombre: '',
    descripcion: null,
    sala_id: null,
    profesor_encargado_id: null,
    capacidad_maxima: 0,
    costo_adicional: null,
    estado_activo: true,
    horarios: [],
    fecha_inicio: null,
    fecha_termino: null
  }
  showModal.value = true
}

const openEditModal = (taller: Taller) => {
  isEditing.value = true
  editingId.value = taller.taller_id
  formData.value = {
    nombre: taller.nombre,
    descripcion: taller.descripcion ?? null,
    sala_id: taller.sala_id ?? null,
    profesor_encargado_id: taller.profesor_encargado_id ?? null,
    capacidad_maxima: taller.capacidad_maxima ?? 0,
    costo_adicional: taller.costo_adicional ?? null,
    estado_activo: !!taller.estado_activo,
    horarios: taller.horarios_parsed ? [...taller.horarios_parsed] : [],
    fecha_inicio: taller.fecha_inicio,
    fecha_termino: taller.fecha_termino
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}

const addHorario = () => {
  formData.value.horarios.push({
    dia_semana: '',
    hora_inicio: '',
    hora_termino: ''
  })
}

const removeHorario = (index: number) => {
  formData.value.horarios.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formData.value.nombre || formData.value.capacidad_maxima <= 0) {
    alert('Ingresa nombre y capacidad máxima válida')
    return
  }

  if (formData.value.horarios.length === 0) {
    alert('Debes agregar al menos un horario')
    return
  }

  const horariosIncompletos = formData.value.horarios.some(
    (h) => !h.dia_semana || !h.hora_inicio || !h.hora_termino
  )
  if (horariosIncompletos) {
    alert('Todos los horarios deben estar completos')
    return
  }

  if (!formData.value.fecha_inicio) {
    alert('Debes seleccionar una fecha de inicio')
    return
  }

  submitting.value = true
  try {
    const payload: TallerFormData = {
      ...formData.value,
      descripcion: formData.value.descripcion || null,
      sala_id: formData.value.sala_id || null,
      costo_adicional: formData.value.costo_adicional ?? null,
      fecha_inicio: formData.value.fecha_inicio || null,
      fecha_termino: formData.value.fecha_termino || null
    }

    if (isEditing.value && editingId.value) {
      await tallerStore.updateFromForm(editingId.value, payload)
      alert('Taller actualizado exitosamente')
    } else {
      await tallerStore.createFromForm(payload)
      alert('Taller creado exitosamente')
    }

    closeModal()
  } catch (error: any) {
    alert(`Error: ${error.message || 'Error al guardar el taller'}`)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (taller: Taller) => {
  tallerToDelete.value = taller
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!tallerToDelete.value) return
  submitting.value = true
  try {
    await tallerStore.disableTaller(tallerToDelete.value.taller_id)
    alert('Taller desactivado exitosamente')
    showDeleteModal.value = false
    tallerToDelete.value = null
  } catch (error: any) {
    alert(`Error: ${error.message || 'Error al desactivar el taller'}`)
  } finally {
    submitting.value = false
  }
}

const confirmActivate = (taller: Taller) => {
  tallerToActivate.value = taller
  showActivateModal.value = true
}

const handleActivate = async () => {
  if (!tallerToActivate.value) return
  submitting.value = true
  try {
    await tallerStore.enableTaller(tallerToActivate.value.taller_id)
    alert('Taller activado exitosamente')
    showActivateModal.value = false
    tallerToActivate.value = null
  } catch (error: any) {
    alert(`Error: ${error.message || 'Error al activar el taller'}`)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      tallerStore.fetchTalleres(),
      salaStore.fetchSalas(),                    // Salas para el select
      teacherStore.fetchProfesores({             // 🔹 Profesores para el select
      })
    ])

    console.log('Profesores cargados:', teacherStore.profesores)
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
  }
})
</script>
