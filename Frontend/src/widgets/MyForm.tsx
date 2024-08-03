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

    socket.emit('createMessage', value)
  }

  return (
    <form className="flex justify-center gap-5 w-full" onSubmit={onSubmit}>
      <input
        className="rounded-lg px-1 w-96"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        className="p-2 bg-green-200 hover:bg-green-300 rounded-md"
        type="submit"
      >
        Submit
      </button>
    </form>
  )
}
