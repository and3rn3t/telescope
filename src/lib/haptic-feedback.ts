/**
 * Haptic feedback utilities for mobile devices
 */

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'impact'
  | 'notification'

/**
 * Triggers haptic feedback on supported devices
 */
export function triggerHapticFeedback(type: HapticFeedbackType = 'light') {
  // Check if device supports haptic feedback
  if (typeof window === 'undefined' || !('navigator' in window)) {
    return
  }

  // Try Vibration API (Android and some other devices)
  if (navigator.vibrate) {
    const patterns: Record<HapticFeedbackType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 50,
      selection: 5,
      impact: [10, 5, 10],
      notification: [50, 20, 50],
    }

    const pattern = patterns[type]
    if (Array.isArray(pattern)) {
      navigator.vibrate(pattern)
    } else {
      navigator.vibrate(pattern)
    }
  }
}

/**
 * Checks if haptic feedback is supported on the current device
 */
export function isHapticFeedbackSupported(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator
}

/**
 * Enhanced button press feedback - provides tactile response for button interactions
 */
export function buttonPressFeedback() {
  triggerHapticFeedback('light')
}

/**
 * Success action feedback - for completed actions like adding to favorites
 */
export function successFeedback() {
  triggerHapticFeedback('medium')
}

/**
 * Selection feedback - for tabs, filters, and selection changes
 */
export function selectionFeedback() {
  triggerHapticFeedback('selection')
}

/**
 * Impact feedback - for pull-to-refresh and similar interactions
 */
export function impactFeedback() {
  triggerHapticFeedback('impact')
}
