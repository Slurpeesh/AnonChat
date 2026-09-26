import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const APP_TITLE = 'AnonChat'
export const MESSAGE_HIGHLIGHT_DURATION = 3000 // 3 seconds
export const MESSAGE_UNREAD_DURATION = 1000 // 1 second

export const MESSAGE_AUTHOR_ME = 'Me'
export const MESSAGE_AUTHOR_OTHER = 'Stranger'
export const MESSAGE_AUTHOR_DIVIDER = ':\u00A0'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
