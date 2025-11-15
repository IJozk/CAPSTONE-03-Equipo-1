<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Salas del Colegio</h3>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Nueva Sala
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="sala in salas" :key="sala.sala_id" class="border border-gray-200 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-2">{{ sala.nombre }}</h4>
        <div class="space-y-1 text-sm text-gray-600">
          <p>Zona: {{ sala.Zona?.nombre_zona || 'Sin zona' }}</p>
          <p>Capacidad: {{ sala.capacidad || 'N/A' }}</p>
          <p>Estado: <span :class="{
            'text-green-600': sala.estado === 'DISPONIBLE',
            'text-orange-600': sala.estado === 'MANTENIMIENTO',
            'text-red-600': sala.estado === 'FUERA_DE_SERVICIO'
          }">{{ sala.estado }}</span></p>
        </div>
        <div class="mt-4 flex gap-2">
          <button @click="editSala(sala)" class="text-sm text-blue-600 hover:text-blue-800">Editar</button>
          <button @click="deleteSala(sala.sala_id)" class="text-sm text-red-600 hover:text-red-800">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal simplificado -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">{{ editingSala ? 'Editar' : 'Nueva' }} Sala</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">ID Sala</label>
            <input v-model="formData.sala_id" required :disabled="!!editingSala" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Nombre</label>
            <input v-model="formData.nombre" required class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Zona</label>
            <select v-model="formData.zona_id" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">Seleccionar zona...</option>
              <option v-for="zona in zonas" :key="zona.zona_id" :value="zona.zona_id">{{ zona.nombre_zona }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Capacidad</label>
            <input v-model.number="formData.capacidad" type="number" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg">
              {{ editingSala ? 'Actualizar' : 'Crear' }}
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
import salaService, { type Sala, type CreateSalaDTO } from '@/services/sala.service';
import zonaService, { type Zona } from '@/services/zona.service';

const authStore = useAuthStore();
const loading = ref(true);
const salas = ref<Sala[]>([]);
const zonas = ref<Zona[]>([]);
const showCreateModal = ref(false);
const editingSala = ref<Sala | null>(null);
const formData = ref<any>({ sala_id: '', nombre: '', zona_id: '', capacidad: null });

const loadData = async () => {
  try {
    loading.value = true;
    if (authStore.user?.colegio_id) {
      [salas.value, zonas.value] = await Promise.all([
        salaService.getAll(),
        zonaService.getAll(authStore.user?.colegio_id)
      ]);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};

const editSala = (sala: Sala) => {
  editingSala.value = sala;
  formData.value = { ...sala };
  showCreateModal.value = true;
};

const deleteSala = async (id: string) => {
  if (confirm('¿Eliminar esta sala?')) {
    try {
      await salaService.delete(id);
      await loadData();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Error al eliminar'}`);
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingSala.value = null;
  formData.value = { sala_id: '', nombre: '', zona_id: '', capacidad: null };
};

const handleSubmit = async () => {
  try {
    if (editingSala.value) {
      await salaService.update(editingSala.value.sala_id, formData.value);
    } else {
      await salaService.create(formData.value as CreateSalaDTO);
    }
    await loadData();
    closeModal();
  } catch (error: any) {
    alert(`Error: ${error.response?.data?.message || 'Error al guardar'}`);
  }
};

onMounted(() => {
  loadData();
});
</script>
