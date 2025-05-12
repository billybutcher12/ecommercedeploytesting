CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  addresses jsonb[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- BẢNG DANH MỤC SẢN PHẨM (CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  image_url text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- BẢNG SẢN PHẨM (PRODUCTS)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  is_featured boolean NOT NULL DEFAULT false,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- BẢNG ĐỊA CHỈ GIAO HÀNG (ADDRESSES)
DROP TABLE IF EXISTS addresses;
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  label text, -- Nhãn: Nhà, Công ty, Gym...
  type text,  -- Loại: home, office, gym, ...
  full_address text NOT NULL, -- Địa chỉ đầy đủ
  lat double precision, -- Vĩ độ
  lng double precision, -- Kinh độ
  country text, -- Quốc gia
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  color text,
  size text
);

-- BẢNG ĐÁNH GIÁ SẢN PHẨM (REVIEWS)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Cho phép user upload file vào bucket avatars
CREATE POLICY "Authenticated users can upload avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Cho phép user update file của chính mình
CREATE POLICY "Authenticated users can update their avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Cho phép user xem chính mình hoặc admin xem tất cả
CREATE POLICY "Users and Admins can view users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Cho phép user update chính mình hoặc admin update tất cả
CREATE POLICY "Users and Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update order status"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create their own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
  ));

-- Cập nhật các policy để sử dụng bảng users thay vì profiles
CREATE POLICY "Users can update their own information"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Function to handle new user signup and create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user_users()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    now(),
    new.raw_user_meta_data->>'avatar_url',
    'customer' -- luôn gán mặc định là customer
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_users ON auth.users;
CREATE TRIGGER on_auth_user_created_users
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_users();


insert into categories (id, name, description) values
  ('550e8400-e29b-41d4-a716-446655440000', 'Áo khoác', 'Áo khoác nam thời trang'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Áo khoác', 'Áo khoác nam cao cấp'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Áo khoác', 'Áo khoác nam trẻ trung');

select * from products
insert into products (id, name, description, price, image_url, category_id, stock, is_featured) values
  ('8d4f2c1a-3b7e-4f12-b9a8-7c9d5e6f3a2b', 'Áo khoác nam QSGTK516', 'Áo khoác thể thao, chất liệu thoáng mát', 369000, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd-V_VlEV1cXddd8rrRVuDgEzU_8us6Bb4Ww&s', '550e8400-e29b-41d4-a716-446655440000', 50, true),
  ('d2e4b7f9-9a1c-4e5d-8b3a-1f2c6d7e8904', 'Áo khoác nam QSGTK520', 'Áo khoác nam trẻ trung, năng động', 319000, 'https://pos.nvncdn.com/f4d87e-8901/ps/20241204_BJ9PIIVFBy.jpeg', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 40, false),
  ('3a9b6c2d-5e8f-4a1b-9c7d-0e3f4a5b678c', 'Áo khoác nam QSGTK521', 'Áo khoác nam vải mát, dễ phối đồ', 299000, 'https://pos.nvncdn.com/f4d87e-8901/ps/20241204_SMAM3J8dpt.jpeg', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 30, false);

insert into reviews (product_id, user_id, rating, comment)
values
  ('8d4f2c1a-3b7e-4f12-b9a8-7c9d5e6f3a2b', 'a1111111-1111-1111-1111-111111111111', 5, 'Sản phẩm rất tốt!'),
  ('8d4f2c1a-3b7e-4f12-b9a8-7c9d5e6f3a2b', 'a2222222-2222-2222-2222-222222222222', 4, 'Đẹp, giao hàng nhanh.'),
  ('d2e4b7f9-9a1c-4e5d-8b3a-1f2c6d7e8904', 'a1111111-1111-1111-1111-111111111111', 3, 'Chất lượng ổn, giá hợp lý.'),
  ('d2e4b7f9-9a1c-4e5d-8b3a-1f2c6d7e8904', 'a3333333-3333-3333-3333-333333333333', 5, 'Mẫu mã đẹp, sẽ ủng hộ tiếp!'),
  ('3a9b6c2d-5e8f-4a1b-9c7d-0e3f4a5b678c', 'a2222222-2222-2222-2222-222222222222', 2, 'Chưa hài lòng lắm về chất liệu.'),
  ('3a9b6c2d-5e8f-4a1b-9c7d-0e3f4a5b678c', 'a3333333-3333-3333-3333-333333333333', 4, 'Đóng gói cẩn thận, giao hàng nhanh.');


select * from users

update users set first_name = 'boiz', last_name = 'sus', phone = '0559669281' where id = '0fe5ef83-a6d0-4905-ae9c-20f79139b790';
select * from users
