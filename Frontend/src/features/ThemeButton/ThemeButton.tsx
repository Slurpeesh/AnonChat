import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
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
    switch (theme) {
      case 'dark':
        dispatch(setLight())
        return
      default:
        dispatch(setDark())
    }
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
