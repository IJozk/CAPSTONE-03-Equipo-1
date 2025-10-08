<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Registro de Asistencia</h1>

      <!-- Selectors -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input
              v-model="selectedDate"
              type="date"
              :max="today"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
            <select
              v-model="selectedSubjectId"
              @change="loadStudents"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar asignatura</option>
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }} - {{ subject.curso.nombre }}
              </option>
            </select>
          </div>
        </div>

        <!-- Quick Actions -->
        <div v-if="students.length > 0" class="mt-4 flex space-x-2">
          <button @click="markAllPresent" class="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
            Marcar Todos Presentes
          </button>
          <button @click="markAllAbsent" class="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
            Marcar Todos Ausentes
          </button>
          <button @click="clearAll" class="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
            Limpiar Todo
          </button>
        </div>
      </div>

      <!-- Students List -->
      <div v-if="students.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">N°</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">ESTUDIANTE</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600">PRESENTE</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600">RETRASO (min)</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600">RETIRO (min)</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600">JUSTIFICADO</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="student in students" :key="student.estudiante_id"
                  :class="getRowClass(attendance[student.estudiante_id])">
                <td class="px-4 py-3 text-sm">{{ student.numero_lista }}</td>
                <td class="px-4 py-3 text-sm font-medium">{{ student.nombre_completo }}</td>
                <td class="px-4 py-3 text-center">
                  <input
                    v-model="attendance[student.estudiante_id].presente"
                    type="checkbox"
                    class="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="attendance[student.estudiante_id].retraso_minutos"
                    type="number"
                    min="0"
                    class="w-20 px-2 py-1 text-center border rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="attendance[student.estudiante_id].retiro_anticipado_minutos"
                    type="number"
                    min="0"
                    class="w-20 px-2 py-1 text-center border rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
                <td class="px-4 py-3 text-center">
                  <input
                    v-model="attendance[student.estudiante_id].justificado"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model="attendance[student.estudiante_id].observaciones"
                    type="text"
                    class="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary-500"
                    placeholder="Observaciones..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Stats & Actions -->
        <div class="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <div class="flex space-x-6 text-sm">
            <div><span class="font-medium">Total:</span> {{ students.length }}</div>
            <div class="text-green-600"><span class="font-medium">Presentes:</span> {{ stats.present }}</div>
            <div class="text-red-600"><span class="font-medium">Ausentes:</span> {{ stats.absent }}</div>
            <div class="text-yellow-600"><span class="font-medium">Retrasos:</span> {{ stats.delays }}</div>
            <div class="text-blue-600"><span class="font-medium">% Asistencia:</span> {{ stats.percentage }}%</div>
          </div>
          <button
            @click="saveAttendance"
            :disabled="saving || !selectedSubjectId"
            class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
          >
            {{ saving ? 'Guardando...' : 'Guardar Asistencia' }}
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <p class="text-sm text-green-800">{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useTeacherStore } from '@/store/teacher.store';
import teacherService from '@/services/teacher.service';
import type { Student, AttendanceRecord } from '@/types/teacher.types';

const route = useRoute();
const teacherStore = useTeacherStore();

const today = new Date().toISOString().split('T')[0];
const selectedDate = ref(today);
const selectedSubjectId = ref('');
const students = ref<Student[]>([]);
const attendance = ref<Record<string, AttendanceRecord>>({});
const saving = ref(false);
const successMessage = ref('');

const stats = computed(() => {
  const records = Object.values(attendance.value);
  const present = records.filter(r => r.presente).length;
  const absent = records.filter(r => !r.presente).length;
  const delays = records.filter(r => r.retraso_minutos > 0).length;
  const percentage = students.value.length > 0 ? Math.round((present / students.value.length) * 100) : 0;
  return { present, absent, delays, percentage };
});

const getRowClass = (record: AttendanceRecord) => {
  if (record.presente) return 'bg-green-50';
  if (!record.presente && record.justificado) return 'bg-blue-50';
  if (!record.presente) return 'bg-red-50';
  return '';
};

const loadStudents = async () => {
  if (!selectedSubjectId.value) return;
  students.value = await teacherService.getSubjectStudents(selectedSubjectId.value);
  attendance.value = {};
  students.value.forEach(s => {
    attendance.value[s.estudiante_id] = {
      estudiante_id: s.estudiante_id,
      nombre_completo: s.nombre_completo,
      numero_lista: s.numero_lista,
      presente: false,
      retraso_minutos: 0,
      retiro_anticipado_minutos: 0,
      justificado: false,
      observaciones: ''
    };
  });
};

const markAllPresent = () => {
  Object.values(attendance.value).forEach(a => a.presente = true);
};

const markAllAbsent = () => {
  Object.values(attendance.value).forEach(a => a.presente = false);
};

const clearAll = () => {
  Object.values(attendance.value).forEach(a => {
    a.presente = false;
    a.retraso_minutos = 0;
    a.retiro_anticipado_minutos = 0;
    a.justificado = false;
    a.observaciones = '';
  });
};

const saveAttendance = async () => {
  saving.value = true;
  successMessage.value = '';
  try {
    await teacherService.saveAttendance({
      fecha: selectedDate.value,
      asignatura_id: selectedSubjectId.value,
      asistencias: Object.values(attendance.value)
    });
    successMessage.value = 'Asistencia registrada exitosamente';
    setTimeout(() => successMessage.value = '', 3000);
  } catch (error) {
    console.error('Error saving attendance:', error);
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }
  if (route.query.subject) {
    selectedSubjectId.value = route.query.subject as string;
    await loadStudents();
  }
});
</script>
