import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/45 mt-32 bg-background/32 backdrop-blur-[1px]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">EUROPA PARFUM</h3>
            <p className="font-body text-sm text-foreground/80 leading-relaxed max-w-xs">
              Искусство парфюмерии, воплощённое в каждом флаконе. Откройте мир ароматов, созданных для тех, кто ценит подлинную роскошь.
            </p>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase mb-6 text-foreground/70">Навигация</h4>
            <div className="flex flex-col gap-3 font-body text-sm">
              <Link to="/" className="hover:text-primary transition-colors duration-300 hover:translate-x-0.5">Главная</Link>
              <Link to="/catalog" className="hover:text-primary transition-colors duration-300 hover:translate-x-0.5">Каталог</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase mb-6 text-foreground/70">Контакты</h4>
            <div className="flex flex-col gap-3 font-body text-sm text-foreground/80">
              <span>info@europarfum.ru</span>
              <span>+7 (495) 000-00-00</span>
              <span>Москва, ул. Тверская, 1</span>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-foreground/65">© 2026 Euro Parfum. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}