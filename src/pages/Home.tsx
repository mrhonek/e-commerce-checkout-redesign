import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TruckIcon, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: 'Wireless Noise-Cancelling Headphones',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    category: 'Electronics',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Premium Leather Wallet',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1627123368891-78a003113d2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVhdGhlciUyMHdhbGxldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
    category: 'Accessories',
    rating: 4.6,
  },
  {
    id: 3,
    name: 'Stainless Steel Water Bottle',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1611514615258-0b095b873b24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8d2F0ZXIlMjBib3R0bGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
    category: 'Home & Kitchen',
    rating: 4.5,
  },
  {
    id: 4,
    name: 'Cotton T-Shirt',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dCUyMHNoaXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
    category: 'Clothing',
    rating: 4.3,
  }
];

// Mock data for categories
const categories = [
  {
    id: 1,
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWxlY3Ryb25pY3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 2,
    name: 'Clothing',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xvdGhpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 3,
    name: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9tZSUyMGtpdGNoZW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 4,
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhdXR5JTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
  }
];

// Helper function for image error handling
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Product+Image';
};

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop the Latest Trends</h1>
              <p className="text-xl mb-8">
                Discover quality products with fast shipping and secure checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors inline-flex items-center"
                >
                  Shop Now <ShoppingBag className="ml-2" size={18} />
                </Link>
                <Link
                  to="/products/category/deals"
                  className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white/10 transition-colors"
                >
                  Browse Deals
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c2hvcHBpbmclMjBvbmxpbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60"
                alt="Online Shopping"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                <TruckIcon className="text-blue-600 mr-4" size={24} />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
                  <p className="text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                <ShieldCheck className="text-blue-600 mr-4" size={24} />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
                  <p className="text-gray-600">100% secure checkout</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                <Clock className="text-blue-600 mr-4" size={24} />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quick Delivery</h3>
                  <p className="text-gray-600">Fast & reliable shipping</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                <ShoppingBag className="text-blue-600 mr-4" size={24} />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
                  <p className="text-gray-600">30-day money back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link to="/products" className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                View All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-500 mb-1">{product.category}</div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        <div className="text-yellow-400 text-sm">
                          {'★'.repeat(Math.round(product.rating))}
                          <span className="text-gray-400 ml-1">({product.rating})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <Link
                  to={`/products/category/${category.name.toLowerCase().replace(' & ', '-')}`}
                  key={category.id}
                  className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Promo Banner */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Summer Sale
                  </h2>
                  <p className="text-gray-300 text-xl mb-8">
                    Get up to 50% off on selected items. Limited time offer.
                  </p>
                  <Link
                    to="/products/category/sale"
                    className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors inline-block w-fit"
                  >
                    Shop the Sale
                  </Link>
                </div>
                <div className="md:w-1/2">
                  <img
                    src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2hvcHBpbmclMjBzYWxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60"
                    alt="Summer Sale"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Stay updated with the latest products, exclusive offers, and shopping tips.
            </p>
            <form className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home; 