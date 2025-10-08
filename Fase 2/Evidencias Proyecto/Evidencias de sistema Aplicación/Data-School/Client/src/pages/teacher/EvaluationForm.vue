<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        {{ isEdit ? 'Editar Evaluación' : 'Nueva Evaluación' }}
      </h1>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura *</label>
            <select class="w-full px-4 py-2 border rounded-lg">
              <option value="">Seleccionar asignatura</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="Ej: Prueba Unidad 2" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea class="w-full px-4 py-2 border rounded-lg" rows="3"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
            <select class="w-full px-4 py-2 border rounded-lg">
              <option>PRUEBA</option>
              <option>TRABAJO</option>
              <option>TAREA</option>
              <option>PROYECTO</option>
              <option>PRESENTACION</option>
              <option>OTROS</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
            <input type="date" class="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Puntaje Máximo *</label>
            <input type="number" class="w-full px-4 py-2 border rounded-lg" placeholder="60" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Porcentaje (%)</label>
            <input type="number" class="w-full px-4 py-2 border rounded-lg" value="100" />
          </div>
          <div class="md:col-span-2">
            <label class="flex items-center">
              <input type="checkbox" class="w-4 h-4 text-primary-600 rounded" />
              <span class="ml-2 text-sm text-gray-700">¿Es recuperativa?</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <router-link to="/teacher/evaluations" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </router-link>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isEdit = computed(() => !!route.params.id);
</script>
