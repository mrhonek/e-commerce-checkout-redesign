import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl font-bold text-gray-900 mb-2">404</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Page Not Found</h1>
          <div className="mb-8">
            <p className="text-gray-600 text-lg">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors w-full sm:w-auto"
            >
              <Home size={18} />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md transition-colors w-full sm:w-auto"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
          
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-gray-500">
              Looking for something specific? Check out these popular destinations:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Link to="/products" className="text-blue-600 hover:text-blue-800 transition-colors">
                Products
              </Link>
              <Link to="/cart" className="text-blue-600 hover:text-blue-800 transition-colors">
                Shopping Cart
              </Link>
              <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="text-blue-600 hover:text-blue-800 transition-colors">
                Create Account
              </Link>
              <Link to="/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound; 