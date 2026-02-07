'use client'

import Image from 'next/image'

export function Avatar({
  size = 40,
  src = '/avatar.svg',
  alt = 'avatar',
  className,
}: {
  size?: number
  src?: string
  alt?: string
  className?: string
}) {
  return (
    <span
      className={`relative inline-flex overflow-hidden rounded-2xl ring-1 ring-black/10 ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </span>
  )
}

