import { socket } from '@/app/socket'
import Loader from '@/features/Loader/Loader'
import Footer from '@/pages/Footer/Footer'
import Header from '@/pages/Header/Header'
import Main from '@/pages/Main/Main'
import Form from '@/widgets/Form/Form'
import Messages from '@/widgets/Messages/Messages'
import aud from '@public/sounds/alert.mp3'
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './hooks/useActions'
import { setConnected } from './store/slices/isConnectedSlice'
import { setWaiting } from './store/slices/isWaitingSlice'
import {
  addMessage,
  deleteMessages,
  setAllAlerted,
} from './store/slices/messagesSlice'
import { setReply } from './store/slices/replySlice'
import { IReply } from './store/slices/types/types'

export default function App() {
  const isConnected = useAppSelector((state) => state.isConnected.value)
  const isWaiting = useAppSelector((state) => state.isWaiting.value)
  const isScrollAtBottom = useAppSelector(
    (state) => state.isScrollAtBottom.value
  )
  const dispatch = useAppDispatch()
  const scrollableMessages = useRef(null)
  const inputRef = useRef(null)
  const isScrollAtBottomRef = useRef(isScrollAtBottom)
  const alertSound = new Audio(aud)

  useEffect(() => {
    isScrollAtBottomRef.current = isScrollAtBottom
  }, [isScrollAtBottom])

  useEffect(() => {
    function onConnect() {
      dispatch(setConnected(true))
      dispatch(setWaiting(true))
    }

    function onDisconnect() {
      dispatch(setWaiting(false))
      dispatch(setConnected(false))
    }

    function onWaitingStatus() {
      dispatch(deleteMessages())
      dispatch(setWaiting(true))
    }

    function onReadyStatus() {
      dispatch(deleteMessages())
      dispatch(setWaiting(false))
    }

    let changer: NodeJS.Timeout = null

    function onMessage(value: string, id: string, reply: IReply) {
      if (socket.id === id) {
        dispatch(
          addMessage({
            value,
            me: true,
            alerted: !document.hidden,
            reply,
            copied: false,
          })
        )
        scrollableMessages.current.scrollTop =
          scrollableMessages.current.scrollHeight
      } else {
        if (Object.keys(reply).length !== 0) {
          reply.author = reply.author === 'Me' ? 'Stranger' : 'Me'
        }
        dispatch(
          addMessage({
            value,
            me: false,
            alerted: !document.hidden,
            reply,
            copied: false,
          })
        )
      }
      dispatch(setReply({}))

      if (document.hidden && changer === null) {
        changer = setInterval(() => {
          if (document.title === 'AnonChat') {
            document.title = 'New messages'
          } else {
            document.title = 'AnonChat'
          }
        }, 1000)
      }
      if (document.hidden || !isScrollAtBottomRef.current) {
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
        dispatch(setAllAlerted())
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
    <div className="text-foreground h-dvh w-dvw flex flex-col overflow-hidden">
      <Header />
      <Main className="relative bg-background flex flex-col flex-grow justify-between items-center p-5">
        <Messages
          ref={scrollableMessages}
          className="z-10 relative basis-4/5"
        />
        <Form
          ref={inputRef}
          scrollableMessages={scrollableMessages}
          className="z-10 relative basis-1/5"
        />
      </Main>
      <Footer />
      {!isConnected && <Loader text="Connecting..." />}
      {isWaiting && <Loader text="Waiting for chat buddy..." />}
    </div>
  )
}
