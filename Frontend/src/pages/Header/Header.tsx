import ThemeButton from '@/features/ThemeButton/ThemeButton'
import { ConnectionManager } from '@/widgets/ConnectionManager'
import { ConnectionState } from '@/widgets/ConnectonState'
import { motion } from 'framer-motion'
import AnonChatSvg from './svg/AnonChatSvg'

export default function Header() {
  return (
    <header className="h-14 md:h-20 bg-accent-mild flex justify-between items-center px-5 py-3">
      <motion.a
        animate={{ x: [-300, 0], opacity: [0, 1] }}
        transition={{ duration: 1 }}
        href=""
        className="h-full flex justify-start items-center fill-accent hover:fill-accent-hover transition-colors text-accent hover:text-accent-hover"
      >
        <AnonChatSvg />
        <h1 className="font-extrabold text-xl md:text-3xl">AnonChat</h1>
      </motion.a>
      <div className="flex items-center gap-3">
        {process.env.NODE_ENV === 'development' && (
          <>
            <ConnectionState />
            <ConnectionManager />
          </>
        )}

        <ThemeButton
          animate={{ x: [100, -10, 0], rotate: [360, -36, 0] }}
          transition={{ duration: 1 }}
        />
      </div>
    </header>
  )
}
