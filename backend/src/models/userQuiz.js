import mongoose from 'mongoose';

const userQuizSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    earnedScore: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, // In seconds
        required: true
    },
    percentageAchieved: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export const UserQuiz = mongoose.model('UserQuiz', userQuizSchema);
