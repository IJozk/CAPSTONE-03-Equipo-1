import { Router } from 'express'
import authRoutes from './auth.routes'
import protectedRoutes from './protected.routes'
import schoolRoutes from './school.routes'
import devRoutes from './dev.routes'

const router = Router()

// Rutas de autenticación
router.use('/auth', authRoutes)

// Rutas de colegio
router.use('/school', schoolRoutes)

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
