import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HeroSection from '../components/home/HeroSection';
import FeaturedSection from '../components/home/FeaturedSection';
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

export default function Home() {
  const { data: remoteProducts = [] } = useQuery({
    queryKey: ['all-products-home'],
    queryFn: fetchAllProducts,
  });

  const mergedProducts = React.useMemo(() => remoteProducts, [remoteProducts])

  const bestsellerProducts = React.useMemo(() => {
    return mergedProducts.filter((product) => product.bestseller).slice(0, 8)
  }, [mergedProducts])

  const popularProducts = React.useMemo(() => {
    return mergedProducts.filter((product) => product.popular).slice(0, 8)
  }, [mergedProducts])

  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />
      {bestsellerProducts.length > 0 && <FeaturedSection products={bestsellerProducts} />}
      {popularProducts.length > 0 && <PopularPerfumesSection products={popularProducts} />}
      <CategoriesSection />
    </div>
  );
}