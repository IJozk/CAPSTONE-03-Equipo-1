import { Router } from 'express'
import { UserController } from '@/controllers/user.controller'

const router = Router()
const userController = new UserController()

// Rutas de autenticación
router.get('/estudiantes', userController.getEstudiantes.bind(userController))


export default router;