import { socket } from '@/app/socket'

export function ConnectionManager() {
  function connect() {
    socket.connect()
  }

  function disconnect() {
    socket.disconnect()
  }

  return (
    <div>
      <button className="p-2 bg-green-600 rounded-md" onClick={connect}>
        Connect
      </button>
      <button className="p-2 bg-red-600 rounded-md" onClick={disconnect}>
        Disconnect
      </button>
    </div>
  )
}
