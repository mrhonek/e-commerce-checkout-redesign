import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Star, CheckCircle, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/formatters';
import { handleImageError } from '../utils/imageUtils';

// API base URL with explicit /api/ path
const API_BASE_URL = 'https://checkout-redesign-backend-production.up.railway.app/api';

// Sample products that match the IDs used on the home page
const sampleProducts = [
  {
    _id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and comfortable over-ear design. Perfect for travel, work, or enjoying your favorite music without distractions.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    category: 'Electronics',
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 123
  },
  {
    _id: '2',
    name: 'Premium Leather Wallet',
    description: 'Handcrafted genuine leather wallet with multiple card slots, bill compartments, and RFID protection. Elegant, durable, and the perfect everyday carry.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1517254797898-04edd251bfb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    category: 'Accessories',
    inStock: true,
    featured: true,
    rating: 4.6,
    reviews: 89
  },
  {
    _id: '3',
    name: 'Stainless Steel Water Bottle',
    description: 'Double-walled vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Durable, leak-proof design with an eco-friendly approach to hydration.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'Home & Kitchen',
    inStock: true,
    featured: true,
    rating: 4.5,
    reviews: 76
  },
  {
    _id: '4',
    name: 'Cotton T-Shirt',
    description: 'Soft, breathable 100% organic cotton t-shirt with a modern fit. Pre-shrunk, durable, and available in multiple colors for everyday casual wear.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dCUyMHNoaXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
    category: 'Clothing',
    inStock: true,
    featured: true,
    rating: 4.3,
    reviews: 112
  }
];

interface Product {
  _id: string;
  id?: string; // Add optional id field to handle different API responses
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
}

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Fetch from the Railway API
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        
        const productData = await response.json();
        console.log('Product details fetched from API:', productData);
        
        setProduct(productData);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        
        // Only fall back to sample product if API fetch fails
        console.warn('Falling back to sample product data due to API error');
        // Create a fallback product directly here instead of depending on sampleProducts
        const fallbackProduct = {
          _id: productId || '1',
          name: 'Premium Wireless Headphones',
          description: 'Experience premium sound quality with these wireless headphones. Features noise cancellation, 30-hour battery life, and comfortable over-ear design.',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          category: 'Electronics',
          inStock: true,
          featured: true,
          rating: 4.8,
          reviews: 124
        };
        
        setProduct(fallbackProduct);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        _id: product._id || product.id || '',
        name: product.name,
        price: product.price,
        image: product.image
      }, quantity);
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div>
              <h3 className="text-red-800 font-medium">Product Not Found</h3>
              <p className="text-sm text-red-700 mt-1">{error || 'Unable to load product details'}</p>
              <Link to="/products" className="mt-3 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-500">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="flex items-center">
            <Link to="/products" className="text-gray-500 hover:text-blue-600">Products</Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="flex items-center">
            <Link to={`/products/category/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-blue-600">
              {product.category}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-gray-700">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-auto object-cover"
            onError={(e) => handleImageError(e, 'large')}
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
          
          {/* Price */}
          <div className="mb-6">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          {/* Stock Status */}
          <div className="mb-6 flex items-center">
            {product.inStock ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-600 font-medium">In Stock</span>
              </>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
            
            <div className="ml-6 flex items-center">
              <Truck className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-600">Free delivery</span>
            </div>
          </div>
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <select
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              disabled={!product.inStock}
              className="mt-1 block w-24 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          
          {/* Add to Cart and Wishlist */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || addedToCart}
              className={`flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                !product.inStock 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : addedToCart 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {addedToCart ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </button>
            
            <button
              className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Heart className="h-5 w-5 mr-2" />
              Add to Wishlist
            </button>
          </div>
          
          {/* Additional information could go here */}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 