import { Router } from 'express'
import { UserController } from '@/controllers/user.controller'

const router = Router()
const userController = new UserController()

// Rutas de autenticación
router.get('/', userController.getAllUsers.bind(userController));


export default router;