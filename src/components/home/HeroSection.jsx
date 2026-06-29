import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import TextType from '@/components/ui/TextType';

export default function HeroSection({ heroImages = [] }) {
  const primaryImage = heroImages[0]
  const fallbackImage = heroImages[0]?.src || ''

  return (
    <section className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,hsl(var(--primary)/0.16),transparent_34%),radial-gradient(circle_at_84%_12%,hsl(var(--accent)/0.18),transparent_34%),linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--background))_44%,hsl(var(--secondary)/0.58)_100%)]" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="rounded-[2rem] border border-border/70 bg-card/78 backdrop-blur-md p-7 md:p-10 shadow-[0_24px_70px_-38px_rgba(14,35,37,0.44)]">
              <p className="font-body text-xs tracking-[0.32em] uppercase text-muted-foreground mb-6">
                Доступная парфюмерия высшего класса
              </p>

              <h1 className="font-heading text-[clamp(2.45rem,6vw,5.4rem)] font-semibold leading-[0.94] tracking-tight text-foreground mb-6">
                Искусство{' '}
                <em className="font-normal block md:inline mt-1 md:mt-0">
                  <TextType
                    as="span"
                    text={['аромата', 'настроения', 'шлейфа']}
                    typingSpeed={110}
                    deletingSpeed={55}
                    pauseDuration={1800}
                    initialDelay={200}
                    cursorCharacter="▎"
                    cursorBlinkDuration={0.55}
                    className="align-baseline"
                    startOnVisible
                  />
                </em>
              </h1>

              <p className="font-body text-base md:text-lg text-muted-foreground max-w-[34ch] leading-relaxed mb-10">
                Откройте мир изысканных композиций, где каждый флакон звучит как личная история и раскрывается в идеальном ритме.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-body text-sm tracking-[0.08em] uppercase hover:opacity-90 transition-opacity"
                >
                  Смотреть каталог
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="font-body text-sm text-muted-foreground">200+ редких ароматов</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="lg:col-span-7"
          >
            <div className="relative max-w-[760px] lg:ml-auto flex justify-center lg:justify-end">
              <div className="absolute -inset-10 bg-[radial-gradient(circle,hsl(var(--primary)/0.18),transparent_64%)] blur-2xl" />
              <div className="relative w-full max-w-[620px] h-[520px] md:h-[600px] rounded-[2rem] overflow-hidden border border-border/70 bg-card/70">
                {primaryImage && (
                  <img
                    src={primaryImage.src}
                    alt={primaryImage.alt}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    onError={(event) => {
                      if (fallbackImage && event.currentTarget.src !== fallbackImage) {
                        event.currentTarget.src = fallbackImage
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}