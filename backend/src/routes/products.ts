import { Router, Response } from 'express';
import { supabaseClient, supabaseServiceClient } from '../utils/supabase.ts';
import { sendError, sendSuccess, sendCreated } from '../utils/jwt.ts';
import { validate, createProductSchema, updateProductSchema } from '../utils/validation.ts';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { CreateProductRequest, UpdateProductRequest } from '../types/index.ts';

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

/**
 * POST /api/products/dev-seed
 * Create sample products for development (NO AUTH REQUIRED)
 */
router.post('/dev-seed', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Use development mode check
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) {
      return sendError(res, 403, 'Dev seed endpoint only available in development');
    }

    // Create test vendor user first
    const vendorEmail = 'test-vendor@marketu.app';
    
    // Check if vendor already exists
    const { data: existingVendor } = await supabaseServiceClient
      .from('users')
      .select('id')
      .eq('email', vendorEmail)
      .single();

    let vendorId = existingVendor?.id;

    // If vendor doesn't exist, create one using service client (bypasses RLS)
    if (!vendorId) {
      const { data: newVendor, error: vendorError } = await supabaseServiceClient
        .from('users')
        .insert({
          email: vendorEmail,
          full_name: 'Test Vendor',
          role: 'vendor',
          avatar_url: 'https://via.placeholder.com/150?text=Test+Vendor',
        })
        .select('id')
        .single();

      if (vendorError || !newVendor) {
        return sendError(res, 400, `Failed to create test vendor: ${vendorError?.message}`);
      }
      vendorId = newVendor.id;
    }

    // Sample products to create
    const sampleProducts = [
      {
        vendor_id: vendorId,
        title: 'Livro Cálculo Volume 1 - Muito Bom',
        description: 'Livro de Cálculo Volume 1, praticamente novo, apenas folhas de rascunho. Perfeito para quem estuda engenharia ou matemática.',
        category: 'Livros',
        condition: 'como_novo',
        price: 5500,
        location: 'Luanda',
        image_urls: ['https://via.placeholder.com/400x300?text=Livro+Calculo+1'],
        stock: 1,
        is_active: true,
      },
      {
        vendor_id: vendorId,
        title: 'iPhone 8 - Excelente Estado',
        description: 'iPhone 8, 64GB, cor cinza espacial. Funciona perfeitamente, bateria com 85% de saúde.',
        category: 'Tecnologia',
        condition: 'novo',
        price: 35000,
        location: 'Luanda',
        image_urls: ['https://via.placeholder.com/400x300?text=iPhone+8'],
        stock: 1,
        is_active: true,
      },
      {
        vendor_id: vendorId,
        title: 'Livro Harry Potter - Câmara Secreta',
        description: 'Livro Harry Potter e a Câmara Secreta, edição portuguesa, capa dura. Muito bem conservado.',
        category: 'Livros',
        condition: 'como_novo',
        price: 4000,
        location: 'Luanda',
        image_urls: ['https://via.placeholder.com/400x300?text=Harry+Potter'],
        stock: 2,
        is_active: true,
      },
      {
        vendor_id: vendorId,
        title: 'Calculadora Científica Casio',
        description: 'Calculadora científica Casio fx-991, funciona perfeitamente. Sem defeitos.',
        category: 'Material Escolar',
        condition: 'novo',
        price: 3000,
        location: 'Luanda',
        image_urls: ['https://via.placeholder.com/400x300?text=Calculadora'],
        stock: 3,
        is_active: true,
      },
      {
        vendor_id: vendorId,
        title: 'Notebook Dell Inspiron',
        description: 'Notebook Dell Inspiron, Intel i5, 8GB RAM, SSD 256GB. Funciona muito bem.',
        category: 'Tecnologia',
        condition: 'como_novo',
        price: 45000,
        location: 'Luanda',
        image_urls: ['https://via.placeholder.com/400x300?text=Notebook+Dell'],
        stock: 1,
        is_active: true,
      },
      {
        vendor_id: vendorId,
        title: 'Dicionário Inglês-Português',
        description: 'Dicionário Inglês-Português com mais de 50 mil palavras. Excelente qualidade.',
        category: 'Livros',
        condition: 'novo',
        price: 2500,
        location: 'Huambo',
        image_urls: ['https://via.placeholder.com/400x300?text=Dicionario'],
        stock: 2,
        is_active: true,
      },
    ];

    // Insert products using service client (bypasses RLS)
    const { data: products, error: productsError } = await supabaseServiceClient
      .from('products')
      .insert(sampleProducts)
      .select();

    if (productsError) {
      return sendError(res, 400, `Failed to create products: ${productsError.message}`);
    }

    sendSuccess(res, {
      message: `Created ${products?.length || 0} sample products`,
      vendor_id: vendorId,
      products: products || [],
    });
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

export default router;
