'use client'

import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Props {
  children: ReactNode
  className?: string
  /** stagger delay in ms */
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * Enter reveal driven by GSAP ScrollTrigger, so it rides the same Lenis-bridged
 * timeline as the 3D camera (§3) — no scroll-position desync. The visual itself
 * is the CSS `.is-in` transition; ScrollTrigger just flips the class on enter.
 */
export default function Reveal({ children, className = '', delay = 0, as = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in')
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        el.style.transitionDelay = `${delay}ms`
        el.classList.add('is-in')
      },
    })
    return () => st.kill()
  }, [delay])

  const Tag = as as 'div'
  return (
    <Tag ref={ref as RefObject<HTMLDivElement>} className={`reveal ${className}`}>
      {children}
    </Tag>
  )
}
