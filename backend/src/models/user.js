import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  totalPoints: { type: Number, default: 0 },
  totalRedemptions: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
});

export const User = mongoose.model('User', userSchema);
