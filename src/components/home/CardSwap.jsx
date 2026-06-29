import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import './CardSwap.css'

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card-swap-card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
))
Card.displayName = 'Card'

const makeSlot = (index, distX, distY, total) => ({
  x: index * distX,
  y: -index * distY,
  z: -index * distX * 1.5,
  zIndex: total - index,
})

const placeNow = (element, slot, skewAmount) =>
  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skewAmount,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  })

const CardSwap = ({
  width = 520,
  height = 460,
  cardDistance = 34,
  verticalDistance = 18,
  delay = 4200,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 2,
  easing = 'elastic',
  children,
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'power2.out',
          durDrop: 0.45,
          durMove: 0.55,
          durReturn: 0.6,
          promoteOverlap: 0.38,
          returnDelay: 0.08,
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.45,
          durMove: 0.55,
          durReturn: 0.55,
          promoteOverlap: 0.35,
          returnDelay: 0.08,
        }

  const childArr = useMemo(() => Children.toArray(children), [children])
  const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr.length])
  const order = useRef(Array.from({ length: childArr.length }, (_, index) => index))
  const tlRef = useRef(null)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const total = refs.length
    refs.forEach((ref, index) => placeNow(ref.current, makeSlot(index, cardDistance, verticalDistance, total), skewAmount))

    const swap = () => {
      if (order.current.length < 2) return

      const [front, ...rest] = order.current
      const frontElement = refs[front].current
      const tl = gsap.timeline()
      tlRef.current = tl

      tl.to(frontElement, {
        y: '+=28',
        scale: 0.96,
        duration: config.durDrop,
        ease: config.ease,
      })

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`)

      rest.forEach((itemIndex, index) => {
        const element = refs[itemIndex].current
        const slot = makeSlot(index, cardDistance, verticalDistance, refs.length)

        tl.set(element, { zIndex: slot.zIndex }, 'promote')
        tl.to(
          element,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            scale: 1,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${index * 0.1}`
        )
      })

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length)
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`)
      tl.call(() => {
        gsap.set(frontElement, { zIndex: backSlot.zIndex })
      }, undefined, 'return')
      tl.to(
        frontElement,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          scale: 0.98,
          duration: config.durReturn,
          ease: config.ease,
        },
        'return'
      )

      tl.call(() => {
        order.current = [...rest, front]
      })
    }

    swap()
    intervalRef.current = window.setInterval(swap, delay)

    if (pauseOnHover) {
      const node = containerRef.current
      const pause = () => {
        tlRef.current?.pause()
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
      const resume = () => {
        tlRef.current?.play()
        intervalRef.current = window.setInterval(swap, delay)
      }

      node?.addEventListener('mouseenter', pause)
      node?.addEventListener('mouseleave', resume)

      return () => {
        node?.removeEventListener('mouseenter', pause)
        node?.removeEventListener('mouseleave', resume)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, refs])

  const renderedChildren = childArr.map((child, index) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: index,
          ref: refs[index],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: event => {
            child.props.onClick?.(event)
            onCardClick?.(index)
          },
        })
      : child
  )

  return (
    <div ref={containerRef} className="card-swap-container" style={{ width, height }}>
      {renderedChildren}
    </div>
  )
}

export default CardSwap