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
  'https://ultimate-quiz-management.onrender.com',
  'https://ultimate-quiz-management.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
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
