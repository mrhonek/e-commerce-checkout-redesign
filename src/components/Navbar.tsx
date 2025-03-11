import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Heart, 
  LogOut,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setIsUserMenuOpen(false);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (!isUserMenuOpen) {
      setIsSearchOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const categories = [
    { name: 'Electronics', path: '/products/category/electronics' },
    { name: 'Clothing', path: '/products/category/clothing' },
    { name: 'Home & Kitchen', path: '/products/category/home-kitchen' },
    { name: 'Beauty', path: '/products/category/beauty' },
    { name: 'Sale', path: '/products/category/sale' },
    { name: 'Deals', path: '/products/category/deals' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Hamburger Menu */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="block md:hidden mr-4"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">RhnkShop</span>
            </Link>
          </div>

          {/* Desktop Navigation Links - hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Home
            </Link>
            <div className="relative group">
              <Link
                to="/products"
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Products
                <ChevronDown className="h-4 w-4 ml-1" />
              </Link>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    to="/products/category/home-kitchen"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Home & Kitchen
                  </Link>
                  <Link
                    to="/products/category/beauty"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Beauty
                  </Link>
                  <Link
                    to="/products/category/electronics"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Electronics
                  </Link>
                  <Link
                    to="/products/category/sale"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sale
                  </Link>
                  <Link
                    to="/products/category/deals"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Deals
                  </Link>
                </div>
              </div>
            </div>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cart
            </Link>
          </nav>

          {/* Icons on the right */}
          <div className="flex items-center space-x-4">
            {/* Remove the search button */}
            
            {/* Remove the user/account button */}
            
            {/* Cart Icon with Item Count */}
            <Link 
              to="/cart"
              className="block text-gray-700 hover:text-blue-600 transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Remove the search bar */}
      
      {/* Mobile Menu - slide in from left when toggled */}
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="py-3 px-4 bg-white shadow-inner">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products/category/home-kitchen"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2 ml-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link
                  to="/products/category/beauty"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2 ml-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Beauty
                </Link>
              </li>
              <li>
                <Link
                  to="/products/category/electronics"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2 ml-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products/category/sale"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2 ml-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sale
                </Link>
              </li>
              <li>
                <Link
                  to="/products/category/deals"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2 ml-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Deals
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="block text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart
                </Link>
              </li>
              {/* Remove the login/my account links from mobile menu */}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar; 