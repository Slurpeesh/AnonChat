import { socket } from '@/app/socket'
import Footer from '@/pages/Footer/Footer'
import Header from '@/pages/Header/Header'
import Main from '@/pages/Main/Main'
import Messages from '@/widgets/Messages/Messages'
import { MyForm } from '@/widgets/MyForm'
import { useEffect, useRef } from 'react'
import { useAppDispatch } from './hooks/useActions'
import { setConnected } from './store/slices/isConnectedSlice'
import { setWaiting } from './store/slices/isWaitingSlice'
import { addMessage, deleteMessages } from './store/slices/messagesSlice'

export default function App() {
  const dispatch = useAppDispatch()
  const scrollableMessages = useRef(null)

  useEffect(() => {
    function onConnect() {
      dispatch(setConnected(true))
      dispatch(deleteMessages())
      dispatch(setWaiting(true))
    }

    function onDisconnect() {
      dispatch(setWaiting(false))
      dispatch(setConnected(false))
      socket.connect()
    }

    function onWaitingStatus() {
      dispatch(setWaiting(true))
    }

    function onReadyStatus() {
      dispatch(setWaiting(false))
    }

    function onMessage(value: string, id: string) {
      if (socket.id === id) {
        dispatch(addMessage({ value, me: true }))
      } else {
        dispatch(addMessage({ value, me: false }))
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('waitingStatus', onWaitingStatus)
    socket.on('readyStatus', onReadyStatus)
    socket.on('message', onMessage)

    socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('waitingStatus', onWaitingStatus)
      socket.off('readyStatus', onReadyStatus)
      socket.off('message', onMessage)
    }
  }, [])

  return (
    <div className="bg-slate-400 h-dvh w-dvw flex flex-col">
      <Header />
      <Main className="bg-slate-200 flex-grow justify-between items-center p-5">
        <Messages ref={scrollableMessages} />
        <MyForm scrollableMessages={scrollableMessages} />
      </Main>
      <Footer />
    </div>
  )
}
