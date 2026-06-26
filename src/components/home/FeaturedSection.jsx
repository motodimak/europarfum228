import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';

export default function FeaturedSection({ products = [] }) {
  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-32">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Избранное
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold">
            Бестселлеры
          </h2>
        </div>
        <Link
          to="/catalog"
          className="hidden md:flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Все ароматы <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <Link
        to="/catalog"
        className="md:hidden flex items-center justify-center gap-2 mt-10 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Все ароматы <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}