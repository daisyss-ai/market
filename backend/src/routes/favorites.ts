import { Router, Response } from 'express';
import { supabaseClient } from '../utils/supabase.ts';
import { sendError, sendSuccess, sendCreated } from '../utils/jwt.ts';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

/**
 * GET /api/favorites
 * Get user's favorite products
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: favorites, error, count } = await supabaseClient
      .from('favorites')
      .select('*, product:products(*, vendor:users(id, full_name, avatar_url))', { count: 'exact' })
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, {
      favorites,
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
 * POST /api/favorites/:productId
 * Add product to favorites
 */
router.post('/:productId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { productId } = req.params;

    // Check if product exists
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return sendError(res, 404, 'Product not found');
    }

    // Check if already favorited
    const { data: existingFavorite } = await supabaseClient
      .from('favorites')
      .select('id')
      .eq('user_id', req.user.userId)
      .eq('product_id', productId)
      .single();

    if (existingFavorite) {
      return sendError(res, 400, 'Product already in favorites');
    }

    const { data: favorite, error } = await supabaseClient
      .from('favorites')
      .insert({
        user_id: req.user.userId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendCreated(res, favorite, 'Added to favorites');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * DELETE /api/favorites/:productId
 * Remove product from favorites
 */
router.delete('/:productId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { productId } = req.params;

    // Check if favorite exists
    const { data: favorite, error: favoriteError } = await supabaseClient
      .from('favorites')
      .select('id')
      .eq('user_id', req.user.userId)
      .eq('product_id', productId)
      .single();

    if (favoriteError || !favorite) {
      return sendError(res, 404, 'Favorite not found');
    }

    const { error } = await supabaseClient
      .from('favorites')
      .delete()
      .eq('user_id', req.user.userId)
      .eq('product_id', productId);

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, {}, 'Removed from favorites');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

export default router;
