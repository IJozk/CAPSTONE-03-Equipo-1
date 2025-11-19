import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class EstudianteController {

    // Crear nuevo estudiante
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                user_id,
                nombre_completo,
                fecha_nacimiento,
                rut,
                genero,
                direccion,
                telefono,
                email
            } = req.body

            // Validar campos requeridos
            if (!nombre_completo || !fecha_nacimiento) {
                return res.status(400).json({ message: 'nombre_completo y fecha_nacimiento son requeridos' })
            }

            // Si tiene user_id, verificar que existe y tiene role ESTUDIANTE
            if (user_id) {
                const { data: userData, error: userError } = await supabaseAdmin!
                    .from('User')
                    .select('role')
                    .eq('user_id', user_id)
                    .single()

                if (userError || !userData) {
                    return res.status(404).json({ message: 'Usuario no encontrado' })
                }

                if (userData.role !== 'ESTUDIANTE_APODERADO') {
                    return res.status(400).json({ message: 'El usuario debe tener rol ESTUDIANTE' })
                }
            }

            // Crear estudiante
            const { data, error } = await supabaseAdmin!
                .from('Estudiante')
                .insert({
                    user_id,
                    nombre_completo,
                    fecha_nacimiento,
                    rut,
                    genero,
                    direccion,
                    telefono,
                    email,
                    estado_activo: true
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

        // Obtener todos los estudiantes activos o todos
        public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { incluir_inactivos } = req.query;

            let query = supabaseAdmin!
            .from('Estudiante')
            .select('*, User(email_address, is_active)');

            if (incluir_inactivos !== 'true') {
            query = query.eq('estado_activo', true);
            }

            const { data, error } = await query;

            if (error) throw error;

            // 🔹 Reemplazar teléfonos vacíos por 'N/A'
            const estudiantesFormateados = (data || []).map(e => ({
            ...e,
            telefono: e.telefono && e.telefono.trim() !== '' ? e.telefono : 'N/A'
            }));

            return res.status(200).json(estudiantesFormateados);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
        }

    // Obtener estudiante por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Estudiante')
                .select('*, User(email_address, is_active)')
                .eq('estudiante_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Obtener curso actual del estudiante desde la tabla Matricula
            // Solo buscamos matrículas activas (estado_matricula_id = 1)
            const { data: cursoData, error: cursoError } = await supabaseAdmin!
                .from('Matricula')
                .select('curso_id, Curso(curso_id, nombre, nivel_id)')
                .eq('estudiante_id', id)
                .eq('estado_matricula_id', 1)
                .maybeSingle()

            // Log para debugging
            console.log('📚 Query curso para estudiante:', id)
            console.log('📚 Resultado curso_actual:', cursoData)
            console.log('📚 Error curso_actual:', cursoError)

            const tutores = await supabaseAdmin!
                .from('Tutor')
                .select('Tutor(nombre_completo, telefono)')
                .eq('estudiante_id', id)

            return res.status(200).json({
                ...data,
                curso_actual: cursoData
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar datos del estudiante (NO modifica User)
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre_completo,
                fecha_nacimiento,
                rut,
                genero,
                direccion,
                telefono,
                email,
                estado_activo
            } = req.body

            // Solo actualizar campos de la tabla Estudiante
            const updateData: any = {}
            if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo
            if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento
            if (rut !== undefined) updateData.rut = rut
            if (genero !== undefined) updateData.genero = genero
            if (direccion !== undefined) updateData.direccion = direccion
            if (telefono !== undefined) updateData.telefono = telefono
            if (email !== undefined) updateData.email = email
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Estudiante')
                .update(updateData)
                .eq('estudiante_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar estudiante (soft delete)
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Deshabilitar en tabla Estudiante
            const { data: estudianteData, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .update({
                    estado_activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('estudiante_id', id)
                .select('user_id')
                .single()

            if (estudianteError) throw estudianteError

            if (!estudianteData) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Si tiene cuenta de usuario, deshabilitarla
            if (estudianteData.user_id) {
                const { error: userError } = await supabaseAdmin!
                    .from('User')
                    .update({
                        is_active: false,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', estudianteData.user_id)

                if (userError) throw userError
            }

            return res.status(200).json({ message: 'Estudiante deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Habilitar estudiante
    public async enable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Habilitar en tabla Estudiante
            const { data: estudianteData, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .update({
                    estado_activo: true,
                    updated_at: new Date().toISOString()
                })
                .eq('estudiante_id', id)
                .select('user_id')
                .single()

            if (estudianteError) throw estudianteError

            if (!estudianteData) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Si tiene cuenta de usuario, habilitarla
            if (estudianteData.user_id) {
                const { error: userError } = await supabaseAdmin!
                    .from('User')
                    .update({
                        is_active: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', estudianteData.user_id)

                if (userError) throw userError
            }

            return res.status(200).json({ message: 'Estudiante habilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener dashboard del estudiante con estadísticas
    public async getDashboard(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            console.log('📊 Obteniendo dashboard para estudiante:', id);

            // 1. Obtener datos del estudiante y su matrícula activa
            const { data: estudiante, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .select('*, User(email_address)')
                .eq('estudiante_id', id)
                .single();

            if (estudianteError) throw estudianteError;
            if (!estudiante) {
                return res.status(404).json({ message: 'Estudiante no encontrado' });
            }

            // 2. Obtener matrícula activa y curso
            console.log('🔍 Buscando matrícula para estudiante:', id);

            // Estado activo = 1 (basado en otras queries del sistema)
            const { data: matricula, error: matriculaError } = await supabaseAdmin!
                .from('Matricula')
                .select(`
                    *,
                    Curso(
                        curso_id,
                        nombre,
                        nivel_id
                    )
                `)
                .eq('estudiante_id', id)
                .eq('estado_matricula_id', 1)
                .maybeSingle();

            if (matriculaError) {
                console.error('❌ Error obteniendo matrícula:', matriculaError);
            } else if (!matricula) {
                console.warn('⚠️ No se encontró matrícula activa para el estudiante');
            } else {
                console.log('✅ Matrícula encontrada:', {
                    matricula_id: matricula.matricula_id,
                    curso_id: matricula.curso_id,
                    curso: matricula.Curso
                });
            }

            const cursoId = matricula?.curso_id;

            // 3. Obtener asignaturas del curso (solo si hay curso_id)
            console.log('🔍 Buscando asignaturas para curso:', cursoId);

            let asignaturas: any[] = [];
            let asignaturasError = null;

            if (cursoId) {
                const result = await supabaseAdmin!
                    .from('Asignatura')
                    .select(`
                        asignatura_id,
                        nombre,
                        codigo,
                        Profesor(nombre_completo)
                    `)
                    .eq('curso_id', cursoId)
                    .eq('estado_activo', true);

                asignaturas = result.data || [];
                asignaturasError = result.error;

                if (asignaturasError) {
                    console.error('❌ Error obteniendo asignaturas:', asignaturasError);
                } else {
                    console.log(`✅ Asignaturas encontradas: ${asignaturas?.length || 0}`);
                }
            } else {
                console.warn('⚠️ No se puede buscar asignaturas sin curso_id');
            }

            // 4. Calcular promedio general y obtener notas recientes
            console.log('🔍 Buscando resultados de evaluaciones para estudiante:', id);

            const { data: resultados, error: resultadosError } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select(`
                    *,
                    Evaluacion(
                        nombre,
                        fecha_evaluacion,
                        Asignatura(nombre)
                    )
                `)
                .eq('estudiante_id', id)
                .order('created_at', { ascending: false })
                .limit(100);

            if (resultadosError) {
                console.error('❌ Error obteniendo resultados:', resultadosError);
            } else {
                console.log(`✅ Resultados encontrados: ${resultados?.length || 0}`);
            }

            // Calcular promedio general
            let promedioGeneral = 0;
            const promediosPorAsignatura: any = {};

            if (resultados && resultados.length > 0) {
                // Agrupar notas por asignatura
                resultados.forEach((resultado: any) => {
                    const asignaturaId = resultado.Evaluacion?.Asignatura?.nombre;
                    if (!asignaturaId) return;

                    if (!promediosPorAsignatura[asignaturaId]) {
                        promediosPorAsignatura[asignaturaId] = {
                            notas: [],
                            suma: 0,
                            count: 0
                        };
                    }

                    if (resultado.nota) {
                        promediosPorAsignatura[asignaturaId].notas.push(resultado.nota);
                        promediosPorAsignatura[asignaturaId].suma += resultado.nota;
                        promediosPorAsignatura[asignaturaId].count += 1;
                    }
                });

                // Calcular promedio por asignatura
                const promedios = Object.values(promediosPorAsignatura).map((asig: any) =>
                    asig.count > 0 ? asig.suma / asig.count : 0
                );

                // Calcular promedio general
                if (promedios.length > 0) {
                    promedioGeneral = promedios.reduce((a: number, b: number) => a + b, 0) / promedios.length;
                }
            }

            // Notas recientes (últimas 5)
            const notasRecientes = resultados?.slice(0, 5).map((r: any) => ({
                evaluacion_nombre: r.Evaluacion?.nombre,
                asignatura_nombre: r.Evaluacion?.Asignatura?.nombre,
                nota: r.nota,
                puntaje: r.puntaje_obtenido,
                fecha: r.Evaluacion?.fecha_evaluacion,
                created_at: r.created_at
            })) || [];

            // 5. Calcular porcentaje de asistencia
            const { data: asistencias, error: asistenciasError } = await supabaseAdmin!
                .from('Asistencia')
                .select('presente')
                .eq('estudiante_id', id);

            if (asistenciasError) console.error('Error obteniendo asistencias:', asistenciasError);

            let porcentajeAsistencia = 0;
            if (asistencias && asistencias.length > 0) {
                const presentes = asistencias.filter((a: any) => a.presente).length;
                porcentajeAsistencia = Math.round((presentes / asistencias.length) * 100);
            }

            // 6. Obtener anotaciones del estudiante
            const { data: anotaciones, error: anotacionesError } = await supabaseAdmin!
                .from('Anotaciones')
                .select('tipo_anotacion')
                .eq('estudiante_id', id);

            if (anotacionesError) console.error('Error obteniendo anotaciones:', anotacionesError);

            const anotacionesStats = {
                positivas: anotaciones?.filter((a: any) => a.tipo_anotacion === 'Positiva').length || 0,
                negativas: anotaciones?.filter((a: any) => a.tipo_anotacion === 'Negativa').length || 0,
                neutras: anotaciones?.filter((a: any) => a.tipo_anotacion === 'Neutra').length || 0
            };

            // 7. Obtener evaluaciones próximas (próximos 30 días)
            const hoy = new Date();
            const en30Dias = new Date();
            en30Dias.setDate(hoy.getDate() + 30);

            const { data: evaluacionesProximas, error: evalProximasError } = await supabaseAdmin!
                .from('Evaluacion')
                .select(`
                    evaluacion_id,
                    nombre,
                    fecha_evaluacion,
                    tipo,
                    Asignatura(nombre)
                `)
                .in('asignatura_id', asignaturas?.map((a: any) => a.asignatura_id) || [])
                .gte('fecha_evaluacion', hoy.toISOString().split('T')[0])
                .lte('fecha_evaluacion', en30Dias.toISOString().split('T')[0])
                .order('fecha_evaluacion', { ascending: true })
                .limit(5);

            if (evalProximasError) console.error('Error obteniendo evaluaciones próximas:', evalProximasError);

            // 8. Obtener horario del día actual
            const diasSemana: { [key: number]: string } = {
                0: 'DOMINGO',
                1: 'LUNES',
                2: 'MARTES',
                3: 'MIERCOLES',
                4: 'JUEVES',
                5: 'VIERNES',
                6: 'SABADO'
            };

            const diaActual = new Date().getDay(); // 0-6
            const horarioHoy: any[] = [];

            if (asignaturas && asignaturas.length > 0 && diaActual >= 1 && diaActual <= 5) {
                // Solo lunes a viernes, buscar por asignaturas del estudiante
                const asignaturasIds = asignaturas.map((a: any) => a.asignatura_id);

                const { data: horarioData, error: horarioError } = await supabaseAdmin!
                    .from('Horario')
                    .select(`
                        *,
                        Asignatura(nombre, Profesor(nombre_completo)),
                        Sala(nombre)
                    `)
                    .in('asignatura_id', asignaturasIds)
                    .eq('dia_semana', diaActual)
                    .eq('estado_activo', true)
                    .order('hora_inicio', { ascending: true });

                if (!horarioError && horarioData) {
                    horarioData.forEach((h: any) => {
                        horarioHoy.push({
                            asignatura: h.Asignatura?.nombre || 'Sin asignatura',
                            profesor: h.Asignatura?.Profesor?.nombre_completo || 'Sin profesor',
                            sala: h.Sala?.nombre || 'Sin sala',
                            horario: `${h.hora_inicio} - ${h.hora_termino}`,
                            hora_inicio: h.hora_inicio,
                            hora_termino: h.hora_termino
                        });
                    });
                }
            }

            // 9. Obtener eventos próximos (próximos 7 días)
            const en7Dias = new Date();
            en7Dias.setDate(hoy.getDate() + 7);

            const eventos: any[] = [];

            // Agregar evaluaciones próximas (próximos 7 días destacadas)
            if (evaluacionesProximas && evaluacionesProximas.length > 0) {
                evaluacionesProximas.forEach((ev: any) => {
                    const fechaEval = new Date(ev.fecha_evaluacion);
                    if (fechaEval <= en7Dias) {
                        eventos.push({
                            tipo: 'evaluacion',
                            titulo: ev.nombre,
                            descripcion: `${ev.tipo} - ${ev.Asignatura?.nombre}`,
                            fecha: ev.fecha_evaluacion,
                            color: 'red' // Color distintivo para evaluaciones
                        });
                    }
                });
            }

            // Agregar eventos generales (próximos 7 días)
            const { data: eventosGenerales, error: eventosError } = await supabaseAdmin!
                .from('Evento')
                .select(`
                    evento_id,
                    nombre,
                    lugar,
                    fecha_inicio,
                    fecha_fin
                `)
                .gte('fecha_inicio', hoy.toISOString().split('T')[0])
                .lte('fecha_inicio', en7Dias.toISOString().split('T')[0])
                .order('fecha_inicio', { ascending: true });

            if (!eventosError && eventosGenerales && eventosGenerales.length > 0) {
                eventosGenerales.forEach((ev: any) => {
                    eventos.push({
                        tipo: 'evento',
                        titulo: ev.nombre,
                        descripcion: ev.lugar ? `Lugar: ${ev.lugar}` : 'Evento escolar',
                        fecha: ev.fecha_inicio,
                        color: 'green' // Color distintivo para eventos
                    });
                });
            }

            // Ordenar eventos por fecha
            eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

            // 10. Construir respuesta del dashboard
            const dashboard = {
                estudiante: {
                    estudiante_id: estudiante.estudiante_id,
                    nombre_completo: estudiante.nombre_completo,
                    rut: estudiante.rut,
                    email: estudiante.email || estudiante.User?.email_address
                },
                curso: matricula ? {
                    curso_id: matricula.Curso.curso_id,
                    nombre: matricula.Curso.nombre,
                    nivel_id: matricula.Curso.nivel_id
                } : null,
                stats: {
                    promedio_general: Math.round(promedioGeneral * 10) / 10,
                    porcentaje_asistencia: porcentajeAsistencia,
                    total_asignaturas: asignaturas?.length || 0,
                    evaluaciones_proximas: evaluacionesProximas?.length || 0,
                    anotaciones: anotacionesStats
                },
                asignaturas: asignaturas?.map((asig: any) => ({
                    asignatura_id: asig.asignatura_id,
                    nombre: asig.nombre,
                    codigo: asig.codigo,
                    profesor: asig.Profesor?.nombre_completo,
                    promedio: promediosPorAsignatura[asig.nombre]?.count > 0
                        ? Math.round((promediosPorAsignatura[asig.nombre].suma / promediosPorAsignatura[asig.nombre].count) * 10) / 10
                        : null
                })) || [],
                notas_recientes: notasRecientes,
                evaluaciones_proximas: evaluacionesProximas?.map((ev: any) => ({
                    evaluacion_id: ev.evaluacion_id,
                    nombre: ev.nombre,
                    asignatura: ev.Asignatura?.nombre,
                    fecha: ev.fecha_evaluacion,
                    tipo: ev.tipo
                })) || [],
                horario_hoy: horarioHoy,
                eventos_proximos: eventos
            };

            console.log('✅ Dashboard generado exitosamente');

            return res.status(200).json(dashboard);

        } catch (error: any) {
            console.error('❌ Error obteniendo dashboard:', error);
            return res.status(500).json({ message: error.message });
        }
    }
}
