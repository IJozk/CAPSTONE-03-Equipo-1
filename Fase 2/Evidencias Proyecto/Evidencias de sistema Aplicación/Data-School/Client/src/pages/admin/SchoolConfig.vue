<template>
  <AdminSidebar />
   <div class="min-h-screen bg-gray-50 p-6 md:ml-64">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Configuración del Colegio</h1>
        <p class="text-gray-600 mt-1">Gestiona la información, infraestructura y año académico del colegio</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex overflow-x-auto" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2'
              ]"
            >
              <component :is="tab.icon" class="w-5 h-5" />
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Tab: Información General -->
          <div v-if="activeTab === 'info'">
            <InfoGeneralTab />
          </div>

          <!-- Tab: Año Académico -->
          <div v-else-if="activeTab === 'anio'">
            <AnioAcademicoTab />
          </div>

          <!-- Tab: Zonas -->
          <div v-else-if="activeTab === 'zonas'">
            <ZonasTab />
          </div>

          <!-- Tab: Salas -->
          <div v-else-if="activeTab === 'salas'">
            <SalasTab />
          </div>

          <!-- Tab: Áreas -->
          <div v-else-if="activeTab === 'areas'">
            <AreasTab />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import InfoGeneralTab from '../../components/admin/config/InfoGeneralTab.vue';
import AnioAcademicoTab from '../../components/admin/config/AnioAcademicoTab.vue';
import ZonasTab from '../../components/admin/config/ZonasTab.vue';
import SalasTab from '../../components/admin/config/SalasTab.vue';
import AreasTab from '../../components/admin/config/AreasTab.vue';
import AdminSidebar from '../../components/layout/admin/AdminSidebar.vue';
import { useAuthStore } from '@/store/auth.store';

const authStore = useAuthStore()

// Icons as components
const InfoIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
};

const CalendarIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
  ])
};

const LocationIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z' })
  ])
};

const HomeIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
  ])
};

const FolderIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' })
  ])
};

const activeTab = ref<string>('info');

const tabs = [
  { id: 'info', name: 'Información General', icon: InfoIcon },
  { id: 'anio', name: 'Año Académico', icon: CalendarIcon },
  { id: 'zonas', name: 'Zonas Físicas', icon: LocationIcon },
  { id: 'salas', name: 'Salas', icon: HomeIcon },
  { id: 'areas', name: 'Áreas Administrativas', icon: FolderIcon }
];

</script>
