<template>
  <div class="flex h-screen bg-background">
    <!-- Mobile overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
      :class="{
        'translate-x-0': isMobileMenuOpen,
        '-translate-x-full': !isMobileMenuOpen
      }"
    >
      <!-- Sidebar header -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <h1 class="text-lg font-semibold text-sidebar-foreground">
          Sistema Académico
        </h1>
        <button 
          @click="closeMobileMenu"
          class="lg:hidden p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- User info -->
      <div class="p-4 border-b border-sidebar-border">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <span class="text-sidebar-primary-foreground font-medium">
              {{ authStore.user?.name?.charAt(0) }}
            </span>
          </div>
          <div>
            <p class="font-medium text-sidebar-foreground">{{ authStore.user?.name }}</p>
            <p class="text-sm text-sidebar-foreground/70 capitalize">{{ authStore.user?.role }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li v-for="item in navigationItems" :key="item.id">
            <button
              @click="selectView(item.id)"
              class="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors"
              :class="{
                'bg-sidebar-accent text-sidebar-accent-foreground': activeView === item.id,
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground': activeView !== item.id
              }"
            >
              <component :is="item.icon" class="h-5 w-5" />
              <span>{{ item.label }}</span>
              <span 
                v-if="item.id === 'notifications' && notificationCount > 0"
                class="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1 min-w-[1.5rem] h-6 flex items-center justify-center"
              >
                {{ notificationCount }}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Logout button -->
      <div class="p-4 border-t border-sidebar-border">
        <button
          @click="handleLogout"
          class="w-full flex items-center space-x-3 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
        >
          <LogOutIcon class="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-60">
      <button
        @click="toggleMobileMenu"
        class="p-2 bg-sidebar text-sidebar-foreground rounded-lg shadow-lg"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Main content area -->
    <main class="flex-1 overflow-auto lg:ml-0">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore'

// Icons as simple SVG components
const DashboardIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v4" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 5v4" />
  </svg>`
}

const BellIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5h5l-5-5V17zm-5 0V3a2 2 0 00-2-2H5a2 2 0 00-2 2v14h7zm-5-3V6h2v8H5z" />
  </svg>`
}

const UsersIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-3 5.197H7v-1a6 6 0 0112 0v1z" />
  </svg>`
}

const BookOpenIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>`
}

const ClipboardIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>`
}

const BarChartIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>`
}

const LogOutIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>`
}

// Props
defineProps({
  activeView: {
    type: String,
    required: true
  },
  notificationCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['view-change'])

// Store
const authStore = useAuthStore()

// State
const isMobileMenuOpen = ref(false)

// Navigation items based on user role
const navigationItems = computed(() => {
  const role = authStore.user?.role
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'notifications', label: 'Notificaciones', icon: BellIcon }
  ]

  const roleSpecificItems = {
    coordinador: [
      { id: 'students', label: 'Estudiantes', icon: UsersIcon },
      { id: 'courses', label: 'Cursos', icon: BookOpenIcon },
      { id: 'reports', label: 'Reportes', icon: BarChartIcon },
      { id: 'surveys', label: 'Encuestas', icon: ClipboardIcon }
    ],
    docente: [
      { id: 'students', label: 'Mis Estudiantes', icon: UsersIcon },
      { id: 'courses', label: 'Mis Cursos', icon: BookOpenIcon },
      { id: 'attendance', label: 'Asistencia', icon: ClipboardIcon }
    ],
    apoderado: [
      { id: 'students', label: 'Mis Hijos', icon: UsersIcon }
    ]
  }

  return [...baseItems, ...(roleSpecificItems[role] || [])]
})

// Methods
const selectView = (view) => {
  emit('view-change', view)
  closeMobileMenu()
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  closeMobileMenu()
}

// Handle escape key
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>