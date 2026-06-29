import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { sendTelegramOrderNotification } from '@/lib/telegram';

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data, error } = await supabase.from('carts').select('*')
      if (error) throw error
      return data || []
    },
    retry: 1,
  });

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    delivery_date: '',
    delivery_time_slot: '',
    payment_method: 'card',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const total = cartItems.reduce((sum, item) => sum + Number(item.product_price || 0) * (item.quantity || 1), 0);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    // Get current client info to link order
    const clientRaw = localStorage.getItem('clientRegistration');
    const clientInfo = clientRaw ? JSON.parse(clientRaw) : null;
    const clientIdentifier = clientInfo?.contactValue || '';
    const clientContactType = clientInfo?.contactType || 'unknown';
    const clientContactValue = clientInfo?.contactValue || '';
    const clientPhone = form.phone || (clientContactType === 'phone' ? clientContactValue : '');
    try {
      await supabase.from('orders').insert({
        ...form,
        total_amount: total,
        items_snapshot: JSON.stringify(cartItems),
        status: 'new',
        client_identifier: clientIdentifier,
        client_contact_type: clientContactType,
        client_contact_value: clientContactValue,
        client_phone: clientPhone,
      });
    } catch (error) {
      setSubmitError('Не удалось оформить заказ. Проверьте соединение и попробуйте снова.');
      setLoading(false);
      return;
    }

    try {
      await sendTelegramOrderNotification({
        fullName: form.full_name,
        phone: clientPhone,
        address: form.address,
        deliveryDate: form.delivery_date,
        deliveryTimeSlot: form.delivery_time_slot,
        paymentMethod: form.payment_method,
        total,
        items: cartItems,
        clientContact: clientContactValue,
        clientContactType,
      });
    } catch (notificationError) {
      console.warn('Telegram notification failed:', notificationError);
    }

    try {
      // Очищаем корзину
      await Promise.all(cartItems.map(item => supabase.from('carts').delete().eq('id', item.id)));
    } catch (error) {
      // Non-critical for success page
    }

    queryClient.invalidateQueries({ queryKey: ['cart'] });

    setLoading(false);
    setDone(true);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const deliveryTimeSlots = ['10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'];

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="font-heading text-3xl font-semibold mb-3">Заказ оформлен</h2>
          <p className="font-body text-muted-foreground mb-8">
            Спасибо, {form.full_name.split(' ')[0]}! Мы свяжемся с вами для подтверждения доставки.
          </p>
          <Link to="/">
            <Button className="rounded-full px-10 font-body text-sm tracking-wider uppercase">
              На главную
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12 py-10 md:py-16">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Последний шаг</p>
        <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-10">Оформление заказа</h1>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Данные клиента */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
          <h2 className="font-heading text-lg font-medium border-b border-border/50 pb-3">Контактные данные</h2>
          <div className="space-y-2">
            <Label htmlFor="full_name" className="font-body text-xs tracking-wider uppercase text-muted-foreground">ФИО</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Иванов Иван Иванович"
              value={form.full_name}
              onChange={handleChange}
              required
              className="h-12 font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-body text-xs tracking-wider uppercase text-muted-foreground">Номер телефона</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="79581234567"
              value={form.phone}
              onChange={handleChange}
              required
              className="h-12 font-body"
            />
          </div>
        </motion.div>

        {/* Доставка */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-5">
          <h2 className="font-heading text-lg font-medium border-b border-border/50 pb-3">Доставка</h2>
          <div className="space-y-2">
            <Label htmlFor="address" className="font-body text-xs tracking-wider uppercase text-muted-foreground">Адрес доставки</Label>
            <Input
              id="address"
              name="address"
              placeholder="г. Москва, ул. Пушкина, д. 10, кв. 5"
              value={form.address}
              onChange={handleChange}
              required
              className="h-12 font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_date" className="font-body text-xs tracking-wider uppercase text-muted-foreground">Дата доставки</Label>
            <Input
              id="delivery_date"
              name="delivery_date"
              type="date"
              min={minDate}
              value={form.delivery_date}
              onChange={handleChange}
              required
              className="h-12 font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_time_slot" className="font-body text-xs tracking-wider uppercase text-muted-foreground">Время доставки</Label>
            <select
              id="delivery_time_slot"
              name="delivery_time_slot"
              value={form.delivery_time_slot}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Выберите интервал</option>
              {deliveryTimeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Способ оплаты */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h2 className="font-heading text-lg font-medium border-b border-border/50 pb-3">Способ оплаты</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, payment_method: 'card' }))}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
                form.payment_method === 'card'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <CreditCard className={`w-6 h-6 ${form.payment_method === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`font-body text-sm font-medium ${form.payment_method === 'card' ? 'text-primary' : 'text-foreground'}`}>
                На карту
              </span>
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, payment_method: 'cash' }))}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
                form.payment_method === 'cash'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <Banknote className={`w-6 h-6 ${form.payment_method === 'cash' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`font-body text-sm font-medium ${form.payment_method === 'cash' ? 'text-primary' : 'text-foreground'}`}>
                Наличными
              </span>
            </button>
          </div>
        </motion.div>

        {/* Итог */}
        {cartItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-5 rounded-xl bg-secondary/50 border border-border/40 space-y-3">
            <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">Ваш заказ</p>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center font-body text-sm">
                <span className="text-foreground">{item.product_name} <span className="text-muted-foreground">×{item.quantity || 1}</span></span>
                <span className="font-medium">{(Number(item.product_price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-border/40">
              <span className="font-body text-sm font-medium">Итого</span>
              <span className="font-heading text-xl font-semibold">{total.toLocaleString('ru-RU')} ₽</span>
            </div>
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={loading || cartItems.length === 0}
          className="w-full h-14 font-body text-sm tracking-wider uppercase rounded-full"
        >
          {loading ? 'Оформляем...' : 'Подтвердить заказ'}
        </Button>
        {submitError && (
          <p className="text-sm text-destructive text-center">{submitError}</p>
        )}
      </form>
    </div>
  );
}