import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-2xl font-bold text-indigo-600">ShopCart</Link>
          </div>
          
          <nav>
            <ul className="flex space-x-8">
              <li>
                <Link 
                  to="/cart" 
                  className={`${location.pathname === '/cart' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600'}`}
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link 
                  to="/checkout" 
                  className={`${location.pathname === '/checkout' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600'}`}
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center">
            <div className="relative">
              <Link to="/cart" className="text-gray-600 hover:text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 