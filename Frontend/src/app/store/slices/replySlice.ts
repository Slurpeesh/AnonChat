import { IReply } from '@/sharedTypes'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IReplySlice {
  value: IReply
}

const initialState: IReplySlice = {
  value: null,
}

export const replySlice = createSlice({
  name: 'reply',
  initialState,
  reducers: {
    setReply: (state, action: PayloadAction<IReply>) => {
      state.value = action.payload
    },
  },
})

export const { setReply } = replySlice.actions
export default replySlice.reducer
