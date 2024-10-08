import { cn } from '@/app/lib/utils'
import bgMain from '@/pages/Main/assets/bgMain.png'
import { HTMLAttributes, ReactNode } from 'react'
interface IMain extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

export default function Main({ className, children }: IMain) {
  return (
    <main className={cn('flex flex-col', className)}>
      <div
        className="absolute right-0 top-0 h-full w-full bg-cover bg-left mix-blend-difference invert"
        style={{ backgroundImage: `url(${bgMain})` }}
      ></div>
      {children}
    </main>
  )
}
