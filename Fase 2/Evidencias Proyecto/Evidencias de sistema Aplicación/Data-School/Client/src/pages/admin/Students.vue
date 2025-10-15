<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
          <p class="text-gray-600 mt-1">Administra los estudiantes del colegio</p>
        </div>
        <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Estudiante
        </button>
      </div>
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Lista de Estudiantes</h2>
        <p class="text-gray-600 mb-6">Aquí puedes ver y gestionar todos los estudiantes registrados en el sistema.</p>
        <div v-if="studentStore.loading" class="text-gray-600">Cargando estudiantes...</div>
        <div v-else-if="studentStore.error" class="text-red-600">Error: {{ studentStore.error }}</div>

        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Estudiante</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in studentStore.estudiantes" :key="student.user_id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.user_id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.nombre_completo }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.created_at }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.estado_activo }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                <button class="text-red-600 hover:text-red-900">Eliminar</button>
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
import { useStudentStore } from '@/store/student.store';
import { on } from 'events';
import { onMounted } from 'vue';

const studentStore = useStudentStore();

onMounted(async () => {
  try {
    await studentStore.fetchEstudiantes();
  } catch (error) {
    console.error('Error fetching students:', error);
  }
});


</script>
