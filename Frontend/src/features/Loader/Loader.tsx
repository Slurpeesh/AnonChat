import { ConnectionManager } from '@/widgets/ConnectionManager'
import { ConnectionState } from '@/widgets/ConnectonState'

interface ILoader {
  text: string
}

export default function Loader({ text }: ILoader) {
  return (
    <div className="absolute z-50 top-0 left-0 h-full w-full bg-black/85 flex flex-col gap-3 justify-center items-center">
      <div className="w-40 h-40 border-x-4 border-accent rounded-full animate-spin"></div>
      <p className="text-white">{text}</p>
      {import.meta.env.DEV && (
        <>
          <ConnectionState />
          <ConnectionManager />
        </>
      )}
    </div>
  )
}
