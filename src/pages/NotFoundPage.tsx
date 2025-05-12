import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-secondary-800 mb-4">404</h1>
      <p className="text-xl text-secondary-600 mb-8">Oops! The page you're looking for cannot be found.</p>
      
      <div className="mb-8">
        <ShoppingBag size={64} className="text-primary-500 mx-auto" />
      </div>
      
      <p className="text-secondary-500 max-w-md mb-8">
        It seems like the page you were trying to reach doesn't exist or might have been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/" 
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Back to Home
        </Link>
        <Link 
          to="/products" 
          className="px-6 py-3 bg-white border border-secondary-300 text-secondary-800 rounded-md hover:bg-secondary-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;