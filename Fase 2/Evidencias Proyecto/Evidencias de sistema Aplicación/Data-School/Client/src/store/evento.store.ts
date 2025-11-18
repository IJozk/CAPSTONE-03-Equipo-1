import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import eventoService, { 
  type Evento, 
  type CreateEventoDTO, 
  type UpdateEventoDTO,
  type EventoQueryParams,
  type EventoFormData
} from '@/services/evento.service'

export const useEventoStore = defineStore('evento', () => {
  // State
  const eventos = ref<Evento[]>([])
  const currentEvento = ref<Evento | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const eventosProximos = computed(() => {
    const hoy = new Date().toISOString()
    return eventos.value.filter(e => e.fecha_inicio && e.fecha_inicio >= hoy)
  })

  const eventosPasados = computed(() => {
    const hoy = new Date().toISOString()
    return eventos.value.filter(e => e.fecha_fin && e.fecha_fin < hoy)
  })

  // Actions
  async function fetchEventos(filters?: EventoQueryParams) {
    loading.value = true
    error.value = null
    try {
      eventos.value = await eventoService.getAll(filters)
    } catch (err: any) {
      error.value = err.message || 'Error al cargar eventos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventoById(id: string) {
    loading.value = true
    error.value = null
    try {
      currentEvento.value = await eventoService.getById(id)
      return currentEvento.value
    } catch (err: any) {
      error.value = err.message || 'Error al cargar evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventosProximos() {
    loading.value = true
    error.value = null
    try {
      const data = await eventoService.getProximos()
      return data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar eventos próximos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventosPasados() {
    loading.value = true
    error.value = null
    try {
      const data = await eventoService.getPasados()
      return data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar eventos pasados'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventosEnCurso() {
    loading.value = true
    error.value = null
    try {
      const data = await eventoService.getEnCurso()
      return data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar eventos en curso'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear evento desde datos de formulario
   */
  async function createEventoFromForm(formData: EventoFormData, creado_por?: string) {
    loading.value = true
    error.value = null
    try {
      const newEvento = await eventoService.createFromForm(formData, creado_por)
      eventos.value.unshift(newEvento)
      return newEvento
    } catch (err: any) {
      error.value = err.message || 'Error al crear evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear evento (método directo con DTO)
   */
  async function createEvento(evento: CreateEventoDTO) {
    loading.value = true
    error.value = null
    try {
      const newEvento = await eventoService.create(evento)
      eventos.value.unshift(newEvento)
      return newEvento
    } catch (err: any) {
      error.value = err.message || 'Error al crear evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar evento desde datos de formulario
   */
  async function updateEventoFromForm(id: string, formData: EventoFormData, modificado_por?: string) {
    loading.value = true
    error.value = null
    try {
      const updated = await eventoService.updateFromForm(id, formData, modificado_por)
      const index = eventos.value.findIndex(e => e.evento_id === id)
      if (index !== -1) {
        eventos.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar evento (método directo con DTO)
   */
  async function updateEvento(id: string, evento: UpdateEventoDTO) {
    loading.value = true
    error.value = null
    try {
      const updated = await eventoService.update(id, evento)
      const index = eventos.value.findIndex(e => e.evento_id === id)
      if (index !== -1) {
        eventos.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEvento(id: string) {
    loading.value = true
    error.value = null
    try {
      await eventoService.delete(id)
      eventos.value = eventos.value.filter(e => e.evento_id !== id)
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventoAlertas(id: string) {
    loading.value = true
    error.value = null
    try {
      const alertas = await eventoService.getAlertas(id)
      return alertas
    } catch (err: any) {
      error.value = err.message || 'Error al cargar alertas del evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    eventos,
    currentEvento,
    loading,
    error,
    // Getters
    eventosProximos,
    eventosPasados,
    // Actions
    fetchEventos,
    fetchEventoById,
    fetchEventosProximos,
    fetchEventosPasados,
    fetchEventosEnCurso,
    createEvento,
    createEventoFromForm,
    updateEvento,
    updateEventoFromForm,
    deleteEvento,
    fetchEventoAlertas
  }
})