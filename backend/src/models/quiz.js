import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalScore: { type: Number, required: true },
    level: { 
        type: String, 
        required: true, 
        enum: ['Easy', 'Medium', 'Hard'] 
    },
    questions: [questionSchema],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema);
