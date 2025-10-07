import apiClient from './api.config';
import type {
    SchoolInfo
} from '@/types/school.types';

class SchoolService {
    /**
     * Obtiene la información del colegio desde el backend
     * @returns Información del colegio 
     * @throws Error si falla la solicitud
     */
    async getSchoolInfo(): Promise<SchoolInfo> {
        try {
            const response = await apiClient.get<SchoolInfo>('/school/infoColegio');
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Error al obtener información del colegio'
            );
        }
    }
}

export default new SchoolService();