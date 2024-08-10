import { HTMLMotionProps, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface IBackToBottomButton extends HTMLMotionProps<'button'> {
  [key: string]: any
}

export default function BackToBottomButton({ ...rest }: IBackToBottomButton) {
  return (
    <motion.button
      className="absolute bg-accent opacity-20 hover:opacity-90 transition-opacity z-50 top-2 right-3 p-2 rounded-full"
      {...rest}
    >
      <ArrowDown className="stroke-foreground" />
    </motion.button>
  )
}
