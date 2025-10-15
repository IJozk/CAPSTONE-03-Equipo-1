import { Router } from 'express'
import { SchoolController } from '@/controllers/school.controller'

const router = Router()
const schoolController = new SchoolController()

// Rutas de autenticación

router.get('/infoColegio', schoolController.getSchoolInfo.bind(schoolController))


export default router;