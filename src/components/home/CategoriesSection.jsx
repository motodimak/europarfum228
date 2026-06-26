import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowRight } from 'lucide-react';
import { mergeProducts } from '@/lib/productStore';

const categories = [
  { key: 'aquatic', label: 'Акватические', desc: 'Морские ноты и свежесть воды' },
  { key: 'aldehydic', label: 'Альдегидные', desc: 'Чистые, воздушные и яркие ноты' },
  { key: 'amber', label: 'Амбровые', desc: 'Тёплые, смолистые оттенки' },
  { key: 'balsamic', label: 'Бальзамические', desc: 'Смолистые, густые акценты' },
  { key: 'oriental', label: 'Восточные', desc: 'Пряные и восточные ноты' },
  { key: 'gourmand', label: 'Гурманские', desc: 'Сладкие десертные композиции' },
  { key: 'woody', label: 'Древесные', desc: 'Тёплое дерево, кедр и сандал' },
  { key: 'other', label: 'Другая', desc: 'Редкие и необычные ароматы' },
  { key: 'leather', label: 'Кожаные', desc: 'Глубокие кожаные акценты' },
  { key: 'musky', label: 'Мускусные', desc: 'Тёплый мускус и мягкая база' },
  { key: 'spicy', label: 'Пряные', desc: 'Острые, ароматные специи' },
  { key: 'sweet', label: 'Сладкие', desc: 'Сладкие и аппетитные ноты' },
  { key: 'tobacco', label: 'Табачные', desc: 'Дымные табачные акценты' },
  { key: 'fruity', label: 'Фруктовые', desc: 'Сочные фруктовые ноты' },
  { key: 'fougere', label: 'Фужерные', desc: 'Зелёные и пряные фужерные мотивы' },
  { key: 'floral', label: 'Цветочные', desc: 'Нежные цветочные акценты' },
  { key: 'citrus', label: 'Цитрусовые', desc: 'Свежие цитрусовые ароматы' },
];

function CategoryProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="group flex gap-3 items-start hover:bg-secondary/40 rounded-lg p-2 -mx-2 transition-colors duration-200">
      <div className="w-14 h-14 rounded-md overflow-hidden bg-secondary flex-shrink-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-heading text-xl">N</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-[11px] text-muted-foreground truncate">{product.brand}</p>
        <p className="font-heading text-sm font-medium leading-tight truncate">{product.name}</p>
        <p className="font-body text-sm font-semibold mt-0.5">{(product.price || 0).toLocaleString('ru-RU')} ₽</p>
        {product.description && (
          <p className="font-body text-[11px] text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
        )}
      </div>
    </Link>
  );
}

function CategoryBlock({ category, index }) {
  const { data: products = [] } = useQuery({
    queryKey: ['category-products', category.key],
    queryFn: () => base44.entities.Product.filter({ category: category.key }, '-created_date', 2),
  });

  const mergedProducts = React.useMemo(
    () => mergeProducts(products).filter((product) => product.category === category.key),
    [products, category.key]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col gap-5 hover:border-border hover:shadow-md transition-all duration-300 bg-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-xl font-semibold">{category.label}</h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">{category.desc}</p>
        </div>
        <Link
          to={`/catalog?category=${category.key}`}
          className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap mt-1"
        >
          Все <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Products */}
      {mergedProducts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {mergedProducts.map((product) => (
            <CategoryProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="font-body text-xs text-muted-foreground/50 py-2">Скоро появятся ароматы</p>
      )}
    </motion.div>
  );
}

export default function CategoriesSection() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-32">
      <div className="mb-12 md:mb-16">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Ароматы по настроению
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-semibold">
          Категории
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {categories.map((cat, i) => (
          <CategoryBlock key={cat.key} category={cat} index={i} />
        ))}
      </div>
    </section>
  );
}