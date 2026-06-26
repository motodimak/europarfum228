import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import { mergeCartItems } from '@/lib/cartStore';

export default function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const remoteItems = await base44.entities.CartItem.list()
        return mergeCartItems(remoteItems)
      } catch (error) {
        return mergeCartItems([])
      }
    },
  });

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen font-body">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} />
    </div>
  );
}