import express from 'express';
import cors from 'cors';
import prisma from './config/prisma.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in .env');
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [row] = await prisma.$queryRaw`SELECT NOW() AS now`;
    res.json({ status: 'ok', dbTime: row.now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

export default app;