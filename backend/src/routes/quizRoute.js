import express from 'express';
import { createQuiz, getAllQuizzes, getQuizById, deleteQuiz } from '../controllers/quizController.js';
import { authenticateUser, authenticateAdmin } from '../middleware/index.js';

const router = express.Router();

// Public routes
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);

// Admin only routes
router.post('/', authenticateUser, authenticateAdmin, createQuiz);
router.delete('/:id', authenticateUser, authenticateAdmin, deleteQuiz);

export default router;
