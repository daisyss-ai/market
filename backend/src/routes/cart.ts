import { Router, Response } from 'express';
import { supabaseClient } from '../utils/supabase.js';
import { sendError, sendSuccess, sendCreated } from '../utils/jwt.js';
import { validate, addToCartSchema, updateProductSchema } from '../utils/validation.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/cart
 * Get user's shopping cart
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { data: cartItems, error } = await supabaseClient
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          title,
          price,
          image_urls,
          stock,
          vendor_id,
          vendor:users(id, full_name, avatar_url)
        )
      `)
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return sendError(res, 400, error.message);
    }

    // Calculate totals
    let totalPrice = 0;
    let totalItems = 0;

    cartItems?.forEach((item: any) => {
      if (item.product) {
        totalPrice += item.product.price * item.quantity;
        totalItems += item.quantity;
      }
    });

    sendSuccess(res, {
      items: cartItems || [],
      totals: {
        items: totalItems,
        price: parseFloat(totalPrice.toFixed(2)),
      },
    });
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/cart
 * Add item to cart
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const data = validate(addToCartSchema, req.body);

    // Check if product exists and is active
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('id, stock')
      .eq('id', data.product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return sendError(res, 404, 'Product not found or unavailable');
    }

    if (product.stock < data.quantity) {
      return sendError(res, 400, 'Insufficient stock available');
    }

    // Check if item already in cart
    const { data: existingItem } = await supabaseClient
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.userId)
      .eq('product_id', data.product_id)
      .single();

    let cartItem;
    let error;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + data.quantity;
      if (newQuantity > product.stock) {
        return sendError(res, 400, 'Quantity exceeds available stock');
      }

      const result = await supabaseClient
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      cartItem = result.data;
      error = result.error;
    } else {
      // Add new item
      const result = await supabaseClient
        .from('cart_items')
        .insert({
          user_id: req.user.userId,
          product_id: data.product_id,
          quantity: data.quantity,
        })
        .select()
        .single();

      cartItem = result.data;
      error = result.error;
    }

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendCreated(res, cartItem, 'Item added to cart');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * PUT /api/cart/:itemId
 * Update cart item quantity
 */
router.put('/:itemId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return sendError(res, 400, 'Quantity must be greater than 0');
    }

    // Check if item belongs to user
    const { data: cartItem, error: cartError } = await supabaseClient
      .from('cart_items')
      .select('*, product:products(stock)')
      .eq('id', itemId)
      .eq('user_id', req.user.userId)
      .single();

    if (cartError || !cartItem) {
      return sendError(res, 404, 'Cart item not found');
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return sendError(res, 400, 'Quantity exceeds available stock');
    }

    const { data: updatedItem, error } = await supabaseClient
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, updatedItem, 'Cart item updated');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * DELETE /api/cart/:itemId
 * Remove item from cart
 */
router.delete('/:itemId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { itemId } = req.params;

    // Check if item belongs to user
    const { data: cartItem, error: cartError } = await supabaseClient
      .from('cart_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', req.user.userId)
      .single();

    if (cartError || !cartItem) {
      return sendError(res, 404, 'Cart item not found');
    }

    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, {}, 'Item removed from cart');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

export default router;
