import { Router } from 'express';
import {
  getAnotacionesByEstudiante,
  getAnotacionesByProfesor,
  getAnotacionesByAsignatura,
  createAnotacion,
  updateAnotacion,
  deleteAnotacion,
  getEstadisticasAnotaciones
} from '../controllers/anotaciones.controller';

const router = Router();

// Rutas para obtener anotaciones
router.get('/estudiante/:estudiante_id', getAnotacionesByEstudiante);
router.get('/profesor/:profesor_id', getAnotacionesByProfesor);
router.get('/asignatura/:asignatura_id', getAnotacionesByAsignatura);
router.get('/estadisticas/:estudiante_id', getEstadisticasAnotaciones);

// CRUD
router.post('/', createAnotacion);
router.put('/:id', updateAnotacion);
router.delete('/:id', deleteAnotacion);

export default router;
