import isConnectedReducer from '@/app/store/slices/isConnectedSlice'
import isWaitingReducer from '@/app/store/slices/isWaitingSlice'
import messagesReducer from '@/app/store/slices/messagesSlice'
import themeReducer from '@/app/store/slices/themeSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    isConnected: isConnectedReducer,
    messages: messagesReducer,
    isWaiting: isWaitingReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
