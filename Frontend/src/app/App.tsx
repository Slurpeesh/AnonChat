import { IReply } from '@/app/sharedTypes'
import { socket } from '@/app/socket'
import Loader from '@/features/Loader/Loader'
import Footer from '@/pages/Footer/Footer'
import Header from '@/pages/Header/Header'
import Main from '@/pages/Main/Main'
import MessageForm from '@/widgets/Form/MessageForm'
import Messages from '@/widgets/Messages/Messages'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './hooks/useActions'
import { APP_TITLE } from './lib/utils'
import { setIsConnected } from './store/slices/isConnectedSlice'
import { setIsWaiting } from './store/slices/isWaitingSlice'
import {
  addMessage,
  deleteAllMessages,
  setAllAlerted,
} from './store/slices/messagesSlice'

export default function App() {
  const isConnected = useAppSelector((state) => state.isConnected.value)
  const isWaiting = useAppSelector((state) => state.isWaiting.value)
  const dispatch = useAppDispatch()

  useEffect(() => {
    function onConnect() {
      dispatch(setIsConnected(true))
      dispatch(setIsWaiting(true))
    }

    function onDisconnect() {
      dispatch(setIsWaiting(false))
      dispatch(setIsConnected(false))
    }

    function onWaitingStatus() {
      dispatch(deleteAllMessages())
      dispatch(setIsWaiting(true))
    }

    function onReadyStatus() {
      dispatch(deleteAllMessages())
      dispatch(setIsWaiting(false))
    }

    let titleChanger: ReturnType<typeof setInterval> | null = null

    function onMessage(
      messageId: string,
      value: string,
      socketId: string,
      reply: IReply,
    ) {
      const isMe = socket.id === socketId

      if (!isMe && reply !== null) {
        reply.isRepliedMessageMine = !reply.isRepliedMessageMine
      }

      dispatch(
        addMessage({
          id: messageId,
          value,
          isMine: isMe,
          isAlerted: document.hidden,
          reply,
          isCopied: false,
        }),
      )

      if (document.hidden && titleChanger === null) {
        titleChanger = setInterval(() => {
          document.title =
            document.title === APP_TITLE ? 'New messages' : APP_TITLE
        }, 1000)
      }
    }

    function onTabVisibility() {
      if (!document.hidden) {
        if (titleChanger !== null) {
          clearInterval(titleChanger)
          titleChanger = null
        }
        dispatch(setAllAlerted(false))
        document.title = APP_TITLE
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

      if (titleChanger !== null) {
        clearInterval(titleChanger)
        titleChanger = null
      }
    }
  }, [])

  return (
    <div className="text-foreground h-dvh w-dvw flex flex-col overflow-hidden">
      <Header />
      <Main className="relative bg-background flex flex-col flex-grow justify-between items-center p-5">
        <Messages className="z-10 relative basis-4/5" />
        <MessageForm className="z-10 relative basis-1/5" />
      </Main>
      <Footer />
      {!isConnected && <Loader text="Connecting..." />}
      {isWaiting && <Loader text="Waiting for chat buddy..." />}
    </div>
  )
}
