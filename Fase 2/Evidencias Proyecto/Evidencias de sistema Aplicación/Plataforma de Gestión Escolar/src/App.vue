<template>
  <div class="min-h-screen bg-background">
    <!-- Loading state -->
    <div v-if="authStore.isLoading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Login form when not authenticated -->
    <LoginForm v-else-if="!authStore.user" />

    <!-- Main application when authenticated -->
    <div v-else class="flex h-screen">
      <SidebarLayout 
        :active-view="activeView"
        @view-change="setActiveView"
        :notification-count="unreadNotifications"
      />
      
      <main class="flex-1 overflow-auto">
        <component :is="currentComponent" />
      </main>
    </div>

    <!-- Socioeconomic survey modal -->
    <SurveyModal
      v-if="showSurvey"
      :survey="socioeconomicSurvey"
      :is-open="showSurvey"
      @close="closeSurvey"
      @complete="completeSurvey"
    />

    <!-- Toast notifications -->
    <div 
      v-if="toast.show"
      class="fixed bottom-4 right-4 z-50 p-4 bg-card border rounded-lg shadow-lg max-w-sm transition-all duration-300"
      :class="{
        'bg-green-50 border-green-200 text-green-800': toast.type === 'success',
        'bg-red-50 border-red-200 text-red-800': toast.type === 'error',
        'bg-blue-50 border-blue-200 text-blue-800': toast.type === 'info'
      }"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useNotificationStore } from './stores/notificationStore'
import { useToast } from './composables/useToast'
import LoginForm from './components/LoginForm.vue'
import SidebarLayout from './components/SidebarLayout.vue'
import Dashboard from './components/Dashboard.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import StudentView from './components/StudentView.vue'
import SurveyModal from './components/SurveyModal.vue'
import { socioeconomicSurvey, mockSurveyResponses } from './data/mockData'

// Stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { toast, showToast } = useToast()

// Reactive state
const activeView = ref('dashboard')
const showSurvey = ref(false)

// Component mapping
const components = {
  dashboard: Dashboard,
  notifications: NotificationCenter,
  students: StudentView,
  default: {
    template: `
      <div class="p-4 md:p-6 text-center">
        <h2 class="text-2xl font-semibold mb-2">Funcionalidad en desarrollo</h2>
        <p class="text-muted-foreground">
          Esta sección estará disponible próximamente.
        </p>
      </div>
    `
  }
}

// Computed properties
const currentComponent = computed(() => {
  return components[activeView.value] || components.default
})

const unreadNotifications = computed(() => {
  if (!authStore.user) return 0
  return notificationStore.getUnreadCount(authStore.user.id)
})

// Methods
const setActiveView = (view) => {
  activeView.value = view
}

const closeSurvey = () => {
  showSurvey.value = false
}

const completeSurvey = () => {
  authStore.updateUser({ firstLogin: false })
  showSurvey.value = false
  showToast('¡Encuesta completada! Gracias por proporcionar esta información.', 'success')
}

// Watchers
watch(() => authStore.user, (user) => {
  if (user?.role === 'apoderado' && user.firstLogin) {
    // Check if user has completed socioeconomic survey
    const hasCompletedSurvey = mockSurveyResponses.some(
      response => response.userId === user.id && response.surveyId === socioeconomicSurvey.id
    )
    
    if (!hasCompletedSurvey) {
      showSurvey.value = true
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  authStore.checkAuth()
  notificationStore.loadNotifications()
})
</script>

<style>
/* Global styles are handled by globals.css */
</style>