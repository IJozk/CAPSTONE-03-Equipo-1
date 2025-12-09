<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Administrativos</h1>
          <p class="text-gray-600 mt-1">Administra todos los administrativos del sistema</p>
        </div>
        <div class="flex gap-2">
          <!-- Botones de exportación -->
          <button
            @click="exportToCSV"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            title="Exportar a CSV"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
          <button
            @click="exportToPDF"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            title="Exportar a PDF"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
          <router-link
            to="/register"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Administrativo
          </router-link>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-8">
        <div v-if="adminStore.loading" class="text-center py-8">
          <div class="text-gray-600">Cargando administrativos...</div>
        </div>
        
        <div v-else-if="adminStore.error" class="text-center py-8">
          <div class="text-red-600">Error: {{ adminStore.error }}</div>
        </div>

        <div v-else-if="adminStore.administrativos.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">No hay administrativos</h2>
          <p class="text-gray-600">Aún no hay administrativos registrados en el sistema.</p>
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
              Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ totalFilteredAdmins }} administrativos
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

          <!-- Tabla de administrativos -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Telefono</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="paginatedAdmins.length === 0">
                  <td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500">
                    No se encontraron administrativos con los filtros aplicados
                  </td>
                </tr>
                <tr v-for="admin in paginatedAdmins" :key="admin.user_id">
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                    <span class="font-medium">{{ admin.rut }}</span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ admin.nombre_completo }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ admin.User?.email_address }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ admin.cargo }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ admin.Area?.nombre_area }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ formatDate(admin.created_at) }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ admin.telefono }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="admin.estado_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ admin.estado_activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm font-medium">
                    <button @click="openEditModal(admin)" class="text-blue-600 hover:text-blue-900">Editar</button>
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
                    Editar Administrativo
                  </h3>
                  
                  <form @submit.prevent="saveAdmin" class="space-y-4">
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

                    <!-- RUT -->
                    <div>
                      <label for="rut" class="block text-sm font-medium text-gray-700">RUT</label>
                      <input
                        type="text"
                        id="rut"
                        v-model="editForm.rut"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>

                    <!-- Cargo -->
                    <div>
                      <label for="cargo" class="block text-sm font-medium text-gray-700">Cargo</label>
                      <input
                        type="text"
                        id="cargo"
                        v-model="editForm.cargo"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                @click="saveAdmin"
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
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAdministrativoStore } from '@/store/administrativo.store';
import { onMounted, computed, ref } from 'vue';

const adminStore = useAdministrativoStore();
const currentPage = ref(1);
const itemsPerPage = 20;
const rutFilter = ref('');
const statusFilter = ref('');

// Estado del modal de edición
const isEditModalOpen = ref(false);
const editingAdmin = ref<any>(null);
const editForm = ref<{
  nombre_completo: string;
  rut: string;
  cargo: string;
  telefono: string;
  estado_activo: boolean;
}>({
  nombre_completo: '',
  rut: '',
  cargo: '',
  telefono: '',
  estado_activo: true
});

// Normalizar RUT para comparación (quita puntos y guiones)
const normalizeRut = (rut: string) => {
  return rut.replace(/[.-]/g, '').toLowerCase();
};

// Administrativos filtrados
const filteredAdmins = computed(() => {
  let admins = adminStore.administrativos;

  // Filtrar por RUT
  if (rutFilter.value) {
    const normalizedFilter = normalizeRut(rutFilter.value);
    admins = admins.filter(admin => {
      const normalizedRut = normalizeRut(admin.rut || '');
      return normalizedRut.includes(normalizedFilter);
    });
  }

  // Filtrar por estado
  if (statusFilter.value !== '') {
    const isActive = statusFilter.value === 'true';
    admins = admins.filter(admin => {
      return (admin.estado_activo === isActive || 
              admin.estado_activo === Boolean(isActive));
    });
  }

  return admins;
});

// Computed properties para la paginación
const totalFilteredAdmins = computed(() => filteredAdmins.value.length);

const totalPages = computed(() => Math.ceil(totalFilteredAdmins.value / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);

const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalFilteredAdmins.value));

const paginatedAdmins = computed(() => {
  return filteredAdmins.value.slice(startIndex.value, endIndex.value);
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
const openEditModal = (admin: any) => {
  editingAdmin.value = admin;
  editForm.value = {
    nombre_completo: admin.nombre_completo,
    rut: admin.rut,
    cargo: admin.cargo || '',
    telefono: admin.telefono || '',
    estado_activo: admin.estado_activo === true || admin.estado_activo === 'true'
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingAdmin.value = null;
  editForm.value = {
    nombre_completo: '',
    rut: '',
    cargo: '',
    telefono: '',
    estado_activo: true
  };
};

const saveAdmin = async () => {
  try {
    await adminStore.updateAdministrativo(editingAdmin.value.administrativo_id, editForm.value);
    closeEditModal();
    alert('Administrativo actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar administrativo:', error);
    alert('Error al actualizar el administrativo');
  }
};

onMounted(async () => {
  try {
    await adminStore.fetchAdministrativos();
  } catch (error) {
    console.error('Error fetching administrativos:', error);
  }
});

// Funciones de exportación
const exportToCSV = () => {
  try {
    // Preparar los datos
    const data = filteredAdmins.value.map(admin => ({
      'RUT': admin.rut,
      'Nombre Completo': admin.nombre_completo,
      'Email': admin.User?.email_address || '-',
      'Cargo': admin.cargo || '-',
      'Área': admin.Area?.nombre_area || '-',
      'Teléfono': admin.telefono || '-',
      'Estado': admin.estado_activo ? 'Activo' : 'Inactivo',
      'Fecha de Registro': formatDate(admin.created_at)
    }))

    if (data.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    // Crear CSV
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header as keyof typeof row]
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(','))
    ].join('\n')

    // Crear BOM para UTF-8
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `administrativos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('✅ CSV exportado exitosamente')
  } catch (error) {
    console.error('Error exportando CSV:', error)
    alert('Error al exportar CSV')
  }
}

const exportToPDF = () => {
  try {
    const data = filteredAdmins.value.map(admin => ({
      rut: admin.rut,
      nombre: admin.nombre_completo,
      email: admin.User?.email_address || '-',
      cargo: admin.cargo || '-',
      area: admin.Area?.nombre_area || '-',
      telefono: admin.telefono || '-',
      estado: admin.estado_activo ? 'Activo' : 'Inactivo',
      fecha: formatDate(admin.created_at)
    }))

    if (data.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    // Crear contenido HTML para el PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Administrativos</title>
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
            margin-bottom: 30px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th {
            background-color: #2563eb;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tr:hover {
            background-color: #f3f4f6;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .status-active {
            color: #059669;
            font-weight: bold;
          }
          .status-inactive {
            color: #dc2626;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>Reporte de Administrativos</h1>
        <div class="subtitle">Generado el ${new Date().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>

        <table>
          <thead>
            <tr>
              <th>RUT</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Área</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(admin => `
              <tr>
                <td>${admin.rut}</td>
                <td>${admin.nombre}</td>
                <td>${admin.email}</td>
                <td>${admin.cargo}</td>
                <td>${admin.area}</td>
                <td>${admin.telefono}</td>
                <td class="${admin.estado === 'Activo' ? 'status-active' : 'status-inactive'}">${admin.estado}</td>
                <td>${admin.fecha}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Total de administrativos: ${data.length}</p>
          <p>Data-School - Sistema de Gestión Escolar</p>
        </div>
      </body>
      </html>
    `

    // Crear ventana de impresión
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Esperar a que se cargue el contenido antes de imprimir
      printWindow.onload = () => {
        printWindow.print()
      }
    } else {
      alert('Por favor, permite ventanas emergentes para exportar a PDF')
    }

    console.log('✅ PDF generado exitosamente')
  } catch (error) {
    console.error('Error exportando PDF:', error)
    alert('Error al exportar PDF')
  }
}
</script>