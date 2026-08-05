'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PROPERTY } from '@/lib/property'

export default function Preloader() {
  const panelRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    document.documentElement.classList.add('is-loading')

    const finish = () => {
      document.documentElement.classList.remove('is-loading')
      document.documentElement.classList.add('ready')
      setDone(true)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    const count = { v: 0 }
    const tl = gsap.timeline({ onComplete: finish })
    tl.fromTo(
      nameRef.current,
      { yPercent: 110 },
      { yPercent: 0, duration: 1, ease: 'power3.out' },
      0.15,
    )
    tl.to(
      count,
      {
        v: 100,
        duration: 2,
        ease: 'power4.inOut',
        onUpdate: () => {
          if (counterRef.current)
            counterRef.current.textContent = String(Math.round(count.v)).padStart(3, '0')
        },
      },
      0.15,
    )
    tl.add(() => window.dispatchEvent(new CustomEvent('preloader:exit')), '+=0.15')
    tl.to(panel, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.9,
      ease: 'power4.inOut',
    })

    return () => {
      tl.kill()
      document.documentElement.classList.remove('is-loading')
    }
  }, [])

  if (done) return null

  return (
    <div className="preloader" ref={panelRef} aria-hidden>
      <p className="preloader__name display">
        <span className="mask">
          <span className="mask__inner" ref={nameRef}>
            {PROPERTY.name}
          </span>
        </span>
      </p>
      <span className="preloader__counter" ref={counterRef}>
        000
      </span>
    </div>
  )
}
