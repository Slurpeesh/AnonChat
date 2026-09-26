import { IMessage, IMessageGroup } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IStateController } from './types/types'

export interface IMessageGroupsSlice {
  value: Array<IMessageGroup>
}

const initialState: IMessageGroupsSlice = {
  value: [],
}

function findMessageById(
  messageGroups: IMessageGroup[],
  id: string,
): IMessage | null {
  for (const messageGroup of messageGroups) {
    const message = messageGroup.messages.find((msg) => msg.id === id)
    if (message) return message
  }
  return null
}

export const messageGroupsSlice = createSlice({
  name: 'messageGroups',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<IMessage>) => {
      const message = action.payload
      const messageGroupsValue = state.value
      const lastGroup = messageGroupsValue[messageGroupsValue.length - 1]

      if (lastGroup && lastGroup.isMine === message.isMine) {
        lastGroup.messages.push(message)
      } else {
        messageGroupsValue.push({
          id: message.id,
          isMine: message.isMine,
          messages: [message],
        })
      }
    },
    deleteAllMessages: (state) => {
      state.value = []
    },
    setIsHighlighted: (state, action: PayloadAction<IStateController>) => {
      const message = findMessageById(state.value, action.payload.id)

      if (message === null) {
        throw new Error(`Message with id ${action.payload.id} not found`)
      }

      message.isHighlighted = action.payload.state
    },
    setIsRead: (state, action: PayloadAction<IStateController>) => {
      const message = findMessageById(state.value, action.payload.id)

      if (message === null) {
        throw new Error(`Message with id ${action.payload.id} not found`)
      }

      message.isRead = action.payload.state
    },
    markAsRead: (state, action: PayloadAction<string[]>) => {
      const ids = new Set(action.payload)
      for (const group of state.value) {
        for (const message of group.messages) {
          if (ids.has(message.id)) {
            message.isRead = true
          }
        }
      }
    },
    setIsCopied: (state, action: PayloadAction<IStateController>) => {
      const message = findMessageById(state.value, action.payload.id)

      if (message === null) {
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
} = messageGroupsSlice.actions
export default messageGroupsSlice.reducer
