# MarketU Backend - Student Marketplace API

Complete backend API for a student marketplace built with Node.js, Express, and Supabase.

## 🚀 Features

- **Student Authentication** with verified student flow
- **Product Management** - Create, read, update, delete listings
- **Real-time Messaging** - Direct messaging between buyers and vendors
- **Reviews & Ratings** - Product reviews with star ratings
- **Favorites System** - Bookmark favorite products
- **Shopping Cart** - Add products to cart for future checkout
- **User Profiles** - Student and vendor profiles with stats
- **RLS Security** - Row Level Security policies for data protection
- **Full-text Search** - Search products by title and description

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- PostgreSQL database

## 🛠️ Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Open the SQL editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL

### 4. Set Up RLS (Row Level Security) Policies

1. In Supabase SQL editor
2. Copy and paste the contents of `database/rls-policies.sql`
3. Execute the SQL

Note: Make sure you have RLS enabled on all tables (this is done in schema.sql)

### 5. Create Admin User (Optional)

Run the admin setup script to create an initial admin user:

```bash
npm run create-admin
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST /auth/verify-student
Verify if student exists in the system.
- **Body:**
  ```json
  {
    "student_id": "123456",
    "email": "student@university.edu",
    "full_name": "John Doe"
  }
  ```
- **Response:** `{ student_id: "uuid" }`

#### POST /auth/signup
Register a new student account.
- **Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "secure_password",
    "full_name": "John Doe",
    "student_id": "123456"
  }
  ```
- **Response:** `{ user: {...}, token: "jwt_token" }`

#### POST /auth/login
Login with email and password.
- **Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "password"
  }
  ```
- **Response:** `{ user: {...}, token: "jwt_token", session: {...} }`

#### POST /auth/logout
Logout current user.
- **Auth:** Required (Bearer token)
- **Response:** `{ message: "Logged out successfully" }`

#### GET /auth/me
Get current user profile.
- **Auth:** Required (Bearer token)
- **Response:** `{ user: {...} }`

### Products Endpoints

#### GET /products
List all active products with filters and pagination.
- **Query Params:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `category`: Filter by category
  - `condition`: 'novo', 'como_novo', 'usado'
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `search`: Search query
  - `sort`: 'newest', 'price-asc', 'price-desc', 'rating'
- **Response:** `{ products: [...], pagination: {...} }`

#### GET /products/:id
Get product details with reviews.
- **Response:** `{ ...product, avgRating, reviewCount }`

#### POST /products
Create new product (vendor only).
- **Auth:** Required (Vendor role)
- **Body:**
  ```json
  {
    "title": "Usado Notebook",
    "description": "Notebook in good condition",
    "category": "Eletrônicos",
    "condition": "como_novo",
    "price": 1500.00,
    "location": "Campus A",
    "image_urls": ["https://..."],
    "stock": 5
  }
  ```
- **Response:** `{ product: {...} }`

#### PUT /products/:id
Update product (vendor only).
- **Auth:** Required (Vendor role)
- **Body:** Any updatable fields
- **Response:** `{ product: {...} }`

#### DELETE /products/:id
Delete product (vendor only).
- **Auth:** Required (Vendor role)
- **Response:** `{ message: "Product deleted successfully" }`

### Messages Endpoints

#### GET /messages
Get all conversations.
- **Auth:** Required
- **Response:** `[{ partner, lastMessage, unreadCount }, ...]`

#### GET /messages/:userId
Get conversation with specific user.
- **Auth:** Required
- **Query Params:** `page`, `limit`
- **Response:** `{ messages: [...], pagination: {...} }`

#### POST /messages
Send a message.
- **Auth:** Required
- **Body:**
  ```json
  {
    "recipient_id": "uuid",
    "product_id": "uuid (optional)",
    "content": "Are you still selling this?"
  }
  ```
- **Response:** `{ message: {...} }`

#### PUT /messages/:id/read
Mark message as read.
- **Auth:** Required
- **Response:** `{ message: {...} }`

### Reviews Endpoints

#### GET /reviews/product/:productId
Get product reviews.
- **Query Params:** `page`, `limit`
- **Response:** `{ reviews: [...], avgRating, reviewCount, pagination: {...} }`

#### POST /reviews/product/:productId
Create review (buyer only).
- **Auth:** Required
- **Body:**
  ```json
  {
    "rating": 5,
    "comment": "Great product, fast delivery!"
  }
  ```
- **Response:** `{ review: {...} }`

### Favorites Endpoints

#### GET /favorites
Get user's favorite products.
- **Auth:** Required
- **Query Params:** `page`, `limit`
- **Response:** `{ favorites: [...], pagination: {...} }`

#### POST /favorites/:productId
Add product to favorites.
- **Auth:** Required
- **Response:** `{ favorite: {...} }`

#### DELETE /favorites/:productId
Remove product from favorites.
- **Auth:** Required
- **Response:** `{ message: "Removed from favorites" }`

### Cart Endpoints

#### GET /cart
Get user's shopping cart.
- **Auth:** Required
- **Response:** `{ items: [...], totals: { items, price } }`

#### POST /cart
Add item to cart.
- **Auth:** Required
- **Body:**
  ```json
  {
    "product_id": "uuid",
    "quantity": 2
  }
  ```
- **Response:** `{ cartItem: {...} }`

#### PUT /cart/:itemId
Update cart item quantity.
- **Auth:** Required
- **Body:** `{ quantity: 3 }`
- **Response:** `{ cartItem: {...} }`

#### DELETE /cart/:itemId
Remove item from cart.
- **Auth:** Required
- **Response:** `{ message: "Item removed from cart" }`

### Users Endpoints

#### GET /users/:id
Get user profile.
- **Response:** `{ user: {...} }`

#### GET /users/:id/vendor-stats
Get vendor profile with stats.
- **Response:** `{ vendor: {...}, stats: { productCount, reviewCount, avgRating } }`

#### PUT /users/:id
Update own profile.
- **Auth:** Required
- **Body:** `{ full_name: "...", avatar_url: "..." }`
- **Response:** `{ user: {...} }`

#### GET /users/:id/products
Get vendor's products.
- **Query Params:** `page`, `limit`
- **Response:** `{ products: [...], pagination: {...} }`

## 🔐 Authentication

### Using JWT Tokens

Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Format

Tokens include:
- `userId`: User UUID
- `email`: User email
- `role`: 'student', 'vendor', or 'admin'

Tokens expire after 24 hours.

## 🗄️ Database Schema

### Tables
- **students** - Verified student records
- **users** - User accounts with roles
- **products** - Product listings
- **reviews** - Product reviews and ratings
- **messages** - Direct messages between users
- **favorites** - Bookmarked products
- **cart_items** - Shopping cart items

### Indexes
All frequently queried columns are indexed for performance:
- `student_id`, `email` on students table
- `vendor_id`, `category`, `is_active`, `price` on products table
- `sender_id`, `recipient_id` on messages table
- `user_id` on favorites and cart_items

### Full-Text Search
Products support full-text search on title and description using Portuguese language.

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only view their own data (except public profiles/products)
- Vendors can only edit their own products
- Messages are private between sender and recipient
- Service role has admin access

### Password Security
- Passwords hashed with bcryptjs
- Minimum 6 characters required
- Handled by Supabase Auth

### CORS
- Configured for frontend URL (default: localhost:5173)
- Modify `FRONTEND_URL` env variable for production

## 🚢 Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Set up HTTPS
4. Configure CORS for production domain
5. Set up environment variables
6. Use service role key only on server
7. Enable RLS on all tables
8. Set up monitoring/logging
9. Test all endpoints
10. Set up database backups

### Deploy to Vercel

```bash
vercel
```

Configure environment variables in Vercel dashboard.

## 📝 Database Maintenance

### Backup Database
```bash
# Use Supabase backups
# Available in project dashboard under Backups
```

### Update Schema
1. Create new SQL migration
2. Test locally
3. Apply in Supabase SQL editor
4. Update corresponding code

## 🐛 Troubleshooting

### JWT Verification Issues
- Ensure JWT_SECRET matches
- Check token expiration
- Verify Bearer token format

### RLS Policy Errors
- Check RLS policies are enabled
- Verify auth.uid() matches user record
- Test with service role if debugging

### Database Connection Issues
- Verify SUPABASE_URL and keys
- Check network connectivity
- Review Supabase logs

### CORS Errors
- Update FRONTEND_URL env variable
- Restart server after changes
- Check browser console for specific errors

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Guide](https://jwt.io/)

## 📄 License

MIT

## 👨‍💻 Support

For issues and questions, please open an issue on GitHub or contact the development team.
