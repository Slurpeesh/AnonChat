import isConnectedReducer from '@/app/store/slices/isConnectedSlice'
import isWaitingReducer from '@/app/store/slices/isWaitingSlice'
import messagesReducer from '@/app/store/slices/messagesSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    isConnected: isConnectedReducer,
    messages: messagesReducer,
    isWaiting: isWaitingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
