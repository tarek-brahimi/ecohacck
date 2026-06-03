import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * CSS à ajouter dans globals.css :
 *
 * .liquid-fill {
 *   position: absolute;
 *   inset: 0;
 *   left: 0;
 *   transform: translateX(-100%);
 *   width: 100%;
 *   height: 100%;
 *   z-index: 0;
 *   transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
 *   pointer-events: none;
 * }
 * .liquid-btn:hover .liquid-fill,
 * .liquid-btn:focus-visible .liquid-fill {
 *   transform: translateX(0%);
 * }
 */

const liquidFill: Record<string, string> = {
  default:     'bg-blue-700',
  destructive: 'bg-red-500',
  outline:     'bg-emerald-500',
  secondary:   'bg-green-300',
  ghost:       'bg-violet-500',
  link:        'bg-transparent',
}

const buttonVariants = cva(
  [
    'liquid-btn',
    'relative overflow-hidden',
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    'outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground',
        destructive:
          'bg-destructive/20 text-destructive border border-destructive/40 hover:text-white dark:bg-destructive/10',
        outline:
          'border bg-background text-foreground shadow-xs hover:text-white dark:bg-input/30 dark:border-input',
        secondary:
          'bg-secondary text-secondary-foreground',
        ghost:
          'text-foreground hover:text-white',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:   'h-9 px-4 py-2 has-[>svg]:px-3',
        sm:        'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg:        'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon:      'size-9',
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
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  const fillColor = liquidFill[variant ?? 'default'] ?? liquidFill.default

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Couleur qui glisse de gauche à droite au hover */}
      {variant !== 'link' && (
        <span
          aria-hidden="true"
          className={cn('liquid-fill', fillColor)}
        />
      )}

      {/* Contenu toujours au-dessus */}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  )
}

export { Button, buttonVariants }