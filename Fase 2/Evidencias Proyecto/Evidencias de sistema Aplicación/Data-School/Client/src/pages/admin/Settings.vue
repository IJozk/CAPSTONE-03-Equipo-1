<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p class="text-gray-600 mt-1">Gestiona las configuraciones generales del colegio</p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Configuración
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-12 bg-gray-200 rounded"></div>
          <div class="h-12 bg-gray-200 rounded"></div>
          <div class="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Configuraciones agrupadas por tipo -->
      <div v-else-if="tiposUnicos.length > 0" class="space-y-6">
        <div
          v-for="tipo in tiposUnicos"
          :key="tipo"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <!-- Header del grupo -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 capitalize">
              {{ tipo || 'Sin categoría' }}
            </h2>
          </div>

          <!-- Lista de configuraciones -->
          <div class="divide-y divide-gray-100">
            <div
              v-for="config in getConfigByType(tipo)"
              :key="config.configuracion_id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <!-- Info de la configuración -->
                <div class="flex-1 min-w-0 mr-4">
                  <div class="flex items-center space-x-3">
                    <h3 class="text-sm font-semibold text-gray-900">{{ config.clave }}</h3>
                    <span
                      v-if="config.tipo"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ config.tipo }}
                    </span>
                  </div>
                  <p v-if="config.descripcion" class="text-sm text-gray-600 mt-1">
                    {{ config.descripcion }}
                  </p>

                  <!-- Editar inline -->
                  <div v-if="editingConfigId === config.configuracion_id" class="mt-3">
                    <div class="flex items-center space-x-2">
                      <input
                        v-model="editingValue"
                        type="text"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nuevo valor"
                        @keyup.enter="saveEdit(config)"
                        @keyup.esc="cancelEdit"
                      />
                      <button
                        @click="saveEdit(config)"
                        class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        :disabled="savingEdit"
                      >
                        <svg v-if="!savingEdit" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </button>
                      <button
                        @click="cancelEdit"
                        class="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div v-else class="mt-2">
                    <span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                      {{ config.valor }}
                    </span>
                  </div>
                </div>

                <!-- Acciones -->
                <div v-if="editingConfigId !== config.configuracion_id" class="flex items-center space-x-2">
                  <button
                    @click="startEdit(config)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(config)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay configuraciones</h3>
        <p class="text-gray-600 mb-4">Comienza agregando la primera configuración del sistema.</p>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Configuración
        </button>
      </div>

      <!-- Modal de crear/editar -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Nueva Configuración
          </h2>

          <form @submit.prevent="submitCreate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Clave</label>
              <input
                v-model="newConfig.clave"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="ej: horario_inicio"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                v-model="newConfig.valor"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="ej: 08:00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <input
                v-model="newConfig.tipo"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="ej: horarios"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                v-model="newConfig.descripcion"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descripción de la configuración"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="creatingConfig"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ creatingConfig ? 'Creando...' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useConfiguracionColegioStore } from '@/store/configuracionColegio.store';
import { useAuthStore } from '@/store/auth.store';
import type { ConfiguracionColegio } from '@/services/configuracionColegio.service';

// Stores
const configStore = useConfiguracionColegioStore();
const authStore = useAuthStore();

// Estado local
const editingConfigId = ref<number | null>(null);
const editingValue = ref('');
const savingEdit = ref(false);
const showModal = ref(false);
const creatingConfig = ref(false);

const newConfig = ref({
  clave: '',
  valor: '',
  tipo: '',
  descripcion: ''
});

// Computed
const loading = computed(() => configStore.loading);
const error = computed(() => configStore.error);
const configuraciones = computed(() => configStore.todasLasConfiguraciones);
const tiposUnicos = computed(() => configStore.tiposUnicos);

// ID del colegio del usuario actual
const colegioId = computed(() => authStore.user?.colegio_id || 1);

// Obtener configuraciones por tipo
const getConfigByType = (tipo: string) => {
  return configStore.getConfiguracionesPorTipo(tipo);
};

// Edición inline
const startEdit = (config: ConfiguracionColegio) => {
  editingConfigId.value = config.configuracion_id;
  editingValue.value = config.valor;
};

const cancelEdit = () => {
  editingConfigId.value = null;
  editingValue.value = '';
};

const saveEdit = async (config: ConfiguracionColegio) => {
  if (!editingValue.value.trim()) return;

  savingEdit.value = true;
  try {
    await configStore.updateValor(config.clave, colegioId.value, editingValue.value);
    cancelEdit();
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
  } finally {
    savingEdit.value = false;
  }
};

// Modal de crear
const openCreateModal = () => {
  showModal.value = true;
  newConfig.value = {
    clave: '',
    valor: '',
    tipo: '',
    descripcion: ''
  };
};

const closeModal = () => {
  showModal.value = false;
  newConfig.value = {
    clave: '',
    valor: '',
    tipo: '',
    descripcion: ''
  };
};

const submitCreate = async () => {
  creatingConfig.value = true;
  try {
    await configStore.createConfiguracion({
      clave: newConfig.value.clave,
      valor: newConfig.value.valor,
      colegio_id: colegioId.value,
      tipo: newConfig.value.tipo || undefined,
      descripcion: newConfig.value.descripcion || undefined
    });
    closeModal();
  } catch (error) {
    console.error('Error al crear configuración:', error);
  } finally {
    creatingConfig.value = false;
  }
};

// Eliminar
const confirmDelete = async (config: ConfiguracionColegio) => {
  if (confirm(`¿Estás seguro de eliminar la configuración "${config.clave}"?`)) {
    try {
      await configStore.deleteConfiguracion(config.configuracion_id);
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
    }
  }
};

// Lifecycle
onMounted(async () => {
  await configStore.fetchConfiguraciones(colegioId.value);
});
</script>
