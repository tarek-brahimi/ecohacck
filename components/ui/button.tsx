import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Add this to your global CSS (index.css / globals.css):
//
// .liquid-btn { position: relative; overflow: hidden; }
// .liquid-btn .liquid-fill {
//   position: absolute; bottom: -100%; left: 50%;
//   transform: translateX(-50%);
//   width: 200%; height: 200%;
//   border-radius: 40%;
//   transition: bottom 0.6s cubic-bezier(0.23, 1, 0.32, 1);
//   z-index: 0;
//   animation: liquid-spin 4s linear infinite;
//   pointer-events: none;
// }
// .liquid-btn:hover .liquid-fill,
// .liquid-btn:focus-visible .liquid-fill { bottom: -40%; }
// .liquid-btn:active .liquid-fill       { bottom: -20%; transition: bottom 0.15s ease; }
// .liquid-btn > *:not(.liquid-fill) { position: relative; z-index: 1; }
//
// .liquid-bubble {
//   position: absolute; border-radius: 50%;
//   opacity: 0; z-index: 1; pointer-events: none;
//   animation: liquid-rise 2s ease-in infinite;
// }
// @keyframes liquid-spin {
//   from { transform: translateX(-50%) rotate(0deg); }
//   to   { transform: translateX(-50%) rotate(360deg); }
// }
// @keyframes liquid-rise {
//   0%   { transform: translateY(0) scale(1); opacity: 0.6; }
//   80%  { opacity: 0.3; }
//   100% { transform: translateY(-60px) scale(0.4); opacity: 0; }
// }

const liquidColors: Record<string, { fill: string; bubble: string }> = {
  default:     { fill: 'bg-primary',        bubble: 'bg-blue-300/50' },
  destructive: { fill: 'bg-destructive',    bubble: 'bg-red-300/50' },
  outline:     { fill: 'bg-emerald-500',    bubble: 'bg-emerald-200/60' },
  secondary:   { fill: 'bg-green-300',      bubble: 'bg-green-200/50' },
  ghost:       { fill: 'bg-violet-500',     bubble: 'bg-violet-300/50' },
  link:        { fill: 'bg-transparent',    bubble: 'bg-transparent' },
}

const BUBBLES = [
  { left: '20%', delay: '0s',   size: 7 },
  { left: '50%', delay: '0.6s', size: 5 },
  { left: '75%', delay: '1.2s', size: 8 },
  { left: '35%', delay: '1.8s', size: 4 },
]

const buttonVariants = cva(
  "liquid-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:text-white dark:bg-input/30 dark:border-input',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:text-white dark:hover:bg-accent/50',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  className,
  variant = 'default',
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const colors = liquidColors[variant ?? 'default'] ?? liquidColors.default

  // When used as Slot (asChild), skip liquid layer to avoid DOM conflicts
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Liquid wave */}
      <span
        aria-hidden="true"
        className={cn('liquid-fill', colors.fill)}
      />

      {/* Rising bubbles */}
      {variant !== 'link' &&
        BUBBLES.map((b, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn('liquid-bubble absolute', colors.bubble)}
            style={{
              left: b.left,
              bottom: '-20px',
              width: b.size,
              height: b.size,
              animationDelay: b.delay,
            }}
          />
        ))}

      {children}
    </button>
  )
}

export { Button, buttonVariants }