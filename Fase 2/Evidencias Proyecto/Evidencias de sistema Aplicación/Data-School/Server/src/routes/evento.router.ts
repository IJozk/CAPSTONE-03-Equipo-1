import { Router } from 'express'
import { EventoController } from '@/controllers/evento.controller'

const router = Router()
const eventoController = new EventoController()

// CRUD Eventos
router.post('/', eventoController.create.bind(eventoController))
router.get('/', eventoController.getAll.bind(eventoController))
router.get('/proximos', eventoController.getProximos.bind(eventoController))
router.get('/pasados', eventoController.getPasados.bind(eventoController))
router.get('/en-curso', eventoController.getEnCurso.bind(eventoController))
router.get('/:id', eventoController.getById.bind(eventoController))
router.get('/:id/alertas', eventoController.getAlertas.bind(eventoController))
router.put('/:id', eventoController.update.bind(eventoController))
router.delete('/:id', eventoController.delete.bind(eventoController))

export default router
