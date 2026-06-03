import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
  imageClassName?: string
  textClassName?: string
}

export function BrandLogo({
  className,
  imageClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background',
          imageClassName,
        )}
      >
        <Image
          src="/image.png"
          alt="shabeb logo"
          width={40}
          height={40}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span
        className={cn(
          'text-xl font-bold tracking-normal text-foreground',
          textClassName,
        )}
      >
        shabeb
      </span>
    </span>
  )
}
