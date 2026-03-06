import { Router, Response } from 'express';
import { supabaseClient } from '../utils/supabase.js';
import { sendError, sendSuccess, sendCreated } from '../utils/jwt.js';
import { validate, createProductSchema, updateProductSchema } from '../utils/validation.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { CreateProductRequest, UpdateProductRequest } from '../types/index.js';

const router = Router();

/**
 * GET /api/products
 * Get all active products with filters and pagination
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const condition = req.query.condition as string;
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const search = req.query.search as string;
    const sort = req.query.sort as string;

    let query = supabaseClient
      .from('products')
      .select('*, vendor:users(id, full_name, avatar_url, role)', { count: 'exact' })
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (condition) query = query.eq('condition', condition);
    if (minPrice && !isNaN(minPrice)) query = query.gte('price', minPrice);
    if (maxPrice && !isNaN(maxPrice)) query = query.lte('price', maxPrice);

    // Apply sorting
    if (sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('created_at', { ascending: false }); // Could add avg rating later
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

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

/**
 * GET /api/products/:id
 * Get product details with reviews and ratings
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select(`
        *,
        vendor:users(id, full_name, avatar_url, email),
        reviews(id, rating, comment, reviewer_id, created_at)
      `)
      .eq('id', id)
      .single();

    if (productError || !product) {
      return sendError(res, 404, 'Product not found');
    }

    // Calculate average rating
    const avgRating = product.reviews?.length > 0
      ? (product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
      : null;

    sendSuccess(res, {
      ...product,
      avgRating,
      reviewCount: product.reviews?.length || 0,
    });
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/products
 * Create new product (vendor only)
 */
router.post('/', authenticateToken, requireRole('vendor'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const data = validate(createProductSchema, req.body);

    // Get vendor user id
    const { data: vendor, error: vendorError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('id', req.user.userId)
      .single();

    if (vendorError || !vendor) {
      return sendError(res, 400, 'Vendor profile not found');
    }

    const { data: product, error } = await supabaseClient
      .from('products')
      .insert({
        vendor_id: req.user.userId,
        ...data,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendCreated(res, product);
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * PUT /api/products/:id
 * Update product (vendor only)
 */
router.put('/:id', authenticateToken, requireRole('vendor'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { id } = req.params;
    const data = validate(updateProductSchema, req.body);

    // Check if vendor owns this product
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('vendor_id')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return sendError(res, 404, 'Product not found');
    }

    if (product.vendor_id !== req.user.userId) {
      return sendError(res, 403, 'You do not have permission to update this product');
    }

    const { data: updatedProduct, error } = await supabaseClient
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, updatedProduct);
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * DELETE /api/products/:id
 * Delete product (vendor only)
 */
router.delete('/:id', authenticateToken, requireRole('vendor'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { id } = req.params;

    // Check if vendor owns this product
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('vendor_id')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return sendError(res, 404, 'Product not found');
    }

    if (product.vendor_id !== req.user.userId) {
      return sendError(res, 403, 'You do not have permission to delete this product');
    }

    const { error } = await supabaseClient
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, {}, 'Product deleted successfully');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

export default router;
