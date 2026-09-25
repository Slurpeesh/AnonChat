import { cn } from '@/app/lib/utils'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type MotionProps } from 'motion/react'
import * as React from 'react'

function BubbleGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="bubble-group"
      className={cn('flex min-w-0 flex-col gap-2', className)}
      {...props}
    />
  )
}

const bubbleVariants = cva(
  'group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full',
  {
    variants: {
      variant: {
        default:
          '*:data-[slot=bubble-content]:bg-accent *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-accent-hover',
        secondary:
          '*:data-[slot=bubble-content]:bg-background-section *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--color-theme-background-section),var(--color-theme-foreground)_5%)]',
        muted:
          '*:data-[slot=bubble-content]:bg-background-section *:data-[slot=bubble-content]:text-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--color-theme-background-section),var(--color-theme-foreground)_5%)]',
        tinted:
          '*:data-[slot=bubble-content]:bg-accent-mild *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--color-theme-accent-mild),var(--color-theme-foreground)_5%)]',
        outline:
          '*:data-[slot=bubble-content]:border-muted *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-background-section [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground',
        ghost:
          'border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-background-section [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground',
        destructive:
          '*:data-[slot=bubble-content]:bg-danger/10 *:data-[slot=bubble-content]:text-danger [&>[data-slot=bubble-content]:is(button,a):hover]:bg-danger/20',
        alert:
          '*:data-[slot=bubble-content]:bg-alert *:data-[slot=bubble-content]:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type NativeProps = Omit<
  React.ComponentProps<'div'>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDrop'
>

type BubbleProps = NativeProps &
  VariantProps<typeof bubbleVariants> & {
    align?: 'start' | 'end'
  }

const Bubble = React.forwardRef<HTMLDivElement, BubbleProps & MotionProps>(
  function Bubble(
    { variant = 'default', align = 'start', className, ...props },
    ref,
  ) {
    return (
      <motion.div
        ref={ref}
        data-slot="bubble"
        data-variant={variant}
        data-align={align}
        className={cn(bubbleVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

function BubbleContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'w-fit max-w-full min-w-0 overflow-hidden rounded-3xl border border-transparent px-3 py-2.5 text-sm leading-relaxed wrap-anywhere group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-accent [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-accent/30',
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'bubble-content',
    },
  })
}

const bubbleReactionsVariants = cva(
  'absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-background-section px-1.5 py-0.5 text-sm ring-3 ring-background has-[button]:p-0',
  {
    variants: {
      side: {
        top: 'top-0 -translate-y-3/4',
        bottom: 'bottom-0 translate-y-3/4',
      },
      align: {
        start: 'left-3',
        end: 'right-3',
      },
    },
    defaultVariants: {
      side: 'bottom',
      align: 'end',
    },
  },
)

function BubbleReactions({
  side = 'bottom',
  align = 'end',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  align?: 'start' | 'end'
  side?: 'top' | 'bottom'
}) {
  return (
    <div
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  )
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions }
