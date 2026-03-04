import { Quiz } from '../models/quiz.js';
import { sendSuccess, sendError, STATUS_CODES } from '../utils/responseHandler.js';

// @desc    Create a new quiz
// @route   POST /api/quiz
// @access  Admin
export const createQuiz = async (req, res) => {
    try {
        const { name, totalScore, level, questions } = req.body;

        if (!questions || questions.length === 0) {
            return sendError(res, 'Quiz must have at least one question', STATUS_CODES.BAD_REQUEST);
        }

        const quiz = await Quiz.create({
            name,
            totalScore,
            level,
            questions,
            createdBy: req.user._id
        });

        return sendSuccess(res, 'Quiz created successfully', quiz, STATUS_CODES.CREATED);
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Get all quizzes
// @route   GET /api/quiz
// @access  Public
export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({}).populate('createdBy', 'username');
        return sendSuccess(res, 'Quizzes fetched successfully', quizzes);
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Get quiz by ID
// @route   GET /api/quiz/:id
// @access  Public
export const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'username');
        if (quiz) {
            return sendSuccess(res, 'Quiz fetched successfully', quiz);
        } else {
            return sendError(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
        }
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quiz/:id
// @access  Admin
export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (quiz) {
            await quiz.deleteOne();
            return sendSuccess(res, 'Quiz deleted successfully');
        } else {
            return sendError(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
        }
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};
