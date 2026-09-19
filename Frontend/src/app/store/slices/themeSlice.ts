import { createSlice } from '@reduxjs/toolkit'

const initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light'

const html = document.documentElement
html.classList.remove('light', 'dark')
html.classList.add(initialTheme)

export interface IThemeState {
  value: 'light' | 'dark'
}

const initialState: IThemeState = {
  value: initialTheme,
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      html.classList.remove('light', 'dark')
      html.classList.add(action.payload)
      state.value = action.payload
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
