#!/usr/bin/env node

/**
 * Quick Reference - MarketU Backend API
 * 
 * Use this file as a quick lookup for all API endpoints
 */

const API = {
  baseUrl: 'http://localhost:3000/api',
  
  auth: {
    verifyStudent: {
      method: 'POST',
      path: '/auth/verify-student',
      description: 'Verify if student exists',
      body: { student_id: 'string', email: 'string', full_name: 'string' }
    },
    signup: {
      method: 'POST',
      path: '/auth/signup',
      description: 'Register new student',
      body: { email: 'string', password: 'string', full_name: 'string', student_id: 'string' }
    },
    login: {
      method: 'POST',
      path: '/auth/login',
      description: 'Login with credentials',
      body: { email: 'string', password: 'string' }
    },
    logout: {
      method: 'POST',
      path: '/auth/logout',
      description: 'Logout user',
      auth: true
    },
    me: {
      method: 'GET',
      path: '/auth/me',
      description: 'Get current user profile',
      auth: true
    }
  },

  products: {
    list: {
      method: 'GET',
      path: '/products',
      description: 'List all products',
      query: {
        page: 1,
        limit: 20,
        category: 'optional',
        condition: 'novo|como_novo|usado',
        minPrice: 'optional',
        maxPrice: 'optional',
        search: 'optional',
        sort: 'newest|price-asc|price-desc|rating'
      }
    },
    get: {
      method: 'GET',
      path: '/products/:id',
      description: 'Get product details'
    },
    create: {
      method: 'POST',
      path: '/products',
      description: 'Create new product',
      auth: true,
      role: 'vendor',
      body: {
        title: 'string',
        description: 'string',
        category: 'string',
        condition: 'novo|como_novo|usado',
        price: 'number',
        location: 'string',
        image_urls: 'array',
        stock: 'number'
      }
    },
    update: {
      method: 'PUT',
      path: '/products/:id',
      description: 'Update product',
      auth: true,
      role: 'vendor',
      body: 'any product field'
    },
    delete: {
      method: 'DELETE',
      path: '/products/:id',
      description: 'Delete product',
      auth: true,
      role: 'vendor'
    }
  },

  messages: {
    list: {
      method: 'GET',
      path: '/messages',
      description: 'Get all conversations',
      auth: true
    },
    conversation: {
      method: 'GET',
      path: '/messages/:userId',
      description: 'Get conversation with user',
      auth: true,
      query: { page: 1, limit: 50 }
    },
    send: {
      method: 'POST',
      path: '/messages',
      description: 'Send message',
      auth: true,
      body: { recipient_id: 'uuid', product_id: 'uuid|optional', content: 'string' }
    },
    markRead: {
      method: 'PUT',
      path: '/messages/:id/read',
      description: 'Mark message as read',
      auth: true
    }
  },

  reviews: {
    list: {
      method: 'GET',
      path: '/reviews/product/:productId',
      description: 'Get product reviews',
      query: { page: 1, limit: 10 }
    },
    create: {
      method: 'POST',
      path: '/reviews/product/:productId',
      description: 'Create review',
      auth: true,
      body: { rating: '1-5', comment: 'string' }
    }
  },

  favorites: {
    list: {
      method: 'GET',
      path: '/favorites',
      description: 'Get favorites',
      auth: true,
      query: { page: 1, limit: 20 }
    },
    add: {
      method: 'POST',
      path: '/favorites/:productId',
      description: 'Add to favorites',
      auth: true
    },
    remove: {
      method: 'DELETE',
      path: '/favorites/:productId',
      description: 'Remove from favorites',
      auth: true
    }
  },

  cart: {
    list: {
      method: 'GET',
      path: '/cart',
      description: 'Get shopping cart',
      auth: true
    },
    add: {
      method: 'POST',
      path: '/cart',
      description: 'Add item to cart',
      auth: true,
      body: { product_id: 'uuid', quantity: 'number' }
    },
    update: {
      method: 'PUT',
      path: '/cart/:itemId',
      description: 'Update cart item',
      auth: true,
      body: { quantity: 'number' }
    },
    remove: {
      method: 'DELETE',
      path: '/cart/:itemId',
      description: 'Remove from cart',
      auth: true
    }
  },

  users: {
    get: {
      method: 'GET',
      path: '/users/:id',
      description: 'Get user profile'
    },
    stats: {
      method: 'GET',
      path: '/users/:id/vendor-stats',
      description: 'Get vendor stats'
    },
    update: {
      method: 'PUT',
      path: '/users/:id',
      description: 'Update own profile',
      auth: true,
      body: { full_name: 'optional', avatar_url: 'optional' }
    },
    products: {
      method: 'GET',
      path: '/users/:id/products',
      description: 'Get vendor products',
      query: { page: 1, limit: 20 }
    }
  }
};

// Example usage in comments
const examples = {
  login_example: `
    curl -X POST http://localhost:3000/api/auth/login \\
      -H "Content-Type: application/json" \\
      -d '{
        "email": "student@university.edu",
        "password": "password123"
      }'
  `,
  
  get_products_example: `
    curl http://localhost:3000/api/products?category=Electronics&limit=10&sort=newest
  `,

  create_product_example: `
    curl -X POST http://localhost:3000/api/products \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer YOUR_TOKEN" \\
      -d '{
        "title": "Used Laptop",
        "description": "Great condition",
        "category": "Electronics",
        "condition": "como_novo",
        "price": 1500.00,
        "location": "Campus A",
        "image_urls": ["https://..."],
        "stock": 1
      }'
  `,

  send_message_example: `
    curl -X POST http://localhost:3000/api/messages \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer YOUR_TOKEN" \\
      -d '{
        "recipient_id": "user-uuid",
        "product_id": "product-uuid",
        "content": "Are you still selling this?"
      }'
  `
};

console.log(JSON.stringify(API, null, 2));

module.exports = { API, examples };
