import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IMessage, IStateController } from './types/types'

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
    deleteAllMessages: (state) => {
      state.value = []
    },
    setAllAlerted: (state, action: PayloadAction<boolean>) => {
      state.value.forEach((message) => {
        message.isAlerted = action.payload
      })
    },
    setIsAlerted: (state, action: PayloadAction<IStateController>) => {
      const message = state.value.find((msg) => msg.id === action.payload.id)

      if (message === undefined) {
        throw new Error(`Message with id ${action.payload.id} not found`)
      }

      message.isAlerted = action.payload.state
    },
    setIsCopied: (state, action: PayloadAction<IStateController>) => {
      const message = state.value.find((msg) => msg.id === action.payload.id)

      if (message === undefined) {
        throw new Error(`Message with id ${action.payload.id} not found`)
      }

      message.isCopied = action.payload.state
    },
  },
})

export const {
  addMessage,
  deleteAllMessages,
  setAllAlerted,
  setIsAlerted,
  setIsCopied,
} = messagesSlice.actions
export default messagesSlice.reducer
