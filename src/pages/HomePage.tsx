import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import FeaturedProducts from '../components/products/FeaturedProducts';
import CollectionCard from '../components/products/CollectionCard';
import NewArrivals from '../components/products/NewArrivals';
import Newsletter from '../components/shared/Newsletter';
import BannerSlider from '../components/shared/BannerSlider';

type Category = Database['public']['Tables']['categories']['Row'];

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(3);
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <BannerSlider />

      {/* Featured Products */}
      <motion.section 
        className="py-20" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={staggerContainer}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-700">Sản Phẩm Nổi Bật</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Khám phá những sản phẩm được yêu thích nhất của chúng tôi
            </p>
          </motion.div>
          <FeaturedProducts />
        </div>
      </motion.section>

      {/* Collection Showcase */}
      <motion.section 
        className="py-20 bg-white/90" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={staggerContainer}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-700">Bộ Sưu Tập</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Khám phá các bộ sưu tập độc đáo của chúng tôi
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg h-80 animate-pulse"></div>
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <CollectionCard
                  key={category.id}
                  title={category.name}
                  imageUrl={category.image_url || 'https://via.placeholder.com/600x800?text=No+Image'}
                  link={`/products?category=${category.name}`}
                />
              ))
            ) : (
              <>
                <CollectionCard
                  title="Summer Collection"
                  imageUrl="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800"
                  link="/products?collection=summer"
                />
                <CollectionCard
                  title="Autumn Essentials"
                  imageUrl="https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=800"
                  link="/products?collection=autumn"
                />
                <CollectionCard
                  title="Premium Accessories"
                  imageUrl="https://images.pexels.com/photos/1127000/pexels-photo-1127000.jpeg?auto=compress&cs=tinysrgb&w=800"
                  link="/products?category=accessories"
                />
              </>
            )}
          </div>
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-primary-600 to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:from-purple-500 hover:to-primary-600 transform hover:scale-105 transition-all duration-300"
            >
              Xem Tất Cả Bộ Sưu Tập
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* New Arrivals Section */}
      <motion.section 
        className="py-20" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={staggerContainer}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-700">Hàng Mới Về</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Những sản phẩm mới nhất vừa cập bến
            </p>
          </motion.div>
          <NewArrivals />
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section 
        className="py-20 bg-white/90" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={fadeIn}
      >
        <Newsletter />
      </motion.section>
    </div>
  );
};

export default HomePage;