import { defineStore } from 'pinia';
import SchoolService from '@/services/school.service.ts';
import type {
  SchoolInfo
} from '@/types/school.types';

export const useSchoolStore = defineStore('school', {
  state: () => ({
        schoolInfo: null as SchoolInfo | null,
        loading: false,
        error: null as string | null,
    }),
        actions: {
        /**
         * Acción para obtener la información del colegio
         */
        async fetchSchoolInfo() {
            this.loading = true;
            this.error = null;
                try {
                this.schoolInfo = await SchoolService.getSchoolInfo();
            } catch (error: any) {
                this.error = error.message || 'Error al cargar la información del colegio';
            }
                this.loading = false;   
        }
    }   
});