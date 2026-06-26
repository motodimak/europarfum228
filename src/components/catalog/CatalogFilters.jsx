import React from 'react';
import { Button } from '@/components/ui/button';

const categories = [
  { key: 'all', label: 'Все' },
  { key: 'aquatic', label: 'Акватические' },
  { key: 'aldehydic', label: 'Альдегидные' },
  { key: 'amber', label: 'Амбровые' },
  { key: 'balsamic', label: 'Бальзамические' },
  { key: 'oriental', label: 'Восточные' },
  { key: 'gourmand', label: 'Гурманские' },
  { key: 'woody', label: 'Древесные' },
  { key: 'other', label: 'Другая' },
  { key: 'leather', label: 'Кожаные' },
  { key: 'musky', label: 'Мускусные' },
  { key: 'spicy', label: 'Пряные' },
  { key: 'sweet', label: 'Сладкие' },
  { key: 'tobacco', label: 'Табачные' },
  { key: 'fruity', label: 'Фруктовые' },
  { key: 'fougere', label: 'Фужерные' },
  { key: 'floral', label: 'Цветочные' },
  { key: 'citrus', label: 'Цитрусовые' },
];

const genders = [
  { key: 'all', label: 'Все' },
  { key: 'feminine', label: 'Женские' },
  { key: 'masculine', label: 'Мужские' },
  { key: 'unisex', label: 'Унисекс' },
];

export default function CatalogFilters({ activeCategory, activeGender, onCategoryChange, onGenderChange }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">Категория</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.key}
              variant={activeCategory === cat.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat.key)}
              className="font-body text-xs tracking-wider rounded-full"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">Для кого</p>
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => (
            <Button
              key={g.key}
              variant={activeGender === g.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGenderChange(g.key)}
              className="font-body text-xs tracking-wider rounded-full"
            >
              {g.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}