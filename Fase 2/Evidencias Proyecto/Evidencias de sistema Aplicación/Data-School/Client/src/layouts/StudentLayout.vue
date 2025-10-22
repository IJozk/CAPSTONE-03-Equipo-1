<template>
  <div class="min-h-screen bg-gray-50 flex">
    <StudentSidebar :isSidebarOpen="isSidebarOpen" @closeSidebar="isSidebarOpen = false" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <StudentNavbar @toggleSidebar="isSidebarOpen = !isSidebarOpen" />
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StudentSidebar from '@/components/layout/student/StudentSidebar.vue';
import StudentNavbar from '@/components/layout/student/StudentNavbar.vue';
import { useStudentStore } from '@/store/student.store';

const studentStore = useStudentStore();
const isSidebarOpen = ref(true);

onMounted(async () => {
  await studentStore.fetchProfile();
});
</script>
