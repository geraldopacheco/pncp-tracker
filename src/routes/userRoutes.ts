import express from 'express';
import UserController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Rotas públicas
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Rotas protegidas
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.get('/saved-contracts', authMiddleware, UserController.getSavedContracts);
router.post('/save-contract/:contractId', authMiddleware, UserController.saveContract);
router.delete('/save-contract/:contractId', authMiddleware, UserController.removeContract);

export default router;
