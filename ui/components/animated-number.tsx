'use client'

import { animate } from 'motion'
import { useEffect, useRef, useState } from 'react'

export function AnimatedNumber({
  value,
  className,
  format = true,
}: {
  value: number
  className?: string
  format?: boolean
}) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    prev.current = value
    return () => controls.stop()
  }, [value])

  const rounded = Math.round(display)
  return (
    <span className={className}>
      {format ? rounded.toLocaleString() : rounded}
    </span>
  )
}
