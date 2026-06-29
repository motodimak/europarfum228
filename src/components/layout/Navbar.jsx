import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes'
import ProfileButton from '@/components/ProfileButton'

export default function Navbar({ cartCount = 0, onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark'
  const toggleTheme = () => {
    if (!mounted) return
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="font-heading text-xl md:text-2xl font-semibold tracking-tight">
            EUROPA PARFUM
          </Link>

          <div className="hidden md:flex items-center gap-12 font-body text-sm tracking-widest uppercase">
            <Link to="/" className="hover:text-primary transition-colors duration-300">Главная</Link>
            <Link to="/catalog" className="hover:text-primary transition-colors duration-300">Каталог</Link>
            <Link to="/profile" className="hover:text-primary transition-colors duration-300">Профиль</Link>
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
              <Link to="/" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">
                Главная
              </Link>
              <Link to="/catalog" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">
                Каталог
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}