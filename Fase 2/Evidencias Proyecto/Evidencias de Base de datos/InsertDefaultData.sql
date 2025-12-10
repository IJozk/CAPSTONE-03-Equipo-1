-- ============================================
-- SCRIPT DE INSERCIÓN DE DATOS BASE
-- Sistema de Gestión Escolar
-- ============================================

-- Variables para el colegio (usar en todas las tablas que requieran colegio_id)
DO $$
DECLARE
    v_colegio_id UUID;
    v_anio_id INTEGER;
BEGIN
    -- ============================================
    -- 1. CREAR COLEGIO
    -- ============================================
    INSERT INTO public."Colegio" (
        colegio_id,
        nombre_colegio,
        direccion,
        fecha_fundacion,
        telefono,
        email,
        ciudad,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Escuela Básica Municipal',
        'Av. Principal #123',
        '2000-01-01',
        '+56912345678',
        'contacto@escuela.cl',
        'Concepción',
        NOW(),
        NOW()
    ) RETURNING colegio_id INTO v_colegio_id;

    RAISE NOTICE 'Colegio creado con ID: %', v_colegio_id;

    -- ============================================
    -- 2. ÁREAS ADMINISTRATIVAS
    -- ============================================
    INSERT INTO public."Area" (nombre_area, colegio_id, descripcion, jefe_area_id) VALUES
    ('Dirección', v_colegio_id, 'Director, Subdirector, Rector', NULL),
    ('UTP (Unidad Técnico Pedagógica)', v_colegio_id, 'Jefe UTP, Coordinadores académicos', NULL),
    ('Inspectoría General', v_colegio_id, 'Inspector General, Inspectores de patio', NULL),
    ('Orientación', v_colegio_id, 'Orientadores, Psicólogos escolares', NULL),
    ('Psicopedagogía', v_colegio_id, 'Psicopedagogos, Educadores diferenciales', NULL),
    ('Convivencia Escolar', v_colegio_id, 'Encargado de convivencia, Mediadores', NULL),
    ('PIE (Programa Integración Escolar)', v_colegio_id, 'Coordinador PIE, Profesionales de apoyo', NULL),
    ('Administración y Finanzas', v_colegio_id, 'Contador, Tesorero, Personal administrativo', NULL),
    ('Recursos Humanos', v_colegio_id, 'Encargado de RRHH, Personal de apoyo', NULL),
    ('Tecnologías de la Información', v_colegio_id, 'Encargado TI, Soporte técnico', NULL),
    ('Biblioteca/CRA', v_colegio_id, 'Encargado de biblioteca, Asistentes CRA', NULL),
    ('Enfermería', v_colegio_id, 'Enfermera, TENS, Paramédicos', NULL),
    ('Servicios Generales', v_colegio_id, 'Auxiliares, Personal de aseo y mantención', NULL),
    ('Secretaría', v_colegio_id, 'Secretarias, Recepcionistas', NULL);

    -- ============================================
    -- 3. ESPECIALIDADES (Perfeccionamiento Docente)
    -- ============================================
    INSERT INTO public."Especialidad" (created_at, nombre, area_conocimiento) VALUES
    -- Diplomados
    (NOW(), 'Diplomado en Educación Inclusiva', 'Pedagogía'),
    (NOW(), 'Diplomado en Evaluación para el Aprendizaje', 'Pedagogía'),
    (NOW(), 'Diplomado en Gestión Curricular', 'Pedagogía'),
    (NOW(), 'Diplomado en Convivencia Escolar', 'Psicopedagogía'),
    (NOW(), 'Diplomado en Neurociencias y Educación', 'Neuroeducación'),
    
    -- Postítulos
    (NOW(), 'Postítulo en Educación Diferencial', 'Educación Especial'),
    (NOW(), 'Postítulo en Matemáticas', 'Matemáticas'),
    (NOW(), 'Postítulo en Lenguaje', 'Lenguaje'),
    (NOW(), 'Postítulo en Liderazgo Educativo', 'Gestión'),
    
    -- Magíster
    (NOW(), 'Magíster en Educación', 'Pedagogía'),
    (NOW(), 'Magíster en Gestión Educacional', 'Gestión'),
    (NOW(), 'Magíster en Currículum', 'Pedagogía'),
    
    -- Certificaciones y Talleres
    (NOW(), 'Certificación en Metodologías Activas', 'Pedagogía'),
    (NOW(), 'Certificación en Tecnologías Educativas', 'TIC'),
    (NOW(), 'Taller de Primeros Auxilios Psicológicos', 'Psicología'),
    (NOW(), 'Taller de Resolución de Conflictos', 'Convivencia'),
    (NOW(), 'Certificación en Evaluación Auténtica', 'Evaluación');

    -- ============================================
    -- 4. MATERIAS (Asignaturas del Currículum Nacional)
    -- ============================================
    INSERT INTO public."Materia" (nombre, descripcion) VALUES
    -- Educación Parvularia
    ('Lenguaje Verbal', 'Desarrollo del lenguaje oral y escrito en educación inicial'),
    ('Pensamiento Matemático', 'Desarrollo de nociones matemáticas básicas'),
    ('Exploración del Entorno', 'Conocimiento del mundo natural y social'),
    
    -- Educación Básica - Lenguaje
    ('Lenguaje y Comunicación', 'Comprensión lectora, expresión oral y escrita'),
    ('Inglés', 'Idioma extranjero inglés'),
    
    -- Educación Básica - Matemáticas
    ('Matemática', 'Números, geometría, datos y probabilidades'),
    
    -- Educación Básica - Ciencias
    ('Ciencias Naturales', 'Biología, física, química y ciencias de la Tierra'),
    
    -- Educación Básica - Sociales
    ('Historia, Geografía y Ciencias Sociales', 'Historia de Chile y universal, geografía, formación ciudadana'),
    
    -- Educación Básica - Artes
    ('Artes Visuales', 'Expresión artística y apreciación visual'),
    ('Música', 'Educación musical, interpretación y apreciación'),
    
    -- Educación Básica - Otras
    ('Educación Física y Salud', 'Actividad física, deportes y vida saludable'),
    ('Tecnología', 'Uso de tecnologías digitales y diseño'),
    ('Orientación', 'Desarrollo personal y social'),
    ('Religión', 'Formación religiosa (optativa)'),
    
    -- Educación Media - Científico Humanista
    ('Lengua y Literatura', 'Literatura, análisis de textos, escritura'),
    ('Filosofía', 'Pensamiento filosófico y ético'),
    ('Educación Ciudadana', 'Formación ciudadana y democracia'),
    ('Biología', 'Ciencias de la vida'),
    ('Química', 'Estudio de la materia y sus transformaciones'),
    ('Física', 'Estudio de fenómenos físicos'),
    
    -- Educación Media - Formación Diferenciada
    ('Participación y Argumentación en Democracia', 'Formación ciudadana profundizada'),
    ('Comprensión Histórica del Presente', 'Análisis histórico contemporáneo'),
    ('Límites, Derivadas e Integrales', 'Cálculo diferencial e integral'),
    ('Probabilidades y Estadística Descriptiva e Inferencial', 'Matemáticas aplicadas'),
    ('Ciencias de la Salud', 'Biología aplicada'),
    ('Ciencias del Ejercicio Físico y Deportivo', 'Educación física profundizada');

    -- ============================================
    -- 5. NIVELES Y CURSOS
    -- ============================================
    INSERT INTO public."NivelCurso" (created_at, nivel, numero) VALUES
    -- Educación Parvularia
    (NOW(), 'SalaCuna', 0),  -- Sala Cuna
    (NOW(), 'Prekinder', 0),  -- Pre-Kinder
    (NOW(), 'Kinder', 0),   -- Kinder
    
    -- Educación Básica
    (NOW(), 'Básica', 1),
    (NOW(), 'Básica', 2),
    (NOW(), 'Básica', 3),
    (NOW(), 'Básica', 4),
    (NOW(), 'Básica', 5),
    (NOW(), 'Básica', 6),
    (NOW(), 'Básica', 7),
    (NOW(), 'Básica', 8),
    
    -- Educación Media
    (NOW(), 'Media', 1),  -- I Medio
    (NOW(), 'Media', 2),  -- II Medio
    (NOW(), 'Media', 3),  -- III Medio
    (NOW(), 'Media', 4);  -- IV Medio

    -- ============================================
    -- 6. PROFESIONES Y OFICIOS
    -- ============================================
    INSERT INTO public."Profesion" (created_at, nombre, descripcion) VALUES
    -- Docentes
    (NOW(), 'Profesor(a) de Educación Básica', 'Docente especializado en enseñanza básica general'),
    (NOW(), 'Profesor(a) de Educación Parvularia', 'Docente especializado en primera infancia'),
    (NOW(), 'Profesor(a) de Educación Media', 'Docente especializado en enseñanza media'),
    (NOW(), 'Profesor(a) de Matemáticas', 'Docente especialista en matemáticas'),
    (NOW(), 'Profesor(a) de Lenguaje', 'Docente especialista en lenguaje y comunicación'),
    (NOW(), 'Profesor(a) de Inglés', 'Docente especialista en idioma inglés'),
    (NOW(), 'Profesor(a) de Historia', 'Docente especialista en historia y ciencias sociales'),
    (NOW(), 'Profesor(a) de Ciencias', 'Docente especialista en ciencias naturales'),
    (NOW(), 'Profesor(a) de Educación Física', 'Docente especialista en educación física y deportes'),
    (NOW(), 'Profesor(a) de Artes Visuales', 'Docente especialista en artes visuales'),
    (NOW(), 'Profesor(a) de Música', 'Docente especialista en educación musical'),
    (NOW(), 'Profesor(a) de Tecnología', 'Docente especialista en tecnología'),
    (NOW(), 'Profesor(a) Diferencial', 'Educador diferencial o de educación especial'),
    
    -- Profesionales de Apoyo
    (NOW(), 'Psicólogo(a) Educacional', 'Profesional de apoyo psicológico'),
    (NOW(), 'Psicopedagogo(a)', 'Profesional de apoyo pedagógico'),
    (NOW(), 'Orientador(a)', 'Profesional de orientación vocacional y personal'),
    (NOW(), 'Fonoaudiólogo(a)', 'Profesional de terapia del lenguaje'),
    (NOW(), 'Terapeuta Ocupacional', 'Profesional de terapia ocupacional'),
    (NOW(), 'Trabajador(a) Social', 'Profesional de trabajo social'),
    (NOW(), 'Nutricionista', 'Profesional de nutrición y alimentación'),
    (NOW(), 'Kinesiólogo(a)', 'Profesional de kinesiología'),
    
    -- Directivos y Coordinadores
    (NOW(), 'Director(a)', 'Director del establecimiento'),
    (NOW(), 'Subdirector(a)', 'Subdirector del establecimiento'),
    (NOW(), 'Inspector(a) General', 'Inspector general'),
    (NOW(), 'Jefe UTP', 'Jefe de Unidad Técnico Pedagógica'),
    (NOW(), 'Coordinador(a) Académico', 'Coordinador de áreas académicas'),
    (NOW(), 'Coordinador(a) PIE', 'Coordinador del Programa de Integración Escolar'),
    (NOW(), 'Encargado(a) Convivencia Escolar', 'Responsable de convivencia'),
    
    -- Administrativos
    (NOW(), 'Contador(a)', 'Profesional contable'),
    (NOW(), 'Secretario(a)', 'Personal de secretaría'),
    (NOW(), 'Recepcionista', 'Personal de recepción'),
    (NOW(), 'Asistente Administrativo', 'Apoyo administrativo general'),
    (NOW(), 'Encargado(a) de RRHH', 'Recursos humanos'),
    (NOW(), 'Tesorero(a)', 'Manejo de finanzas'),
    
    -- Servicios de Apoyo
    (NOW(), 'Bibliotecario(a)/Encargado(a) CRA', 'Encargado de biblioteca'),
    (NOW(), 'Informático(a)/Encargado(a) TI', 'Soporte tecnológico'),
    (NOW(), 'Enfermero(a)', 'Personal de enfermería'),
    (NOW(), 'TENS', 'Técnico en enfermería de nivel superior'),
    (NOW(), 'Paramédico', 'Personal paramédico'),
    
    -- Personal de Servicios
    (NOW(), 'Auxiliar de Servicios', 'Personal de aseo y mantención'),
    (NOW(), 'Portero(a)', 'Personal de portería'),
    (NOW(), 'Manipulador(a) de Alimentos', 'Personal de cocina/casino'),
    (NOW(), 'Conductor(a)', 'Conductor de transporte escolar'),
    (NOW(), 'Técnico en Mantención', 'Mantención de infraestructura'),
    
    -- Asistentes de la Educación
    (NOW(), 'Asistente de Aula', 'Apoyo en sala de clases'),
    (NOW(), 'Inspector(a) de Patio', 'Supervisión de recreos'),
    (NOW(), 'Asistente de Párvulos', 'Apoyo en educación parvularia');

    -- ============================================
    -- 7. TIPOS DE ALERTA
    -- ============================================
    INSERT INTO public."TipoAlerta" (nombre, descripcion, prioridad, color, requiere_accion, activo) VALUES
    ('Asistencia Crítica', 'Estudiante con asistencia menor al 85%', 1, '#FF0000', true, true),
    ('Riesgo de Repitencia', 'Estudiante en riesgo de reprobar el año', 1, '#FF4444', true, true),
    ('Rendimiento Académico Bajo', 'Promedio general bajo 4.0', 2, '#FF8C00', true, true),
    ('Conducta Grave', 'Problemas severos de comportamiento', 1, '#DC143C', true, true),
    ('Conducta Moderada', 'Problemas de comportamiento recurrentes', 2, '#FFD700', true, true),
    ('Pago Atrasado - Crítico', 'Más de 3 meses de atraso', 1, '#1E90FF', true, true),
    ('Pago Atrasado', 'Mensualidad pendiente', 3, '#87CEEB', false, true),
    ('Documentación Pendiente', 'Documentos importantes sin entregar', 3, '#32CD32', false, true),
    ('Certificado Médico Requerido', 'Necesita presentar certificado médico', 4, '#90EE90', false, true),
    ('Necesidad de Apoyo PIE', 'Requiere evaluación para PIE', 2, '#9370DB', true, true),
    ('Seguimiento Psicológico', 'Requiere atención psicológica', 2, '#BA55D3', true, true),
    ('Ausentismo Prolongado', 'Más de 5 días consecutivos sin asistir', 2, '#FFA500', true, true),
    ('Matrícula Vencida', 'Proceso de matrícula incompleto', 2, '#FF6347', true, true),
    ('Actualizar Datos', 'Información de contacto desactualizada', 4, '#20B2AA', false, true),
    ('Información General', 'Comunicaciones generales sin urgencia', 5, '#808080', false, true);

    -- ============================================
    -- 8. TIPOS DE ASIGNATURA
    -- ============================================
    INSERT INTO public."TipoAsignatura" (nombre, descripcion) VALUES
    ('Obligatoria', 'Asignatura del currículo nacional obligatorio'),
    ('Electiva', 'Asignatura de formación diferenciada o electiva'),
    ('Extracurricular', 'Actividad fuera del currículo regular'),
    ('Taller', 'Taller práctico o de reforzamiento'),
    ('Apoyo PIE', 'Asignatura de apoyo del Programa de Integración Escolar'),
    ('Nivelación', 'Curso de nivelación o reforzamiento académico');

    -- ============================================
    -- 9. TIPOS DE PARENTESCO
    -- ============================================
    INSERT INTO public."Tipo_parentesco" (nombre, descripcion) VALUES
    ('Padre', 'Padre biológico o adoptivo'),
    ('Madre', 'Madre biológica o adoptiva'),
    ('Tutor Legal', 'Tutor legal asignado por tribunal'),
    ('Apoderado Suplente', 'Apoderado autorizado como suplente'),
    ('Abuelo/a', 'Abuelo o abuela'),
    ('Tío/a', 'Tío o tía'),
    ('Hermano/a Mayor', 'Hermano o hermana mayor de edad con tutela'),
    ('Padrastro/Madrastra', 'Pareja del padre o madre'),
    ('Otro Familiar', 'Otro familiar responsable'),
    ('Familia de Acogida', 'Familia de acogida SENAME'),
    ('Hogar de Menores', 'Representante de hogar o institución');

    -- ============================================
    -- 10. AÑO ACADÉMICO ACTUAL
    -- ============================================
    INSERT INTO public."AnioAcademico" (
        colegio_id,
        anio,
        fecha_inicio,
        fecha_termino,
        activo,
        created_at
    ) VALUES (
        v_colegio_id,
        EXTRACT(YEAR FROM CURRENT_DATE),
        MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 3, 1),
        MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 12, 20),
        true,
        NOW()
    ) RETURNING anio_id INTO v_anio_id;

    RAISE NOTICE 'Año académico creado con ID: %', v_anio_id;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATOS BASE INSERTADOS EXITOSAMENTE';
    RAISE NOTICE 'Colegio ID: %', v_colegio_id;
    RAISE NOTICE 'Año Académico ID: %', v_anio_id;
    RAISE NOTICE '============================================';

END $$;