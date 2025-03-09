import express from 'express';
import ContractController from '../controllers/contractController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Rotas públicas
router.get('/search', ContractController.searchContracts);
router.get('/details/:contractId', ContractController.getContractDetails);

// Rotas protegidas
router.post('/comment/:contractId', authMiddleware, ContractController.addComment);
router.get('/comments/:contractId', ContractController.getComments);
router.delete('/comment/:commentId', authMiddleware, ContractController.deleteComment);

export default router;
