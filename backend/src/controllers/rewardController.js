import { RewardRequest } from '../models/rewardRequest.js';
import { User } from '../models/user.js';
import { sendSuccess, sendError, STATUS_CODES } from '../utils/responseHandler.js';

// @desc    User requests to redeem points
// @route   POST /api/reward/request
// @access  User
export const requestRedeem = async (req, res) => {
    try {
        const { pointsRequested } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (user.totalPoints < pointsRequested) {
            return sendError(res, 'Insufficient points to redeem', STATUS_CODES.BAD_REQUEST);
        }

        const request = await RewardRequest.create({
            user: userId,
            pointsRequested
        });

        return sendSuccess(res, 'Redemption request submitted successfully', request, STATUS_CODES.CREATED);

    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Admin approves redemption request
// @route   POST /api/reward/approve/:id
// @access  Admin
export const approveRedeem = async (req, res) => {
    try {
        const { adminPercentage } = req.body; // percentage from 0-100
        const requestId = req.params.id;
        const adminId = req.user._id;

        const request = await RewardRequest.findById(requestId).populate('user');
        if (!request) {
            return sendError(res, 'Redemption request not found', STATUS_CODES.NOT_FOUND);
        }

        if (request.status !== 'pending') {
            return sendError(res, 'Request is already processed', STATUS_CODES.BAD_REQUEST);
        }

        const user = request.user;
        if (user.totalPoints < request.pointsRequested) {
            return sendError(res, 'User no longer has enough points', STATUS_CODES.BAD_REQUEST);
        }

        // Calculate points distribution
        const pointsToAdmin = (request.pointsRequested * adminPercentage) / 100;
        const pointsToUser = request.pointsRequested - pointsToAdmin;

        // Update request
        request.status = 'approved';
        request.adminPercentage = adminPercentage;
        request.pointsToAdmin = pointsToAdmin;
        request.pointsToUser = pointsToUser;
        request.approvedBy = adminId;
        await request.save();

        // Update User's points (deduct total requested points) and increment redemptions
        user.totalPoints -= request.pointsRequested;
        user.totalRedemptions += 1;
        await user.save();

        // Update Admin's points (add pointsToAdmin)
        await User.findByIdAndUpdate(adminId, {
            $inc: { totalPoints: pointsToAdmin }
        });

        return sendSuccess(res, 'Redemption request approved successfully', request);

    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Admin rejects redemption request
// @route   POST /api/reward/reject/:id
// @access  Admin
export const rejectRedeem = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await RewardRequest.findById(requestId);
        
        if (!request) {
            return sendError(res, 'Redemption request not found', STATUS_CODES.NOT_FOUND);
        }

        if (request.status !== 'pending') {
            return sendError(res, 'Request is already processed', STATUS_CODES.BAD_REQUEST);
        }

        request.status = 'rejected';
        await request.save();

        return sendSuccess(res, 'Redemption request rejected', request);

    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Admin views all pending requests
// @route   GET /api/reward/pending
// @access  Admin
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await RewardRequest.find({ status: 'pending' }).populate('user', 'username email totalPoints');
        return sendSuccess(res, 'Pending requests fetched successfully', requests);
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    User views their own requests
// @route   GET /api/reward/my-requests
// @access  User
export const getMyRequests = async (req, res) => {
    try {
        const requests = await RewardRequest.find({ user: req.user._id });
        return sendSuccess(res, 'My requests fetched successfully', requests);
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};
