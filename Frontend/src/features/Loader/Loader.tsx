import { ConnectionManager } from '@/widgets/ConnectionManager'
import { ConnectionState } from '@/widgets/ConnectonState'

interface ILoader {
  text: string
}

export default function Loader({ text }: ILoader) {
  return (
    <div className="absolute z-50 top-0 left-0 h-full w-full bg-black bg-opacity-85 flex flex-col gap-3 justify-center items-center">
      <div className="w-40 h-40 border-x-4 border-green-600 rounded-full animate-spin"></div>
      <p className="text-white">{text}</p>
      {process.env.NODE_ENV === 'development' && (
        <>
          <ConnectionState />
          <ConnectionManager />
        </>
      )}
    </div>
  )
}
