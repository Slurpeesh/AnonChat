import { useAppSelector } from '@/app/hooks/useActions'
import { cn } from '@/app/lib/utils'

export function Messages() {
  const messages = useAppSelector((state) => state.messages.value)
  return (
    <ul className="w-2/3 h-[28rem] overflow-auto">
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
  )
}
