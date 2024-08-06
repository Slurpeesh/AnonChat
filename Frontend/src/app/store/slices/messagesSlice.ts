import { RootState } from '@/app/store'
import { IReply } from '@/app/store/slices/types/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IMessage {
  value: string
  me: boolean
  alerted: boolean
  reply?: IReply
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
    setAlerted: (state) => {
      state.value.forEach((message) => {
        message.alerted = true
      })
    },
  },
})

export const { addMessage, deleteMessages, setAlerted } = messagesSlice.actions
export const selectMessages = (state: RootState) => state.messages.value
export default messagesSlice.reducer
