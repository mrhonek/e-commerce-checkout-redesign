import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { CheckoutProvider } from './contexts/CheckoutContext';
import { AuthProvider } from './contexts/AuthContext';

// Import components and pages
import { Navbar, Footer } from './components';
import { 
  Home, 
  Login, 
  Register, 
  NotFound,
  Checkout,
  OrderConfirmation,
  Cart,
  Products,
  ProductDetails
} from './pages';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CheckoutProvider>
            <div className="flex flex-col min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetails />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/products/category/:category" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </CheckoutProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
