import React from 'react';
import { useCart } from '../hooks/useCart';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (productId: string, color: string, size: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, color, size, newQuantity);
    } else {
      removeFromCart(productId, color, size);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total: number, item: import('../hooks/useCart').CartItem) => total + (item.price * item.quantity), 0);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8 text-primary-700">Giỏ hàng</h1>
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
          <a href="/products" className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold shadow hover:bg-primary-600 transition">Tiếp tục mua sắm</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8 text-primary-700">Giỏ hàng</h1>
      <div className="grid grid-cols-1 gap-8">
        {items.map((item: import('../hooks/useCart').CartItem) => (
          <div key={item.id + item.color + item.size} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl shadow-xl">
            <img
              src={item.image}
              alt={item.name}
              className="w-32 h-32 object-cover rounded-xl shadow-md border"
            />
            <div className="flex-1 w-full">
              <h3 className="text-lg md:text-xl font-bold text-primary-700 mb-1">{item.name}</h3>
              <p className="text-primary-600 font-semibold mb-1">{item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
              <p className="text-gray-500 text-sm mb-2">Màu: {item.color} | Size: {item.size}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.color, item.size, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition"
                >
                  -
                </button>
                <span className="w-10 text-center text-lg font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.color, item.size, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id, item.color, item.size)}
                  className="ml-4 text-red-600 hover:text-white hover:bg-red-500 rounded-full px-3 py-1 text-sm font-semibold transition"
                >
                  Xóa
                </button>
              </div>
            </div>
            <div className="text-right min-w-[120px]">
              <p className="font-bold text-xl text-primary-700">{(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            </div>
          </div>
        ))}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-xl font-semibold text-gray-700">Tổng cộng:</div>
          <div className="text-2xl font-bold text-primary-700">{calculateTotal().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
          <a
            href="/checkout"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 text-white font-bold shadow-lg text-lg hover:from-purple-500 hover:to-primary-500 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Thanh toán
          </a>
        </div>
      </div>
    </div>
  );
}