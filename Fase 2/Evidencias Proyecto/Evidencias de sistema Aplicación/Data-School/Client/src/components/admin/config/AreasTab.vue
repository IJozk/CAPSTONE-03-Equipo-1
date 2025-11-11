<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Áreas Administrativas</h3>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Nueva Área
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else>
      <div v-if="areas.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">No hay áreas administrativas registradas</p>
        <button @click="showCreateModal = true" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Crear Primera Área
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="area in areas" :key="area.area_id" class="border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-2">{{ area.nombre_area }}</h4>
          <p v-if="area.descripcion" class="text-sm text-gray-600 mb-2">{{ area.descripcion }}</p>
          <div class="text-sm">
            <span class="text-gray-600">Jefe de Área:</span>
            <span class="ml-2 font-medium">{{ area.Profesor?.nombre_completo || 'Sin asignar' }}</span>
          </div>
          <div class="mt-4 flex gap-2">
            <button @click="editArea(area)" class="text-sm text-blue-600 hover:text-blue-800">Editar</button>
            <button @click="deleteArea(area.area_id)" class="text-sm text-red-600 hover:text-red-800">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">{{ editingArea ? 'Editar' : 'Nueva' }} Área</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nombre del Área</label>
            <input v-model="formData.nombre_area" required class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Descripción</label>
            <textarea v-model="formData.descripcion" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Jefe de Área (Opcional)</label>
            <select v-model="formData.jefe_area_id" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Sin asignar</option>
              <option v-for="profesor in profesores" :key="profesor.profesor_id" :value="profesor.profesor_id">
                {{ profesor.nombre_completo }}
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg">
              {{ editingArea ? 'Actualizar' : 'Crear' }}
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
import { useTeacherStore } from '@/store/teacher.store';
import areaService, { type Area, type CreateAreaDTO } from '@/services/area.service';

const authStore = useAuthStore();
const teacherStore = useTeacherStore();
const loading = ref(true);
const areas = ref<Area[]>([]);
const showCreateModal = ref(false);
const editingArea = ref<Area | null>(null);
const formData = ref<any>({ nombre_area: '', descripcion: '', jefe_area_id: '' });

const profesores = teacherStore.profesores;

const loadData = async () => {
  try {
    loading.value = true;
    console.log('[AreasTab] Iniciando carga de datos...');
    console.log('[AreasTab] Usuario:', authStore.user);

    // Obtener colegio_id del usuario o del admin_profile
    const colegioId = authStore.user?.colegio_id;
    console.log('🔍 [AreasTab] Colegio ID:', colegioId);

    if (colegioId) {
      console.log('[AreasTab] Llamando a areaService.getAll...');
      areas.value = await areaService.getAll(colegioId);
      console.log('[AreasTab] Áreas cargadas:', areas.value);

      if (teacherStore.profesores.length === 0) {
        console.log('[AreasTab] Cargando profesores...');
        await teacherStore.fetchProfesores();
        console.log('[AreasTab] Profesores cargados:', teacherStore.profesores.length);
      }
    } else {
      console.warn('[AreasTab] No hay colegio_id disponible');
    }
  } catch (error) {
    console.error('[AreasTab] Error:', error);
  } finally {
    loading.value = false;
    console.log('[AreasTab] Carga finalizada');
  }
};

const editArea = (area: Area) => {
  editingArea.value = area;
  formData.value = {
    nombre_area: area.nombre_area,
    descripcion: area.descripcion || '',
    jefe_area_id: area.jefe_area_id || ''
  };
  showCreateModal.value = true;
};

const deleteArea = async (id: number) => {
  if (confirm('¿Eliminar esta área?')) {
    try {
      await areaService.delete(id);
      await loadData();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Error al eliminar'}`);
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingArea.value = null;
  formData.value = { nombre_area: '', descripcion: '', jefe_area_id: '' };
};

const handleSubmit = async () => {
  try {
    if (editingArea.value) {
      await areaService.update(editingArea.value.area_id, formData.value);
    } else {
      // Obtener colegio_id del usuario o del admin_profile
      const colegioId = authStore.user?.colegio_id || authStore.user?.admin_profile?.colegio_id;
      const data: CreateAreaDTO = {
        ...formData.value,
        jefe_area_id: formData.value.jefe_area_id || undefined,
        colegio_id: colegioId!
      };
      await areaService.create(data);
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
