import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReviewStars from '@/components/ReviewStars';
import { getAverageRating } from '@/lib/reviewStore';

const categoryLabels = {
  aquatic: 'Акватический',
  aldehydic: 'Альдегидный',
  amber: 'Амбровый',
  balsamic: 'Бальзамический',
  oriental: 'Восточный',
  gourmand: 'Гурманский',
  woody: 'Древесный',
  leather: 'Кожаный',
  musky: 'Мускусный',
  spicy: 'Пряный',
  sweet: 'Сладкий',
  tobacco: 'Табачный',
  fruity: 'Фруктовый',
  fougere: 'Фужерный',
  floral: 'Цветочный',
  citrus: 'Цитрусовый',
  other: 'Другая',
};

export default function ProductCard({ product, index = 0 }) {
  const hasSale = product.sale_price && product.sale_price < product.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="h-full"
    >
      <Link
        to={`/product/${product.id}`}
        className="group block h-full rounded-2xl border border-border/85 bg-card/88 backdrop-blur-sm p-3 md:p-4 shadow-[0_12px_34px_-22px_rgba(8,24,28,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_24px_50px_-24px_rgba(8,24,28,0.68)]"
      >
        <div className="aspect-square overflow-hidden rounded-xl bg-secondary mb-4 relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-heading text-4xl">
              N
            </div>
          )}
          {product.bestseller && (
            <div className="absolute left-3 top-3 rounded-full bg-[#630b05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white shadow-md">
              Хит продаж
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
        </div>
        <div className="space-y-1.5">
          <p className="font-body text-[11px] tracking-widest uppercase text-muted-foreground/90">
            {product.brand}
          </p>
          <h3 className="font-heading text-base md:text-lg font-medium leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground/90">
            <ReviewStars rating={getAverageRating(product.id)} size={14} />
            <span>{getAverageRating(product.id).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            {hasSale ? (
              <>
                <span className="font-body text-sm text-muted-foreground/85 line-through">
                  {(product.price || 0).toLocaleString('ru-RU')} ₽
                </span>
                <span className="font-body text-sm font-semibold text-emerald-600">
                  {(product.sale_price || 0).toLocaleString('ru-RU')} ₽
                </span>
              </>
            ) : (
              <span className="font-body text-sm font-semibold">
                {(product.price || 0).toLocaleString('ru-RU')} ₽
              </span>
            )}
            {product.volume_ml && (
              <span className="font-body text-xs text-muted-foreground">{product.volume_ml} мл</span>
            )}
          </div>
          {product.category && (
            <span className="inline-block mt-2 font-body text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              {categoryLabels[product.category] || product.category}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}