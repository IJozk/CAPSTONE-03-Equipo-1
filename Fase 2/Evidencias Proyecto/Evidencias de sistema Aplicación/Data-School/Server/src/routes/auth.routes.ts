import { Router } from 'express'
import { AuthController } from '@/controllers/auth.controller'

const router = Router()
const authController = new AuthController()

// Rutas de autenticación
router.post('/register', authController.register.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.get('/me', authController.getCurrentUser.bind(authController))

export default router;