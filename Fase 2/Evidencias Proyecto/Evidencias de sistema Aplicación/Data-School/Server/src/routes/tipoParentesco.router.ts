import { Router } from 'express'
import { TipoParentescoController } from '@/controllers/tipoParentesco.controller'

const router = Router()
const tipoParentescoController = new TipoParentescoController()

router.get('/', tipoParentescoController.getAll)
router.get('/:id', tipoParentescoController.getById)
router.post('/', tipoParentescoController.create)
router.put('/:id', tipoParentescoController.update)
router.delete('/:id', tipoParentescoController.delete)

export default router
