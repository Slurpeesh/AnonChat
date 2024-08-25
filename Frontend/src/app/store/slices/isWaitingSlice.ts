import { RootState } from '@/app/store'
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
    setWaiting: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload
    },
  },
})

export const { setWaiting } = isWaitingSlice.actions
export const selectIsWaiting = (state: RootState) => state.isWaiting.value
export default isWaitingSlice.reducer
