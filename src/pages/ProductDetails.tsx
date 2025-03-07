import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Star, CheckCircle, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/formatters';

// Get API URL from environment variable or use the deployed backend URL
const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-checkout-api-production.up.railway.app/api';

// Make sure the API URL doesn't end with a slash
const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

interface Product {
  _id: string;
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
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productUrl = `${baseUrl}/products/${productId}`;
        console.log(`[Debug] Fetching product from: ${productUrl}`);
        
        // Use the constructed URL
        const response = await fetch(productUrl);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // For demo purposes, use a placeholder product if API is not available
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && loading) {
      setTimeout(() => {
        setProduct({
          _id: productId || '1',
          name: 'Premium Wireless Headphones',
          description: 'Experience premium sound quality with these wireless headphones. Features noise cancellation, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers and professionals alike.',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          category: 'Electronics',
          inStock: true,
          featured: true,
          rating: 4.8,
          reviews: 124
        });
        setLoading(false);
      }, 1000);
    }
  }, [loading, productId]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        _id: product._id,
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