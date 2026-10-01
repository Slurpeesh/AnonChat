import { memo } from 'react'

import { cn } from '@/app/lib/utils'
import { Button } from '@/shared/Button'

import { EMOJI_MAP } from './emojiMap'

interface IEmojiButtonProps {
  emojiId: string
  isSelected: boolean
  onSelect: (emojiId: string) => void
}

const EmojiSelectButton = memo(function EmojiSelectButton({
  emojiId,
  isSelected,
  onSelect,
}: IEmojiButtonProps) {
  const EmojiComponent = EMOJI_MAP[emojiId]
  if (!EmojiComponent) {
    throw new Error(
      `[emojiMap] Component not found for emojiId: "${emojiId}". Check src/features/Emoji/emojiMap.ts — id must be in EMOJI_MAP.`,
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className={cn('p-1', isSelected && 'bg-foreground/30')}
      onClick={() => onSelect(emojiId)}
    >
      <EmojiComponent className="size-full" />
    </Button>
  )
})

export default EmojiSelectButton
