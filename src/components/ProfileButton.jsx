import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import ClientRegisterDialog from '@/components/ClientRegisterDialog'
import { User, LogOut, Shield } from 'lucide-react'

export default function ProfileButton() {
  const [client, setClient] = useState(null)
  const [adminSession, setAdminSession] = useState(null)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const rootRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('clientRegistration')
      if (raw) setClient(JSON.parse(raw))
      else setClient(null)

      const adminRaw = localStorage.getItem('adminSession')
      if (adminRaw) setAdminSession(JSON.parse(adminRaw))
      else setAdminSession(null)
    } catch (e) {
      setClient(null)
      setAdminSession(null)
    }

    // listener for registration changes
    const onChange = (ev) => {
      try {
        const detail = ev?.detail
        if (detail) setClient(detail)
        else {
          const raw2 = localStorage.getItem('clientRegistration')
          setClient(raw2 ? JSON.parse(raw2) : null)
        }
      } catch (err) {
        setClient(null)
      }
    }
    window.addEventListener('clientRegistrationChanged', onChange)
    const onAdminChange = (ev) => {
      try {
        const detail = ev?.detail
        if (detail) setAdminSession(detail)
        else {
          const adminRaw = localStorage.getItem('adminSession')
          setAdminSession(adminRaw ? JSON.parse(adminRaw) : null)
        }
      } catch (err) {
        setAdminSession(null)
      }
    }
    window.addEventListener('adminSessionChanged', onAdminChange)
    // also listen to storage (other tabs)
    const onStorage = () => {
      try {
        const raw3 = localStorage.getItem('clientRegistration')
        setClient(raw3 ? JSON.parse(raw3) : null)
        const adminRaw = localStorage.getItem('adminSession')
        setAdminSession(adminRaw ? JSON.parse(adminRaw) : null)
      } catch (err) {
        setClient(null)
        setAdminSession(null)
      }
    }
    window.addEventListener('storage', onStorage)

    // click outside to close popup
    const onDocClick = (ev) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(ev.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)

    return () => {
      window.removeEventListener('clientRegistrationChanged', onChange)
      window.removeEventListener('adminSessionChanged', onAdminChange)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('mousedown', onDocClick)
    }
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem('clientRegistration')
      localStorage.removeItem('adminSession')
    } catch (e) {}
    setClient(null)
    setAdminSession(null)
    setOpen(false)
    try { window.dispatchEvent(new CustomEvent('clientRegistrationChanged', { detail: null })) } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('adminSessionChanged', { detail: null })) } catch (e) {}
    navigate('/')
  }

  if (!client && !adminSession) {
    // Show registration trigger when no client
    return <ClientRegisterDialog />
  }

  const isAdmin = Boolean(adminSession)
  const initials = isAdmin
    ? 'AD'
    : `${(client?.firstName || '').slice(0,1)}${(client?.lastName || '').slice(0,1)}`.toUpperCase()

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(v => !v)} className="inline-flex items-center focus:outline-none">
          <Avatar>
            <AvatarFallback>{isAdmin ? <Shield className="w-4 h-4" /> : (initials || <User className="w-4 h-4" />)}</AvatarFallback>
          </Avatar>
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background p-3 shadow">
          <div className="px-2 py-1 text-sm">
            {isAdmin ? (
              <>
                <div className="font-medium">Администратор</div>
                <div className="text-xs text-muted-foreground">Доступ к панели управления</div>
              </>
            ) : (
              <>
                <div className="font-medium">{client.firstName} {client.lastName}</div>
                <div className="text-xs text-muted-foreground">{client.contactType}: {client.contactValue}</div>
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 px-2 pt-3">
            {isAdmin ? (
              <Link to="/admin"><Button size="sm" variant="outline">АДМИНКА</Button></Link>
            ) : (
              <Link to="/profile"><Button size="sm" variant="outline">ПРОФИЛЬ</Button></Link>
            )}
            <Button size="sm" variant="ghost" onClick={handleLogout}>ВЫХОД</Button>
          </div>
        </div>
      )}
    </div>
  )
}
