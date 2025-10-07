import { Router } from 'express'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { ROLES } from '@/constants/roles'

const router = Router()

// Ejemplo: Ruta protegida solo para usuarios autenticados
router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: 'Perfil del usuario',
    user: req.user
  })
})

// Ejemplo: Ruta solo para PROFESORES y ADMINISTRATIVOS
router.get('/dashboard/profesor',
  authenticate,
  authorize(ROLES.PROFESOR, ROLES.ADMINISTRATIVO),
  (req, res) => {
    res.json({
      message: 'Dashboard de profesor',
      user: req.user
    })
})

// Ejemplo: Ruta solo para ADMINISTRATIVOS
router.get('/admin/users',
  authenticate,
  authorize(ROLES.ADMINISTRATIVO),
  (req, res) => {
    res.json({
      message: 'Listado de usuarios (solo admin)',
      user: req.user
    })
})

// Ejemplo: Ruta solo para ESTUDIANTES
router.get('/student/grades',
  authenticate,
  authorize(ROLES.ESTUDIANTE),
  (req, res) => {
    res.json({
      message: 'Calificaciones del estudiante',
      user: req.user
    })
})

export default router
