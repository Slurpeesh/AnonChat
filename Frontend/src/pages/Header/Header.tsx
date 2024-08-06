import ThemeButton from '@/features/ThemeButton/ThemeButton'
import { ConnectionManager } from '@/widgets/ConnectionManager'
import { ConnectionState } from '@/widgets/ConnectonState'
import AnonChatSvg from './svg/AnonChatSvg'

export default function Header() {
  return (
    <header className="h-14 md:h-20 bg-accent-mild flex justify-between items-center px-5 py-3">
      <a
        href=""
        className="h-full flex justify-start items-center fill-accent hover:fill-accent-hover transition-colors text-accent hover:text-accent-hover"
      >
        <AnonChatSvg />
        <h1 className="font-extrabold text-xl md:text-3xl">AnonChat</h1>
      </a>
      <div className="flex items-center gap-3">
        {process.env.NODE_ENV === 'development' && (
          <>
            <ConnectionState />
            <ConnectionManager />
          </>
        )}

        <ThemeButton />
      </div>
    </header>
  )
}
