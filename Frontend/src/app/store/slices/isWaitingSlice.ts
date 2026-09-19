import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IWaitingSlice {
  value: boolean
}

const initialState: IWaitingSlice = {
  value: false,
}

export const isWaitingSlice = createSlice({
  name: 'isWaiting',
  initialState,
  reducers: {
    setIsWaiting: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload
    },
  },
})

export const { setIsWaiting } = isWaitingSlice.actions
export default isWaitingSlice.reducer
