import { RootState } from '@/app/store'
import { createSlice } from '@reduxjs/toolkit'

const initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light'

const html = document.querySelector('html')
html.setAttribute('class', initialTheme)

export interface IThemeState {
  value: string
}

const initialState: IThemeState = {
  value: initialTheme,
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setLight: (state) => {
      html.setAttribute('class', 'light')
      state.value = 'light'
    },
    setDark: (state) => {
      html.setAttribute('class', 'dark')
      state.value = 'dark'
    },
  },
})

export const { setLight, setDark } = themeSlice.actions
export const selectTheme = (state: RootState) => state.theme.value
export default themeSlice.reducer
