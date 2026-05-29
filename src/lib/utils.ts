import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export const CARE_LEVELS: Record<string, string> = {
  easy: '🟢 Easy',
  moderate: '🟡 Moderate',
  expert: '🔴 Expert',
}

export const SUNLIGHT: Record<string, string> = {
  full: '☀️ Full Sun',
  partial: '⛅ Partial',
  shade: '🌥️ Shade',
}

export const WATER: Record<string, string> = {
  low: '💧 Low',
  moderate: '💧💧 Moderate',
  high: '💧💧💧 High',
}
