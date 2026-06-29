import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';
import CatalogFilters from '../components/catalog/CatalogFilters';
import { Loader2 } from 'lucide-react';

const fetchCatalogProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data || []
}

export default function Catalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';

  const [category, setCategory] = useState(initialCategory);
  const [gender, setGender] = useState('all');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchCatalogProducts,
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catMatch = category === 'all' || p.category === category;
      const genMatch = gender === 'all' || p.gender === gender;
      return catMatch && genMatch;
    });
  }, [products, category, gender]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Наша коллекция
        </p>
        <h1 className="font-heading text-3xl md:text-5xl font-semibold mb-10">
          Каталог
        </h1>
      </motion.div>

      <CatalogFilters
        activeCategory={category}
        activeGender={gender}
        onCategoryChange={setCategory}
        onGenderChange={setGender}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-body text-muted-foreground">В этой категории пока нет ароматов</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mt-10">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}