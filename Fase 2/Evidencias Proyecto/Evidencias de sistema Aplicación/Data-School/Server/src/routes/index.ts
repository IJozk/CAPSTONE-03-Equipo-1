import { Router } from 'express'
import authRoutes from './auth.routes'
import protectedRoutes from './protected.routes'
import schoolRoutes from './school.routes'
import userRoutes from './user.router'
import devRoutes from './dev.routes'
import profesorRoutes from './profesor.router'
import estudianteRoutes from './estudiante.router'
import administrativoRoutes from './administrativo.router'
import tutorRoutes from './tutor.router'
import asignaturaRoutes from './asignatura.router'
import cursoRoutes from './curso.router'

const router = Router()

// Rutas de autenticación
router.use('/auth', authRoutes)

// Rutas de colegio
router.use('/school', schoolRoutes)

// Rutas data usuarios
router.use('/users', userRoutes)

// Rutas CRUD por tipo de usuario
router.use('/profesores', profesorRoutes)
router.use('/estudiantes', estudianteRoutes)
router.use('/administrativos', administrativoRoutes)
router.use('/tutores', tutorRoutes)

// Rutas CRUD de entidades académicas
router.use('/asignaturas', asignaturaRoutes)
router.use('/cursos', cursoRoutes)

// Rutas protegidas
router.use('/protected', protectedRoutes)

// Rutas de desarrollo (solo en dev)
if (process.env.NODE_ENV !== 'production') {
  router.use('/dev', devRoutes)
}

// Ruta de estado
router.get('/status', (_req, res) => {
  res.json({ status: 'ok' })
})

export default router
