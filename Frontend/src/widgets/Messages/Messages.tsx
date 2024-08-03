import { useAppSelector } from '@/app/hooks/useActions'
import { cn } from '@/app/lib/utils'
import { ScrollArea } from '@/shared/ScrollArea/ScrollArea'
import { forwardRef, LegacyRef } from 'react'

const Messages = forwardRef(function Messages(
  props,
  ref: LegacyRef<HTMLDivElement>
) {
  const messages = useAppSelector((state) => state.messages.value)

  return (
    <ScrollArea ref={ref} className="w-2/3 h-[28rem] rounded-md border p-4">
      <ul className="">
        {messages.map((message, index) => (
          <li
            className={cn('p-2 my-2 rounded-lg bg-white w-2/3 break-words', {
              'ml-auto': message.me,
            })}
            key={index}
          >
            <span className="font-semibold">
              {message.me ? 'Me: ' : 'Stranger: '}
            </span>
            {message.value}
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
})

export default Messages
