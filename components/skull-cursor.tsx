'use client'

import { useEffect, useRef, useState } from 'react'

type CursorState = 'idle' | 'hover' | 'cta' | 'disabled'

/**
 * Premium smart skull cursor.
 *
 * - Follows the mouse at 60fps via requestAnimationFrame + translate3d.
 * - Hotspot is the upper tip of the flame (exactly where the user points).
 * - Idle: soft blue eyes with gentle pulse.
 * - Hover on clickable items: red eyes + subtle scale-up.
 * - Hover on primary CTAs (Buy / Get Started / Become a Pro / gradient-primary): fiery red + stronger glow.
 * - Click: brighter flash + quick squash.
 * - Disabled: muted gray eyes, no glow.
 * - Hidden on touch devices, text inputs, and before the first mouse move.
 */
export function SkullCursor() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const raf = useRef<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [state, setState] = useState<CursorState>('idle')
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Don't render on touch-primary devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const el = rootRef.current
    if (!el) return

    // ── mouse tracking ────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      if (!visible) setVisible(true)
      updateStateFromTarget(e.target as Element | null)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const onMouseDown = () => setActive(true)
    const onMouseUp = () => {
      // hold the active state long enough to see the flash
      window.setTimeout(() => setActive(false), 160)
    }

    // ── state detection ────────────────────────────────────────────
    const CLICKABLE_SELECTOR = [
      'a[href]',
      'button',
      '[role="button"]',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'label[for]',
      'summary',
      'select',
      '.cursor-pointer',
      '[data-clickable="true"]',
    ].join(',')

    const CTA_SELECTOR = [
      '.gradient-primary',
      '[data-cta="primary"]',
    ].join(',')

    const TEXT_INPUT_SELECTOR = [
      'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"])',
      'textarea',
      '[contenteditable="true"]',
    ].join(',')

    const updateStateFromTarget = (t: Element | null) => {
      if (!t) { setState('idle'); el.classList.remove('skull-cursor--text'); return }

      // text inputs: hide skull entirely, show native I-beam
      const textEl = t.closest(TEXT_INPUT_SELECTOR)
      if (textEl) {
        el.classList.add('skull-cursor--text')
        return
      }
      el.classList.remove('skull-cursor--text')

      const clickable = t.closest(CLICKABLE_SELECTOR)
      if (!clickable) { setState('idle'); return }

      // disabled?
      const isDisabled =
        clickable.hasAttribute('disabled') ||
        clickable.getAttribute('aria-disabled') === 'true' ||
        (clickable as HTMLButtonElement).disabled === true
      if (isDisabled) { setState('disabled'); return }

      // CTA?
      const isCta = !!clickable.closest(CTA_SELECTOR) || !!t.closest(CTA_SELECTOR)
      setState(isCta ? 'cta' : 'hover')
    }

    // ── render loop ────────────────────────────────────────────────
    const tick = () => {
      // smooth follow with a tiny lerp (premium feel without lag)
      const lerp = 0.32
      current.current.x += (target.current.x - current.current.x) * lerp
      current.current.y += (target.current.y - current.current.y) * lerp
      el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [visible])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-state={state}
      data-active={active ? 'true' : 'false'}
      data-visible={visible ? 'true' : 'false'}
      className="skull-cursor"
    >
      <svg
        width="40"
        height="55"
        viewBox="0 0 32 44"
        xmlns="http://www.w3.org/2000/svg"
        className="skull-cursor__svg"
      >
        <defs>
          <linearGradient id="skullBody" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#1a1a1f" />
            <stop offset="55%" stopColor="#0a0a0d" />
            <stop offset="100%" stopColor="#141418" />
          </linearGradient>
          <radialGradient id="skullHighlight" cx="0.35" cy="0.25" r="0.55">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="eyeGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--eye-core)" />
            <stop offset="60%" stopColor="var(--eye-color)" />
            <stop offset="100%" stopColor="var(--eye-edge)" />
          </radialGradient>
        </defs>

        {/* Skull body — flame-tipped teardrop following reference silhouette */}
        <path
          d="
            M16 1.5
            C 18.2 4.5, 19.6 7.2, 20.8 9.5
            C 23.4 12, 25.8 15, 26.7 19
            C 27.8 24, 27.2 29, 25.5 33
            C 24 36.8, 21.5 39.6, 18.6 41
            C 17.4 41.6, 16.6 42, 16 42.4
            C 15.4 42, 14.6 41.6, 13.4 41
            C 10.5 39.6, 8 36.8, 6.5 33
            C 4.8 29, 4.2 24, 5.3 19
            C 6.2 15, 8.6 12, 11.2 9.5
            C 12.4 7.2, 13.8 4.5, 16 1.5
            Z
          "
          fill="url(#skullBody)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.4"
        />

        {/* subtle top-left highlight */}
        <path
          d="
            M16 1.5
            C 14 4.5, 12.8 7.2, 11.5 9.5
            C 9 12, 7 15, 6 19
            C 8 16, 11 13, 14 10
            C 15 7, 15.4 4, 16 1.5
            Z
          "
          fill="url(#skullHighlight)"
          opacity="0.9"
        />

        {/* Eye sockets — outer dark rim */}
        <ellipse cx="11" cy="22" rx="4" ry="4.5" fill="#000" />
        <ellipse cx="21" cy="22" rx="4" ry="4.5" fill="#000" />

        {/* Eye glow (the dynamic color part) */}
        <g className="skull-cursor__eyes">
          <ellipse cx="11" cy="22" rx="3" ry="3.5" fill="url(#eyeGlow)" />
          <ellipse cx="21" cy="22" rx="3" ry="3.5" fill="url(#eyeGlow)" />
          {/* inner bright core / pupil highlight */}
          <circle cx="11" cy="21.4" r="0.9" fill="rgba(255,255,255,0.95)" />
          <circle cx="21" cy="21.4" r="0.9" fill="rgba(255,255,255,0.95)" />
        </g>

        {/* small teeth notches on the jaw */}
        <path
          d="M13.5 40.2 L14.3 41.6 L15 40.4 L15.8 41.8 L16.5 40.4 L17.3 41.8 L18 40.4 L18.6 41.5"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth="0.35"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
