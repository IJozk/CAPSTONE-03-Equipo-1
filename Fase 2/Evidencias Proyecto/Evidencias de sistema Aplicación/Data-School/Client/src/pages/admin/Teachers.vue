<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Profesores</h1>
          <p class="text-gray-600 mt-1">Administra el personal docente</p>
        </div>
        <router-link
          to="/register"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Profesor
        </router-link>
      </div>
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Lista de Profesores</h2>
        <p class="text-gray-600 mb-6">Aquí puedes ver y gestionar todos los profesores registrados en el sistema.</p>
        <div v-if="teacherStore.loading" class="text-gray-600">Cargando profesores...</div>
        <div v-else-if="teacherStore.error" class="text-red-600">Error: {{ teacherStore.error }}</div>

        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rut</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado profesor</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titulo Profesional</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="teacher in teacherStore.profesores" :key="teacher.user_id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ teacher.rut }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ teacher.nombre_completo }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ teacher.estado_activo }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ teacher.created_at }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ teacher.titulo_profesional }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ teacher.especialidad }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                <button v-if="teacher.estado_activo" @click="teacherStore.disableProfesor(teacher.profesor_id)" class="text-red-600 hover:text-red-900">Desactivar</button>
                <button v-if="!teacher.estado_activo" @click="teacherStore.enableProfesor(teacher.profesor_id)" class="text-red-600 hover:text-red-900">Reactivar</button>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue';

import { computed, onMounted, ref } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';

const teacherStore = useTeacherStore();

onMounted(async () => {
  try {
    await teacherStore.fetchProfesores();
  } catch (error) {
    console.error('Error loading teachers:', error);
  }
});
</script>

<style scoped>
/* Agrega estilos personalizados aquí si es necesario */
</style>
