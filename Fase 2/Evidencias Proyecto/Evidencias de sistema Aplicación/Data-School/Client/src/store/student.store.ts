import { defineStore } from 'pinia';
import usersService from '@/services/user.service';
import type {
    User
} from '@/types/auth.types';
import { StudentProfile } from '@/types/student.types';

export const useStudentStore = defineStore('school', {
  state: () => ({
        studentList: [] as User[],
        studentInfo: null as StudentProfile | null,
        loading: false,
        error: null as string | null,
    }),
        actions: {
        /**
         * Acción para obtener la información del colegio
         */
        async fetchStudents() {
            this.loading = true;
            this.error = null;
                try {
                this.studentList = await usersService.getAllUsers("ESTUDIANTE");
            } catch (error: any) {
                this.error = error.message || 'Error al cargar la información del colegio';
            }
                this.loading = false;   
        }
    }   
});