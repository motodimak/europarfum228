import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import LightPillar from '../background/LightPillar';
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
    <div className="relative min-h-screen font-body isolate">
      <LightPillar
        className="site-light-pillar"
        topColor="#1f4b46"
        bottomColor="#b68b73"
        intensity={1.08}
        rotationSpeed={0.4}
        glowAmount={0.0034}
        pillarWidth={3.15}
        pillarHeight={0.4}
        noiseIntensity={0.1}
        pillarRotation={58}
        interactive={false}
        mixBlendMode="screen"
        quality="medium"
      />
      <div className="nordic-ambient" />
      <div className="readability-veil" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_28%,hsla(var(--primary),0.12),transparent_42%),radial-gradient(circle_at_80%_12%,hsla(var(--accent),0.1),transparent_38%)]" />

      <div className="relative z-10">
        <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
        <main className="pt-16 md:pt-20">
          <Outlet />
        </main>
        <Footer />
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} />
    </div>
  );
}