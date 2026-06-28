import React, { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChartContainer } from '@/components/ui/chart'
import { Loader2, Plus, Trash2, Upload, PencilLine, Shield, Package, CheckCircle2, Clock, BarChart } from 'lucide-react'
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts'
import { getEffectivePrice } from '@/lib/pricing'
import { sendTelegramOrderNotification } from '@/lib/telegram'

const emptyProduct = {
  name: '',
  brand: '',
  price: '',
  sale_price: '',
  volume_ml: '',
  description: '',
  category: 'floral',
  top_notes: '',
  heart_notes: '',
  base_notes: '',
  image_url: '',
  gender: 'unisex',
  featured: false,
  bestseller: false,
  popular: false,
}

const categories = ['aquatic', 'aldehydic', 'amber', 'balsamic', 'oriental', 'gourmand', 'woody', 'other', 'leather', 'musky', 'spicy', 'sweet', 'tobacco', 'fruity', 'fougere', 'floral', 'citrus']
const genders = ['unisex', 'feminine', 'masculine']

export default function Admin() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('products') // 'products' or 'orders' or 'stats'
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date', 300),
    retry: 1,
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
    retry: 1,
  })

  const { data: siteVisits = [] } = useQuery({
    queryKey: ['admin-site-visits'],
    queryFn: () => base44.entities.SiteVisit.list('-created_date', 2000),
    retry: 1,
  })

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [orderStatusUpdate, setOrderStatusUpdate] = useState('')
  const [editingOrderItems, setEditingOrderItems] = useState(false)
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('')
  const [quantityToAdd, setQuantityToAdd] = useState('1')
  const [searchProductsText, setSearchProductsText] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [status, setStatus] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState('')
  const [bulkSetPopular, setBulkSetPopular] = useState(false)
  const [bulkSetBestseller, setBulkSetBestseller] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('')
  const [selectedPopularIds, setSelectedPopularIds] = useState([])
  const [selectedBestsellerIds, setSelectedBestsellerIds] = useState([])
  const [popularSearch, setPopularSearch] = useState('')
  const [bestsellerSearch, setBestsellerSearch] = useState('')
  const [popularStatus, setPopularStatus] = useState('')
  const [bestsellerStatus, setBestsellerStatus] = useState('')

  const getLastDays = (count) => {
    const result = []
    const today = new Date()
    for (let i = count - 1; i >= 0; i -= 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      result.push({
        iso: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      })
    }
    return result
  }

  const totalOrders = orders.length

  const isPurchasedOrder = (order) => {
    const status = (order.status || 'new').toLowerCase()
    return status !== 'new' && status !== 'cancelled'
  }

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (!isPurchasedOrder(order)) return sum
      return sum + (Number(order.total_amount) || 0)
    }, 0)
  }, [orders])

  const pendingRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      const status = (order.status || 'new').toLowerCase()
      if (status !== 'new') return sum
      return sum + (Number(order.total_amount) || 0)
    }, 0)
  }, [orders])

  const averageOrderValue = useMemo(() => {
    const purchasedOrders = orders.filter(isPurchasedOrder)
    return purchasedOrders.length > 0
      ? purchasedOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) / purchasedOrders.length
      : 0
  }, [orders])

  const statusCounts = useMemo(() => {
    return orders.reduce((counts, order) => {
      const status = (order.status || 'new').toLowerCase()
      counts[status] = (counts[status] || 0) + 1
      return counts
    }, {})
  }, [orders])

  const revenueHistory = useMemo(() => {
    const map = {}

    orders.forEach((order) => {
      if (!isPurchasedOrder(order)) return
      if (!order.created_at) return
      const date = new Date(order.created_at)
      if (Number.isNaN(date.getTime())) return
      const iso = date.toISOString().slice(0, 10)
      map[iso] = (map[iso] || 0) + (Number(order.total_amount) || 0)
    })

    return getLastDays(7).map((day) => ({
      date: day.label,
      revenue: Number(map[day.iso] || 0),
    }))
  }, [orders])

  const totalVisits = useMemo(() => siteVisits.length, [siteVisits])

  const visitsHistory = useMemo(() => {
    const map = {}
    siteVisits.forEach((visit) => {
      const iso = String(visit.created_at || '').slice(0, 10)
      if (!iso) return
      map[iso] = (map[iso] || 0) + 1
    })
    return getLastDays(7).map((day) => ({
      date: day.label,
      visits: Number(map[day.iso] || 0),
    }))
  }, [siteVisits])

  const statusChartData = useMemo(() => {
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }))
  }, [statusCounts])

  useEffect(() => {
    if (!selectedId) return
    const current = products.find((item) => item.id === selectedId)
    if (current) {
      setForm({ ...emptyProduct, ...current })
    }
  }, [selectedId, products])

  const currentProduct = useMemo(
    () => products.find((item) => item.id === selectedId) || null,
    [products, selectedId]
  )

  const toggleSelectedProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const applyBulkUpdate = async () => {
    if (selectedProductIds.length === 0) {
      setBulkStatus('Выберите хотя бы один товар для массового обновления.')
      setTimeout(() => setBulkStatus(''), 3000)
      return
    }

    const percent = Number(bulkDiscountPercent)
    const priceValue = bulkPrice.trim() === '' ? null : Number(bulkPrice)

    await Promise.all(products.map(async (product) => {
      if (!selectedProductIds.includes(product.id)) return
      const price = priceValue != null && !Number.isNaN(priceValue) ? priceValue : product.price
      const sale_price = !Number.isNaN(percent) && percent > 0 && percent < 100
        ? Math.round(price * (100 - percent) / 100)
        : product.sale_price || null

      await base44.entities.Product.update(product.id, {
        price,
        sale_price: sale_price === null ? null : sale_price,
        popular: bulkSetPopular ? true : product.popular,
        bestseller: bulkSetBestseller ? true : product.bestseller,
      })
    }))

    await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    await queryClient.invalidateQueries({ queryKey: ['all-products-home'] })
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    await queryClient.invalidateQueries({ queryKey: ['featured-products'] })
    setBulkStatus('Массовое обновление применено')
    setTimeout(() => setBulkStatus(''), 3000)
  }

  const sendTestTelegramNotification = async () => {
    setStatus('')
    setOrderStatusUpdate('Отправка тестового сообщения...')

    try {
      await sendTelegramOrderNotification({
        fullName: 'Тестовый клиент',
        address: 'г. Москва, ул. Тестовая, д. 1',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTimeSlot: '12:00-14:00',
        paymentMethod: 'card',
        total: 1490,
        items: [
          {
            id: 'test-item-1',
            product_name: 'Тестовый парфюм',
            quantity: 1,
            product_price: 1490,
          },
        ],
        clientContact: '+7 (900) 000-00-00',
        clientContactType: 'phone',
      })
      setOrderStatusUpdate('Тестовое сообщение успешно отправлено в Telegram.')
    } catch (error) {
      setOrderStatusUpdate(`Ошибка отправки теста: ${error.message}`)
    }
  }

  useEffect(() => {
    setSelectedPopularIds(products.filter((product) => product.popular).map((product) => product.id))
    setSelectedBestsellerIds(products.filter((product) => product.bestseller).map((product) => product.id))
  }, [products])

  const filteredProductsForPopular = useMemo(() => {
    const query = popularSearch.trim().toLowerCase()
    return products.filter((product) => {
      if (!query) return true
      return (
        (product.name || '').toLowerCase().includes(query) ||
        (product.brand || '').toLowerCase().includes(query) ||
        (product.category || '').toLowerCase().includes(query)
      )
    })
  }, [products, popularSearch])

  const filteredProductsForBestseller = useMemo(() => {
    const query = bestsellerSearch.trim().toLowerCase()
    return products.filter((product) => {
      if (!query) return true
      return (
        (product.name || '').toLowerCase().includes(query) ||
        (product.brand || '').toLowerCase().includes(query) ||
        (product.category || '').toLowerCase().includes(query)
      )
    })
  }, [products, bestsellerSearch])

  const togglePopularSelection = (productId) => {
    setSelectedPopularIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }
      if (prev.length >= 8) {
        setPopularStatus('Можно выбрать не более 8 популярных позиций.')
        setTimeout(() => setPopularStatus(''), 3000)
        return prev
      }
      return [...prev, productId]
    })
  }

  const toggleBestsellerSelection = (productId) => {
    setSelectedBestsellerIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }
      if (prev.length >= 8) {
        setBestsellerStatus('Можно выбрать не более 8 бестселлеров.')
        setTimeout(() => setBestsellerStatus(''), 3000)
        return prev
      }
      return [...prev, productId]
    })
  }

  const applyPopularSelection = async () => {
    if (selectedPopularIds.length > 8) {
      setPopularStatus('Выбрано слишком много товаров. Максимум 8.')
      return
    }

    await Promise.all(products.map((product) =>
      base44.entities.Product.update(product.id, { popular: selectedPopularIds.includes(product.id) })
    ))

    await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    await queryClient.invalidateQueries({ queryKey: ['all-products-home'] })
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    setPopularStatus('Популярные позиции обновлены')
    setTimeout(() => setPopularStatus(''), 3000)
  }

  const applyBestsellerSelection = async () => {
    if (selectedBestsellerIds.length > 8) {
      setBestsellerStatus('Выбрано слишком много товаров. Максимум 8.')
      return
    }

    await Promise.all(products.map((product) =>
      base44.entities.Product.update(product.id, { bestseller: selectedBestsellerIds.includes(product.id) })
    ))

    await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    await queryClient.invalidateQueries({ queryKey: ['all-products-home'] })
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    setBestsellerStatus('Бестселлеры обновлены')
    setTimeout(() => setBestsellerStatus(''), 3000)
  }

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const selectProduct = (product) => {
    setSelectedId(product.id)
    setForm({ ...emptyProduct, ...product, featured: Boolean(product.featured) })
    setStatus('')
  }

  const startNew = () => {
    setSelectedId(null)
    setForm(emptyProduct)
    setStatus('Создание новой позиции')
  }

  const uploadImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setField('image_url', reader.result || '')
    reader.readAsDataURL(file)
  }

  const saveProduct = async (event) => {
    event.preventDefault()

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      sale_price: form.sale_price === '' ? null : Number(form.sale_price),
      volume_ml: form.volume_ml === '' ? null : Number(form.volume_ml),
      description: form.description.trim(),
      category: form.category,
      top_notes: form.top_notes.trim(),
      heart_notes: form.heart_notes.trim(),
      base_notes: form.base_notes.trim(),
      image_url: form.image_url.trim(),
      gender: form.gender,
      featured: Boolean(form.featured),
      bestseller: Boolean(form.bestseller),
      popular: Boolean(form.popular),
    }

    if (!payload.name || !payload.brand || Number.isNaN(payload.price)) {
      setStatus('Заполните имя, бренд и цену.')
      return
    }

    if (selectedId) {
      await base44.entities.Product.update(selectedId, payload)
    } else {
      await base44.entities.Product.create(payload)
    }
    setStatus(selectedId ? 'Позиция обновлена' : 'Позиция добавлена')
    await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    await queryClient.invalidateQueries({ queryKey: ['featured-products'] })
    await queryClient.invalidateQueries({ queryKey: ['all-products-home'] })
    await queryClient.invalidateQueries({ queryKey: ['category-products'] })
    setSelectedId(null)
    setForm(emptyProduct)
  }

  const deleteCurrent = async () => {
    if (!selectedId) return
    await base44.entities.Product.delete(selectedId)
    setStatus('Позиция удалена')
    await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    await queryClient.invalidateQueries({ queryKey: ['featured-products'] })
    await queryClient.invalidateQueries({ queryKey: ['all-products-home'] })
    await queryClient.invalidateQueries({ queryKey: ['category-products'] })
    setSelectedId(null)
    setForm(emptyProduct)
  }

  const updateOrderStatus = async (newStatus) => {
    if (!selectedOrderId) return

    await base44.entities.Order.update(selectedOrderId, { status: newStatus })
    setOrderStatusUpdate(`Статус обновлён: ${getStatusText(newStatus)}`)

    await queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    setTimeout(() => setOrderStatusUpdate(''), 3000)
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

  const getStatusBadgeColor = (status) => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower === 'new') return 'bg-blue-100 text-blue-800'
    if (statusLower === 'confirmed') return 'bg-green-100 text-green-800'
    if (statusLower === 'shipped') return 'bg-purple-100 text-purple-800'
    if (statusLower === 'delivered') return 'bg-emerald-100 text-emerald-800'
    if (statusLower === 'cancelled') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
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

  const addItemToOrder = async () => {
    if (!selectedOrderId || !selectedProductToAdd) return

    const product = products.find(p => p.id === selectedProductToAdd)
    if (!product) return

    const currentItems = parseItems(selectedOrder.items_snapshot)
    const newItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: parseInt(quantityToAdd) || 1,
      product_price: getEffectivePrice(product)
    }

    const updatedItems = [...currentItems, newItem]
    const updatedItemsSnapshot = JSON.stringify(updatedItems)
    const newTotal = selectedOrder.total_amount + (newItem.product_price * newItem.quantity)

    await base44.entities.Order.update(selectedOrderId, {
      items_snapshot: updatedItemsSnapshot,
      total_amount: newTotal
    })

    setOrderStatusUpdate(`Товар добавлен в заказ`)
    setSelectedProductToAdd('')
    setQuantityToAdd('1')
    await queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    setTimeout(() => setOrderStatusUpdate(''), 3000)
  }

  const removeItemFromOrder = async (itemIndex) => {
    if (!selectedOrderId) return

    const currentItems = parseItems(selectedOrder.items_snapshot)
    const removedItem = currentItems[itemIndex]
    const updatedItems = currentItems.filter((_, idx) => idx !== itemIndex)
    const updatedItemsSnapshot = JSON.stringify(updatedItems)
    const newTotal = selectedOrder.total_amount - ((removedItem.product_price || 0) * (removedItem.quantity || 1))

    await base44.entities.Order.update(selectedOrderId, {
      items_snapshot: updatedItemsSnapshot,
      total_amount: Math.max(0, newTotal)
    })

    setOrderStatusUpdate(`Товар удален из заказа`)
    await queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    setTimeout(() => setOrderStatusUpdate(''), 3000)
  }

  const filteredProductsForAdd = useMemo(() => {
    let filtered = products

    // Filter by search text
    if (searchProductsText.trim()) {
      const query = searchProductsText.toLowerCase()
      filtered = filtered.filter(
        p => (p.name || '').toLowerCase().includes(query) ||
             (p.brand || '').toLowerCase().includes(query) ||
             (p.description || '').toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(p => p.category === filterCategory)
    }

    // intensity removed from filters

    // Filter by gender
    if (filterGender) {
      filtered = filtered.filter(p => p.gender === filterGender)
    }

    return filtered
  }, [products, searchProductsText, filterCategory, filterGender])

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10 md:py-14">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Админ-панель</p>
          <h1 className="font-heading text-3xl md:text-5xl font-semibold flex items-center gap-3">
            <Shield className="w-8 h-8" /> {activeTab === 'products' ? 'Управление товарами' : activeTab === 'orders' ? 'Управление заказами' : 'Статистика'}
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-3 max-w-2xl">
            {activeTab === 'products' 
              ? 'Меняйте цены, описания, фотографии и добавляйте новые позиции прямо здесь.'
              : activeTab === 'orders'
                ? 'Просмотрите и обновляйте статусы заказов клиентов.'
                : 'Обзор выручки, заказов и посещений сайта.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'products' && <Button onClick={startNew} className="shrink-0"><Plus className="w-4 h-4" /> Новая позиция</Button>}
          <Button variant="outline" onClick={sendTestTelegramNotification} className="shrink-0">
            Тестовая отправка
          </Button>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-2 mb-6 border-b border-border/50">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" /> Товары ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 inline mr-2" /> Заказы ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart className="w-4 h-4 inline mr-2" /> Статистика
        </button>
      </div>

      {status && <div className="mb-6 rounded-lg border border-border/50 bg-secondary/40 px-4 py-3 text-sm">{status}</div>}
      {orderStatusUpdate && <div className="mb-6 rounded-lg border border-green-200/50 bg-green-50 px-4 py-3 text-sm text-green-800">{orderStatusUpdate}</div>}
      {activeTab === 'products' && (
        <>
          <div className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-semibold">Популярные позиции</h2>
                <p className="text-sm text-muted-foreground mt-2">Выберите до 8 товаров, которые попадут в раздел «Популярные ароматы».</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={applyPopularSelection}>Сохранить</Button>
                <Button variant="outline" onClick={() => setSelectedPopularIds(products.filter((product) => product.popular).map((product) => product.id))}>
                  Сбросить
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <Input
                placeholder="Поиск по названию, бренду или категории"
                value={popularSearch}
                onChange={(e) => setPopularSearch(e.target.value)}
                className="h-10"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {filteredProductsForPopular.map((product) => (
                  <label
                    key={product.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${selectedPopularIds.includes(product.id) ? 'border-primary bg-primary/5' : 'border-border/50 bg-background hover:border-border hover:bg-secondary/40'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPopularIds.includes(product.id)}
                      onChange={() => togglePopularSelection(product.id)}
                      className="h-4 w-4"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name || 'Без названия'}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.brand || 'Без бренда'}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Выбрано: {selectedPopularIds.length}/8</p>
              {popularStatus && <div className="rounded-lg border border-border/50 bg-secondary/40 px-4 py-3 text-sm">{popularStatus}</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-semibold">Бестселлеры</h2>
                <p className="text-sm text-muted-foreground mt-2">Выберите до 8 товаров, которые попадут в раздел «Бестселлеры».</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={applyBestsellerSelection}>Сохранить</Button>
                <Button variant="outline" onClick={() => setSelectedBestsellerIds(products.filter((product) => product.bestseller).map((product) => product.id))}>
                  Сбросить
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <Input
                placeholder="Поиск по названию, бренду или категории"
                value={bestsellerSearch}
                onChange={(e) => setBestsellerSearch(e.target.value)}
                className="h-10"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {filteredProductsForBestseller.map((product) => (
                  <label
                    key={product.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${selectedBestsellerIds.includes(product.id) ? 'border-primary bg-primary/5' : 'border-border/50 bg-background hover:border-border hover:bg-secondary/40'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBestsellerIds.includes(product.id)}
                      onChange={() => toggleBestsellerSelection(product.id)}
                      className="h-4 w-4"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name || 'Без названия'}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.brand || 'Без бренда'}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Выбрано: {selectedBestsellerIds.length}/8</p>
              {bestsellerStatus && <div className="rounded-lg border border-border/50 bg-secondary/40 px-4 py-3 text-sm">{bestsellerStatus}</div>}
            </div>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <div className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">Массовые действия</h2>
              <p className="text-sm text-muted-foreground">Выберите несколько позиций и примените скидку, популярное или Хит продаж.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">Выбрано: {selectedProductIds.length}</span>
              <Button variant="outline" onClick={() => setSelectedProductIds(products.map((product) => product.id))}>Выбрать все</Button>
              <Button variant="outline" onClick={() => setSelectedProductIds([])}>Сбросить</Button>
            </div>
          </div>

          <div className="grid gap-3 mt-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <Input
              placeholder="Новая цена"
              type="number"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              className="h-10"
            />
            <Input
              placeholder="Скидка %"
              type="number"
              value={bulkDiscountPercent}
              onChange={(e) => setBulkDiscountPercent(e.target.value)}
              className="h-10"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bulkSetPopular} onChange={(e) => setBulkSetPopular(e.target.checked)} className="h-4 w-4" />
              В популярные
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bulkSetBestseller} onChange={(e) => setBulkSetBestseller(e.target.checked)} className="h-4 w-4" />
              Хит продаж
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button onClick={applyBulkUpdate}>Применить к выбранным</Button>
            {bulkStatus && <span className="text-sm text-muted-foreground">{bulkStatus}</span>}
          </div>
        </div>
      )}

      {activeTab === 'products' ? (
        // ТОВАРЫ
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-8">
        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">Позиции ({products.length})</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => {
                const isSelected = selectedProductIds.includes(product.id)
                const hasSale = product.sale_price && product.sale_price < product.price
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => selectProduct(product)}
                    className={`relative text-left rounded-xl border p-3 transition-all ${selectedId === product.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border hover:bg-secondary/40'}`}
                  >
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1 shadow-sm">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); toggleSelectedProduct(product.id) }}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-heading text-3xl">N</div>
                      )}
                    </div>
                    <p className="font-body text-[11px] tracking-widest uppercase text-muted-foreground truncate">{product.brand}</p>
                    <p className="font-heading text-base font-medium leading-tight truncate">{product.name}</p>
                    <div className="font-body text-sm font-semibold mt-1">
                      {hasSale ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-muted-foreground">{(product.price || 0).toLocaleString('ru-RU')} ₽</span>
                          <span className="text-emerald-600">{(product.sale_price || 0).toLocaleString('ru-RU')} ₽</span>
                        </div>
                      ) : (
                        <span>{(product.price || 0).toLocaleString('ru-RU')} ₽</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">{selectedId ? 'Редактирование позиции' : 'Новая позиция'}</h2>
            {currentProduct && <span className="text-xs text-muted-foreground">ID: {currentProduct.id}</span>}
          </div>

          <form className="grid gap-4" onSubmit={saveProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Название</Label><Input value={form.name} onChange={(e) => setField('name', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Бренд</Label><Input value={form.brand} onChange={(e) => setField('brand', e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Цена</Label><Input type="number" value={form.price} onChange={(e) => setField('price', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Объём, мл</Label><Input type="number" value={form.volume_ml} onChange={(e) => setField('volume_ml', e.target.value)} /></div>
              <div className="grid gap-2">
                <Label>Категория</Label>
                <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  {categories.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Для кого</Label>
                <select value={form.gender} onChange={(e) => setField('gender', e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  {genders.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-2"><Label>Описание</Label><Textarea rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} /></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Верхние ноты</Label><Input value={form.top_notes} onChange={(e) => setField('top_notes', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Ноты сердца</Label><Input value={form.heart_notes} onChange={(e) => setField('heart_notes', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Базовые ноты</Label><Input value={form.base_notes} onChange={(e) => setField('base_notes', e.target.value)} /></div>
            </div>

            <div className="grid gap-2">
              <Label>Фото</Label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
                <Input value={form.image_url} onChange={(e) => setField('image_url', e.target.value)} placeholder="URL изображения или файл" />
                <label className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md border border-input cursor-pointer hover:bg-secondary/60 transition-colors">
                  <Upload className="w-4 h-4" /> Загрузить
                  <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
                </label>
              </div>
              {form.image_url && <div className="mt-2 aspect-[4/3] max-w-md rounded-xl overflow-hidden border border-border/50 bg-secondary"><img src={form.image_url} alt="preview" className="w-full h-full object-cover" /></div>}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-2"><Label>Цена со скидкой</Label><Input type="number" value={form.sale_price} onChange={(e) => setField('sale_price', e.target.value)} /></div>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setField('featured', e.target.checked)} className="h-4 w-4" /> Показывать на главной</label>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.bestseller} onChange={(e) => setField('bestseller', e.target.checked)} className="h-4 w-4" /> Хит продаж</label>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.popular} onChange={(e) => setField('popular', e.target.checked)} className="h-4 w-4" /> В популярные</label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit"><PencilLine className="w-4 h-4" />{selectedId ? 'Сохранить изменения' : 'Добавить позицию'}</Button>
              {selectedId && <Button type="button" variant="outline" onClick={() => window.confirm('Удалить эту позицию?') && deleteCurrent()}><Trash2 className="w-4 h-4" /> Удалить</Button>}
            </div>
          </form>
        </div>
      </div>
      ) : activeTab === 'orders' ? (
        // ЗАКАЗЫ
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-8">
          <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">Все заказы ({orders.length})</h2>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Нет заказов</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-all ${
                      selectedOrderId === order.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-border hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-heading text-sm font-semibold">Заказ #{order.id?.toString().slice(-8)}</p>
                        <p className="text-xs text-muted-foreground">{order.full_name || 'Клиент'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{order.total_amount?.toFixed(2) || 0} ₽</p>
                    {order.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6">
            {selectedOrder ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold">Детали заказа</h2>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">НОМЕР ЗАКАЗА</Label>
                    <p className="font-heading text-lg font-semibold mt-1">{selectedOrder.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">ДАТА</Label>
                      <p className="font-body text-sm mt-1">
                        {selectedOrder.created_at
                          ? new Date(selectedOrder.created_at).toLocaleDateString('ru-RU')
                          : 'Неизвестно'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">СУММА</Label>
                      <p className="font-heading text-lg font-semibold mt-1">{selectedOrder.total_amount?.toFixed(2) || 0} ₽</p>
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <Label className="text-xs font-semibold text-muted-foreground">КЛИЕНТ</Label>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>ФИО:</strong> {selectedOrder.full_name}</p>
                      <p><strong>Адрес:</strong> {selectedOrder.address}</p>
                      <p><strong>Доставка:</strong> {new Date(selectedOrder.delivery_date).toLocaleDateString('ru-RU')}</p>
                      <p><strong>Интервал:</strong> {selectedOrder.delivery_time_slot || 'Не выбран'}</p>
                      <p><strong>Оплата:</strong> {selectedOrder.payment_method === 'card' ? 'На карту' : 'Наличные'}</p>
                      <p><strong>Связь:</strong> {selectedOrder.client_contact_type || 'N/A'} - {selectedOrder.client_contact_value || 'N/A'}</p>
                    </div>
                  </div>

                  {parseItems(selectedOrder.items_snapshot).length > 0 && (
                    <div className="border-t border-border/30 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-xs font-semibold text-muted-foreground">ТОВАРЫ ({parseItems(selectedOrder.items_snapshot).length})</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingOrderItems(!editingOrderItems)}
                          className="text-xs"
                        >
                          {editingOrderItems ? 'Готово' : 'Редактировать'}
                        </Button>
                      </div>
                      <ul className="mt-2 space-y-2">
                        {parseItems(selectedOrder.items_snapshot).map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm p-2 rounded border border-border/30 hover:bg-secondary/40 transition-colors">
                            <span className="text-muted-foreground">
                              {item.product_name || 'Товар'} × {item.quantity || 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{((item.quantity || 1) * (item.product_price || 0)).toFixed(2)} ₽</span>
                              {editingOrderItems && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItemFromOrder(idx)}
                                  className="text-xs h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {editingOrderItems && (
                    <div className="border-t border-border/30 pt-4">
                      <Label className="text-xs font-semibold text-muted-foreground mb-4 block">ДОБАВИТЬ ТОВАР В ЗАКАЗ</Label>
                      
                      {/* Поиск */}
                      <div className="mb-4">
                        <Input
                          placeholder="Поиск по названию, бренду..."
                          value={searchProductsText}
                          onChange={(e) => setSearchProductsText(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Фильтры */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="h-9 rounded-md border border-input bg-transparent px-2 py-1 text-xs w-full"
                          >
                            <option value="">Все категории</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                            className="h-9 rounded-md border border-input bg-transparent px-2 py-1 text-xs w-full"
                          >
                            <option value="">Все полы</option>
                            {genders.map((gen) => (
                              <option key={gen} value={gen}>{gen}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Каталог товаров */}
                      <div className="mb-4 max-h-[400px] overflow-y-auto border border-border/30 rounded-lg p-3">
                        {filteredProductsForAdd.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">Нет товаров, соответствующих фильтрам</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {filteredProductsForAdd.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => setSelectedProductToAdd(product.id)}
                                className={`text-left rounded-lg border p-2 transition-all text-xs ${
                                  selectedProductToAdd === product.id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border/50 hover:border-border hover:bg-secondary/40'
                                }`}
                              >
                                <div className="aspect-square rounded overflow-hidden bg-secondary mb-2">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-sm font-heading">N</div>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate">{product.brand}</p>
                                <p className="font-semibold leading-tight truncate">{product.name}</p>
                                <p className="font-semibold text-primary mt-1">{product.price} ₽</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Количество и добавление */}
                      {selectedProductToAdd && (
                        <div className="space-y-3 pt-3 border-t border-border/30">
                          <div className="grid gap-2">
                            <Label className="text-xs">Количество</Label>
                            <Input
                              type="number"
                              min="1"
                              value={quantityToAdd}
                              onChange={(e) => setQuantityToAdd(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={addItemToOrder}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4" /> Добавить в заказ
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border/30 pt-4">
                    <Label className="text-xs font-semibold text-muted-foreground mb-3 block">ИЗМЕНИТЬ СТАТУС</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
                        <Button
                          key={st}
                          type="button"
                          size="sm"
                          variant={selectedOrder.status === st ? 'default' : 'outline'}
                          onClick={() => updateOrderStatus(st)}
                          className="text-xs"
                        >
                          {getStatusText(st)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Package className="w-8 h-8 mb-3 opacity-50" />
                <p>Выберите заказ для просмотра</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // СТАТИСТИКА
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground">Выручка</p>
              <p className="mt-4 text-3xl font-semibold">{totalRevenue.toLocaleString('ru-RU')} ₽</p>
              <p className="mt-2 text-sm text-muted-foreground">В ожидании: {pendingRevenue.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground">Заказы</p>
              <p className="mt-4 text-3xl font-semibold">{totalOrders}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground">Средний чек</p>
              <p className="mt-4 text-3xl font-semibold">{averageOrderValue.toFixed(0).toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground">Посещений</p>
              <p className="mt-4 text-3xl font-semibold">{totalVisits}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-xl font-semibold">Выручка за неделю</h2>
                  <p className="text-sm text-muted-foreground">Тренд выручки по дням</p>
                </div>
              </div>
              <ChartContainer className="h-[320px]" config={{ line: { color: '#0ea5e9' } }}>
                <LineChart data={revenueHistory} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-xl font-semibold">Статус заказов</h2>
                  <p className="text-sm text-muted-foreground">Распределение по статусам</p>
                </div>
              </div>
              <ChartContainer className="h-[320px]" config={{ line: { color: '#0f766e' } }}>
                <LineChart data={statusChartData} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-xl font-semibold">Посещения сайта</h2>
                <p className="text-sm text-muted-foreground">История посещений за неделю</p>
              </div>
            </div>
            <ChartContainer className="h-[320px]" config={{ line: { color: '#7c3aed' } }}>
              <LineChart data={visitsHistory} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      )}
    </div>
  )
}
