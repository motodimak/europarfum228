import React from 'react';
import { Button } from '@/components/ui/button';

const categories = [
  { key: 'all', label: 'Все' },
  { key: 'Акватические', label: 'Акватические' },
  { key: 'Альдегидные', label: 'Альдегидные' },
  { key: 'Амбровые', label: 'Амбровые' },
  { key: 'Бальзамические', label: 'Бальзамические' },
  { key: 'Восточные', label: 'Восточные' },
  { key: 'Гурманские', label: 'Гурманские' },
  { key: 'Древесные', label: 'Древесные' },
  { key: 'Другая', label: 'Другая' },
  { key: 'Кожаные', label: 'Кожаные' },
  { key: 'Мускусные', label: 'Мускусные' },
  { key: 'Пряные', label: 'Пряные' },
  { key: 'Сладкие', label: 'Сладкие' },
  { key: 'Табачные', label: 'Табачные' },
  { key: 'Фруктовые', label: 'Фруктовые' },
  { key: 'Фужерные', label: 'Фужерные' },
  { key: 'Цветочные', label: 'Цветочные' },
  { key: 'Цитрусовые', label: 'Цитрусовые' },
];

const genders = [
  { key: 'all', label: 'Все' },
  { key: 'Женские', label: 'Женские' },
  { key: 'Мужские', label: 'Мужские' },
  { key: 'Унисекс', label: 'Унисекс' },
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