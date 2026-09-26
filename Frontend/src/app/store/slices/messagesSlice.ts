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
    setIsHighlighted: (state, action: PayloadAction<IStateController>) => {
      const message = state.value.find((msg) => msg.id === action.payload.id)

      if (message === undefined) {
        throw new Error(`Message with id ${action.payload.id} not found`)
      }

      message.isHighlighted = action.payload.state
    },
    setIsRead: (state, action: PayloadAction<IStateController>) => {
      const message = state.value.find((msg) => msg.id === action.payload.id)
      if (!message) throw new Error(`Message ${action.payload.id} not found`)
      message.isRead = action.payload.state
    },
    markAsRead: (state, action: PayloadAction<string[]>) => {
      const ids = new Set(action.payload)
      state.value.forEach((message) => {
        if (ids.has(message.id)) {
          message.isRead = true
        }
      })
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
  setIsHighlighted,
  setIsRead,
  markAsRead,
  setIsCopied,
} = messagesSlice.actions
export default messagesSlice.reducer
