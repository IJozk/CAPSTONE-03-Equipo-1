<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Salas del Colegio</h3>
        <p class="text-sm text-gray-600 mt-1">Total: {{ salas.length }} salas</p>
      </div>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Sala
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Cargando salas...</p>
    </div>

    <div v-else-if="salas.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-gray-600">No hay salas registradas</p>
      <button @click="showCreateModal = true" class="mt-4 text-primary-600 hover:text-primary-800 font-medium">
        Crear primera sala
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="sala in salas" :key="sala.sala_id" class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-3">
          <h4 class="font-bold text-gray-900 text-lg">{{ sala.nombre }}</h4>
          <span class="px-2 py-1 rounded text-xs font-semibold" :class="{
            'bg-green-100 text-green-800': sala.estado === 'DISPONIBLE',
            'bg-orange-100 text-orange-800': sala.estado === 'MANTENIMIENTO',
            'bg-red-100 text-red-800': sala.estado === 'FUERA_DE_SERVICIO'
          }">
            {{ sala.estado }}
          </span>
        </div>
        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ sala.Zona?.nombre_zona || 'Sin zona asignada' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span><strong>Capacidad:</strong> {{ sala.capacidad || 'Sin definir' }} estudiantes</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="text-xs text-gray-500">ID: {{ sala.sala_id }}</span>
          </div>
        </div>
        <div class="flex gap-2 pt-3 border-t border-gray-200">
          <button @click="editSala(sala)" class="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium">
            Editar
          </button>
          <button @click="deleteSala(sala.sala_id)" class="flex-1 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal mejorado -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">{{ editingSala ? 'Editar Sala' : 'Nueva Sala' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ID de Sala <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.sala_id"
              required
              :disabled="!!editingSala"
              placeholder="Ej: SALA-01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-gray-500 mt-1">Identificador único de la sala</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Sala <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.nombre"
              required
              placeholder="Ej: Sala de Matemáticas"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Zona <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.zona_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar zona...</option>
              <option v-for="zona in zonas" :key="zona.zona_id" :value="zona.zona_id">{{ zona.nombre_zona }}</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Ubicación física de la sala</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Capacidad de Estudiantes <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formData.capacidad"
              type="number"
              min="1"
              max="100"
              required
              placeholder="Ej: 30"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">Número máximo de estudiantes que puede contener (usada para validar asignaciones)</p>
          </div>

          <!-- Configuración de distribución de asientos -->
          <div class="border-t border-gray-200 pt-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">Distribución de Asientos (Plantilla)</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Filas <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.template_rows"
                  type="number"
                  min="1"
                  max="10"
                  required
                  placeholder="Ej: 5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Columnas <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.template_columns"
                  type="number"
                  min="1"
                  max="10"
                  required
                  placeholder="Ej: 6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Posición del profesor -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Posición del Profesor
              </label>
              <select
                v-model="formData.teacher_position"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="front">Frente (bajo la pizarra)</option>
                <option value="back">Atrás</option>
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
              </select>
            </div>

            <p class="text-xs text-gray-500 mt-2">
              Total de asientos disponibles: <strong>{{ (formData.template_rows || 0) * (formData.template_columns || 0) }}</strong>
              ({{ formData.template_rows || 0 }} filas × {{ formData.template_columns || 0 }} columnas)
            </p>
            <p class="text-xs text-blue-600 mt-1">
              💡 Después de crear la sala, podrás personalizar la distribución bloqueando asientos específicos (ej: pasillos, espacios vacíos)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="formData.estado"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="MANTENIMIENTO">En Mantenimiento</option>
              <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              {{ submitting ? 'Guardando...' : (editingSala ? 'Actualizar' : 'Crear Sala') }}
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
const submitting = ref(false);
const salas = ref<Sala[]>([]);
const zonas = ref<Zona[]>([]);
const showCreateModal = ref(false);
const editingSala = ref<Sala | null>(null);
const formData = ref<any>({
  sala_id: '',
  nombre: '',
  zona_id: '',
  capacidad: null,
  estado: 'DISPONIBLE',
  template_rows: 5,
  template_columns: 6,
  teacher_position: 'front'
});

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
    console.error('Error cargando datos:', error);
    alert('Error al cargar las salas');
  } finally {
    loading.value = false;
  }
};

const editSala = (sala: Sala) => {
  editingSala.value = sala;

  // Extraer configuración de plantilla si existe
  const template = sala.distribucion_asientos_template as any;
  const rows = template?.rows || 5;
  const columns = template?.columns || 6;
  const teacherPosition = template?.teacher_position || 'front';

  formData.value = {
    sala_id: sala.sala_id,
    nombre: sala.nombre,
    zona_id: sala.zona_id,
    capacidad: sala.capacidad,
    estado: sala.estado || 'DISPONIBLE',
    template_rows: rows,
    template_columns: columns,
    teacher_position: teacherPosition
  };
  showCreateModal.value = true;
};

const deleteSala = async (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta sala?\n\nAdvertencia: Si la sala está asignada a alguna asignatura, no podrá ser eliminada.')) {
    try {
      await salaService.delete(id);
      await loadData();
      alert('Sala eliminada exitosamente');
    } catch (error: any) {
      alert(`Error al eliminar sala: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingSala.value = null;
  formData.value = {
    sala_id: '',
    nombre: '',
    zona_id: '',
    capacidad: null,
    estado: 'DISPONIBLE',
    template_rows: 5,
    template_columns: 6,
    teacher_position: 'front'
  };
};

const handleSubmit = async () => {
  try {
    submitting.value = true;

    // Validaciones
    if (!formData.value.capacidad || formData.value.capacidad < 1) {
      alert('La capacidad debe ser al menos 1 estudiante');
      return;
    }

    if (!formData.value.template_rows || formData.value.template_rows < 1) {
      alert('El número de filas debe ser al menos 1');
      return;
    }

    if (!formData.value.template_columns || formData.value.template_columns < 1) {
      alert('El número de columnas debe ser al menos 1');
      return;
    }

    const totalAsientos = formData.value.template_rows * formData.value.template_columns;
    if (totalAsientos > formData.value.capacidad) {
      alert(`El total de asientos (${totalAsientos}) no puede superar la capacidad de la sala (${formData.value.capacidad})`);
      return;
    }

    // Preparar datos con la plantilla de distribución
    const dataToSave = {
      sala_id: formData.value.sala_id,
      nombre: formData.value.nombre,
      zona_id: formData.value.zona_id,
      capacidad: formData.value.capacidad,
      estado: formData.value.estado,
      distribucion_asientos_template: {
        rows: formData.value.template_rows,
        columns: formData.value.template_columns,
        teacher_position: formData.value.teacher_position,
        blocked_seats: [] // Inicialmente sin asientos bloqueados
      }
    };

    if (editingSala.value) {
      await salaService.update(editingSala.value.sala_id, dataToSave);
      alert('Sala actualizada exitosamente');
    } else {
      await salaService.create(dataToSave as CreateSalaDTO);
      alert('Sala creada exitosamente');
    }

    await loadData();
    closeModal();
  } catch (error: any) {
    alert(`Error al guardar sala: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
