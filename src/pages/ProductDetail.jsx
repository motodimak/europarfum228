import React from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEffectivePrice, hasDiscount } from '@/lib/pricing';
import ReviewStars from '@/components/ReviewStars';
import { getAverageRating, getReviewCount, getUserReview, saveProductReview, getProductReviews } from '@/lib/reviewStore';

const categoryLabels = {
  floral: 'Цветочный',
  woody: 'Древесный',
  oriental: 'Восточный',
  citrus: 'Цитрусовый',
  gourmand: 'Гурманский',
  aquatic: 'Акватический',
  aldehydic: 'Альдегидный',
  amber: 'Амбровый',
  balsamic: 'Бальзамический',
  leather: 'Кожаный',
  musky: 'Мускусный',
  spicy: 'Пряный',
  sweet: 'Сладкий',
  tobacco: 'Табачный',
  fruity: 'Фруктовый',
  fougere: 'Фужерный',
  other: 'Другая',
};


const genderLabels = {
  unisex: 'Унисекс',
  feminine: 'Женский',
  masculine: 'Мужской',
};

export default function ProductDetail() {
  const { id } = useParams();
  const productId = String(id || '').trim().replace(/\/+$/, '');

  const queryClient = useQueryClient();

  const { data: product = null, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      // Fetch product from Supabase using regular select (not .single())
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
      
      if (error) {
        console.error('[ProductDetail] Query error:', error, 'ID:', productId);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('[ProductDetail] No rows found for ID:', productId);
        return null;
      }
      
      console.log('[ProductDetail] Found product:', data[0].id);
      return data[0];
    },
    retry: 1,
  });

  const userInfoRaw = typeof window === 'undefined' ? null : localStorage.getItem('clientRegistration')
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null

  const confirmedOrderIds = React.useMemo(() => [], [])

  const currentReview = getUserReview(productId, userInfo?.id)
  const [reviewRating, setReviewRating] = React.useState(currentReview?.rating || 0)
  const [reviewText, setReviewText] = React.useState(currentReview?.text || '')
  const [reviewSaved, setReviewSaved] = React.useState(Boolean(currentReview))

  React.useEffect(() => {
    if (currentReview) {
      setReviewSaved(true)
      setReviewRating(currentReview.rating || 0)
      setReviewText(currentReview.text || '')
    }
  }, [currentReview])

  const hasConfirmedOrder = confirmedOrderIds.includes(productId)
  const hasExistingReview = Boolean(currentReview)
  const userHasReview = reviewSaved || hasExistingReview
  const reviewDisplayRating = currentReview?.rating || reviewRating

  const onSaveReview = () => {
    if (!userInfo || !hasConfirmedOrder || reviewRating <= 0) return
    saveProductReview({
      product_id: productId,
      product_name: product?.name,
      user_id: userInfo.id,
      rating: reviewRating,
      text: reviewText,
    })
    setReviewSaved(true)
  }

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product) return
      const effectivePrice = getEffectivePrice(product)
      
      const { data: existingCart } = await supabase
        .from('carts')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle()

      if (existingCart) {
        await supabase
          .from('carts')
          .update({
            quantity: (existingCart.quantity || 1) + 1,
            product_price: effectivePrice,
            product_name: product.name,
            product_image: product.image_url,
            product_volume: product.volume_ml,
            product_category: product.category,
            product_gender: product.gender,
          })
          .eq('id', existingCart.id)
      } else {
        await supabase
          .from('carts')
          .insert([{
            product_id: productId,
            quantity: 1,
            product_name: product.name,
            product_price: effectivePrice,
            product_image: product.image_url,
            product_volume: product.volume_ml,
            product_category: product.category,
            product_gender: product.gender,
          }])
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const averageRating = getAverageRating(productId)
  const reviewCount = getReviewCount(productId)
  const reviews = getProductReviews(productId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 text-center">
        <p className="text-muted-foreground">Товар не найден</p>
        <Link to="/catalog" className="text-sm underline mt-4 inline-block">Вернуться в каталог</Link>
      </div>
    );
  }

  const notes = [
    { label: 'Верхние ноты', value: product.top_notes },
    { label: 'Ноты сердца', value: product.heart_notes },
    { label: 'Базовые ноты', value: product.base_notes },
  ].filter(n => n.value);
  const effectivePrice = getEffectivePrice(product)
  const discounted = hasDiscount(product)

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-16">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Каталог
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Image + Notes */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary relative">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 font-heading text-6xl">
                N
              </div>
            )}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="rounded-xl border border-border/70 bg-card/85 p-6 md:p-7 shadow-sm">
            <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-4">Ноты аромата</p>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.label}>
                    <p className="font-body text-xs font-semibold mb-1">{note.label}</p>
                    <p className="font-body text-sm text-muted-foreground">{note.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Ноты для этого аромата скоро появятся.</p>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
            {product.brand}
          </p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            {product.name}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-baseline gap-4">
              {discounted && (
                <span className="font-body text-base text-muted-foreground line-through">
                  {Number(product.price || 0).toLocaleString('ru-RU')} ₽
                </span>
              )}
              <span className="font-heading text-2xl md:text-3xl font-semibold text-primary">
                {Number(effectivePrice || 0).toLocaleString('ru-RU')} ₽
              </span>
              {product.volume_ml && (
                <span className="font-body text-sm text-muted-foreground">{product.volume_ml} мл</span>
              )}
            </div>

            <Button
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
              className="h-12 px-7 font-body text-xs md:text-sm tracking-[0.08em] uppercase rounded-lg border border-primary/20 shadow-md gap-2 shrink-0"
            >
              {addToCartMutation.isSuccess ? (
                <><Check className="w-4 h-4" /> Добавлено в корзину</>
              ) : (
                <><ShoppingBag className="w-4 h-4" /> Добавить в корзину</>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {product.category && (
              <span className="font-body text-[11px] tracking-wider uppercase px-3 py-1 rounded-full border border-border">
                {categoryLabels[product.category]}
              </span>
            )}
            {/* intensity removed */}
            {product.gender && (
              <span className="font-body text-[11px] tracking-wider uppercase px-3 py-1 rounded-full border border-border">
                {genderLabels[product.gender]}
              </span>
            )}
          </div>

          {product.description && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg">
              {product.description}
            </p>
          )}

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <ReviewStars rating={averageRating} size={18} />
                <div>
                  <p className="font-body text-sm font-medium">Рейтинг товара</p>
                  <p className="font-body text-xs text-muted-foreground">{averageRating.toFixed(1)} из 5 • {reviewCount} отзывов</p>
                </div>
              </div>
            </div>

            {userInfo ? (
              hasConfirmedOrder ? (
                userHasReview ? (
                  <div className="space-y-4 p-6 rounded-xl bg-secondary/50 border border-border/40">
                    <p className="font-body text-sm font-semibold">Ваш отзыв сохранён</p>
                    <div className="flex items-center gap-2">
                      <ReviewStars rating={reviewDisplayRating} size={18} />
                      <span className="font-body text-sm text-muted-foreground">{reviewDisplayRating.toFixed(1)} из 5</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-6 rounded-xl bg-secondary/50 border border-border/40">
                    <p className="font-body text-sm font-semibold">Оставить отзыв</p>
                    <ReviewStars rating={reviewRating} interactive onRate={setReviewRating} />
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Оставьте комментарий о товаре"
                      className="w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <Button onClick={onSaveReview} disabled={reviewRating <= 0}>
                        Сохранить отзыв
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-border/40 bg-secondary/40 p-6">
                  <p className="font-body text-sm text-muted-foreground">
                    Оставить отзыв можно только после подтверждённого заказа.
                  </p>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-border/40 bg-secondary/40 p-6">
                <p className="font-body text-sm text-muted-foreground">
                  Войдите или зарегистрируйтесь, чтобы оставить отзыв.
                </p>
              </div>
            )}
          </div>

          {/* Все отзывы */}
          {reviews.length > 0 && (
            <div className="space-y-4 mb-10 p-6 rounded-xl bg-secondary/50 border border-border/40">
              <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-4">Отзывы покупателей ({reviews.length})</p>
              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-background border border-border/30">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <ReviewStars rating={Number(review.rating) || 0} size={14} />
                        <span className="text-xs font-semibold text-muted-foreground">{Number(review.rating || 0).toFixed(1)}</span>
                      </div>
                      {review.created_at && (
                        <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                    {review.text && <p className="font-body text-sm text-foreground">{review.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
