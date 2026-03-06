-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ==================== STUDENTS POLICIES ====================
-- Public can view verified students only (for vendor profiles)
CREATE POLICY "Verified students are viewable by public"
  ON students FOR SELECT
  USING (verified = TRUE);

-- Users can view their own student record
CREATE POLICY "Users can view own student record"
  ON students FOR SELECT
  USING (auth.uid()::text IN (SELECT auth_user_id::text FROM users WHERE student_id = students.id));

-- Only service role can insert/update students (during signup flow)
CREATE POLICY "Service role can manage students"
  ON students FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ==================== USERS POLICIES ====================
-- Public can view user profiles (vendors)
CREATE POLICY "Public can view user profiles"
  ON users FOR SELECT
  USING (TRUE);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Only service role can create users
CREATE POLICY "Service role can create users"
  ON users FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ==================== PRODUCTS POLICIES ====================
-- Public can view active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- Vendors can view their own products (including inactive)
CREATE POLICY "Vendors can view own products"
  ON products FOR SELECT
  USING (
    vendor_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Vendors can create products
CREATE POLICY "Vendors can create products"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND vendor_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Vendors can update their own products
CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  USING (
    vendor_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Vendors can delete their own products
CREATE POLICY "Vendors can delete own products"
  ON products FOR DELETE
  USING (
    vendor_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ==================== REVIEWS POLICIES ====================
-- Public can view reviews
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  USING (TRUE);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND reviewer_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ==================== MESSAGES POLICIES ====================
-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    sender_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR recipient_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    recipient_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    recipient_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- ==================== FAVORITES POLICIES ====================
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (
    user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Authenticated users can add favorites
CREATE POLICY "Authenticated users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Users can remove their own favorites
CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE
  USING (
    user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ==================== CART_ITEMS POLICIES ====================
-- Users can view their own cart
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (
    user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Authenticated users can add to cart
CREATE POLICY "Authenticated users can add to cart"
  ON cart_items FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (
    user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Users can remove items from their cart
CREATE POLICY "Users can remove own cart items"
  ON cart_items FOR DELETE
  USING (
    user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );
