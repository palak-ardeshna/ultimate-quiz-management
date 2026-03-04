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
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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
