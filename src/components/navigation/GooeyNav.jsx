import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './GooeyNav.css'

export default function GooeyNav({
  items = [],
  animationTime = 600,
  initialActiveIndex = 0,
}) {
  const location = useLocation()
  const containerRef = useRef(null)
  const navRef = useRef(null)
  const indicatorRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex)

  const updateIndicatorPosition = element => {
    if (!containerRef.current || !indicatorRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const pos = element.getBoundingClientRect()

    const styles = {
      left: `${pos.left - containerRect.left}px`,
      top: `${pos.top - containerRect.top}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    }

    Object.assign(indicatorRef.current.style, styles)
  }

  const handleClick = (event, index) => {
    const liElement = event.currentTarget
    if (activeIndex === index) return

    setActiveIndex(index)
    updateIndicatorPosition(liElement)

    const ripple = document.createElement('span')
    ripple.className = 'gooey-nav-ripple'
    liElement.appendChild(ripple)

    window.setTimeout(() => {
      ripple.remove()
    }, animationTime)
  }

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const liElement = event.currentTarget.parentElement
      if (liElement) {
        handleClick({ currentTarget: liElement }, index)
      }
    }
  }

  useEffect(() => {
    if (!items.length) return

    const matchedIndex = items.findIndex(item => {
      if (item.href === '/') {
        return location.pathname === '/'
      }

      return location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
    })

    const nextIndex = matchedIndex === -1 ? initialActiveIndex : matchedIndex

    setActiveIndex(previous => (previous === nextIndex ? previous : nextIndex))
  }, [initialActiveIndex, items, location.pathname])

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return

    const activeLi = navRef.current.querySelectorAll('li')[activeIndex]
    if (activeLi) {
      updateIndicatorPosition(activeLi)
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex]
      if (currentActiveLi) {
        updateIndicatorPosition(currentActiveLi)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [activeIndex])

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav className="gooey-nav-shell" aria-label="Основная навигация">
        <span className="gooey-nav-indicator" ref={indicatorRef} aria-hidden="true" />
        <ul ref={navRef} className="gooey-nav-list">
          {items.map((item, index) => (
            <li key={item.href} className={activeIndex === index ? 'active' : ''}>
              <NavLink
                to={item.href}
                onClick={event => handleClick(event, index)}
                onKeyDown={event => handleKeyDown(event, index)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}