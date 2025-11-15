<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ encuesta?.titulo }}</h2>
            <p v-if="encuesta?.descripcion" class="text-gray-600 mt-1">
              {{ encuesta.descripcion }}
            </p>
            <p class="text-sm text-gray-500 mt-2">
              Válida hasta: {{ formatDate(encuesta?.fecha_fin) }}
            </p>
          </div>
          <button
            v-if="canSkip"
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Survey Form -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="space-y-6">
          <!-- Info Message -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm text-blue-800 font-medium">
                  Por favor, completa esta encuesta. Tu opinión es muy importante para nosotros.
                </p>
                <p class="text-xs text-blue-700 mt-1">
                  Los campos marcados con <span class="text-red-500">*</span> son obligatorios.
                </p>
              </div>
            </div>
          </div>

          <!-- Questions -->
          <div
            v-for="(question, index) in template?.questions"
            :key="question.id"
            class="bg-gray-50 rounded-lg p-5"
          >
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-900">
                {{ index + 1 }}. {{ question.title }}
                <span v-if="question.required" class="text-red-500">*</span>
              </label>
              <p v-if="question.description" class="text-xs text-gray-600 mt-1">
                {{ question.description }}
              </p>
            </div>

            <!-- Text Input -->
            <input
              v-if="question.type === 'text'"
              v-model="responses[question.id]"
              type="text"
              :required="question.required"
              :minlength="question.validation?.minLength"
              :maxlength="question.validation?.maxLength"
              :pattern="question.validation?.pattern"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tu respuesta"
            />

            <!-- Textarea -->
            <textarea
              v-else-if="question.type === 'textarea'"
              v-model="responses[question.id]"
              :required="question.required"
              :minlength="question.validation?.minLength"
              :maxlength="question.validation?.maxLength"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tu respuesta"
            ></textarea>

            <!-- Radio (Single Choice) -->
            <div v-else-if="question.type === 'radio'" class="space-y-2">
              <label
                v-for="option in question.options"
                :key="option.value"
                class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="radio"
                  :name="question.id"
                  :value="option.value"
                  v-model="responses[question.id]"
                  :required="question.required"
                  class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-3 text-sm text-gray-900">{{ option.label }}</span>
              </label>
            </div>

            <!-- Checkbox (Multiple Choice) -->
            <div v-else-if="question.type === 'checkbox'" class="space-y-2">
              <label
                v-for="option in question.options"
                :key="option.value"
                class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="option.value"
                  v-model="responses[question.id]"
                  class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span class="ml-3 text-sm text-gray-900">{{ option.label }}</span>
              </label>
            </div>

            <!-- Select (Dropdown) -->
            <select
              v-else-if="question.type === 'select'"
              v-model="responses[question.id]"
              :required="question.required"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="" disabled>Selecciona una opción</option>
              <option
                v-for="option in question.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <!-- Rating (Scale) -->
            <div v-else-if="question.type === 'rating'" class="space-y-2">
              <div class="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{{ question.ratingConfig?.minLabel || question.ratingConfig?.min }}</span>
                <span>{{ question.ratingConfig?.maxLabel || question.ratingConfig?.max }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <button
                  v-for="value in getRatingRange(question)"
                  :key="value"
                  type="button"
                  @click="responses[question.id] = value"
                  :class="[
                    'flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium',
                    responses[question.id] === value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  ]"
                >
                  {{ value }}
                </button>
              </div>
            </div>

            <!-- Yes/No -->
            <div v-else-if="question.type === 'yesno'" class="flex gap-4">
              <label class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer flex-1">
                <input
                  type="radio"
                  :name="question.id"
                  value="si"
                  v-model="responses[question.id]"
                  :required="question.required"
                  class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-3 text-sm text-gray-900">Sí</span>
              </label>
              <label class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer flex-1">
                <input
                  type="radio"
                  :name="question.id"
                  value="no"
                  v-model="responses[question.id]"
                  :required="question.required"
                  class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-3 text-sm text-gray-900">No</span>
              </label>
            </div>

            <!-- Date -->
            <input
              v-else-if="question.type === 'date'"
              v-model="responses[question.id]"
              type="date"
              :required="question.required"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            <!-- Number -->
            <input
              v-else-if="question.type === 'number'"
              v-model.number="responses[question.id]"
              type="number"
              :required="question.required"
              :min="question.validation?.min"
              :max="question.validation?.max"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ingresa un número"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            v-if="canSkip"
            type="button"
            @click="handleSkip"
            class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Responder más tarde
          </button>
          <div class="flex gap-3 ml-auto">
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {{ submitting ? 'Enviando...' : 'Enviar Respuestas' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { useEncuestaEstudianteStore } from '@/store/encuestaEstudiante.store'
import type { EncuestaConDetalles } from '@/services/encuestaEstudiante.service'
import type { SurveyTemplate, Question } from '@/types/survey-template.types'

interface Props {
  encuesta: EncuestaConDetalles | null
  canSkip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canSkip: true
})

const emit = defineEmits<{
  close: []
  submitted: []
}>()

const authStore = useAuthStore()
const encuestaStore = useEncuestaEstudianteStore()

const submitting = ref(false)
const responses = ref<Record<string, any>>({})

const template = computed<SurveyTemplate | null>(() => {
  if (!props.encuesta?.template_encuesta) return null
  return props.encuesta.template_encuesta as SurveyTemplate
})

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
}

const getRatingRange = (question: Question) => {
  const min = question.ratingConfig?.min || 1
  const max = question.ratingConfig?.max || 5
  const step = question.ratingConfig?.step || 1
  const range = []
  for (let i = min; i <= max; i += step) {
    range.push(i)
  }
  return range
}

const handleSubmit = async () => {
  if (!props.encuesta || !authStore.user?.estudiante_profile?.estudiante_id) return

  try {
    submitting.value = true

    // Construir objeto de respuestas
    const surveyResponse = {
      encuesta_id: props.encuesta.encuesta_id,
      responses: responses.value,
      completed_at: new Date().toISOString()
    }

    await encuestaStore.guardarRespuesta({
      id_encuesta: props.encuesta.encuesta_id,
      estudiante_id: authStore.user.estudiante_profile.estudiante_id,
      respuesta_encuesta: surveyResponse,
      fecha_respuesta: new Date().toISOString()
    })

    emit('submitted')
  } catch (error: any) {
    console.error('Error al enviar encuesta:', error)
    alert('Error al enviar la encuesta. Por favor, intenta nuevamente.')
  } finally {
    submitting.value = false
  }
}

const handleSkip = () => {
  if (confirm('¿Estás seguro de que deseas responder esta encuesta más tarde?')) {
    emit('close')
  }
}

const handleClose = () => {
  if (confirm('¿Deseas cerrar esta encuesta sin responder?')) {
    emit('close')
  }
}

onMounted(() => {
  // Inicializar respuestas vacías
  if (template.value?.questions) {
    template.value.questions.forEach((question) => {
      if (question.type === 'checkbox') {
        responses.value[question.id] = []
      } else {
        responses.value[question.id] = ''
      }
    })
  }
})
</script>
