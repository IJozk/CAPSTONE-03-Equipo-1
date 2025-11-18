<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Encuestas</h1>
          <p class="text-gray-600 mt-1">Administra las encuestas del sistema</p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Encuesta
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="filtroEstado"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todas">Todas</option>
              <option value="activas">Activas</option>
              <option value="vigentes">Vigentes</option>
              <option value="proximas">Próximas</option>
              <option value="finalizadas">Finalizadas</option>
            </select>
          </div>

          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirigida a</label>
            <select
              v-model="filtroDirigidaA"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="ESTUDIANTES">Estudiantes</option>
              <option value="APODERADOS">Apoderados</option>
              <option value="PROFESORES">Profesores</option>
              <option value="ADMINISTRATIVOS">Administrativos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-20 bg-gray-200 rounded"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
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

      <!-- Lista de Encuestas -->
      <div v-else-if="encuestasFiltradas.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="encuesta in encuestasFiltradas"
          :key="encuesta.encuesta_id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          <!-- Header de la card -->
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ encuesta.titulo }}
                </h3>
                <p v-if="encuesta.descripcion" class="text-sm text-gray-600 mb-2">
                  {{ encuesta.descripcion }}
                </p>
                <div class="flex flex-wrap gap-2 mt-2">
                  <!-- Badge de estado -->
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getEstadoBadgeClass(encuesta)"
                  >
                    {{ getEstadoTexto(encuesta) }}
                  </span>

                  <!-- Badge de dirigida_a -->
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ getDirigidaATexto(encuesta.dirigida_a) }}
                  </span>

                  <!-- Badge de tipo -->
                  <span
                    v-if="encuesta.TipoEncuesta"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {{ encuesta.TipoEncuesta.nombre_tipo }}
                  </span>
                </div>
              </div>

              <!-- Toggle estado activo -->
              <button
                @click="toggleEstado(encuesta)"
                class="ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="encuesta.estado_activo ? 'bg-primary-600' : 'bg-gray-200'"
                role="switch"
                :aria-checked="encuesta.estado_activo"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="encuesta.estado_activo ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>

          <!-- Body de la card -->
          <div class="p-6 bg-gray-50">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Fecha inicio</p>
                <p class="font-medium text-gray-900">{{ formatDate(encuesta.fecha_inicio) }}</p>
              </div>
              <div>
                <p class="text-gray-500">Fecha fin</p>
                <p class="font-medium text-gray-900">{{ formatDate(encuesta.fecha_fin) }}</p>
              </div>
            </div>
          </div>

          <!-- Footer con acciones -->
          <div class="px-6 py-4 bg-white border-t border-gray-100 flex justify-end space-x-2">
            <button
              @click="viewStatistics(encuesta)"
              class="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver estadísticas"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              @click="editEncuesta(encuesta)"
              class="px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Editar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="confirmDelete(encuesta)"
              class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay encuestas</h3>
        <p class="text-gray-600 mb-4">Comienza creando la primera encuesta.</p>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Encuesta
        </button>
      </div>

      <!-- Modal de crear/editar -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header del modal -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">
              {{ editingEncuesta ? 'Editar Encuesta' : 'Nueva Encuesta' }}
            </h2>

            <!-- Navegación de pasos -->
            <div class="flex items-center mt-4 space-x-4">
              <button
                @click="currentStep = 1"
                :class="[
                  'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                  currentStep === 1 ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                <span class="font-medium">1</span>
                <span>Información</span>
              </button>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <button
                @click="currentStep = 2"
                :class="[
                  'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                  currentStep === 2 ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                <span class="font-medium">2</span>
                <span>Preguntas</span>
              </button>
            </div>
          </div>

          <!-- Contenido del modal -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Paso 1: Información básica -->
            <div v-show="currentStep === 1" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  v-model="formData.titulo"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Título de la encuesta"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  v-model="formData.descripcion"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descripción de la encuesta"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dirigida a *</label>
                <select
                  v-model="formData.dirigida_a"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="ESTUDIANTES">Estudiantes</option>
                  <option value="APODERADOS">Apoderados</option>
                  <option value="PROFESORES">Profesores</option>
                  <option value="ADMINISTRATIVOS">Administrativos</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <input
                    v-model="formData.fecha_inicio"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
                  <input
                    v-model="formData.fecha_fin"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de encuesta *</label>
                <select
                  v-model="formData.tipo_encuesta_id"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar tipo...</option>
                  <option
                    v-for="tipo in tiposEncuesta"
                    :key="tipo.tipo_encuesta_id"
                    :value="tipo.tipo_encuesta_id"
                  >
                    {{ tipo.nombre_tipo }}
                  </option>
                </select>
              </div>

              <div class="flex items-center">
                <input
                  v-model="formData.estado_activo"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-700">
                  Encuesta activa
                </label>
              </div>
            </div>

            <!-- Paso 2: Template de preguntas -->
            <div v-show="currentStep === 2">
              <SurveyTemplateBuilder
                ref="templateBuilderRef"
                v-model="templateData"
              />
            </div>
          </div>

          <!-- Footer del modal -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              v-if="currentStep === 2"
              type="button"
              @click="currentStep = 1"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <div v-else></div>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                v-if="currentStep === 1"
                @click="currentStep = 2"
                type="button"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Siguiente
              </button>
              <button
                v-else
                @click="submitForm"
                :disabled="submitting"
                type="button"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ submitting ? 'Guardando...' : (editingEncuesta ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useEncuestaStore } from '@/store/encuesta.store';
import type { Encuesta } from '@/services/encuesta.service';
import SurveyTemplateBuilder from '@/components/surveys/SurveyTemplateBuilder.vue';
import type { SurveyTemplate } from '@/types/survey-template.types';
import apiClient from '@/services/api.config';

// Store
const encuestaStore = useEncuestaStore();

// Estado local
const filtroEstado = ref('todas');
const filtroDirigidaA = ref('');
const showModal = ref(false);
const editingEncuesta = ref<Encuesta | null>(null);
const submitting = ref(false);
const currentStep = ref(1);
const templateBuilderRef = ref<InstanceType<typeof SurveyTemplateBuilder> | null>(null);
const tiposEncuesta = ref<Array<{ tipo_encuesta_id: number; nombre_tipo: string }>>([]);

const formData = ref({
  titulo: '',
  descripcion: '',
  dirigida_a: '',
  fecha_inicio: '',
  fecha_fin: '',
  estado_activo: true,
  tipo_encuesta_id: ''
});

const templateData = ref<SurveyTemplate | null>(null);

// Computed
const loading = computed(() => encuestaStore.loading);
const error = computed(() => encuestaStore.error);

const encuestasFiltradas = computed(() => {
  let encuestas = encuestaStore.todasLasEncuestas;

  // Filtrar por estado
  if (filtroEstado.value === 'activas') {
    encuestas = encuestaStore.encuestasActivas;
  } else if (filtroEstado.value === 'vigentes') {
    encuestas = encuestaStore.encuestasVigentes;
  } else if (filtroEstado.value === 'proximas') {
    encuestas = encuestaStore.encuestasProximas;
  } else if (filtroEstado.value === 'finalizadas') {
    encuestas = encuestaStore.encuestasFinalizadas;
  }

  // Filtrar por dirigida_a
  if (filtroDirigidaA.value) {
    encuestas = encuestas.filter(e => e.dirigida_a === filtroDirigidaA.value);
  }

  return encuestas;
});

// Métodos
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getEstadoTexto = (encuesta: Encuesta): string => {
  const hoy = new Date();
  const inicio = new Date(encuesta.fecha_inicio);
  const fin = new Date(encuesta.fecha_fin);

  if (!encuesta.estado_activo) return 'Inactiva';
  if (hoy < inicio) return 'Próxima';
  if (hoy > fin) return 'Finalizada';
  return 'Vigente';
};

const getEstadoBadgeClass = (encuesta: Encuesta): string => {
  const estado = getEstadoTexto(encuesta);
  const classes: Record<string, string> = {
    'Vigente': 'bg-green-100 text-green-800',
    'Próxima': 'bg-blue-100 text-blue-800',
    'Finalizada': 'bg-gray-100 text-gray-800',
    'Inactiva': 'bg-red-100 text-red-800'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
};

const getDirigidaATexto = (dirigidaA: string): string => {
  const textos: Record<string, string> = {
    'ESTUDIANTES': 'Estudiantes',
    'APODERADOS': 'Apoderados',
    'PROFESORES': 'Profesores',
    'ADMINISTRATIVOS': 'Administrativos'
  };
  return textos[dirigidaA] || dirigidaA;
};

const toggleEstado = async (encuesta: Encuesta) => {
  try {
    await encuestaStore.toggleEstado(encuesta.encuesta_id, !encuesta.estado_activo);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
  }
};

const openCreateModal = () => {
  editingEncuesta.value = null;
  currentStep.value = 1;
  formData.value = {
    titulo: '',
    descripcion: '',
    dirigida_a: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado_activo: true,
    tipo_encuesta_id: ''
  };
  templateData.value = null;
  showModal.value = true;
};

const editEncuesta = (encuesta: Encuesta) => {
  editingEncuesta.value = encuesta;
  currentStep.value = 1;
  formData.value = {
    titulo: encuesta.titulo,
    descripcion: encuesta.descripcion || '',
    dirigida_a: encuesta.dirigida_a,
    fecha_inicio: encuesta.fecha_inicio.split('T')[0],
    fecha_fin: encuesta.fecha_fin.split('T')[0],
    estado_activo: encuesta.estado_activo,
    tipo_encuesta_id: encuesta.tipo_encuesta_id.toString()
  };
  // Cargar template existente si existe
  templateData.value = encuesta.template_encuesta || null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingEncuesta.value = null;
  currentStep.value = 1;
  templateData.value = null;
};

const submitForm = async () => {
  submitting.value = true;
  try {
    // Obtener el template del builder
    const template = templateBuilderRef.value?.getTemplate();

    const data = {
      ...formData.value,
      tipo_encuesta_id: parseInt(formData.value.tipo_encuesta_id),
      template_encuesta: template
    };

    if (editingEncuesta.value) {
      await encuestaStore.updateEncuesta(editingEncuesta.value.encuesta_id, data);
    } else {
      await encuestaStore.createEncuesta(data);
    }
    closeModal();
  } catch (error) {
    console.error('Error al guardar encuesta:', error);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (encuesta: Encuesta) => {
  if (confirm(`¿Estás seguro de eliminar la encuesta "${encuesta.titulo}"?`)) {
    try {
      await encuestaStore.deleteEncuesta(encuesta.encuesta_id);
    } catch (error) {
      console.error('Error al eliminar encuesta:', error);
    }
  }
};

const viewStatistics = (encuesta: Encuesta) => {
  // TODO: Implementar vista de estadísticas
  alert(`Ver estadísticas de: ${encuesta.titulo}`);
};

// Lifecycle
// Cargar tipos de encuesta desde la API
const loadTiposEncuesta = async () => {
  try {
    const response = await apiClient.get('/tipos-encuesta/activos');
    tiposEncuesta.value = response.data;
    console.log('📋 Tipos de encuesta cargados:', tiposEncuesta.value);
  } catch (error) {
    console.error('Error cargando tipos de encuesta:', error);
    // Si falla, intentar con el endpoint sin filtro
    try {
      const response = await apiClient.get('/tipos-encuesta');
      tiposEncuesta.value = response.data.filter((t: any) => t.estado_activo);
    } catch (err) {
      console.error('Error cargando tipos de encuesta (fallback):', err);
    }
  }
};

onMounted(async () => {
  await Promise.all([
    encuestaStore.fetchEncuestas(),
    loadTiposEncuesta()
  ]);
});
</script>
