import express from 'express';
import { requestRedeem, approveRedeem, rejectRedeem, getPendingRequests, getMyRequests } from '../controllers/rewardController.js';
import { authenticateUser, authenticateAdmin } from '../middleware/index.js';

const router = express.Router();

// User routes
router.post('/request', authenticateUser, requestRedeem);
router.get('/my-requests', authenticateUser, getMyRequests);

// Admin routes
router.get('/pending', authenticateUser, authenticateAdmin, getPendingRequests);
router.post('/approve/:id', authenticateUser, authenticateAdmin, approveRedeem);
router.post('/reject/:id', authenticateUser, authenticateAdmin, rejectRedeem);

export default router;
