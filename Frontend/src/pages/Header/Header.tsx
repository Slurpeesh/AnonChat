import { ConnectionManager } from '@/widgets/ConnectionManager'
import { ConnectionState } from '@/widgets/ConnectonState'
import AnonChatSvg from './svg/AnonChatSvg'

export default function Header() {
  return (
    <header className="h-20 bg-green-200 flex justify-between items-center px-5 py-3">
      <a
        href=""
        className="h-full flex justify-start items-center fill-green-500 hover:fill-green-600 text-green-500 hover:text-green-600"
      >
        <AnonChatSvg />
        <h1 className="font-extrabold text-3xl">AnonChat</h1>
      </a>
      <div className="flex items-center gap-3">
        <ConnectionState />
        <ConnectionManager />
      </div>
    </header>
  )
}
