import express from 'express';
import { submitQuiz, getMyAttempts } from '../controllers/userQuizController.js';
import { authenticateUser } from '../middleware/index.js';

const router = express.Router();

router.post('/submit', authenticateUser, submitQuiz);
router.get('/my-attempts', authenticateUser, getMyAttempts);

export default router;
