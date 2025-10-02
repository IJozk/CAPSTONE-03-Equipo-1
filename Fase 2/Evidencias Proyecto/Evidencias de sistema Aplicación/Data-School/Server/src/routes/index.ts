import { Router } from 'express';
// Import controllers here
// import userController from '../controllers/userController';

const router = Router();

// Example route
router.get('/status', (_req, res) => {
  res.json({ status: 'ok' });
});

// Add more routes here

export default router;