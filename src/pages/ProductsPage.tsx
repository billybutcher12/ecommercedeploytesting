import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import BannerSlider from '../components/shared/BannerSlider';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category_id: string;
  image_urls?: string[];
  sizes?: string[];
  colors?: string[];
  created_at?: string;
  stock?: number;
  is_featured?: boolean;
}

function getCategoryIcon(name: string, idx: number) {
  // Gán icon theo tên hoặc random cho demo
  const icons = ['🧥', '👗', '👟', '🎒', '👜', '👒', '🧢', '🩳', '🧦', '🧤', '🧣', '👚', '👔', '👞', '👠', '👡', '👢', '🩱', '🩲', '🕶️', '💍', '💄', '🎩', '🧸', '🎁'];
  if (name.toLowerCase().includes('áo')) return '👕';
  if (name.toLowerCase().includes('quần')) return '👖';
  if (name.toLowerCase().includes('giày')) return '👟';
  if (name.toLowerCase().includes('túi')) return '👜';
  if (name.toLowerCase().includes('mũ')) return '🧢';
  return icons[idx % icons.length];
}

function getCategoryBadge(idx: number) {
  // Gán badge thú vị cho một số danh mục
  const badges = [
    { label: 'Hot', color: 'bg-red-500' },
    { label: 'New', color: 'bg-green-500' },
    { label: 'Sale', color: 'bg-yellow-400 text-yellow-900' },
    { label: '🔥', color: 'bg-orange-500' },
    { label: '⭐', color: 'bg-purple-400' },
  ];
  if (idx % 5 === 0) return badges[0];
  if (idx % 7 === 0) return badges[1];
  if (idx % 9 === 0) return badges[2];
  if (idx % 11 === 0) return badges[3];
  if (idx % 13 === 0) return badges[4];
  return null;
}

function CategoryList({ selectedCategory, setSelectedCategory }: { selectedCategory: string | null, setSelectedCategory: (id: string | null) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  return (
    <div className="my-8 py-10 px-2 rounded-3xl bg-gradient-to-br from-purple-50 via-purple-100 to-white shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {/* Tất cả */}
        <motion.div
          className="flex flex-col items-center group cursor-pointer relative"
          whileHover={{
            scale: 1.13,
            rotateY: 12,
            boxShadow: '0 16px 48px 0 rgba(80,36,255,0.22), 0 0 24px 0 #a78bfa55',
            filter: 'brightness(1.08) drop-shadow(0 0 16px #a78bfa88)',
          }}
          whileTap={{ scale: 0.97, rotateY: -8 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          style={{ perspective: 800, minWidth: 110, minHeight: 140 }}
          onClick={() => setSelectedCategory(null)}
        >
          <motion.div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-100 mb-2 flex items-center justify-center text-3xl text-primary-400 border border-purple-100 group-hover:border-purple-400 transition"
            whileHover={{ rotateX: 10, scale: 1.10, borderColor: '#a78bfa', boxShadow: '0 0 32px #a78bfa88' }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}
          >
            <span>🌈</span>
          </motion.div>
          <span
            className={`text-sm md:text-base font-semibold text-primary-700 group-hover:text-purple-600 transition-colors duration-200 text-center drop-shadow group-hover:drop-shadow-lg ${selectedCategory === null ? 'font-bold relative' : ''}`}
            style={selectedCategory === null ? { fontWeight: 700 } : { }}
          >
            Tất cả
            {selectedCategory === null && (
              <span className="block w-8 h-1 bg-purple-400 rounded-full mx-auto mt-1 animate-fade-in" />
            )}
          </span>
        </motion.div>
        {categories.map((cat, idx) => {
          const badge = getCategoryBadge(idx);
          return (
            <motion.div
              key={cat.id}
              className="flex flex-col items-center group cursor-pointer relative"
              whileHover={{
                scale: 1.13,
                rotateY: 12,
                boxShadow: '0 16px 48px 0 rgba(80,36,255,0.22), 0 0 24px 0 #a78bfa55',
                filter: 'brightness(1.08) drop-shadow(0 0 16px #a78bfa88)',
              }}
              whileTap={{ scale: 0.97, rotateY: -8 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              style={{ perspective: 800, minWidth: 110, minHeight: 140 }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <motion.div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-100 mb-2 border border-purple-100 group-hover:border-purple-400 transition flex items-center justify-center text-3xl"
                whileHover={{ rotateX: 10, scale: 1.10, borderColor: '#a78bfa', boxShadow: '0 0 32px #a78bfa88' }}
                transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span>{getCategoryIcon(cat.name, idx)}</span>
                )}
              </motion.div>
              <span
                className={`text-sm md:text-base font-semibold text-primary-700 group-hover:text-purple-600 transition-colors duration-200 text-center drop-shadow group-hover:drop-shadow-lg ${selectedCategory === cat.id ? 'font-bold relative' : ''}`}
                style={selectedCategory === cat.id ? { fontWeight: 700 } : { }}
              >
                {cat.name}
                {selectedCategory === cat.id && (
                  <span className="block w-8 h-1 bg-purple-400 rounded-full mx-auto mt-1 animate-fade-in" />
                )}
              </span>
              {badge && (
                <span className={`absolute -top-2 right-2 px-2 py-0.5 text-xs rounded-full text-white font-bold shadow ${badge.color} animate-bounce`}>{badge.label}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const ProductsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sort, setSort] = useState<string>('latest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [showCategory, setShowCategory] = useState(true);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts(data || []);
      if (data && data.length > 0) {
        const prices = data.map((p: Product) => p.price);
        setMinPrice(Math.min(...prices));
        setMaxPrice(Math.max(...prices));
        setPriceRange([Math.min(...prices), Math.max(...prices)]);
      }
    };
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = [...products];
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sort === 'latest') {
      filtered = filtered.sort((a, b) => (a.id < b.id ? 1 : -1));
    } else if (sort === 'price_asc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, sort, search]);

  const suggestionProducts = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  // Xử lý slider giá
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, idx: 0 | 1) => {
    const value = Number(e.target.value);
    setPriceRange((prev) => {
      const next = [...prev] as [number, number];
      next[idx] = value;
      if (next[0] > next[1]) next[0] = next[1];
      if (next[1] < next[0]) next[1] = next[0];
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BannerSlider />
      <CategoryList selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <div className="pt-8">
        <div className="flex flex-col md:flex-row gap-8 container mx-auto px-4 py-8">
          {/* Sidebar */}
          <aside className="md:w-1/4 w-full">
            <div className="bg-white rounded-xl shadow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">Danh mục</span>
                <button onClick={() => setShowCategory((v) => !v)} className="text-xl font-bold focus:outline-none">
                  {showCategory ? '-' : '+'}
                </button>
              </div>
              {showCategory && (
                <ul className="mb-6">
                  <li
                    className={`cursor-pointer py-1 px-2 rounded transition ${!selectedCategory ? 'bg-primary-100 text-primary-700 font-semibold' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    Tất cả
                  </li>
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      className={`cursor-pointer py-1 px-2 rounded transition ${selectedCategory === cat.id ? 'bg-primary-100 text-primary-700 font-semibold' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mb-4">
                <span className="font-bold block mb-2">Khoảng giá</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-full accent-primary-500"
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full accent-primary-500"
                  />
                </div>
                <div className="text-sm mt-2 text-gray-600">
                  Price: {priceRange[0].toLocaleString('vi-VN')} VND — {priceRange[1].toLocaleString('vi-VN')} VND
                </div>
              </div>
              <button
                className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-primary-700 transition"
                onClick={() => {}}
              >
                FILTER
              </button>
            </div>
          </aside>
          {/* Main content */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div className="text-gray-700 text-lg font-semibold">
                Tổng {filteredProducts.length} sản phẩm
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sắp xếp theo</span>
                <select
                  className="border rounded px-3 py-1 focus:outline-primary-500"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="latest">Sort by latest</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>
            </div>
            {/* Thanh tìm kiếm sản phẩm */}
            <div className="mb-6 flex items-center gap-3 relative">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-primary-200 shadow focus:ring-2 focus:ring-primary-400 focus:outline-none transition-all"
              />
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold shadow hover:bg-primary-600 transition-all"
              >
                Xóa
              </button>
              {/* Gợi ý sản phẩm khi nhập */}
              {showSuggestions && suggestionProducts.length > 0 && (
                <div className="absolute top-full left-0 w-full md:w-1/2 bg-white rounded-xl shadow-lg border border-primary-100 mt-2 z-50 max-h-80 overflow-y-auto animate-fade-in">
                  {suggestionProducts.map((p) => (
                    <Link
                      key={p.id + '-suggestion'}
                      to={`/products/${p.id}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-primary-50 transition rounded-lg"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <img
                        src={Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls[0] : (p.image_url || 'https://via.placeholder.com/60x60?text=No+Image')}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-primary-700 line-clamp-1">{p.name}</div>
                        <div className="text-sm text-gray-500">{p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-16">Không có sản phẩm nào phù hợp</div>
              )}
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                    sizes: product.sizes || [],
                    colors: product.colors || [],
                    created_at: product.created_at || '',
                    stock: product.stock || 0,
                    is_featured: product.is_featured || false,
                  }}
                />
              ))}
            </div>
            {/* Gợi ý sản phẩm nổi bật */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Gợi ý cho bạn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id + '-suggest'}
                    product={{
                      ...product,
                      image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
                      sizes: product.sizes || [],
                      colors: product.colors || [],
                      created_at: product.created_at || '',
                      stock: product.stock || 0,
                      is_featured: product.is_featured || false,
                    }}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;