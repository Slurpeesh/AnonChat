import { useAppSelector } from '@/app/hooks/useActions'
import { cn } from '@/app/lib/utils'

export function ConnectionState() {
  const isConnected = useAppSelector((state) => state.isConnected.value)
  const isWaiting = useAppSelector((state) => state.isWaiting.value)
  return (
    <div>
      <p
        className={cn({
          'bg-red-300': !isConnected,
          'bg-green-400': isConnected,
        })}
      >
        Connected: {'' + isConnected}
      </p>
      <p
        className={cn({
          'bg-yellow-300': isWaiting,
          'bg-slate-300': !isWaiting,
        })}
      >
        Waiting: {'' + isWaiting}
      </p>
    </div>
  )
}
