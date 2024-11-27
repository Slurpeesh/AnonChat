import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import {
  addStyleTagRemovingAllTransitions,
  removeStyleTagRemovingAllTransitions,
} from '@/app/lib/styles'
import { setDark, setLight } from '@/app/store/slices/themeSlice'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { forwardRef, LegacyRef } from 'react'

const ThemeButton = forwardRef(function ThemeButton(
  props,
  ref: LegacyRef<HTMLButtonElement>
) {
  const theme = useAppSelector((state) => state.theme.value)
  const dispatch = useAppDispatch()

  function changeThemeHandler() {
    const css = document.createElement('style')
    addStyleTagRemovingAllTransitions(css)

    switch (theme) {
      case 'dark':
        dispatch(setLight())
        break
      default:
        dispatch(setDark())
    }

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
      {theme == 'light' && <Sun className="h-full w-full stroke-accent" />}
      {theme == 'dark' && <Moon className="h-full w-full stroke-accent" />}
    </button>
  )
})

export default motion(ThemeButton)
