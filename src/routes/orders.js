import express from 'express';
import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder, // Добавляем импорт
    deleteOrder
} from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;