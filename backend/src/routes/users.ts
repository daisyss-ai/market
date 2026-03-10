import { Router, Response } from 'express';
import { supabaseClient } from '../utils/supabase.ts';
import { sendError, sendSuccess } from '../utils/jwt.ts';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

/**
 * GET /api/users/:id
 * Get user profile
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * GET /api/users/:id/vendor-stats
 * Get vendor profile with stats
 */
router.get('/:id/vendor-stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get user info
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'vendor')
      .single();

    if (userError || !user) {
      return sendError(res, 404, 'Vendor not found');
    }

    // Get product count
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id', { count: 'exact' })
      .eq('vendor_id', id)
      .eq('is_active', true);

    // Get average rating
    const { data: reviews } = await supabaseClient
      .from('reviews')
      .select('rating')
      .in('product_id', 
        (await supabaseClient
          .from('products')
          .select('id')
          .eq('vendor_id', id)).data?.map((p: any) => p.id) || []
      );

    const avgRating = reviews && reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    sendSuccess(res, {
      vendor: user,
      stats: {
        productCount: products?.length || 0,
        reviewCount: reviews?.length || 0,
        avgRating,
      },
    });
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * PUT /api/users/:id
 * Update user profile (own profile only)
 */
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { id } = req.params;

    // Ensure user can only update their own profile
    if (id !== req.user.userId) {
      return sendError(res, 403, 'You can only update your own profile');
    }

    const { full_name, avatar_url } = req.body;

    // Build update object with only allowed fields
    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 400, 'No valid fields to update');
    }

    const { data: updatedUser, error } = await supabaseClient
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * GET /api/users/:id/products
 * Get user's products (vendors)
 */
router.get('/:id/products', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Verify user is a vendor
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return sendError(res, 404, 'User not found');
    }

    if (user.role !== 'vendor') {
      return sendError(res, 400, 'User is not a vendor');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, error, count } = await supabaseClient
      .from('products')
      .select('*', { count: 'exact' })
      .eq('vendor_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, {
      products,
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

export default router;
