<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Zonas Físicas del Colegio</h3>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Nueva Zona
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Cargando zonas...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="zona in zonas"
        :key="zona.zona_id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <h4 class="font-semibold text-gray-900 mb-2">{{ zona.nombre_zona }}</h4>
        <p v-if="zona.descripcion" class="text-sm text-gray-600 mb-3">{{ zona.descripcion }}</p>
        <div class="text-sm">
          <span class="text-gray-600">Capacidad:</span>
          <span class="ml-2 font-medium">{{ zona.capacidad_total || 'No especificada' }}</span>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="editZona(zona)"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Editar
          </button>
          <button
            @click="deleteZona(zona.zona_id)"
            class="text-sm text-red-600 hover:text-red-800"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">{{ editingZona ? 'Editar' : 'Nueva' }} Zona</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ID de Zona</label>
            <input
              v-model="formData.zona_id"
              required
              :disabled="!!editingZona"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              v-model="formData.nombre_zona"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              v-model="formData.descripcion"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Capacidad Total</label>
            <input
              v-model.number="formData.capacidad_total"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg">
              {{ editingZona ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import zonaService, { type Zona, type CreateZonaDTO } from '@/services/zona.service';

const authStore = useAuthStore();
const loading = ref(true);
const zonas = ref<Zona[]>([]);
const showCreateModal = ref(false);
const editingZona = ref<Zona | null>(null);
const formData = ref<any>({ zona_id: '', nombre_zona: '', descripcion: '', capacidad_total: null });

const loadZonas = async () => {
  try {
    loading.value = true;
    if (authStore.user?.colegio_id) {
      zonas.value = await zonaService.getAll(authStore.user?.colegio_id);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};

const editZona = (zona: Zona) => {
  editingZona.value = zona;
  formData.value = { ...zona };
  showCreateModal.value = true;
};

const deleteZona = async (id: string) => {
  if (confirm('¿Eliminar esta zona?')) {
    try {
      await zonaService.delete(id);
      await loadZonas();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Error al eliminar'}`);
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingZona.value = null;
  formData.value = { zona_id: '', nombre_zona: '', descripcion: '', capacidad_total: null };
};

const handleSubmit = async () => {
  try {
    if (editingZona.value) {
      await zonaService.update(editingZona.value.zona_id, formData.value);
    } else {
      const data: CreateZonaDTO = { ...formData.value, colegio_id: authStore.user?.colegio_id! };
      await zonaService.create(data);
    }
    await loadZonas();
    closeModal();
  } catch (error: any) {
    alert(`Error: ${error.response?.data?.message || 'Error al guardar'}`);
  }
};

onMounted(() => {
  loadZonas();
});
</script>
