import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { seedAdmin } from './config/seed.js';
import authRoutes from './routes/authRoute.js';
import quizRoutes from './routes/quizRoute.js';
import userQuizRoutes from './routes/userQuizRoute.js';
import rewardRoutes from './routes/rewardRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user-quiz', userQuizRoutes);
app.use('/api/reward', rewardRoutes);

app.get('/', (req, res) => res.send('Hello World!'));

export const startServer = async () => {
  console.log('Starting server...');
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
