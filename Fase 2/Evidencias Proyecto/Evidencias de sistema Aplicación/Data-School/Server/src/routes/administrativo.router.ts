import { Router } from 'express'
import { AdministrativoController } from '@/controllers/administrativo.controller'

const router = Router()
const administrativoController = new AdministrativoController()

// CRUD Administrativos
router.post('/', administrativoController.create.bind(administrativoController))
router.get('/', administrativoController.getAll.bind(administrativoController))
router.get('/:id', administrativoController.getById.bind(administrativoController))
router.put('/:id', administrativoController.update.bind(administrativoController))
router.patch('/:id/disable', administrativoController.disable.bind(administrativoController))
router.patch('/:id/enable', administrativoController.enable.bind(administrativoController))

export default router
