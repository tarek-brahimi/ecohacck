'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "relative flex items-center gap-2 text-sm leading-none font-medium select-none after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 after:content-[''] group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 transition-colors duration-300 ease-out hover:text-primary hover:after:w-full cursor-pointer",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
