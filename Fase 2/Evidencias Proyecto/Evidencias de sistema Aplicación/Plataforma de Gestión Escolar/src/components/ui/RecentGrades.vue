<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <h3 class="font-semibold text-foreground mb-4">Calificaciones Recientes</h3>
    <div class="space-y-3">
      <div
        v-for="grade in recentGrades"
        :key="`${grade.student}-${grade.subject}-${grade.date}`"
        class="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors"
      >
        <div class="flex-1">
          <p class="font-medium text-foreground">{{ grade.student }}</p>
          <p class="text-sm text-muted-foreground">{{ grade.subject }} • {{ formatDate(grade.date) }}</p>
        </div>
        <div class="text-right">
          <span 
            class="text-lg font-bold"
            :class="getGradeColor(grade.grade)"
          >
            {{ grade.grade }}
          </span>
          <div class="text-xs text-muted-foreground">{{ grade.type }}</div>
        </div>
      </div>
    </div>
    
    <button class="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-muted transition-colors">
      Ver todas las calificaciones
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const recentGrades = ref([
  {
    student: 'Sofía Martínez',
    subject: 'Matemáticas',
    grade: 6.8,
    type: 'Prueba',
    date: '2024-03-18'
  },
  {
    student: 'Diego Rodríguez',
    subject: 'Lenguaje',
    grade: 7.2,
    type: 'Ensayo',
    date: '2024-03-17'
  },
  {
    student: 'María González',
    subject: 'Ciencias',
    grade: 6.5,
    type: 'Laboratorio',
    date: '2024-03-17'
  },
  {
    student: 'Carlos López',
    subject: 'Historia',
    grade: 7.0,
    type: 'Presentación',
    date: '2024-03-16'
  }
])

const getGradeColor = (grade) => {
  if (grade >= 7.0) return 'text-green-600'
  if (grade >= 6.0) return 'text-yellow-600'
  if (grade >= 5.0) return 'text-orange-600'
  return 'text-red-600'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit'
  })
}
</script>