import { socket } from '@/app/socket'
import Loader from '@/features/Loader/Loader'
import Footer from '@/pages/Footer/Footer'
import Header from '@/pages/Header/Header'
import Main from '@/pages/Main/Main'
import Messages from '@/widgets/Messages/Messages'
import { MyForm } from '@/widgets/MyForm'
import aud from '@public/sounds/alert.mp3'
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './hooks/useActions'
import { setConnected } from './store/slices/isConnectedSlice'
import { setWaiting } from './store/slices/isWaitingSlice'
import {
  addMessage,
  deleteMessages,
  setAlerted,
} from './store/slices/messagesSlice'

export default function App() {
  const isConnected = useAppSelector((state) => state.isConnected.value)
  const isWaiting = useAppSelector((state) => state.isWaiting.value)
  const dispatch = useAppDispatch()
  const scrollableMessages = useRef(null)
  const alertSound = new Audio(aud)

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

    let changer: NodeJS.Timeout = null

    function onMessage(value: string, id: string) {
      if (socket.id === id) {
        dispatch(addMessage({ value, me: true, alerted: !document.hidden }))
      } else {
        dispatch(addMessage({ value, me: false, alerted: !document.hidden }))
      }

      if (document.hidden && changer === null) {
        changer = setInterval(() => {
          if (document.title === 'AnonChat') {
            document.title = 'New messages'
          } else {
            document.title = 'AnonChat'
          }
        }, 1000)
      }
      if (document.hidden) {
        alertSound.pause()
        alertSound.currentTime = 0
        alertSound.play().catch((reason) => {
          console.error(reason)
        })
      }
    }

    function onTabVisibility() {
      if (!document.hidden) {
        clearInterval(changer)
        changer = null
        dispatch(setAlerted())
        document.title = 'AnonChat'
      }
    }

    document.addEventListener('visibilitychange', onTabVisibility)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('waitingStatus', onWaitingStatus)
    socket.on('readyStatus', onReadyStatus)
    socket.on('message', onMessage)

    socket.connect()

    return () => {
      document.removeEventListener('visibilitychange', onTabVisibility)
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
      {!isConnected && <Loader text="Connecting..." />}
      {isWaiting && <Loader text="Waiting for chat buddy..." />}
    </div>
  )
}
