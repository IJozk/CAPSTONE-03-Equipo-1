<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <h3 class="font-semibold text-foreground mb-4">Resumen de Mis Hijos</h3>
    <div class="space-y-4">
      <div
        v-for="child in children"
        :key="child.id"
        class="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span class="text-primary-foreground font-medium">
              {{ child.name.charAt(0) }}
            </span>
          </div>
          <div>
            <h4 class="font-medium text-foreground">{{ child.name }}</h4>
            <p class="text-sm text-muted-foreground">{{ child.course }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-muted-foreground">Promedio:</span>
            <span 
              class="ml-2 font-medium"
              :class="getGradeColor(child.average)"
            >
              {{ child.average }}
            </span>
          </div>
          <div>
            <span class="text-muted-foreground">Asistencia:</span>
            <span 
              class="ml-2 font-medium"
              :class="getAttendanceColor(child.attendanceRate)"
            >
              {{ child.attendanceRate }}%
            </span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-border">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Última evaluación:</span>
            <span class="text-sm font-medium text-foreground">{{ child.lastGrade }} ({{ child.lastSubject }})</span>
          </div>
        </div>
      </div>
    </div>

    <button class="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-muted transition-colors">
      Ver detalles completos
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const children = ref([
  {
    id: '1',
    name: 'Sofía Martínez',
    course: '7° Básico A',
    average: 6.8,
    attendanceRate: 95,
    lastGrade: 6.5,
    lastSubject: 'Matemáticas'
  },
  {
    id: '2',
    name: 'Diego Rodríguez',
    course: '8° Básico B',
    average: 7.1,
    attendanceRate: 98,
    lastGrade: 7.2,
    lastSubject: 'Historia'
  }
])

const getGradeColor = (grade) => {
  if (grade >= 7.0) return 'text-green-600'
  if (grade >= 6.0) return 'text-yellow-600'
  if (grade >= 5.0) return 'text-orange-600'
  return 'text-red-600'
}

const getAttendanceColor = (rate) => {
  if (rate >= 95) return 'text-green-600'
  if (rate >= 85) return 'text-yellow-600'
  if (rate >= 75) return 'text-orange-600'
  return 'text-red-600'
}
</script>