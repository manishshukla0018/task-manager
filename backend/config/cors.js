import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'https://team-task-manager-git-main-manishshukla0018s-projects.vercel.app',
  'https://team-task-manager-mu-weld.vercel.app'
];

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
});