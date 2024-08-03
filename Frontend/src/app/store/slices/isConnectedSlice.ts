import { socket } from '@/app/socket'
import { RootState } from '@/app/store'
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
    setConnected: (state, payload: PayloadAction<boolean>) => {
      state.value = payload.payload
    },
  },
})

export const { setConnected } = isConnectedSlice.actions
export const selectIsConnected = (state: RootState) => state.isConnected.value
export default isConnectedSlice.reducer
