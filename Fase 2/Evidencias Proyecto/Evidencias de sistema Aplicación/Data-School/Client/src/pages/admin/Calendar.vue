<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Calendario Académico</h1>
          <p class="text-gray-600 mt-1">
            Visualiza eventos y talleres en el calendario
          </p>
        </div>

        <!-- Controles -->
        <div class="flex flex-col md:flex-row md:items-center gap-3">
          <!-- Selector de vista -->
          <div class="inline-flex rounded-lg border bg-white overflow-hidden">
            <button
              type="button"
              @click="viewMode = 'month'"
              :class="[
                'px-3 py-1.5 text-sm font-medium',
                viewMode === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              Mensual
            </button>
            <button
              type="button"
              @click="viewMode = 'week'"
              :class="[
                'px-3 py-1.5 text-sm font-medium',
                viewMode === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              Semanal
            </button>
          </div>

          <!-- Navegación por fecha -->
          <div class="flex items-center gap-2">
            <button
              @click="goToToday"
              class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hoy
            </button>

            <div class="flex items-center gap-2">
              <button
                v-if="viewMode === 'month'"
                @click="prevMonth"
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Mes anterior"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                v-if="viewMode === 'week'"
                @click="prevWeek"
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Semana anterior"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div class="text-lg font-semibold text-gray-900">
                <span v-if="viewMode === 'month'">
                  {{ monthLabel }} {{ currentYear }}
                </span>
                <span v-else>
                  Semana del {{ weekRangeLabel }}
                </span>
              </div>

              <button
                v-if="viewMode === 'month'"
                @click="nextMonth"
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Mes siguiente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                v-if="viewMode === 'week'"
                @click="nextWeek"
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Semana siguiente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="bg-white rounded-lg shadow px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span class="text-gray-700">Evento</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-green-500"></span>
          <span class="text-gray-700">Taller</span>
        </div>
      </div>

      <!-- Loading / Error -->
      <div
        v-if="eventoStore.loading || tallerStore.loading"
        class="bg-white rounded-lg shadow p-8 text-center"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando calendario...</p>
      </div>

      <div
        v-else-if="eventoStore.error || tallerStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-red-800">
            {{ eventoStore.error || tallerStore.error }}
          </p>
        </div>
      </div>

      <!-- Vista Mensual -->
      <div
        v-else-if="viewMode === 'month'"
        class="bg-white rounded-lg shadow p-4 md:p-6"
      >
        <!-- Cabecera de días -->
        <div class="grid grid-cols-7 text-xs font-semibold text-gray-500 border-b pb-2 mb-2">
          <div class="text-center">Lun</div>
          <div class="text-center">Mar</div>
          <div class="text-center">Mié</div>
          <div class="text-center">Jue</div>
          <div class="text-center">Vie</div>
          <div class="text-center">Sáb</div>
          <div class="text-center">Dom</div>
        </div>

        <!-- Celdas -->
        <div class="grid grid-cols-7 gap-1 md:gap-2 text-sm">
          <div
            v-for="day in monthDays"
            :key="day.dateKey"
            class="min-h-[90px] border rounded-lg p-1.5 md:p-2 flex flex-col gap-1"
            :class="[
              !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white',
              day.isToday ? 'ring-2 ring-primary-500' : ''
            ]"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs md:text-sm font-medium">
                {{ day.date.getDate() }}
              </span>
            </div>

            <div class="space-y-0.5">
              <!-- Eventos -->
              <div
                v-for="evento in day.eventos"
                :key="evento.evento_id"
                class="px-1.5 py-0.5 rounded text-[10px] md:text-xs bg-blue-100 text-blue-800 truncate"
                :title="evento.nombre"
              >
                • {{ evento.nombre }}
              </div>

              <!-- Talleres -->
              <div
                v-for="taller in day.talleres"
                :key="taller.taller_id"
                class="px-1.5 py-0.5 rounded text-[10px] md:text-xs bg-green-100 text-green-800 truncate"
                :title="taller.nombre"
              >
                ◦ {{ taller.nombre }}
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-500 mt-3">
          Los talleres se muestran en los días de la semana donde tienen horarios asignados (vista recurrente).
        </p>
      </div>

      <!-- Vista Semanal -->
      <div
        v-else
        class="bg-white rounded-lg shadow p-4 md:p-6 overflow-x-auto"
      >
        <div class="min-w-[800px]">
          <!-- Cabecera días -->
          <div class="grid grid-cols-[80px_repeat(7,1fr)] mb-2 text-xs font-semibold text-gray-500">
            <div></div>
            <div
              v-for="day in weekDays"
              :key="day.dateKey"
              class="text-center"
            >
              <div>{{ day.shortName }}</div>
              <div class="text-gray-700 text-sm">
                {{ day.date.getDate() }}/{{ day.date.getMonth() + 1 }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-[80px_repeat(7,1fr)] border-t border-gray-200 text-xs relative">
            <!-- Columna de horas -->
            <div class="flex flex-col relative">
              <div
                v-for="hour in hours"
                :key="hour"
                class="h-12 border-b border-gray-100 text-right pr-2 text-gray-500"
              >
                {{ hourLabel(hour) }}
              </div>
            </div>

            <!-- Columnas por día -->
            <div
              v-for="(day, dayIndex) in weekDays"
              :key="day.dateKey"
              class="border-l border-gray-200 relative"
            >
              <!-- Líneas de hora -->
              <div
                v-for="hour in hours"
                :key="hour"
                class="h-12 border-b border-gray-100"
              ></div>

              <!-- Bloques de eventos/talleres -->
              <div class="absolute inset-0">
                <div
                  v-for="item in weekEventsByDay[dayIndex]"
                  :key="item.id"
                  class="absolute left-1 right-1 rounded-md px-1 py-0.5 text-[10px] md:text-xs overflow-hidden shadow-sm"
                  :class="item.type === 'evento'
                    ? 'bg-blue-500/90 text-white'
                    : 'bg-green-500/90 text-white'"
                  :style="{
                    top: item.position.top,
                    height: item.position.height
                  }"
                  :title="item.title"
                >
                  <div class="font-semibold truncate">
                    {{ item.title }}
                  </div>
                  <div class="text-[10px] opacity-90">
                    {{ item.timeLabel }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-500 mt-3">
            Vista semanal: se muestra la distribución por hora de los eventos (según fecha_inicio/fecha_fin)
            y talleres (según sus horarios por día de la semana).
          </p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useEventoStore } from '@/store/evento.store'
import { useTallerStore } from '@/store/taller.store'
import type { Taller } from '@/types/taller.types'
import type { Evento } from '@/services/evento.service'

const eventoStore = useEventoStore()
const tallerStore = useTallerStore()

// Modo de vista
const viewMode = ref<'month' | 'week'>('month')

// Fecha base
const today = new Date()
const currentMonth = ref(today.getMonth()) // 0-11
const currentYear = ref(today.getFullYear())

// Semana actual: guardamos el lunes de la semana actual
const getMonday = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay() // 0=Domingo,...6=Sabado
  const diff = (day === 0 ? -6 : 1) - day // mover a Lunes
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
const currentWeekStart = ref(getMonday(today))

// Nombres de meses
const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

const monthLabel = computed(() => monthNames[currentMonth.value])

// Días de semana
const weekDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// --- VISTA MENSUAL ---

const getStartOfMonth = (year: number, month: number) => new Date(year, month, 1)
const getEndOfMonth = (year: number, month: number) => new Date(year, month + 1, 0)

const getEventosForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return eventoStore.eventos.filter((e: Evento) => {
    if (!e.fecha_inicio) return false
    return e.fecha_inicio.startsWith(dateStr)
  })
}

const getTalleresForDate = (date: Date) => {
  const diaSemana = weekDayNames[date.getDay()] // 'Lunes', etc.
  const dateOnly = date.toISOString().split('T')[0] // 'YYYY-MM-DD'

  return tallerStore.talleres.filter((t: Taller) => {
    // 1) Filtramos por rango de fechas
    if (t.fecha_inicio && dateOnly < t.fecha_inicio) return false
    if (t.fecha_termino && dateOnly > t.fecha_termino) return false

    // 2) Filtramos por día de la semana
    const horarios = t.horarios_parsed || []
    return horarios.some((h) => h.dia_semana === diaSemana)
  })
}

const monthDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const start = getStartOfMonth(year, month)
  const end = getEndOfMonth(year, month)

  let startDay = start.getDay() // 0-6
  if (startDay === 0) startDay = 7 // domingo → 7

  const totalCells = 42
  const firstCellDate = new Date(year, month, 1 - (startDay - 1))

  const cells: {
    date: Date
    dateKey: string
    isCurrentMonth: boolean
    isToday: boolean
    eventos: Evento[]
    talleres: Taller[]
  }[] = []

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(firstCellDate)
    cellDate.setDate(firstCellDate.getDate() + i)

    const isCurrent =
      cellDate.getMonth() === month && cellDate.getFullYear() === year
    const isToday = cellDate.toDateString() === today.toDateString()
    const dateKey = cellDate.toISOString().split('T')[0]

    const eventos = isCurrent ? getEventosForDate(cellDate) : []
    const talleres = isCurrent ? getTalleresForDate(cellDate) : []

    cells.push({
      date: cellDate,
      dateKey,
      isCurrentMonth: isCurrent,
      isToday,
      eventos,
      talleres
    })
  }

  return cells
})

// --- VISTA SEMANAL ---

// Rango de horas que queremos mostrar
const START_HOUR = 8
const END_HOUR = 20
const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`

const weekDays = computed(() => {
  const start = currentWeekStart.value
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({
      date: d,
      dateKey: d.toISOString().split('T')[0],
      shortName: weekDayNames[d.getDay()].slice(0, 3) // Lun, Mar...
    })
  }
  return days
})

const weekRangeLabel = computed(() => {
  const start = weekDays.value[0].date
  const end = weekDays.value[6].date
  return `${start.getDate()}/${start.getMonth() + 1} al ${end.getDate()}/${end.getMonth() + 1}`
})

// Normalizamos eventos y talleres a "items" con posición en la semana
interface WeekItem {
  id: string
  title: string
  type: 'evento' | 'taller'
  start: Date
  end: Date
  timeLabel: string
  position: {
    top: string
    height: string
  }
}

// Convierte fecha string ISO + rango de horas en posiciones %
const calcPosition = (start: Date, end: Date) => {
  const totalMinutes = (END_HOUR - START_HOUR) * 60
  const startMinutes = start.getHours() * 60 + start.getMinutes()
  const endMinutes = end.getHours() * 60 + end.getMinutes()

  const clampedStart = Math.max(startMinutes, START_HOUR * 60)
  const clampedEnd = Math.min(endMinutes, END_HOUR * 60)
  const duration = Math.max(clampedEnd - clampedStart, 30) // mínimo 30 min

  const top = ((clampedStart - START_HOUR * 60) / totalMinutes) * 100
  const height = (duration / totalMinutes) * 100

  return {
    top: `${top}%`,
    height: `${height}%`
  }
}

// Items por día (0-6)
const weekEventsByDay = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  const itemsByDay: WeekItem[][] = Array.from({ length: 7 }, () => [])

  // Eventos
  for (const e of eventoStore.eventos as Evento[]) {
    if (!e.fecha_inicio) continue
    const startDate = new Date(e.fecha_inicio)
    const endDate = e.fecha_fin ? new Date(e.fecha_fin) : new Date(startDate.getTime() + 60 * 60 * 1000)

    if (startDate < end && endDate >= start) {
      const dayIndex = (getMonday(startDate).getDay() + 6) % 7 // 0=Lun,...6=Dom en base a nuestro Monday
      const pos = calcPosition(startDate, endDate)
      const label = `${e.fecha_inicio.substring(11, 16)}${e.fecha_fin ? ' - ' + e.fecha_fin.substring(11, 16) : ''}`

      if (dayIndex >= 0 && dayIndex < 7) {
        itemsByDay[dayIndex].push({
          id: e.evento_id,
          title: e.nombre,
          type: 'evento',
          start: startDate,
          end: endDate,
          timeLabel: label,
          position: pos
        })
      }
    }
  }

  // Talleres (recurrentes)
  const diaSemanaMap: Record<string, number> = {
    Lunes: 0,
    Martes: 1,
    Miércoles: 2,
    Jueves: 3,
    Viernes: 4,
    Sábado: 5,
    Domingo: 6
  }

for (const t of tallerStore.talleres as Taller[]) {
  const horarios = t.horarios_parsed || []
  for (const h of horarios) {
    const dayIndex = diaSemanaMap[h.dia_semana]
    if (dayIndex === undefined) continue

    const dayDate = new Date(start)
    dayDate.setDate(start.getDate() + dayIndex)

    // 👇 AQUÍ filtramos por fecha_inicio / fecha_fin
    const dateOnly = dayDate.toISOString().split('T')[0] // 'YYYY-MM-DD'
    if (t.fecha_inicio && dateOnly < t.fecha_inicio) continue
    if (t.fecha_termino && dateOnly > t.fecha_termino) continue

    const [hStartHour, hStartMin] = h.hora_inicio.split(':').map(Number)
    const [hEndHour, hEndMin] = h.hora_termino.split(':').map(Number)

    const startDate = new Date(dayDate)
    startDate.setHours(hStartHour, hStartMin, 0, 0)

    const endDate = new Date(dayDate)
    endDate.setHours(hEndHour, hEndMin, 0, 0)

    const pos = calcPosition(startDate, endDate)
    const label = `${h.hora_inicio} - ${h.hora_termino}`

    itemsByDay[dayIndex].push({
      id: `${t.taller_id}-${h.dia_semana}-${h.hora_inicio}`,
      title: t.nombre,
      type: 'taller',
      start: startDate,
      end: endDate,
      timeLabel: label,
      position: pos
    })
  }
}


  return itemsByDay
})

// Navegación de meses / semanas
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

const prevWeek = () => {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() - 7)
  currentWeekStart.value = getMonday(d)
}

const nextWeek = () => {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 7)
  currentWeekStart.value = getMonday(d)
}

const goToToday = () => {
  const now = new Date()
  currentMonth.value = now.getMonth()
  currentYear.value = now.getFullYear()
  currentWeekStart.value = getMonday(now)
}

// Carga inicial
onMounted(async () => {
  try {
    await Promise.all([
      eventoStore.fetchEventos(),
      tallerStore.fetchTalleres({ estado_activo: true })
    ])
  } catch (error) {
    console.error('Error al cargar datos del calendario:', error)
  }
})
</script>
