import { RootState } from '@/app/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IMessage {
  value: string
  me: boolean
}

export interface IMessagesSlice {
  value: Array<IMessage>
}

const initialState: IMessagesSlice = {
  value: [],
}

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, payload: PayloadAction<IMessage>) => {
      state.value.push(payload.payload)
    },
    deleteMessages: (state) => {
      state.value = []
    },
  },
})

export const { addMessage, deleteMessages } = messagesSlice.actions
export const selectMessages = (state: RootState) => state.messages.value
export default messagesSlice.reducer
