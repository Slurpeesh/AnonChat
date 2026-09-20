import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import {
  addStyleTagRemovingAllTransitions,
  removeStyleTagRemovingAllTransitions,
} from '@/app/lib/styles'
import { setTheme } from '@/app/store/slices/themeSlice'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { forwardRef } from 'react'

const ThemeButton = forwardRef<HTMLButtonElement>(
  function ThemeButton(_props, ref) {
    const theme = useAppSelector((state) => state.theme.value)
    const dispatch = useAppDispatch()

    function changeThemeHandler() {
      const css = document.createElement('style')
      addStyleTagRemovingAllTransitions(css)

      dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))

      removeStyleTagRemovingAllTransitions(css)
    }
    return (
      <button
        ref={ref}
        className="w-12 h-12 p-2 rounded-full transition-colors hover:bg-muted/30"
        onClick={() => changeThemeHandler()}
        aria-label={
          theme === 'dark' ? 'Change to light theme' : 'Change to dark theme'
        }
      >
        {theme === 'light' && <Sun className="h-full w-full stroke-accent" />}
        {theme === 'dark' && <Moon className="h-full w-full stroke-accent" />}
      </button>
    )
  },
)

export default motion.create(ThemeButton)
