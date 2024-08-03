import { cn } from '@/app/lib/utils'
import { HTMLAttributes, ReactNode } from 'react'

interface IMain extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

export default function Main({ className, children }: IMain) {
  return <main className={cn('flex flex-col', className)}>{children}</main>
}
