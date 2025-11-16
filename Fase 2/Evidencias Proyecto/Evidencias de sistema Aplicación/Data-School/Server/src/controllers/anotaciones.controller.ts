import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * Obtener todas las anotaciones de un estudiante
 */
export const getAnotacionesByEstudiante = async (req: Request, res: Response) => {
  try {
    const { estudiante_id } = req.params;

    const { data, error } = await supabase
      .from('Anotaciones')
      .select(`
        *,
        estudiante:Estudiante(estudiante_id, nombre_completo, rut),
        profesor:Profesor(profesor_id, nombre_completo)
      `)
      .eq('estudiante_id', estudiante_id)
      .order('fecha', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching anotaciones by estudiante:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todas las anotaciones de un profesor
 */
export const getAnotacionesByProfesor = async (req: Request, res: Response) => {
  try {
    const { profesor_id } = req.params;

    const { data, error } = await supabase
      .from('Anotaciones')
      .select(`
        *,
        estudiante:Estudiante(estudiante_id, nombre_completo, rut),
        profesor:Profesor(profesor_id, nombre_completo)
      `)
      .eq('profesor_id', profesor_id)
      .order('fecha', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching anotaciones by profesor:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todas las anotaciones de los estudiantes de una asignatura
 */
export const getAnotacionesByAsignatura = async (req: Request, res: Response) => {
  try {
    const { asignatura_id } = req.params;

    console.log('🔍 Buscando anotaciones para asignatura:', asignatura_id);

    // Primero obtener los estudiantes del curso de la asignatura
    const { data: asignatura, error: asignaturaError } = await supabase
      .from('Asignatura')
      .select('curso_id')
      .eq('asignatura_id', asignatura_id)
      .maybeSingle();

    if (asignaturaError) {
      console.error('❌ Error al buscar asignatura:', asignaturaError);
      throw asignaturaError;
    }

    if (!asignatura) {
      console.warn('⚠️ Asignatura no encontrada:', asignatura_id);
      return res.json([]);
    }

    console.log('✅ Asignatura encontrada, curso_id:', asignatura.curso_id);

    // Obtener estudiantes matriculados en el curso
    const { data: matriculas, error: matriculasError } = await supabase
      .from('Matricula')
      .select('estudiante_id')
      .eq('curso_id', asignatura.curso_id)
      .eq('estado', 'Activo');

    if (matriculasError) {
      console.error('❌ Error al buscar matrículas:', matriculasError);
      throw matriculasError;
    }

    console.log('✅ Matrículas encontradas:', matriculas?.length || 0);

    const estudianteIds = matriculas?.map(m => m.estudiante_id) || [];

    if (estudianteIds.length === 0) {
      console.log('⚠️ No hay estudiantes en el curso');
      return res.json([]);
    }

    // Obtener anotaciones de esos estudiantes
    const { data, error } = await supabase
      .from('Anotaciones')
      .select(`
        *,
        estudiante:Estudiante(estudiante_id, nombre_completo, rut, numero_lista),
        profesor:Profesor(profesor_id, nombre_completo)
      `)
      .in('estudiante_id', estudianteIds)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('❌ Error al buscar anotaciones:', error);
      throw error;
    }

    console.log('✅ Anotaciones encontradas:', data?.length || 0);

    res.json(data || []);
  } catch (error: any) {
    console.error('❌ Error fetching anotaciones by asignatura:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crear una nueva anotación
 */
export const createAnotacion = async (req: Request, res: Response) => {
  try {
    const { estudiante_id, profesor_id, tipo_anotacion, descripcion, fecha } = req.body;

    // Validaciones
    if (!estudiante_id || !tipo_anotacion || !fecha) {
      return res.status(400).json({ error: 'estudiante_id, tipo_anotacion y fecha son requeridos' });
    }

    const validTipos = ['Positiva', 'Negativa', 'Neutra'];
    if (!validTipos.includes(tipo_anotacion)) {
      return res.status(400).json({ error: 'tipo_anotacion debe ser Positiva, Negativa o Neutra' });
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin
      .from('Anotaciones')
      .insert({
        estudiante_id,
        profesor_id,
        tipo_anotacion,
        descripcion,
        fecha
      })
      .select(`
        *,
        estudiante:Estudiante(estudiante_id, nombre_completo, rut),
        profesor:Profesor(profesor_id, nombre_completo)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating anotacion:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualizar una anotación
 */
export const updateAnotacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo_anotacion, descripcion, fecha } = req.body;

    const updates: any = {};
    if (tipo_anotacion !== undefined) {
      const validTipos = ['Positiva', 'Negativa', 'Neutra'];
      if (!validTipos.includes(tipo_anotacion)) {
        return res.status(400).json({ error: 'tipo_anotacion debe ser Positiva, Negativa o Neutra' });
      }
      updates.tipo_anotacion = tipo_anotacion;
    }
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (fecha !== undefined) updates.fecha = fecha;

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin
      .from('Anotaciones')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        estudiante:Estudiante(estudiante_id, nombre_completo, rut),
        profesor:Profesor(profesor_id, nombre_completo)
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Anotación no encontrada' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error updating anotacion:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Eliminar una anotación
 */
export const deleteAnotacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { error } = await supabaseAdmin
      .from('Anotaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Anotación eliminada exitosamente' });
  } catch (error: any) {
    console.error('Error deleting anotacion:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener estadísticas de anotaciones por estudiante
 */
export const getEstadisticasAnotaciones = async (req: Request, res: Response) => {
  try {
    const { estudiante_id } = req.params;

    const { data, error } = await supabase
      .from('Anotaciones')
      .select('tipo_anotacion')
      .eq('estudiante_id', estudiante_id);

    if (error) throw error;

    const stats = {
      total: data.length,
      positivas: data.filter(a => a.tipo_anotacion === 'Positiva').length,
      negativas: data.filter(a => a.tipo_anotacion === 'Negativa').length,
      neutras: data.filter(a => a.tipo_anotacion === 'Neutra').length
    };

    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching estadisticas anotaciones:', error);
    res.status(500).json({ error: error.message });
  }
};
