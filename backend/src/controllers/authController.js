import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { sendSuccess, sendError, STATUS_CODES } from '../utils/responseHandler.js';

dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return sendError(res, 'User already exists', STATUS_CODES.BAD_REQUEST);
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (user) {
            return sendSuccess(res, 'User registered successfully', {
                _id: user._id,
                username: user.username,
                email: user.email,
            }, STATUS_CODES.CREATED);
        } else {
            return sendError(res, 'Invalid user data', STATUS_CODES.BAD_REQUEST);
        }
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            return sendSuccess(res, 'Login successful', {
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                totalPoints: user.totalPoints,
                totalQuizzes: user.totalQuizzes,
                totalRedemptions: user.totalRedemptions,
                token: generateToken(user._id),
            });
        } else {
            return sendError(res, 'Invalid email or password', STATUS_CODES.UNAUTHORIZED);
        }
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};


export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        return sendSuccess(res, 'Profile fetched successfully', user);
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = await bcrypt.hash(req.body.password, 10);
            }
            const updatedUser = await user.save();
            return sendSuccess(res, 'Profile updated successfully', {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                token: generateToken(updatedUser._id),
            });
        } else {
            return sendError(res, 'User not found', STATUS_CODES.NOT_FOUND);
        }
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

export const getAllProfile = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false });
        return sendSuccess(res, 'All users fetched successfully', users);
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
}


export const deleteProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            await user.remove();
            return sendSuccess(res, 'User removed successfully');
        } else {
            return sendError(res, 'User not found', STATUS_CODES.NOT_FOUND);
        }
    } catch (error) {
        return sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};
