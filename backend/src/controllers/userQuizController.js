import { UserQuiz } from '../models/userQuiz.js';
import { Quiz } from '../models/quiz.js';
import { User } from '../models/user.js';
import { sendSuccess, sendError, STATUS_CODES } from '../utils/responseHandler.js';

// @desc    Submit a quiz attempt
// @route   POST /api/user-quiz/submit
// @access  User
export const submitQuiz = async (req, res) => {
    try {
        const { quizId, timeTaken } = req.body;
        const userId = req.user._id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return sendError(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
        }

        let multiplier = 0;
        let percentage = 0;

        // Time-based multiplier logic (regardless of answers)
        if (timeTaken <= 20) {
            multiplier = 1.0; // 100%
            percentage = 100;
        } else if (timeTaken <= 50) {
            multiplier = 0.5; // 50%
            percentage = 50;
        } else {
            multiplier = 0.3; // 30%
            percentage = 30;
        }

        // Final score = (Total Possible Score) * Time Multiplier
        const earnedScore = Math.round(quiz.totalScore * multiplier);

        // Save the attempt
        const userQuiz = await UserQuiz.create({
            user: userId,
            quiz: quizId,
            earnedScore,
            timeTaken,
            percentageAchieved: percentage
        });

        // Update user stats (total points and total quizzes)
        await User.findByIdAndUpdate(userId, {
            $inc: { 
                totalPoints: earnedScore, 
                totalQuizzes: 1 
            }
        });

        return sendSuccess(res, 'Quiz submitted successfully', {
            earnedScore,
            percentageAchieved: percentage,
            timeTaken,
            attempt: userQuiz
        }, STATUS_CODES.CREATED);

    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Get user's quiz attempts
// @route   GET /api/user-quiz/my-attempts
// @access  User
export const getMyAttempts = async (req, res) => {
    try {
        const attempts = await UserQuiz.find({ user: req.user._id })
            .populate('quiz', 'name totalScore level');
        return sendSuccess(res, 'My attempts fetched successfully', attempts);
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};
