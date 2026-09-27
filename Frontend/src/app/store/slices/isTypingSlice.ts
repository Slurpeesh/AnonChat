import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ITypingSlice {
  value: boolean
}

const initialState: ITypingSlice = {
  value: false,
}

export const isTypingSlice = createSlice({
  name: 'isTyping',
  initialState,
  reducers: {
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload
    },
  },
})

export const { setIsTyping } = isTypingSlice.actions
export default isTypingSlice.reducer
