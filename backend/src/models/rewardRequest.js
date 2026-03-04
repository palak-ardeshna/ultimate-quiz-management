import mongoose from 'mongoose';

const rewardRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pointsRequested: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminPercentage: {
        type: Number, // Percentage of points that go to admin
        default: 0
    },
    pointsToAdmin: {
        type: Number,
        default: 0
    },
    pointsToUser: {
        type: Number,
        default: 0
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export const RewardRequest = mongoose.model('RewardRequest', rewardRequestSchema);
