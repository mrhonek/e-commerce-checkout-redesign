import { CartItem } from '../store/slices/cartSlice';

// Mock product data
export const products = [
  {
    id: 'p1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and comfortable over-ear design.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    category: 'Electronics',
    stock: 15
  },
  {
    id: 'p2',
    name: 'Smartphone Leather Case',
    description: 'Genuine leather protective case with card slots and premium stitching for the latest smartphone models.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1563642421748-5047b6585a4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    category: 'Accessories',
    stock: 50
  },
  {
    id: 'p3',
    name: 'Ultra-Fast USB-C Charging Cable',
    description: 'Durable 6ft USB-C cable with fast charging capabilities and woven nylon exterior for longer life.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    category: 'Accessories',
    stock: 100
  },
  {
    id: 'p4',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life in a sleek, waterproof design.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    category: 'Electronics',
    stock: 25
  },
  {
    id: 'p5',
    name: 'Portable Bluetooth Speaker',
    description: 'Compact, waterproof speaker with powerful sound, 24-hour battery life, and multi-device connectivity.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    category: 'Electronics',
    stock: 30
  }
];

// Function to generate a mock cart with random products
export const generateMockCart = (): CartItem[] => {
  const numberOfItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
  const mockCart: CartItem[] = [];
  
  // Create a shuffled copy of the products array
  const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
  
  // Take the first numberOfItems products
  for (let i = 0; i < numberOfItems; i++) {
    const product = shuffledProducts[i];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    
    mockCart.push({
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image
    });
  }
  
  return mockCart;
};

// Generate a mock order ID
export const generateMockOrderId = (): string => {
  const prefix = 'ORD';
  const randomNumbers = Math.floor(100000 + Math.random() * 900000); // 6-digit number
  return `${prefix}-${randomNumbers}`;
}; 