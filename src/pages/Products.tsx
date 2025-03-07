import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ChevronDown, Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Hardcode the complete API endpoint for now to ensure it's correct
const API_ENDPOINT = 'https://e-commerce-checkout-api-production.up.railway.app/api/products';

// Debug log function
const logDebug = (message: string, data?: any) => {
  console.log(`[Debug] ${message}`, data || '');
};

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

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  
  // UI state
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Categories derived from products
  const categories = ['all', ...new Set(products.map(product => product.category.toLowerCase()))];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        logDebug('Fetching products from:', API_ENDPOINT);
        
        // Use the hardcoded endpoint
        const response = await fetch(API_ENDPOINT);
        
        logDebug('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        logDebug('Response text:', text.substring(0, 100) + '...');
        
        try {
          const data = JSON.parse(text);
          logDebug('Parsed data:', { count: data.length });
          setProducts(data);
        } catch (jsonError: unknown) {
          const errorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error';
          throw new Error(`Failed to parse JSON: ${errorMessage}`);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // For demo purposes, use placeholder products if API is not available
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && loading) {
      setTimeout(() => {
        // Sample product data
        const sampleProducts: Product[] = [
          {
            _id: '1',
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling wireless headphones with long battery life.',
            price: 199.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            category: 'Electronics',
            inStock: true,
            featured: true,
            rating: 4.8,
            reviews: 124
          },
          {
            _id: '2',
            name: 'Smart Watch',
            description: 'Track your fitness and stay connected with this premium smart watch.',
            price: 249.99,
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
            category: 'Electronics',
            inStock: true,
            featured: false,
            rating: 4.5,
            reviews: 89
          },
          {
            _id: '3',
            name: 'Ergonomic Chair',
            description: 'Comfortable office chair with ergonomic design for long working hours.',
            price: 349.99,
            image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80',
            category: 'Furniture',
            inStock: true,
            featured: true,
            rating: 4.7,
            reviews: 56
          },
          {
            _id: '4',
            name: 'Coffee Maker',
            description: 'Automatic coffee maker with timer and multiple brew settings.',
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1585577490058-1a72f9c66bde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            category: 'Kitchen',
            inStock: false,
            featured: false,
            rating: 4.2,
            reviews: 42
          },
          {
            _id: '5',
            name: 'Winter Jacket',
            description: 'Warm and stylish winter jacket with water-resistant exterior.',
            price: 189.99,
            image: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            category: 'Clothing',
            inStock: true,
            featured: false,
            rating: 4.6,
            reviews: 78
          },
          {
            _id: '6',
            name: 'Smartphone',
            description: 'Latest model smartphone with high-resolution camera and fast processor.',
            price: 899.99,
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2327&q=80',
            category: 'Electronics',
            inStock: true,
            featured: true,
            rating: 4.9,
            reviews: 212
          }
        ];
        
        setProducts(sampleProducts);
        setLoading(false);
      }, 1000);
    }
  }, [loading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange(prev => 
      name === 'min' ? [Number(value), prev[1]] : [prev[0], Number(value)]
    );
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter products based on current filter settings
  const filteredProducts = products.filter(product => {
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory !== 'all' && product.category.toLowerCase() !== selectedCategory) {
      return false;
    }
    
    // Filter by price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Filter by stock status
    if (inStockOnly && !product.inStock) {
      return false;
    }
    
    return true;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        // In a real app, you'd sort by date
        return a._id > b._id ? -1 : 1;
      case 'featured':
      default:
        // Featured products first, then sort by rating
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Products</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Products</h1>
      
      {/* Search and Filter Controls */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          
          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={toggleFilters}
            className="md:hidden flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-1 transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Filters (collapsible on mobile) */}
        <div className={`md:flex ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm mb-4 md:mb-0 md:flex items-center space-x-6">
            {/* Category Filter */}
            <div className="mb-4 md:mb-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-4 md:mb-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="flex items-center space-x-2">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="min"
                    min="0"
                    value={priceRange[0]}
                    onChange={handlePriceRangeChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-1 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Min"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="max"
                    min="0"
                    value={priceRange[1]}
                    onChange={handlePriceRangeChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-1 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            
            {/* In Stock Filter */}
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Link to={`/products/${product._id}`} className="block">
                <div className="relative pb-[60%] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="absolute w-full h-full object-cover"
                  />
                  {product.featured && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white font-bold py-1 px-3 rounded-full text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h2>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-600">
                      ({product.reviews})
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                    <span className="text-xs font-medium text-gray-500">{product.category}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
};

export default Products; 