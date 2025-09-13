<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <h3 class="font-semibold text-foreground mb-4">Acciones Rápidas</h3>
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="action in quickActions"
        :key="action.id"
        @click="handleAction(action.id)"
        class="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors group"
      >
        <div 
          class="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
          :class="action.iconClasses"
        >
          <component :is="action.icon" class="h-6 w-6" />
        </div>
        <span class="text-sm font-medium text-foreground text-center">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()

// Icons
const PlusIcon = {
  template: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
  </svg>`
}

const ClipboardIcon = {
  template: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>`
}

const BookOpenIcon = {
  template: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>`
}

const BarChartIcon = {
  template: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>`
}

const quickActions = ref([
  {
    id: 'add-grade',
    label: 'Agregar Nota',
    icon: PlusIcon,
    iconClasses: 'bg-green-100 text-green-600'
  },
  {
    id: 'take-attendance',
    label: 'Tomar Asistencia',
    icon: ClipboardIcon,
    iconClasses: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'view-courses',
    label: 'Ver Cursos',
    icon: BookOpenIcon,
    iconClasses: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'generate-report',
    label: 'Generar Reporte',
    icon: BarChartIcon,
    iconClasses: 'bg-orange-100 text-orange-600'
  }
])

const handleAction = (actionId) => {
  const actionMessages = {
    'add-grade': 'Abriendo formulario para agregar nueva calificación...',
    'take-attendance': 'Iniciando registro de asistencia...',
    'view-courses': 'Navegando a la vista de cursos...',
    'generate-report': 'Generando reporte académico...'
  }
  
  showToast(actionMessages[actionId] || 'Acción ejecutada', 'info')
}
</script>