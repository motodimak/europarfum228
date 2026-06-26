import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Background gradient atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/50" />
      
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
          {/* Text */}
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Парфюмерия премиум класса
              </p>
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-6">
                Искусство<br />
                <em className="font-normal">аромата</em>
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10">
                Откройте мир изысканных композиций, где каждый флакон — это история, рассказанная через ноты и аккорды.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                Смотреть каталог
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative w-[280px] md:w-[400px] lg:w-[480px]"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="Luxury perfume bottle"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative blur */}
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-[hsl(var(--lavender))]/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}