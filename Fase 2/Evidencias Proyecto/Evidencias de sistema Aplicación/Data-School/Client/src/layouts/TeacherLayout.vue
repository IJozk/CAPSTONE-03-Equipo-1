<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <TeacherSidebar
      :isSidebarOpen="isSidebarOpen"
      @closeSidebar="closeSidebar"
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden lg:ml-72">
      <!-- Header -->
      <TeacherHeader @toggleSidebar="toggleSidebar" />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import TeacherSidebar from '@/components/layout/teacher/TeacherSidebar.vue';
import TeacherHeader from '@/components/layout/teacher/TeacherHeader.vue';

// Estado del sidebar (responsive)
const isSidebarOpen = ref(false);

// Toggle sidebar (para mobile)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Cerrar sidebar
const closeSidebar = () => {
  isSidebarOpen.value = false;
};

// Detectar tamaño de pantalla y abrir sidebar en desktop
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isSidebarOpen.value = true;
  } else {
    isSidebarOpen.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
