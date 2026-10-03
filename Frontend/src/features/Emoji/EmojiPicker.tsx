import { FaceSlightlySmilingPlus } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { cn } from '@/app/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/Popover'
import { ScrollArea } from '@/shared/ScrollArea'

import { useRecentEmojis } from '@/features/Emoji/hooks/useRecentEmojis'
import { motion } from 'motion/react'
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
  const { recent, addRecent } = useRecentEmojis()
  const SelectedEmoji = EMOJI_MAP[selectedEmojiId]

  const handleSelect = useCallback(
    (emojiId: string) => {
      addRecent(emojiId)
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
          >
            <SelectedEmoji className="size-full" />
          </motion.div>
        )}
      </PopoverTrigger>
      <PopoverContent className="h-64 w-auto">
        {recent.length > 0 && (
          <>
            <p className="pr-2 text-sm text-muted">Recent</p>
            <div className="grid grid-cols-6 pr-2">
              {recent.map((emojiId) => (
                <EmojiSelectButton
                  key={emojiId}
                  emojiId={emojiId}
                  isSelected={selectedEmojiId === emojiId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
            <div className="mx-2 my-1 border-t border-muted/30" />
          </>
        )}
        <ScrollArea className="size-full">
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
