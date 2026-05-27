import React, { useState } from 'react';
import { toast } from 'sonner';

const products = [
  {
    id: 1,
    name: 'PAWLSE Signature T-Shirt',
    price: 499,
    img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjB0LXNoaXJ0JTIwbWVyY2hhbmRpc2V8ZW58fHx8MTc3MTY3NTk3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Apparel',
    rating: 4.8
  },
  {
    id: 2,
    name: 'Save the Strays Tote Bag',
    price: 249,
    img: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3RlJTIwYmFnfGVufDF8fHx8MTc3MTY3NTk3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Accessories',
    rating: 4.9
  },
  {
    id: 3,
    name: 'Happy Paw Ceramic Mug',
    price: 349,
    img: 'https://images.unsplash.com/photo-1517256011271-bf07c6f37691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBtdWclMjBtZXJjaGFuZGlzZXxlbnwxfHx8fDE3NzE2NzU5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Kitchen',
    rating: 4.7
  },
  {
    id: 4,
    name: 'Mission Supporter Pin Set',
    price: 149,
    img: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBwaW5zJTIwc3RpY2tlcnN8ZW58fHx8MTc3MTY3NTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Accessories',
    rating: 5.0
  }
];

export function MerchStore() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCartItems([...cartItems, { ...product, quantity: 1 }]);
    setCartOpen(true);
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    null
  );
}
