<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p class="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
        </div>
        <router-link
          to="/register"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </router-link>
      </div>

      <div class="bg-white rounded-lg shadow p-8">
        <div v-if="userStore.loading" class="text-center py-8">
          <div class="text-gray-600">Cargando usuarios...</div>
        </div>
        <div v-else-if="userStore.error" class="text-center py-8">
          <div class="text-red-600">Error: {{ userStore.error }}</div>
        </div>

        <div v-else-if="userStore.users.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">No hay usuarios</h2>
          <p class="text-gray-600">Aún no hay usuarios registrados en el sistema.</p>
        </div>

        <div v-else>
          <!-- Filtro por rol -->
          <div class="mb-6">
            <label for="role-filter" class="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por rol
            </label>
            <select
              id="role-filter"
              v-model="selectedRole"
              @change="currentPage = 1"
              class="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Todos los roles</option>
              <option v-for="role in availableRoles" :key="role" :value="role">
                {{ role }}
              </option>
            </select>
          </div>
          
          <!-- Información de paginación -->
          <div class="mb-4 text-sm text-gray-600">
            Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ totalFilteredUsers }} usuarios
            <span v-if="selectedRole" class="font-medium">(filtrado por: {{ selectedRole }})</span>
          </div>

          <!-- Tabla de usuarios -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in paginatedUsers" :key="user.user_id">
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ user.email_address }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">{{ formatDate(user.created_at) }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Controles de paginación -->
          <div class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
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
                    Editar Usuario
                  </h3>
                  
                  <form @submit.prevent="saveUser" class="space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useUserStore } from '@/store/user.store';
import { onMounted, computed, ref } from 'vue';

const userStore = useUserStore();
const currentPage = ref(1);
const itemsPerPage = 20;
const selectedRole = ref('');

// Estado del modal de edición
const isEditModalOpen = ref(false);
const editingUser = ref<any>(null);
const editForm = ref<{
  email: string;
  estado_activo: boolean;
}>({
  email: '',
  estado_activo: true
});

// Obtener roles únicos disponibles
const availableRoles = computed(() => {
  const roles = new Set(userStore.users.map(user => user.role).filter(role => role));
  return Array.from(roles).sort();
});

// Usuarios filtrados por rol
const filteredUsers = computed(() => {
  if (!selectedRole.value) {
    return userStore.users;
  }
  return userStore.users.filter(user => user.role === selectedRole.value);
});

// Computed properties para la paginación
const totalFilteredUsers = computed(() => filteredUsers.value.length);

const totalPages = computed(() => Math.ceil(totalFilteredUsers.value / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);

const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalFilteredUsers.value));

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value);
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

// Obtener clase CSS para el badge del rol
const getRoleBadgeClass = (role: string) => {
  const roleClasses: Record<string, string> = {
    'admin': 'bg-purple-100 text-purple-800',
    'user': 'bg-blue-100 text-blue-800',
    'moderator': 'bg-green-100 text-green-800',
    'guest': 'bg-gray-100 text-gray-800'
  };
  return roleClasses[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Funciones del modal
const openEditModal = (user: any) => {
  editingUser.value = user;
  editForm.value = {
    email: user.email_address,
    estado_activo: user.is_active
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingUser.value = null;
  editForm.value = {
    email: '',
    estado_activo: true
  };
};

const saveUser = async () => {
  try {
    await userStore.updateUser(editingUser.value.user_id, {
      email_address: editForm.value.email,
      is_active: editForm.value.estado_activo
    });
    closeEditModal();
    await userStore.fetchUsers();
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
  }
};

onMounted(async () => {
  try {
    await userStore.fetchUsers();
  } catch (error) {
    console.error('Error fetching users:', error);
  }
});
</script>