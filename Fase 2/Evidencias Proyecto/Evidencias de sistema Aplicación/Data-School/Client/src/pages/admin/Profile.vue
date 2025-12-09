<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p class="text-gray-600 mt-1">Información personal</p>
      </div>

      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="text-gray-600">Cargando información del perfil...</div>
      </div>

      <div v-else-if="error" class="bg-white rounded-lg shadow p-8">
        <div class="text-red-600 mb-4">Error: {{ error }}</div>
        <!-- Debug info -->
        <details class="mt-4">
          <summary class="cursor-pointer text-sm text-gray-600">Ver datos de debug</summary>
          <pre class="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">{{ debugInfo }}</pre>
        </details>
      </div>

      <!-- Información del perfil -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Header con avatar -->
        <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-white">{{ userProfile.nombre_completo || 'Usuario' }}</h2>
              <p class="text-primary-100">{{ userProfile.email }}</p>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Información Personal</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <p class="text-gray-900 text-base">{{ userProfile.nombre_completo || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">RUT</label>
              <p class="text-gray-900 text-base font-medium">{{ userProfile.rut || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p class="text-gray-900 text-base">{{ userProfile.email || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <p class="text-gray-900 text-base">{{ userProfile.telefono || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
              <span class="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ userProfile.cargo || '-' }}
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <span class="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                {{ getRoleLabel(userProfile.role) }}
              </span>
            </div>

            <div v-if="userProfile.direccion" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <p class="text-gray-900 text-base">{{ userProfile.direccion }}</p>
            </div>

            <div v-if="userProfile.genero">
              <label class="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <p class="text-gray-900 text-base">{{ getGenderLabel(userProfile.genero) }}</p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro</label>
              <p class="text-gray-900 text-base">{{ formatDate(userProfile.created_at) }}</p>
            </div>
          </div>

          <!-- Debug Section (solo en desarrollo) -->
          <details class="mt-8 border-t pt-4">
            <summary class="cursor-pointer text-sm text-gray-500">Ver datos completos (debug)</summary>
            <pre class="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto">{{ JSON.stringify(userProfile, null, 2) }}</pre>
          </details>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.store'

const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const debugInfo = ref({})

// Datos del usuario que usa la vista
const userProfile = ref({
  nombre_completo: '',
  email: '',
  rut: '',
  telefono: '',
  genero: '',
  direccion: '',
  cargo: '',
  role: '',
  created_at: ''
})

const loadUserProfile = async () => {
  loading.value = true
  error.value = ''

  try {
    const userData = authStore.user
    console.log('=== DATOS COMPLETOS DEL USUARIO ===')
    console.log(JSON.stringify(userData, null, 2))
    
    debugInfo.value = userData || {}

    if (!userData) throw new Error('No se encontró información del usuario')

    // Intentar diferentes estructuras posibles
    const adminProfile = (userData as any).admin_profile || 
                        (userData as any).administrativo || 
                        (userData as any).Administrativo ||
                        userData

    console.log('=== PERFIL ADMIN DETECTADO ===')
    console.log(JSON.stringify(adminProfile, null, 2))

    // Mapear todos los campos posibles
    userProfile.value = {
      nombre_completo: adminProfile?.nombre_completo || 
                       adminProfile?.nombre || 
                       (userData as any).nombre_completo ||
                       '',
      email: (userData as any).email || 
             adminProfile?.email || 
             '',
      rut: adminProfile?.rut || 
           (userData as any).rut || 
           '',
      telefono: adminProfile?.telefono || 
                adminProfile?.phone ||
                (userData as any).telefono || 
                '',
      genero: adminProfile?.genero || 
              (userData as any).genero || 
              '',
      direccion: adminProfile?.direccion || 
                 (userData as any).direccion || 
                 '',
      cargo: adminProfile?.cargo || 
             (userData as any).cargo || 
             '',
      role: (userData as any).role || 
            adminProfile?.role || 
            '',
      created_at: adminProfile?.created_at || 
                  (userData as any).created_at || 
                  adminProfile?.createdAt ||
                  (userData as any).createdAt ||
                  ''
    }

    console.log('=== PERFIL FINAL MAPEADO ===')
    console.log(JSON.stringify(userProfile.value, null, 2))

  } catch (err: any) {
    console.error('Error al cargar perfil:', err)
    error.value = err.message || 'Error al cargar la información del perfil'
  } finally {
    loading.value = false
  }
}

// Formatear fecha
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// Obtener etiqueta de género
const getGenderLabel = (gender: string) => {
  const labels: Record<string, string> = {
    M: 'Masculino',
    F: 'Femenino',
    O: 'Otro',
    masculino: 'Masculino',
    femenino: 'Femenino',
    otro: 'Otro'
  }
  return labels[gender] || gender || '-'
}

// Obtener etiqueta de rol
const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    user: 'Usuario',
    administrativo: 'Administrativo',
    super_admin: 'Super Administrador'
  }
  return labels[role] || role || '-'
}

onMounted(() => {
  loadUserProfile()
})
</script>