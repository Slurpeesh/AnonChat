import { RootState } from '@/app/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IScrollAtBottomSlice {
  value: boolean
}

const initialState: IScrollAtBottomSlice = {
  value: true,
}

export const isScrollAtBottomSlice = createSlice({
  name: 'isScrollAtBottom',
  initialState,
  reducers: {
    setIsScrollAtBottom: (state, payload: PayloadAction<boolean>) => {
      state.value = payload.payload
    },
  },
})

export const { setIsScrollAtBottom } = isScrollAtBottomSlice.actions
export const selectIsScrollAtBottom = (state: RootState) =>
  state.isScrollAtBottom.value
export default isScrollAtBottomSlice.reducer
