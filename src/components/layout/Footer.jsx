import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-32">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">EURO PARFUM</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
              Искусство парфюмерии, воплощённое в каждом флаконе. Откройте мир ароматов, созданных для тех, кто ценит подлинную роскошь.
            </p>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase mb-6 text-muted-foreground">Навигация</h4>
            <div className="flex flex-col gap-3 font-body text-sm">
              <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
              <Link to="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase mb-6 text-muted-foreground">Контакты</h4>
            <div className="flex flex-col gap-3 font-body text-sm text-muted-foreground">
              <span>info@europarfum.ru</span>
              <span>+7 (495) 000-00-00</span>
              <span>Москва, ул. Тверская, 1</span>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">© 2026 Euro Parfum. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}