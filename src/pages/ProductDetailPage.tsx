import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Database['public']['Tables']['products']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Database['public']['Tables']['reviews']['Row'][]>([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Giả lập user_id, thực tế nên lấy từ context đăng nhập
  const userId = 'a1111111-1111-1111-1111-111111111111';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) setProduct(data);
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      if (!error) setReviews(data || []);
      setReviewLoading(false);
    };
    if (id) fetchReviews();
  }, [id, submitting]);

  const imageUrl = product?.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0
    ? product.image_urls[0]
    : 'https://via.placeholder.com/600x600?text=No+Image';

  // Tính trung bình số sao
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  // Gửi đánh giá mới
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await supabase.from('reviews').insert({
      product_id: id,
      user_id: userId,
      rating,
      comment,
    });
    setComment('');
    setRating(5);
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Product Image Section */}
          <motion.div
            whileHover={{ scale: 1.04, rotateY: 8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="bg-white rounded-3xl shadow-2xl p-4 flex items-center justify-center min-h-[400px] md:min-h-[500px]"
            style={{ perspective: '1200px' }}
          >
            <div className="aspect-square w-full rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-xl">
              {loading ? (
                <div className="animate-pulse w-2/3 h-2/3 bg-gray-300 rounded-2xl" />
              ) : (
                <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover rounded-2xl transition-transform duration-500" />
              )}
            </div>
          </motion.div>

          {/* Product Details Section */}
          <div className="flex flex-col space-y-8 justify-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-800 mb-2 drop-shadow-lg">{loading ? 'Đang tải...' : product?.name}</h1>
              <p className="mt-1 text-2xl text-primary-600 font-bold mb-4">
                {loading ? '' : product?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </p>
              <div className="prose prose-sm text-gray-600 mb-4 min-h-[60px]">
                {loading ? <p>Đang tải thông tin sản phẩm...</p> : <p>{product?.description}</p>}
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.06, rotateX: 6, boxShadow: '0 8px 32px 0 rgba(80, 0, 200, 0.18)' }}
                whileTap={{ scale: 0.97, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-500 text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:from-purple-500 hover:to-primary-600 transition-all text-lg md:text-xl mt-2 mb-4"
                disabled={loading || !product}
              >
                Thêm vào giỏ hàng
              </motion.button>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-100 rounded-2xl p-6 shadow flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-primary-700 mb-2">Thông tin khác</h3>
              <ul className="list-disc pl-4 text-gray-700">
                <li><span className="font-semibold">Mã sản phẩm:</span> {product?.id}</li>
                <li><span className="font-semibold">Kho:</span> {product?.stock ?? 'Không rõ'}</li>
                <li><span className="font-semibold">Danh mục:</span> {product?.category_id ?? 'Không rõ'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Đánh giá & bình luận */}
        <div className="mt-14 bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex items-center gap-2 text-3xl font-bold text-yellow-500">
              {avgRating ? (
                <>
                  {[...Array(Math.round(Number(avgRating)))].map((_, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} className="inline-block">★</motion.span>)}
                  {[...Array(5 - Math.round(Number(avgRating)))].map((_, i) => <span key={i}>☆</span>)}
                  <span className="ml-3 text-gray-700 text-lg font-semibold">{avgRating} / 5</span>
                </>
              ) : (
                <span className="text-gray-400">Chưa có đánh giá</span>
              )}
            </div>
            <div className="text-gray-600 text-lg">Tổng {reviews.length} đánh giá</div>
          </div>

          {/* Danh sách bình luận */}
          <div className="space-y-6 mb-10">
            {reviewLoading ? (
              <div>Đang tải đánh giá...</div>
            ) : reviews.length === 0 ? (
              <div className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</div>
            ) : (
              <AnimatePresence>
                {reviews.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="border-b pb-4 flex flex-col md:flex-row md:items-center md:gap-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary-700">User: {r.user_id.slice(0, 8)}...</span>
                      <span className="text-yellow-500 text-lg">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <div className="text-gray-700 mb-1 flex-1">{r.comment}</div>
                    <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString('vi-VN')}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Form gửi đánh giá mới */}
          <form onSubmit={handleSubmitReview} className="flex flex-col md:flex-row items-center gap-4 mt-6">
            <div className="flex items-center gap-1">
              <span className="mr-2 font-semibold">Đánh giá:</span>
              {[1,2,3,4,5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={star <= rating ? 'text-yellow-500 text-2xl' : 'text-gray-300 text-2xl'}
                  onClick={() => setRating(star)}
                  tabIndex={-1}
                >★</button>
              ))}
            </div>
            <input
              type="text"
              className="flex-1 border-2 border-primary-200 rounded-xl px-4 py-2 focus:outline-primary-500 shadow"
              placeholder="Viết bình luận của bạn..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={200}
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-primary-600 to-purple-500 text-white px-8 py-2 rounded-xl font-semibold shadow hover:from-purple-500 hover:to-primary-600 transition-all text-lg"
              disabled={submitting || !comment.trim()}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;