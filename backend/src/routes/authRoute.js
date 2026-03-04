import express from 'express';
import { register, login, getProfile, getAllProfile, deleteProfile } from '../controllers/authController.js';
import { authenticateUser, authenticateAdmin } from '../middleware/index.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user', authenticateUser, getProfile);
router.get('/users', authenticateUser, authenticateAdmin, getAllProfile);
router.delete('/user/:id', authenticateUser, authenticateAdmin, deleteProfile);



export default router;
