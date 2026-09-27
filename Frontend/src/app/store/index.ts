import isConnectedReducer from '@/app/store/slices/isConnectedSlice'
import isTypingReducer from '@/app/store/slices/isTypingSlice'
import isWaitingReducer from '@/app/store/slices/isWaitingSlice'
import messageGroupsReducer from '@/app/store/slices/messageGroupsSlice'
import replyReducer from '@/app/store/slices/replySlice'
import themeReducer from '@/app/store/slices/themeSlice'
import { IMessage } from '@/types'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    isConnected: isConnectedReducer,
    messageGroups: messageGroupsReducer,
    isWaiting: isWaitingReducer,
    theme: themeReducer,
    reply: replyReducer,
    isTyping: isTypingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const selectLastMessage = (state: RootState): IMessage | null => {
  const groups = state.messageGroups.value
  const lastGroup = groups[groups.length - 1]

  if (!lastGroup) return null

  const lastMessage = lastGroup.messages[lastGroup.messages.length - 1]

  if (!lastMessage) return null

  return lastMessage
}
