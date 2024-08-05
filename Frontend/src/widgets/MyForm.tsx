import { useAppSelector } from '@/app/hooks/useActions'
import { socket } from '@/app/socket'
import { FormEvent, MutableRefObject, useEffect, useState } from 'react'

interface IMyForm {
  scrollableMessages: MutableRefObject<any>
}

export function MyForm({ scrollableMessages }: IMyForm) {
  const [value, setValue] = useState('')
  const messages = useAppSelector((state) => state.messages.value)

  useEffect(() => {
    scrollableMessages.current.scrollTop =
      scrollableMessages.current.scrollHeight
  }, [messages])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setValue('')
    if (value.trim()) {
      socket.emit('createMessage', value)
    }
  }

  return (
    <form className="flex justify-center gap-5 w-full" onSubmit={onSubmit}>
      <input
        className="rounded-lg px-1 w-96 bg-background-section"
        value={value}
        placeholder="Write a message"
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        className="p-2 bg-accent hover:bg-accent-hover rounded-md transition-colors"
        type="submit"
      >
        Submit
      </button>
    </form>
  )
}
