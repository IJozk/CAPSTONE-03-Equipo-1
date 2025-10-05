import { Router } from 'express'
import authRoutes from './auth.routes'

const router = Router()

// Rutas de autenticación
router.use('/auth', authRoutes)

// Ruta de estado
router.get('/status', (_req, res) => {
  res.json({ status: 'ok' })
})

export default router
