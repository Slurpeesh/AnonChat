import { RootState } from '@/app/store'
import { IReply } from '@/app/store/slices/types/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IReplySlice {
  value: IReply
}

const initialState: IReplySlice = {
  value: {},
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
export const selectReplySlice = (state: RootState) => state.reply.value
export default replySlice.reducer
