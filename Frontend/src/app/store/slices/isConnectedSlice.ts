import { socket } from '@/app/socket'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IConnectedSlice {
  value: boolean
}

const initialState: IConnectedSlice = {
  value: socket.connected,
}

export const isConnectedSlice = createSlice({
  name: 'isConnected',
  initialState,
  reducers: {
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload
    },
  },
})

export const { setIsConnected } = isConnectedSlice.actions
export default isConnectedSlice.reducer
