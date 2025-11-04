import apiClient from './api.config';
import type { Attendance } from '@/types/student.types';

class AttendanceService {
  /**
   * Obtiene el historial de asistencia del estudiante
   * GET /api/students/me/attendance
   */
  async getAttendance(startDate?: string, endDate?: string): Promise<Attendance[]> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get<{ attendance: Attendance[] }>('/students/me/attendance', { params });
      return response.data.attendance;
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asistencia');
    }
  }

  /**
   * Obtiene el resumen de asistencia del estudiante
   * GET /api/students/me/attendance/summary
   */
  async getAttendanceSummary(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/students/me/attendance/summary', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance summary:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener resumen de asistencia');
    }
  }
}

export default new AttendanceService();
