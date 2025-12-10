<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p class="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
        </div>
        <div class="flex gap-2">
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
            Nuevo Usuario
          </router-link>
        </div>
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
          <!-- Filtros -->
          <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Filtro por rol -->
            <div>
              <label for="role-filter" class="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por rol
              </label>
              <select
                id="role-filter"
                v-model="selectedRole"
                @change="currentPage = 1"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Todos los roles</option>
                <option v-for="role in availableRoles" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>

            <!-- Filtro por búsqueda -->
            <div>
              <label for="search-filter" class="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nombre, email o RUT
              </label>
              <div class="relative">
                <input
                  id="search-filter"
                  type="text"
                  v-model="searchQuery"
                  @input="currentPage = 1"
                  placeholder="Buscar..."
                  class="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Información de paginación -->
          <div class="mb-4 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ totalFilteredUsers }} usuarios
              <span v-if="selectedRole || searchQuery" class="font-medium text-primary-600">(filtrado)</span>
            </div>
            <button
              v-if="selectedRole || searchQuery"
              @click="clearAllFilters"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>

          <!-- Tabla de usuarios -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="paginatedUsers.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                    No se encontraron usuarios con los filtros aplicados
                  </td>
                </tr>
                <tr v-for="user in paginatedUsers" :key="user.user_id">
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                    <span class="font-medium">{{ getUserRut(user) }}</span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                    {{ getUserName(user) }}
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                    {{ user.email_address }}
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ user.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
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
const searchQuery = ref('');

// Obtener roles únicos disponibles
const availableRoles = computed(() => {
  const roles = new Set(userStore.users.map(user => user.role).filter(role => role));
  return Array.from(roles).sort();
});

// Función para normalizar texto (quitar tildes y convertir a minúsculas)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.-]/g, '');
};

// Usuarios filtrados por rol y búsqueda
const filteredUsers = computed(() => {
  let users = userStore.users;

  // Filtrar por rol
  if (selectedRole.value) {
    users = users.filter(user => user.role === selectedRole.value);
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = normalizeText(searchQuery.value);
    users = users.filter(user => {
      const name = normalizeText(getUserName(user));
      const email = normalizeText(user.email_address || '');
      const rut = normalizeText(getUserRut(user));
      
      return name.includes(query) || email.includes(query) || rut.includes(query);
    });
  }

  return users;
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

const getUserName = (user: any): string => {
  // Primero intentar obtener el nombre_completo directamente (ya viene mapeado del backend)
  if (user.nombre_completo && user.nombre_completo !== '-') {
    return user.nombre_completo;
  }
  
  // Fallback al método anterior por si acaso
  if (user.role === 'ESTUDIANTE_APODERADO' && user.Estudiante) {
    return user.Estudiante.nombre_completo || '-';
  } else if (user.role === 'PROFESOR' && user.Profesor) {
    return user.Profesor.nombre_completo || '-';
  } else if (user.role === 'ADMINISTRATIVO' && user.Administrativo) {
    return user.Administrativo.nombre_completo || '-';
  }
  return '-';
};

const getUserRut = (user: any): string => {
  // Primero intentar obtener el rut directamente (ya viene mapeado del backend)
  if (user.rut && user.rut !== '-') {
    return user.rut;
  }
  
  // Fallback al método anterior por si acaso
  if (user.role === 'ESTUDIANTE_APODERADO' && user.Estudiante) {
    return user.Estudiante.rut || '-';
  } else if (user.role === 'PROFESOR' && user.Profesor) {
    return user.Profesor.rut || '-';
  } else if (user.role === 'ADMINISTRATIVO' && user.Administrativo) {
    return user.Administrativo.rut || '-';
  }
  return '-';
};

// Funciones de filtrado
const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
};

const clearAllFilters = () => {
  selectedRole.value = '';
  searchQuery.value = '';
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

// Obtener clase CSS para el badge del rol
const getRoleBadgeClass = (role: string) => {
  const roleClasses: Record<string, string> = {
    'ADMINISTRADOR': 'bg-purple-100 text-purple-800',
    'ESTUDIANTE_APODERADO': 'bg-blue-100 text-blue-800',
    'PROFESOR': 'bg-green-100 text-green-800',
    'ADMINISTRATIVO': 'bg-orange-100 text-orange-800'
  };
  return roleClasses[role] || 'bg-gray-100 text-gray-800';
};

onMounted(async () => {
  try {
    await userStore.fetchUsers();
  } catch (error) {
    console.error('Error fetching users:', error);
  }
});

// Funciones de exportación
const exportToCSV = () => {
  try {
    // Preparar los datos
    const data = userStore.users.map(user => ({
      'Nombre Completo': getUserName(user),
      'RUT': getUserRut(user),
      'Email': user.email_address,
      'Rol': user.role,
      'Estado': user.is_active ? 'Activo' : 'Inactivo',
      'Fecha de Registro': formatDate(user.created_at)
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
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
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
    const data = userStore.users.map(user => ({
      nombre: getUserName(user),
      rut: getUserRut(user),
      email: user.email_address,
      rol: user.role,
      estado: user.is_active ? 'Activo' : 'Inactivo',
      fecha: formatDate(user.created_at)
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
        <title>Reporte de Usuarios</title>
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
          }
          th {
            background-color: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 10px;
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
        </style>
      </head>
      <body>
        <h1>Reporte de Usuarios</h1>
        <div class="subtitle">Generado el ${new Date().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>

        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>RUT</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(user => `
              <tr>
                <td>${user.nombre}</td>
                <td>${user.rut}</td>
                <td>${user.email}</td>
                <td>${user.rol}</td>
                <td>${user.estado}</td>
                <td>${user.fecha}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Total de usuarios: ${data.length}</p>
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