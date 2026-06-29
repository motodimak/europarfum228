import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes'
import ProfileButton from '@/components/ProfileButton'
import GooeyNav from '@/components/navigation/GooeyNav'
import ShinyText from '@/components/ui/ShinyText'

const NAV_ITEMS = [
  { label: 'Главная', href: '/' },
  { label: 'Каталог', href: '/catalog' },
  { label: 'Профиль', href: '/profile' },
]

export default function Navbar({ cartCount = 0, onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const navItems = useMemo(() => NAV_ITEMS, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark'
  const toggleTheme = () => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.add('theme-transitioning')
    setTheme(isDark ? 'light' : 'dark')
    window.setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 380)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="font-heading text-xl md:text-2xl font-semibold tracking-tight">
            <ShinyText
              text="EUROPA PARFUM"
              speed={2}
              delay={0.08}
              color="hsl(var(--foreground) / 0.62)"
              shineColor="hsl(var(--primary))"
              spread={106}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </Link>

          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <GooeyNav items={navItems} initialActiveIndex={0} />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
              className="relative p-2 hover:bg-secondary/60 rounded-full transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <ProfileButton />
            <button
              onClick={onCartOpen}
              className="relative p-2 hover:bg-secondary/60 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 hover:bg-secondary/60 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-6 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center gap-10 font-heading text-3xl">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="hover:opacity-60 transition-opacity"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}