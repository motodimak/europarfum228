const TELEGRAM_BOT_TOKEN = '8946038303:AAF-MC3wraSKNi6XNtrabi-u6G-zZui7fcE'
const TELEGRAM_CHAT_ID = '-5144634002'
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₽`

const buildOrderMessage = ({ fullName, phone, address, deliveryDate, deliveryTimeSlot, paymentMethod, total, items, clientContact, clientContactType }) => {
  const header = ['📦 Новая заявка на заказ']
  const clientInfo = [`Имя: ${fullName || '—'}`]
  if (phone) {
    clientInfo.push(`Телефон: ${phone}`)
  }
  if (clientContact) {
    clientInfo.push(`Контакт: ${clientContact}`)
  }
  if (clientContactType) {
    clientInfo.push(`Тип контакта: ${clientContactType}`)
  }

  const deliveryInfo = [
    `Адрес: ${address || '—'}`,
    `Дата доставки: ${deliveryDate || '—'}`,
    `Время доставки: ${deliveryTimeSlot || '—'}`,
    `Оплата: ${paymentMethod === 'cash' ? 'Наличные' : 'На карту'}`,
  ]

  const itemsFormatted = items.length > 0
    ? ['Состав заказа:']
      .concat(items.map((item) => {
        const quantity = item.quantity || 1
        const price = Number(item.product_price || 0) * quantity
        return `- ${item.product_name || 'Товар'} ×${quantity} — ${formatMoney(price)}`
      }))
    : ['Состав заказа: отсутствует']

  return [
    ...header,
    ...clientInfo,
    ...deliveryInfo,
    ...itemsFormatted,
    `Итого: ${formatMoney(total)}`,
  ].join('\n')
}

export async function sendTelegramOrderNotification(orderData) {
  const text = buildOrderMessage(orderData)

  const response = await fetch(TELEGRAM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${body}`)
  }

  return response.json()
}
