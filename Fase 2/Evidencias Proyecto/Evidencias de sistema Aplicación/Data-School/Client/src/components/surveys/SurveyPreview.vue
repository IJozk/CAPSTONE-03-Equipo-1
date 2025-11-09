<template>
  <div class="survey-preview">
    <div class="preview-header">
      <h3>Vista Previa de la Encuesta</h3>
      <p class="text-sm text-gray-500">
        Así es como verán la encuesta los usuarios
      </p>
    </div>

    <div class="preview-content">
      <div v-if="template && template.questions.length > 0" class="questions-preview">
        <div
          v-for="(question, index) in template.questions"
          :key="question.id"
          class="question-preview"
        >
          <div class="question-title">
            <span class="question-number">{{ index + 1 }}.</span>
            <span>{{ question.title || 'Sin título' }}</span>
            <span v-if="question.required" class="required-mark">*</span>
          </div>

          <div v-if="question.description" class="question-description">
            {{ question.description }}
          </div>

          <!-- Text -->
          <div v-if="question.type === 'text'" class="answer-input">
            <input
              type="text"
              placeholder="Respuesta de texto corto"
              class="form-control"
              disabled
            />
          </div>

          <!-- Textarea -->
          <div v-if="question.type === 'textarea'" class="answer-input">
            <textarea
              placeholder="Respuesta de texto largo"
              class="form-control"
              rows="4"
              disabled
            ></textarea>
          </div>

          <!-- Radio -->
          <div v-if="question.type === 'radio'" class="answer-options">
            <label
              v-for="option in question.options"
              :key="option.id"
              class="option-label"
            >
              <input type="radio" :name="`q_${question.id}`" disabled />
              <span>{{ option.label }}</span>
            </label>
          </div>

          <!-- Checkbox -->
          <div v-if="question.type === 'checkbox'" class="answer-options">
            <label
              v-for="option in question.options"
              :key="option.id"
              class="option-label"
            >
              <input type="checkbox" disabled />
              <span>{{ option.label }}</span>
            </label>
          </div>

          <!-- Select -->
          <div v-if="question.type === 'select'" class="answer-input">
            <select class="form-control" disabled>
              <option value="">Selecciona una opción</option>
              <option
                v-for="option in question.options"
                :key="option.id"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Rating -->
          <div v-if="question.type === 'rating'" class="answer-rating">
            <div class="rating-labels">
              <span class="rating-label-min">
                {{ question.ratingConfig?.minLabel || question.ratingConfig?.min }}
              </span>
              <span class="rating-label-max">
                {{ question.ratingConfig?.maxLabel || question.ratingConfig?.max }}
              </span>
            </div>
            <div class="rating-scale">
              <button
                v-for="n in getRatingSteps(question)"
                :key="n"
                class="rating-button"
                disabled
              >
                {{ n }}
              </button>
            </div>
          </div>

          <!-- Yes/No -->
          <div v-if="question.type === 'yesno'" class="answer-options">
            <label class="option-label">
              <input type="radio" :name="`q_${question.id}`" disabled />
              <span>Sí</span>
            </label>
            <label class="option-label">
              <input type="radio" :name="`q_${question.id}`" disabled />
              <span>No</span>
            </label>
          </div>

          <!-- Date -->
          <div v-if="question.type === 'date'" class="answer-input">
            <input
              type="date"
              class="form-control"
              disabled
            />
          </div>

          <!-- Number -->
          <div v-if="question.type === 'number'" class="answer-input">
            <input
              type="number"
              placeholder="Ingresa un número"
              class="form-control"
              disabled
            />
          </div>
        </div>
      </div>

      <div v-else class="empty-preview">
        <i class="fas fa-eye-slash"></i>
        <p>No hay preguntas para mostrar</p>
        <p class="text-sm">Agrega preguntas en el editor para ver la vista previa</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SurveyTemplate, Question } from '@/types/survey-template.types';

interface Props {
  template: SurveyTemplate | null;
}

const props = defineProps<Props>();

// Calcular pasos de rating
const getRatingSteps = (question: Question): number[] => {
  if (!question.ratingConfig) return [];

  const { min, max, step = 1 } = question.ratingConfig;
  const steps: number[] = [];

  for (let i = min; i <= max; i += step) {
    steps.push(Math.round(i * 10) / 10); // Redondear para evitar problemas de precisión
  }

  return steps;
};
</script>

<style scoped>
.survey-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.preview-content {
  min-height: 300px;
}

.questions-preview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.question-title {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.question-number {
  color: #6b7280;
  font-weight: 600;
}

.required-mark {
  color: #dc2626;
  font-weight: 600;
}

.question-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: -0.25rem;
}

.answer-input {
  margin-top: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.form-control:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.option-label input {
  cursor: pointer;
}

.option-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.answer-rating {
  margin-top: 0.5rem;
}

.rating-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.rating-scale {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.rating-button {
  min-width: 48px;
  padding: 0.625rem 0.875rem;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-button:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.rating-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  text-align: center;
}

.empty-preview i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-preview p {
  margin: 0.5rem 0;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}
</style>
