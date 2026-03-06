import { Router, Response } from 'express';
import { supabaseClient } from '../utils/supabase.js';
import { sendError, sendSuccess, sendCreated } from '../utils/jwt.js';
import { validate, createReviewSchema } from '../utils/validation.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/reviews/product/:productId
 * Get all reviews for a product
 */
router.get('/product/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Check if product exists
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return sendError(res, 404, 'Product not found');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reviews, error, count } = await supabaseClient
      .from('reviews')
      .select('*, reviewer:users(id, full_name, avatar_url)', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return sendError(res, 400, error.message);
    }

    // Calculate average rating
    const { data: allReviews } = await supabaseClient
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    const avgRating = allReviews && allReviews.length > 0
      ? (allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : null;

    sendSuccess(res, {
      reviews,
      avgRating,
      reviewCount: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/reviews/product/:productId
 * Create review for product (buyer only)
 */
router.post('/product/:productId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { productId } = req.params;
    const data = validate(createReviewSchema, req.body);

    // Check if product exists
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('vendor_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return sendError(res, 404, 'Product not found');
    }

    // Cannot review own products
    if (product.vendor_id === req.user.userId) {
      return sendError(res, 400, 'Vendors cannot review their own products');
    }

    // Check if already reviewed
    const { data: existingReview } = await supabaseClient
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('reviewer_id', req.user.userId)
      .single();

    if (existingReview) {
      return sendError(res, 400, 'You have already reviewed this product');
    }

    const { data: review, error } = await supabaseClient
      .from('reviews')
      .insert({
        product_id: productId,
        reviewer_id: req.user.userId,
        ...data,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendCreated(res, review);
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

export default router;
