<template>
  <div class="survey-template-builder">
    <!-- Header con acciones -->
    <div class="builder-header">
      <div class="header-left">
        <h3>Editor de Plantilla</h3>
        <p class="text-sm text-gray-500">
          {{ questions.length }} pregunta{{ questions.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <div class="header-actions">
        <button
          @click="showPreview = !showPreview"
          class="btn btn-secondary"
        >
          <i :class="`fas fa-${showPreview ? 'edit' : 'eye'}`"></i>
          {{ showPreview ? 'Editar' : 'Vista Previa' }}
        </button>
      </div>
    </div>

    <!-- Vista de edición -->
    <div v-if="!showPreview" class="builder-content">
      <!-- Selector de tipo de pregunta -->
      <div class="question-type-selector">
        <h4>Agregar Pregunta</h4>
        <div class="question-types-grid">
          <button
            v-for="typeConfig in QUESTION_TYPES"
            :key="typeConfig.type"
            @click="addQuestion(typeConfig.type)"
            class="question-type-card"
            :title="typeConfig.description"
          >
            <i :class="`fas fa-${typeConfig.icon}`"></i>
            <span>{{ typeConfig.label }}</span>
          </button>
        </div>
      </div>

      <!-- Lista de preguntas -->
      <div class="questions-list">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-card"
        >
          <!-- Header de la pregunta -->
          <div class="question-header">
            <div class="question-number">
              <i :class="`fas fa-${getQuestionIcon(question.type)}`"></i>
              <span>Pregunta {{ index + 1 }}</span>
            </div>
            <div class="question-actions">
              <button
                @click="moveQuestion(index, 'up')"
                :disabled="index === 0"
                class="btn-icon"
                title="Mover arriba"
              >
                <i class="fas fa-arrow-up"></i>
              </button>
              <button
                @click="moveQuestion(index, 'down')"
                :disabled="index === questions.length - 1"
                class="btn-icon"
                title="Mover abajo"
              >
                <i class="fas fa-arrow-down"></i>
              </button>
              <button
                @click="duplicateQuestion(index)"
                class="btn-icon"
                title="Duplicar"
              >
                <i class="fas fa-copy"></i>
              </button>
              <button
                @click="removeQuestion(index)"
                class="btn-icon btn-danger"
                title="Eliminar"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- Formulario de la pregunta -->
          <div class="question-form">
            <!-- Título -->
            <div class="form-group">
              <label>Pregunta *</label>
              <input
                v-model="question.title"
                type="text"
                placeholder="Escribe tu pregunta aquí"
                class="form-control"
                required
              />
            </div>

            <!-- Descripción -->
            <div class="form-group">
              <label>Descripción (opcional)</label>
              <textarea
                v-model="question.description"
                placeholder="Agrega contexto o instrucciones adicionales"
                class="form-control"
                rows="2"
              ></textarea>
            </div>

            <!-- Tipo de pregunta -->
            <div class="form-group">
              <label>Tipo de Pregunta</label>
              <select
                v-model="question.type"
                @change="onQuestionTypeChange(question)"
                class="form-control"
              >
                <option
                  v-for="typeConfig in QUESTION_TYPES"
                  :key="typeConfig.type"
                  :value="typeConfig.type"
                >
                  {{ typeConfig.label }}
                </option>
              </select>
            </div>

            <!-- Opciones (para radio, checkbox, select) -->
            <div
              v-if="questionHasOptions(question.type)"
              class="form-group"
            >
              <label>Opciones</label>
              <div class="options-list">
                <div
                  v-for="(option, optIndex) in question.options"
                  :key="option.id"
                  class="option-item"
                >
                  <input
                    v-model="option.label"
                    type="text"
                    placeholder="Texto de la opción"
                    class="form-control"
                  />
                  <button
                    @click="removeOption(question, optIndex)"
                    class="btn-icon btn-danger"
                    :disabled="(question.options?.length || 0) <= 1"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <button
                @click="addOption(question)"
                class="btn btn-secondary btn-sm mt-2"
              >
                <i class="fas fa-plus"></i>
                Agregar Opción
              </button>
            </div>

            <!-- Configuración de calificación (para rating) -->
            <div
              v-if="question.type === 'rating'"
              class="form-group"
            >
              <label>Configuración de Calificación</label>
              <div class="rating-config">
                <div class="form-row">
                  <div class="form-col">
                    <label>Mínimo</label>
                    <input
                      v-model.number="question.ratingConfig!.min"
                      type="number"
                      class="form-control"
                      min="0"
                    />
                  </div>
                  <div class="form-col">
                    <label>Máximo</label>
                    <input
                      v-model.number="question.ratingConfig!.max"
                      type="number"
                      class="form-control"
                      min="1"
                    />
                  </div>
                  <div class="form-col">
                    <label>Paso</label>
                    <input
                      v-model.number="question.ratingConfig!.step"
                      type="number"
                      class="form-control"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                </div>
                <div class="form-row mt-2">
                  <div class="form-col">
                    <label>Etiqueta Mínima</label>
                    <input
                      v-model="question.ratingConfig!.minLabel"
                      type="text"
                      placeholder="Ej: Malo"
                      class="form-control"
                    />
                  </div>
                  <div class="form-col">
                    <label>Etiqueta Máxima</label>
                    <input
                      v-model="question.ratingConfig!.maxLabel"
                      type="text"
                      placeholder="Ej: Excelente"
                      class="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Requerida -->
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="question.required"
                  type="checkbox"
                />
                <span>Esta pregunta es obligatoria</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="questions.length === 0" class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <p>No hay preguntas aún</p>
          <p class="text-sm">Selecciona un tipo de pregunta arriba para comenzar</p>
        </div>
      </div>
    </div>

    <!-- Vista previa -->
    <div v-else class="preview-content">
      <SurveyPreview :template="getTemplate()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type {
  Question,
  QuestionType,
  SurveyTemplate,
  QuestionOption
} from '@/types/survey-template.types';
import { QUESTION_TYPES } from '@/types/survey-template.types';
import SurveyPreview from './SurveyPreview.vue';

interface Props {
  modelValue?: SurveyTemplate | null;
}

interface Emits {
  (e: 'update:modelValue', value: SurveyTemplate): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const questions = ref<Question[]>([]);
const showPreview = ref(false);

// Inicializar desde modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.questions) {
      questions.value = JSON.parse(JSON.stringify(newValue.questions));
    }
  },
  { immediate: true }
);

// Generar ID único
const generateId = (): string => {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Agregar pregunta
const addQuestion = (type: QuestionType): void => {
  const newQuestion: Question = {
    id: generateId(),
    type,
    title: '',
    description: '',
    required: false
  };

  // Configurar opciones si es necesario
  if (questionHasOptions(type)) {
    newQuestion.options = [
      { id: generateId(), label: 'Opción 1', value: 'option_1' },
      { id: generateId(), label: 'Opción 2', value: 'option_2' }
    ];
  }

  // Configurar rating si es necesario
  if (type === 'rating') {
    newQuestion.ratingConfig = {
      min: 1,
      max: 5,
      step: 1,
      minLabel: '',
      maxLabel: ''
    };
  }

  questions.value.push(newQuestion);
};

// Verificar si el tipo de pregunta tiene opciones
const questionHasOptions = (type: QuestionType): boolean => {
  return ['radio', 'checkbox', 'select'].includes(type);
};

// Obtener icono de pregunta
const getQuestionIcon = (type: QuestionType): string => {
  const config = QUESTION_TYPES.find(t => t.type === type);
  return config?.icon || 'question-circle';
};

// Mover pregunta
const moveQuestion = (index: number, direction: 'up' | 'down'): void => {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= questions.value.length) return;

  const temp = questions.value[index];
  questions.value[index] = questions.value[newIndex];
  questions.value[newIndex] = temp;
};

// Duplicar pregunta
const duplicateQuestion = (index: number): void => {
  const original = questions.value[index];
  const duplicate = JSON.parse(JSON.stringify(original));
  duplicate.id = generateId();
  duplicate.title = `${duplicate.title} (copia)`;

  // Regenerar IDs de opciones
  if (duplicate.options) {
    duplicate.options = duplicate.options.map((opt: QuestionOption) => ({
      ...opt,
      id: generateId()
    }));
  }

  questions.value.splice(index + 1, 0, duplicate);
};

// Eliminar pregunta
const removeQuestion = (index: number): void => {
  questions.value.splice(index, 1);
};

// Cambiar tipo de pregunta
const onQuestionTypeChange = (question: Question): void => {
  // Agregar/quitar opciones según el tipo
  if (questionHasOptions(question.type) && !question.options) {
    question.options = [
      { id: generateId(), label: 'Opción 1', value: 'option_1' },
      { id: generateId(), label: 'Opción 2', value: 'option_2' }
    ];
  } else if (!questionHasOptions(question.type)) {
    delete question.options;
  }

  // Agregar/quitar config de rating
  if (question.type === 'rating' && !question.ratingConfig) {
    question.ratingConfig = {
      min: 1,
      max: 5,
      step: 1,
      minLabel: '',
      maxLabel: ''
    };
  } else if (question.type !== 'rating') {
    delete question.ratingConfig;
  }
};

// Agregar opción
const addOption = (question: Question): void => {
  if (!question.options) {
    question.options = [];
  }
  const optionNumber = question.options.length + 1;
  question.options.push({
    id: generateId(),
    label: `Opción ${optionNumber}`,
    value: `option_${optionNumber}`
  });
};

// Eliminar opción
const removeOption = (question: Question, index: number): void => {
  if (question.options && question.options.length > 1) {
    question.options.splice(index, 1);
  }
};

// Obtener template completo
const getTemplate = (): SurveyTemplate => {
  return {
    version: '1.0',
    title: '',
    questions: questions.value
  };
};

// Exponer métodos al padre
defineExpose({
  getTemplate
});
</script>

<style scoped>
.survey-template-builder {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-left h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.builder-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-type-selector h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.question-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.question-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.question-type-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.question-type-card i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.question-type-card span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.question-number {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.question-number i {
  color: #3b82f6;
}

.question-actions {
  display: flex;
  gap: 0.25rem;
}

.question-form {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px;
  ring-color: rgba(59, 130, 246, 0.1);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  gap: 0.5rem;
}

.option-item input {
  flex: 1;
}

.rating-config {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-col label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  cursor: pointer;
}

.btn-icon {
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon.btn-danger:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0.5rem 0;
}

.preview-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 2rem;
}
</style>
