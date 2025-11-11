<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-gray-900">Información del Colegio</h3>

    <!-- Información del colegio (Read-only por ahora, se puede extender) -->
    <div v-if="schoolInfo" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Colegio</label>
        <input
          type="text"
          :value="schoolInfo.nombre"
          readonly
          class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
        <input
          type="text"
          :value="schoolInfo.direccion || 'No especificada'"
          readonly
          class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>

      <div class="md:col-span-2">
        <p class="text-sm text-gray-600">
          Para modificar la información básica del colegio, contacta al administrador del sistema.
        </p>
      </div>
    </div>

    <!-- Configuraciones adicionales -->
    <div class="border-t border-gray-200 pt-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Configuraciones del Sistema</h4>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Cargando configuraciones...</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="config in configs" :key="config.config_id" class="border border-gray-200 rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h5 class="font-medium text-gray-900">{{ config.clave }}</h5>
              <p v-if="config.descripcion" class="text-sm text-gray-600 mt-1">{{ config.descripcion }}</p>
            </div>
            <div class="ml-4">
              <input
                v-if="editingConfigId === config.config_id"
                v-model="editValue"
                type="text"
                class="px-3 py-1 border border-gray-300 rounded"
              />
              <span v-else class="text-sm font-medium text-primary-600">{{ config.valor || 'Sin valor' }}</span>
            </div>
            <div class="ml-4 flex gap-2">
              <button
                v-if="editingConfigId === config.config_id"
                @click="saveConfig(config.config_id)"
                class="text-green-600 hover:text-green-800 text-sm"
              >
                Guardar
              </button>
              <button
                v-if="editingConfigId === config.config_id"
                @click="cancelEdit"
                class="text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancelar
              </button>
              <button
                v-else
                @click="startEdit(config)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        <div v-if="configs.length === 0" class="text-center py-8 text-gray-500">
          No hay configuraciones registradas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import configuracionColegioService from '@/services/configuracionColegio.service';
import schoolService from '@/services/school.service';

const authStore = useAuthStore();
const loading = ref(true);
const schoolInfo = ref<any>(null);
const configs = ref<any[]>([]);
const editingConfigId = ref<string | null>(null);
const editValue = ref('');

const loadData = async () => {
  try {
    loading.value = true;

    // Obtener información del colegio
    if (authStore.user?.colegio_id) {
      schoolInfo.value = await schoolService.getById(authStore.user?.colegio_id);

      // Obtener configuraciones
      configs.value = await configuracionColegioService.getAll(authStore.user?.colegio_id);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
};

const startEdit = (config: any) => {
  editingConfigId.value = config.config_id;
  editValue.value = config.valor || '';
};

const cancelEdit = () => {
  editingConfigId.value = null;
  editValue.value = '';
};

const saveConfig = async (configId: string) => {
  try {
    await configuracionColegioService.update(configId, { valor: editValue.value });
    await loadData();
    cancelEdit();
  } catch (error: any) {
    console.error('Error saving config:', error);
    alert(`Error: ${error.response?.data?.message || 'Error al guardar configuración'}`);
  }
};

onMounted(() => {
  loadData();
});
</script>
