import { useAppSelector } from '@/app/hooks/useActions'
import { cn } from '@/app/lib/utils'
import { ScrollArea } from '@/shared/ScrollArea/ScrollArea'
import { motion } from 'framer-motion'
import { forwardRef, LegacyRef } from 'react'

const Messages = forwardRef(function Messages(
  props,
  ref: LegacyRef<HTMLDivElement>
) {
  const messages = useAppSelector((state) => state.messages.value)

  return (
    <ScrollArea ref={ref} className="w-2/3 h-[28rem] rounded-md border p-4">
      <ul className="">
        {messages.map((message, index, arr) => {
          const isLastMessage = index === arr.length - 1
          const animation = message.me ? { x: [50, 0] } : { x: [-50, 0] }
          const commonClasses = cn(
            'p-2 my-2 rounded-lg w-2/3 break-words transition-colors delay-300 duration-[4000ms]',
            {
              'ml-auto': message.me,
              'bg-amber-300': !message.alerted,
              'bg-white': message.alerted,
            }
          )

          return (
            <motion.li
              animate={isLastMessage ? animation : {}}
              className={commonClasses}
              key={index}
            >
              <span className="font-semibold">
                {message.me ? 'Me: ' : 'Stranger: '}
              </span>
              {message.value}
            </motion.li>
          )
        })}
      </ul>
    </ScrollArea>
  )
})

export default Messages
