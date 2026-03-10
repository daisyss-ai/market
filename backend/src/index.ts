import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorHandler, notFoundHandler } from './middleware/auth.ts';

// Import routes
import authRoutes from './routes/auth.ts';
import productsRoutes from './routes/products.ts';
import messagesRoutes from './routes/messages.ts';
import reviewsRoutes from './routes/reviews.ts';
import favoritesRoutes from './routes/favorites.ts';
import cartRoutes from './routes/cart.ts';
import usersRoutes from './routes/users.ts';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', usersRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
