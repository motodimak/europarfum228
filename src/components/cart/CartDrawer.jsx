import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { isLocalCartItemId, removeLocalCartItem, updateLocalCartItemQuantity } from '@/lib/cartStore';

export default function CartDrawer({ open, onClose, items = [] }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const updateQuantity = async (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (isLocalCartItemId(item.id)) {
      updateLocalCartItemQuantity(item.id, newQty)
    } else {
      if (newQty <= 0) {
        await base44.entities.CartItem.delete(item.id);
      } else {
        await base44.entities.CartItem.update(item.id, { quantity: newQty });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const removeItem = async (item) => {
    if (isLocalCartItemId(item.id)) {
      removeLocalCartItem(item.id)
    } else {
      await base44.entities.CartItem.delete(item.id);
    }
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const total = items.reduce((sum, item) => sum + Number(item.product_price || 0) * (item.quantity || 1), 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-background z-[80] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <h2 className="font-heading text-xl font-semibold">Корзина</h2>
              <button onClick={onClose} className="p-2 hover:bg-secondary/60 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 opacity-30" />
                <p className="font-body text-sm">Корзина пуста</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body text-sm font-medium truncate">{item.product_name}</h4>
                        {item.product_volume && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.product_volume} мл</p>
                        )}
                        <p className="font-body text-sm font-semibold mt-1">
                          {Number(item.product_price || 0).toLocaleString('ru-RU')} ₽
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item)}
                            className="ml-auto p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-border/40 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Итого</span>
                    <span className="font-heading text-xl font-semibold">{total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <Button
                    className="w-full h-12 font-body text-sm tracking-wider uppercase"
                    onClick={() => { onClose(); navigate('/checkout'); }}
                  >
                    Оформить заказ
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}