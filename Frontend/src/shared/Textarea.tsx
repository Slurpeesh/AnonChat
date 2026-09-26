import { cn } from '@/app/lib/utils'
import * as React from 'react'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex w-full rounded-lg bg-background-section px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 disabled:cursor-not-allowed disabled:bg-background-section/50 disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
