import React from 'react';
import { Image } from '../ui/Image';

interface CartItemProps {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  image,
  onUpdateQuantity,
  onRemove
}) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    onUpdateQuantity(id, newQuantity);
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            className="w-full h-full object-center object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      
      <div className="ml-4 flex-1 flex flex-col">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          <p className="text-lg font-medium text-gray-900">${price.toFixed(2)}</p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <label htmlFor={`quantity-${id}`} className="mr-2 text-sm text-gray-600">
              Qty:
            </label>
            <select
              id={`quantity-${id}`}
              name="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-sm"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Remove
          </button>
        </div>
        
        <p className="mt-1 text-sm text-gray-500">
          Subtotal: ${(price * quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default CartItem; 