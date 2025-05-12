import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  size: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color: string, size: string) => void;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      
      addToCart: (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          i => i.id === item.id && i.color === item.color && i.size === item.size
        );
        
        let newItems: CartItem[];
        
        if (existingItemIndex > -1) {
          // Item already exists, update quantity
          newItems = [...currentItems];
          newItems[existingItemIndex].quantity += item.quantity;
        } else {
          // Add new item
          newItems = [...currentItems, item];
        }
        
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items: newItems, itemCount, subtotal });
      },
      
      removeFromCart: (id, color, size) => {
        const newItems = get().items.filter(
          item => !(item.id === id && item.color === color && item.size === size)
        );
        
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items: newItems, itemCount, subtotal });
      },
      
      updateQuantity: (id, color, size, quantity) => {
        if (quantity < 1) return;
        
        const newItems = get().items.map(item => {
          if (item.id === id && item.color === color && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        });
        
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items: newItems, itemCount, subtotal });
      },
      
      clearCart: () => {
        set({ items: [], itemCount: 0, subtotal: 0 });
      },
    }),
    {
      name: 'shopping-cart',
    }
  )
);