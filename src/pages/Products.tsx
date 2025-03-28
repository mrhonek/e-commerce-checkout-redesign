import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Filter, Search, ChevronDown, Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Update the API base URL constant to use the correct URL
const API_BASE_URL = 'https://e-commerce-checkout-api-production.up.railway.app/api';

// Debug log function
const logDebug = (message: string, data?: any) => {
  console.log(`[Debug] ${message}`, data || '');
};

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
  slug?: string; // Add optional slug property
  onSale?: boolean; // For sale items
  isDeal?: boolean; // For deal items
  tags?: string[]; // For products with tags
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';

const Products: React.FC = () => {
  const { category } = useParams<{ category: string }>();
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

  // Update selected category when route parameter changes
  useEffect(() => {
    if (category) {
      // Format category from URL (e.g., "home-kitchen" -> "home & kitchen" or "electronics" -> "electronics")
      let formattedCategory = category.toLowerCase();
      
      // Handle special cases like "home-kitchen" -> "home & kitchen"
      if (formattedCategory === 'home-kitchen') {
        formattedCategory = 'home & kitchen';
      }
      
      setSelectedCategory(formattedCategory);
    }
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let endpoint = `${API_BASE_URL}/products`;
        
        // Check if we need to fetch from a special endpoint
        if (category) {
          // All categories (including sale and deals) should use the category endpoint
          endpoint = `${API_BASE_URL}/products/category/${category}`;
        }
        
        console.log(`Fetching products from endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products from ${endpoint}`);
        }
        
        const data = await response.json();
        console.log('Products fetched from API:', data);
        
        // Handle the case where data isn't an array
        const productsArray = Array.isArray(data) ? data : 
                             (data.products ? data.products : 
                             (data.items ? data.items : []));
        
        if (!Array.isArray(productsArray)) {
          console.error('API returned data in unexpected format:', data);
          throw new Error('Products data is not in the expected format');
        }
        
        // Log details about featured items
        const featuredProducts = productsArray.filter((p: any) => 
          p.isFeatured === true || p.is_featured === true || p.featured === true
        );
        console.log(`Found ${featuredProducts.length} featured products in API response:`, featuredProducts);
        
        setProducts(productsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        
        // Use fallback products only if API fails
        console.log('Using fallback products due to API error');
        // Instead of using a separate sample products variable, let's create one here
        const fallbackProducts = [
          {
            _id: '1',
            name: 'Wireless Headphones',
            description: 'Premium wireless headphones with noise cancellation.',
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            category: 'Electronics',
            inStock: true,
            featured: true,
            rating: 4.5,
            reviews: 120
          },
          {
            _id: '2',
            name: 'Smart Watch',
            description: 'Track your fitness and stay connected with this smartwatch.',
            price: 199.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            category: 'Electronics',
            inStock: true,
            featured: true,
            rating: 4.8,
            reviews: 95
          }
        ];
        
        console.warn('Falling back to sample products due to API error');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]); // Add category as a dependency so it refetches when the category changes

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
    // Ensure inStock is true by default if not explicitly set to false
    product.inStock = product.inStock !== false;
    
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Special handling for "sale" and "deals" categories
    if (selectedCategory === 'sale') {
      // For sale category, check onSale flag or 'sale' tag
      const isSaleProduct = 
        product.onSale === true || 
        (product.tags && Array.isArray(product.tags) && product.tags.includes('sale'));
      
      if (!isSaleProduct) {
        return false;
      }
    } else if (selectedCategory === 'deals') {
      // For deals category, check isDeal flag or 'deal' tag
      const isDealProduct = 
        product.isDeal === true || 
        (product.tags && Array.isArray(product.tags) && product.tags.includes('deal'));
      
      if (!isDealProduct) {
        return false;
      }
    } else if (selectedCategory !== 'all') {
      // Standard category filtering for other categories
      const productCategory = product.category?.toLowerCase() || '';
      if (productCategory !== selectedCategory) {
        return false;
      }
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

  // Debug output for filtered products
  console.log(`After filtering: ${filteredProducts.length} products remain out of ${products.length} total`);
  if (selectedCategory === 'sale' || selectedCategory === 'deals') {
    console.log(`Filtered ${selectedCategory} products:`, filteredProducts);
  }

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
            <div key={product._id || product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Link 
                to={`/products/${product._id?.toString() || product.id || product.slug || product.name?.toLowerCase().replace(/\s+/g, '-') || 'product-not-found'}`}
                className="block"
                onClick={(e) => {
                  // Add debug logging for product link
                  console.log('Product link clicked:', product);
                  if (!product._id) {
                    console.warn('Product missing _id:', product);
                  }
                }}
              >
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