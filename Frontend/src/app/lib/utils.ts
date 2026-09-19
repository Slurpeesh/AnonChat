import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const APP_TITLE = 'AnonChat'
export const MESSAGE_ALERT_DURATION = 3000 // 3 seconds

export const MESSAGE_AUTHOR_ME = 'Me'
export const MESSAGE_AUTHOR_OTHER = 'Stranger'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
