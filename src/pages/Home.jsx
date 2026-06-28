import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import PopularPerfumesSection from '../components/home/PopularPerfumesSection';

const HERO_IMAGE = 'https://media.base44.com/images/public/69ede4f3bbf6ffb09c345510/267f53f86_generated_84f14b21.png';

const fetchAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) throw error
  return data || []
}

const isEnabledFlag = (value) => {
  if (value === true) return true
  if (value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  }
  return false
}

export default function Home() {
  const { data: remoteProducts = [] } = useQuery({
    queryKey: ['all-products-home'],
    queryFn: fetchAllProducts,
  });

  const mergedProducts = React.useMemo(() => remoteProducts, [remoteProducts])

  const popularProducts = React.useMemo(() => {
    return mergedProducts.filter((product) => isEnabledFlag(product.popular)).slice(0, 8)
  }, [mergedProducts])

  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />
      {popularProducts.length > 0 && <PopularPerfumesSection products={popularProducts} />}
      <CategoriesSection />
    </div>
  );
}