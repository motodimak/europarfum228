import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { supabase } from '@/api/supabaseClient'
import { Package, Calendar, DollarSign, MapPin } from 'lucide-react'
import { getReviewsByUser } from '@/lib/reviewStore'
import ReviewStars from '@/components/ReviewStars'

export default function Profile() {
  const { user, isAuthenticated } = useAuth()
  const [localClient, setLocalClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const loadClientAndOrders = async () => {
      let clientInfo = null
      try {
        // Load client registration
        const raw = localStorage.getItem('clientRegistration')
        clientInfo = raw ? JSON.parse(raw) : null
        if (clientInfo) setLocalClient(clientInfo)

        // Get current client identifier
        const clientIdentifier = clientInfo?.contactValue || ''

        // Load orders from backend only
        let allOrders = []
        const { data: backendOrders, error } = await supabase.from('orders').select('*')
        if (error) throw error
        if (backendOrders && Array.isArray(backendOrders)) {
          allOrders = clientIdentifier
            ? backendOrders.filter((o) => o.client_identifier === clientIdentifier || o.client_contact_value === clientIdentifier)
            : backendOrders
        }

        // Sort by created_at descending (newest first)
        allOrders.sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA
        })

        setOrders(allOrders)
      } catch (err) {
        console.error('Error loading orders:', err)
        setOrders([])
      } finally {
        setLoadingOrders(false)
      }

      // Load reviews from localStorage via review store
      try {
        const userId = clientInfo?.id
        const userReviews = userId ? getReviewsByUser(userId) : []
        setReviews(userReviews)
      } catch (err) {
        setReviews([])
      }
    }

    loadClientAndOrders()
  }, [])

  const displayName = () => {
    if (user?.name) return user.name
    if (localClient) return `${localClient.firstName || ''} ${localClient.lastName || ''}`.trim()
    return 'Гость'
  }

  const parseItems = (itemsSnapshot) => {
    if (!itemsSnapshot) return []
    try {
      if (typeof itemsSnapshot === 'string') {
        return JSON.parse(itemsSnapshot)
      }
      return Array.isArray(itemsSnapshot) ? itemsSnapshot : []
    } catch (err) {
      return []
    }
  }

  const getStatusBadgeColor = (status) => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower === 'new') return 'bg-blue-100 text-blue-800'
    if (statusLower === 'confirmed') return 'bg-green-100 text-green-800'
    if (statusLower === 'shipped') return 'bg-purple-100 text-purple-800'
    if (statusLower === 'delivered') return 'bg-emerald-100 text-emerald-800'
    if (statusLower === 'cancelled') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const statusLower = (status || '').toLowerCase()
    const statusMap = {
      new: 'Новый',
      confirmed: 'Подтвержден',
      shipped: 'В пути',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    }
    return statusMap[statusLower] || status || 'Неизвестный статус'
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Профиль</h1>
          <p className="text-sm text-muted-foreground">Добро пожаловать, {displayName()}.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/catalog"><Button variant="outline">Вернуться в магазин</Button></Link>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-2">Контактная информация</h2>
        {localClient ? (
          <div className="rounded-md border p-4">
            <div><strong>Имя:</strong> {localClient.firstName}</div>
            <div><strong>Фамилия:</strong> {localClient.lastName}</div>
            <div><strong>Связь ({localClient.contactType}):</strong> {localClient.contactValue}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Информация о клиенте не найдена. Зарегистрируйтесь.</div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Заказы</h2>
        {loadingOrders ? (
          <div className="text-sm text-muted-foreground">Загрузка заказов...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Пока нет заказов.</p>
            <Link to="/catalog">
              <Button variant="outline" size="sm" className="mt-4">
                Начать покупки
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const items = parseItems(order.items_snapshot)
              const orderDate = order.created_at ? new Date(order.created_at) : null
              return (
                <div key={order.id} className="rounded-lg border border-border/50 p-5 hover:shadow-sm transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-sm">Заказ #{order.id?.toString().slice(-8) || 'N/A'}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      {orderDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {orderDate.toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm flex items-center gap-1 justify-end">
                        <DollarSign className="w-4 h-4" />
                        {order.total_amount?.toFixed(2) || '0.00'} ₽
                      </p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border/30 text-xs">
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Контакт</p>
                      <p className="break-all">{order.full_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Способ оплаты</p>
                      <p className="capitalize">{order.payment_method === 'card' ? 'На карту' : 'Наличные'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Адрес доставки
                      </p>
                      <p className="break-all">{order.address}</p>
                    </div>
                    {order.delivery_date && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground font-medium mb-1">Дата доставки</p>
                        <p>{new Date(order.delivery_date).toLocaleDateString('ru-RU')}</p>
                      </div>
                    )}
                    {order.delivery_time_slot && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground font-medium mb-1">Время доставки</p>
                        <p>{order.delivery_time_slot}</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {items.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Товары ({items.length})</p>
                      <ul className="space-y-1 text-xs">
                        {items.map((item, idx) => (
                          <li key={idx} className="text-muted-foreground">
                            {item.product_name || 'Товар'} × {item.quantity || 1}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Отзывы</h2>
        {reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground">Нет отзывов.</div>
        ) : (
          <ul className="space-y-2">
            {reviews.map((r, idx) => (
              <li key={idx} className="border rounded p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-sm"><strong>Товар:</strong> {r.product_name || r.productName || '—'}</span>
                  <div className="flex items-center gap-2">
                    <ReviewStars rating={Number(r.rating) || 0} size={16} />
                    <span className="text-sm text-muted-foreground">{Number(r.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
                {r.text && <div className="text-sm text-muted-foreground">{r.text}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
