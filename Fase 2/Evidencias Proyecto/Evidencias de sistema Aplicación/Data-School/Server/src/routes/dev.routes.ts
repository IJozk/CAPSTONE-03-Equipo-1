import { Router } from 'express'
import { DevController } from '@/controllers/dev.controller'

const router = Router()
const devController = new DevController()

// ⚠️ Solo para desarrollo - NUNCA exponer en producción
if (process.env.NODE_ENV !== 'production') {
  // Listar todos los usuarios
  router.get('/users', devController.listUsers.bind(devController))

  // Limpiar usuarios de prueba
  router.delete('/cleanup-test-users', devController.cleanupTestUsers.bind(devController))
}

export default router
