import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { corsMiddleware } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
connectDB();

app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(corsMiddleware);
app.options("*", corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Team Task Manager API is running' });
});

app.use('/api', apiRoutes);

const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ success: false, message: 'Not found' });
  });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
});
