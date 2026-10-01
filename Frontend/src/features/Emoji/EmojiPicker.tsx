import { FaceSlightlySmilingPlus } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { cn } from '@/app/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/Popover'
import { ScrollArea } from '@/shared/ScrollArea'

import EmojiSelectButton from './EmojiSelectButton'
import { EMOJI_IDS, EMOJI_MAP } from './emojiMap'

interface IEmojiPickerProps {
  selectedEmojiId: string
  onSelect: (emojiId: string) => void
  disabled?: boolean
}

const EmojiPicker = memo(function EmojiPicker({
  selectedEmojiId,
  onSelect,
  disabled = false,
}: IEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const SelectedEmoji = EMOJI_MAP[selectedEmojiId]

  const handleSelect = useCallback(
    (emojiId: string) => {
      setIsOpen(false)
      onSelect(emojiId)
    },
    [onSelect],
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'size-6 rounded-full p-0.5 transition-colors',
          !disabled && !isOpen && 'text-muted hover:text-foreground',
          !disabled && isOpen && 'text-foreground',
        )}
      >
        {SelectedEmoji === undefined ? (
          <FaceSlightlySmilingPlus className="size-full" />
        ) : (
          <SelectedEmoji className="size-full" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <ScrollArea className="h-64 w-full">
          <div className="grid grid-cols-6 pr-2">
            {EMOJI_IDS.map((emojiId) => (
              <EmojiSelectButton
                key={emojiId}
                emojiId={emojiId}
                isSelected={selectedEmojiId === emojiId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
})

export default EmojiPicker
