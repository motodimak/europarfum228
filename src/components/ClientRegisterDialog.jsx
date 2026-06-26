import React, { useState } from "react"
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ClientRegisterDialog() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const [mode, setMode] = useState('register') // 'register' | 'login'
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [contactType, setContactType] = useState("phone")
  const [contactValue, setContactValue] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!contactValue || contactValue.trim() === "") {
      setError('Введите контакт.')
      return
    }

    const usersRaw = localStorage.getItem('users')
    let users = []
    try { users = usersRaw ? JSON.parse(usersRaw) : [] } catch (err) { users = [] }

    if (mode === 'register') {
      if (contactType === 'other' && contactValue === 'ADMIN228SS') {
        setError('Этот код зарезервирован для админки.')
        return
      }

      if (!firstName || firstName.trim() === '') {
        setError('Введите имя для регистрации.')
        return
      }

      // Check duplicates by contactType + contactValue
      const exists = users.find(u => u.contactType === contactType && u.contactValue === contactValue)
      if (exists) {
        setError('Пользователь с такими данными уже зарегистрирован. Войдите в аккаунт.')
        return
      }

      const newUser = { id: Date.now().toString(), firstName, lastName, contactType, contactValue }
      users.push(newUser)
      try { localStorage.setItem('users', JSON.stringify(users)) } catch (err) {}
      try { localStorage.setItem('clientRegistration', JSON.stringify(newUser)) } catch (err) {}
      // notify other components
      try { window.dispatchEvent(new CustomEvent('clientRegistrationChanged', { detail: newUser })) } catch (e) {}
      setOpen(false)
      navigate('/profile')
    } else {
      if (isAdminLogin) {
        const adminSession = {
          role: 'admin',
          code: 'ADMIN228SS',
          label: 'Администратор',
          createdAt: new Date().toISOString(),
        }
        try { localStorage.setItem('adminSession', JSON.stringify(adminSession)) } catch (err) {}
        try { window.dispatchEvent(new CustomEvent('adminSessionChanged', { detail: adminSession })) } catch (e) {}
        try { window.dispatchEvent(new CustomEvent('clientRegistrationChanged', { detail: null })) } catch (e) {}
        setOpen(false)
        navigate('/admin')
        return
      }

      // login
      const found = users.find(u => u.contactType === contactType && u.contactValue === contactValue)
      if (!found) {
        setError('Пользователь не найден. Проверьте данные или зарегистрируйтесь.')
        return
      }
      try { localStorage.setItem('clientRegistration', JSON.stringify(found)) } catch (err) {}
      try { window.dispatchEvent(new CustomEvent('clientRegistrationChanged', { detail: found })) } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('adminSessionChanged', { detail: null })) } catch (e) {}
      setOpen(false)
      navigate('/profile')
    }
  }

  const placeholderMap = {
    phone: "+7 (___) ___-__-__",
    telegram: "@username or link",
    whatsapp: "+7 (___) ___-__-__",
    other: "Контактная информация",
  }

  const isAdminLogin = mode === 'login' && contactType === 'other' && contactValue === 'ADMIN228SS'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Регистрация</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setMode('register')} className={`px-3 py-1 rounded ${mode==='register' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}>
              Регистрация
            </button>
            <button type="button" onClick={() => setMode('login')} className={`px-3 py-1 rounded ${mode==='login' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}>
              Вход
            </button>
          </div>
          <DialogTitle>{mode === 'register' ? 'Регистрация клиента' : 'Вход в аккаунт'}</DialogTitle>
          <DialogDescription>{mode === 'register' ? 'Укажите имя, фамилию и один способ связи.' : 'Введите способ связи и значение, чтобы войти.'}</DialogDescription>
          {mode === 'login' && (
            <p className="mt-2 text-xs text-muted-foreground">
              Для входа в админ-панель выберите <span className="font-medium">Другое</span> и введите код <span className="font-medium">ADMIN228SS</span>.
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-1 gap-2">
                <Label>Имя</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label>Фамилия</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label>Способ связи (выберите один)</Label>
            <RadioGroup value={contactType} onValueChange={setContactType} className="flex gap-4">
              <label className="flex items-center gap-2">
                <RadioGroupItem value="phone" />
                Телефон
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="telegram" />
                Telegram
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="whatsapp" />
                WhatsApp
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="other" />
                Другое
              </label>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label>Контакт</Label>
            <Input
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={placeholderMap[contactType] || placeholderMap.other}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Отмена</Button>
            </DialogClose>
            <Button type="submit">{mode === 'register' ? 'Зарегистрировать' : 'Войти'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
