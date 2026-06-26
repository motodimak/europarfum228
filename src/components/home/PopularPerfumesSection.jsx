import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../products/ProductCard'

const perfumes = [
  { name: 'Amber Noir', brand: 'Maison Select', notes: 'амбра · ваниль · мускус', price: '8 900', category: 'oriental', tint: '#8b5e3c' },
  { name: 'Cedar Rush', brand: 'Maison Select', notes: 'кедр · ветивер · специи', price: '9 400', category: 'woody', tint: '#4f5f44' },
  { name: 'Neroli Bloom', brand: 'Maison Select', notes: 'нероли · бергамот · жасмин', price: '7 700', category: 'citrus', tint: '#c58d4a' },
  { name: 'Velvet Oud', brand: 'Maison Select', notes: 'уд · ладан · кожа', price: '12 300', category: 'oriental', tint: '#4d2f2f' },
  { name: 'Fresh Linen', brand: 'Maison Select', notes: 'альдегиды · белый чай · мускус', price: '6 800', category: 'aldehydic', tint: '#7992a3' },
  { name: 'Rose Atelier', brand: 'Maison Select', notes: 'роза · пион · кашмеран', price: '8 200', category: 'floral', tint: '#b56b86' },
  { name: 'Coco Suede', brand: 'Maison Select', notes: 'кокос · ирис · сандал', price: '10 100', category: 'gourmand', tint: '#8e725c' },
  { name: 'Green Fig', brand: 'Maison Select', notes: 'инжир · листья · амбра', price: '7 900', category: 'fruity', tint: '#5f7b4b' },
]

export default function PopularPerfumesSection({ products = [] }) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-32">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Ходовые позиции
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold">
            Популярные ароматы
          </h2>
        </div>
        <Link
          to="/catalog"
          className="hidden md:flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Смотреть каталог <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      <Link
        to="/catalog"
        className="md:hidden flex items-center justify-center gap-2 mt-10 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Смотреть каталог <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  )
}
