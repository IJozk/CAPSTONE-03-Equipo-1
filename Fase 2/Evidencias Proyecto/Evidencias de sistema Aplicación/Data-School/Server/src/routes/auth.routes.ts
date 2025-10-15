import { Router } from 'express'
import { AuthController } from '@/controllers/auth.controller'

const router = Router()
const authController = new AuthController()

// Rutas de autenticación
router.post('/register', authController.register.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.get('/me', authController.getCurrentUser.bind(authController))

// Rutas de recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword.bind(authController))
router.post('/reset-password', authController.resetPassword.bind(authController))

// Rutas de registro por tipo de usuario
router.post('/register/profesor', authController.registerProfesor.bind(authController))
router.post('/register/estudiante', authController.registerEstudiante.bind(authController))
router.post('/register/tutor', authController.registerTutor.bind(authController))
router.post('/register/administrativo', authController.registerAdministrativo.bind(authController))

export default router;