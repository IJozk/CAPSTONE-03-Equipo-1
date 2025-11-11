<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Gestión de Años Académicos</h3>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Nuevo Año Académico
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Cargando años académicos...</p>
    </div>

    <!-- Lista de años académicos -->
    <div v-else class="space-y-4">
      <div
        v-for="anio in aniosAcademicos"
        :key="anio.anio_id"
        class="border border-gray-200 rounded-lg p-4"
        :class="{ 'border-green-500 border-2': anio.estado_activo }"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h4 class="text-lg font-semibold text-gray-900">Año {{ anio.anio }}</h4>
              <span
                v-if="anio.estado_activo"
                class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
              >
                Activo
              </span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Inicio:</span>
                <span class="ml-2 font-medium">{{ formatDate(anio.fecha_inicio) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Término:</span>
                <span class="ml-2 font-medium">{{ formatDate(anio.fecha_termino) }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              v-if="!anio.estado_activo"
              @click="activateAnio(anio.anio_id)"
              class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Activar
            </button>
            <button
              @click="editAnio(anio)"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar
            </button>
          </div>
        </div>
      </div>

      <div v-if="aniosAcademicos.length === 0" class="text-center py-12 text-gray-500">
        No hay años académicos registrados
      </div>
    </div>

    <!-- Modal Crear/Editar (simplificado por espacio) -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ editingAnio ? 'Editar' : 'Nuevo' }} Año Académico</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Año</label>
              <input
                v-model.number="formData.anio"
                type="number"
                required
                :disabled="!!editingAnio"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                v-model="formData.fecha_inicio"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Término</label>
              <input
                v-model="formData.fecha_termino"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {{ editingAnio ? 'Actualizar' : 'Crear' }}
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
import anioAcademicoService, { type AnioAcademico, type CreateAnioAcademicoDTO, type UpdateAnioAcademicoDTO } from '@/services/anioAcademico.service';

const authStore = useAuthStore();
const loading = ref(true);
const aniosAcademicos = ref<AnioAcademico[]>([]);
const showCreateModal = ref(false);
const editingAnio = ref<AnioAcademico | null>(null);
const formData = ref<any>({
  anio: new Date().getFullYear(),
  fecha_inicio: '',
  fecha_termino: ''
});

const loadAnios = async () => {
  try {
    loading.value = true;
    if (authStore.user?.colegio_id) {
      aniosAcademicos.value = await anioAcademicoService.getAll({ colegio_id: authStore.user?.colegio_id });
    }
  } catch (error) {
    console.error('Error loading años académicos:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
};

const activateAnio = async (id: number) => {
  if (confirm('¿Estás seguro de activar este año académico? Los demás se desactivarán.')) {
    try {
      await anioAcademicoService.activate(id);
      await loadAnios();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Error al activar año académico'}`);
    }
  }
};

const editAnio = (anio: AnioAcademico) => {
  editingAnio.value = anio;
  formData.value = {
    anio: anio.anio,
    fecha_inicio: anio.fecha_inicio,
    fecha_termino: anio.fecha_termino
  };
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  editingAnio.value = null;
  formData.value = {
    anio: new Date().getFullYear(),
    fecha_inicio: '',
    fecha_termino: ''
  };
};

const handleSubmit = async () => {
  try {
    if (editingAnio.value) {
      await anioAcademicoService.update(editingAnio.value.anio_id, formData.value as UpdateAnioAcademicoDTO);
    } else {
      const data: CreateAnioAcademicoDTO = {
        ...formData.value,
        colegio_id: authStore.user?.colegio_id!
      };
      await anioAcademicoService.create(data);
    }
    await loadAnios();
    closeModal();
  } catch (error: any) {
    alert(`Error: ${error.response?.data?.message || 'Error al guardar año académico'}`);
  }
};

onMounted(() => {
  loadAnios();
});
</script>
