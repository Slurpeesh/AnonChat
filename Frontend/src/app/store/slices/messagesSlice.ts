import { RootState } from '@/app/store'
import { IReply } from '@/app/store/slices/types/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IStateController {
  id: number
  state: boolean
}

interface IMessage {
  value: string
  me: boolean
  alerted: boolean
  copied: boolean
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
    addMessage: (state, action: PayloadAction<IMessage>) => {
      state.value.push(action.payload)
    },
    deleteMessages: (state) => {
      state.value = []
    },
    setAllAlerted: (state) => {
      state.value.forEach((message) => {
        message.alerted = true
      })
    },
    setAlerted: (state, action: PayloadAction<IStateController>) => {
      state.value[action.payload.id].alerted = action.payload.state
    },
    setCopied: (state, action: PayloadAction<IStateController>) => {
      state.value[action.payload.id].copied = action.payload.state
    },
  },
})

export const {
  addMessage,
  deleteMessages,
  setAllAlerted,
  setAlerted,
  setCopied,
} = messagesSlice.actions
export const selectMessages = (state: RootState) => state.messages.value
export default messagesSlice.reducer
