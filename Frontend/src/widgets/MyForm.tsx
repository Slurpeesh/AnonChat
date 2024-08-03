import { socket } from '@/app/socket'
import { FormEvent, useState } from 'react'

export function MyForm() {
  const [value, setValue] = useState('')

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
