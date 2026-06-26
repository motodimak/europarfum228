import React from 'react'
import { Star } from 'lucide-react'

export default function ReviewStars({ rating = 0, size = 18, onRate, interactive = false }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-1">
      {stars.map((value) => {
        const filled = value <= Math.round(rating)
        return (
          <button
            type="button"
            key={value}
            onClick={() => interactive && onRate && onRate(value)}
            className={`transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'} ${filled ? 'text-amber-400' : 'text-slate-300'}`}
            aria-label={`Оценка ${value} звезд`}
          >
            <Star className="w-4 h-4" style={{ width: size, height: size }} />
          </button>
        )
      })}
    </div>
  )
}
