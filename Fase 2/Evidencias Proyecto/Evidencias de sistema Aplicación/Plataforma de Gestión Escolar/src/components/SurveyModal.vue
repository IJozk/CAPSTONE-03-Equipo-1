<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    @click="$emit('close')"
  >
    <div
      class="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      @click.stop
    >
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-foreground mb-2">{{ survey.title }}</h2>
        <p class="text-muted-foreground">{{ survey.description }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div
          v-for="(question, index) in survey.questions"
          :key="question.id"
          class="space-y-3"
        >
          <h3 class="font-medium text-foreground">
            {{ index + 1 }}. {{ question.text }}
          </h3>

          <div v-if="question.type === 'multiple-choice'" class="space-y-2">
            <label
              v-for="option in question.options"
              :key="option"
              class="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              :class="{
                'border-primary bg-primary/5': responses[question.id] === option
              }"
            >
              <input
                :value="option"
                v-model="responses[question.id]"
                type="radio"
                :name="question.id"
                class="text-primary focus:ring-primary"
                required
              />
              <span class="text-foreground">{{ option }}</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-6 border-t border-border">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Completar Encuesta
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  survey: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'complete'])

const responses = ref({})

const isFormValid = computed(() => {
  return props.survey.questions.every(question => 
    responses.value[question.id] && responses.value[question.id].trim() !== ''
  )
})

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('complete', {
      surveyId: props.survey.id,
      responses: responses.value,
      timestamp: new Date().toISOString()
    })
  }
}
</script>