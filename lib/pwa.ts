/**
 * PWA utility functions for managing service worker and app installation
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

/**
 * Check if the app is running as a PWA (installed)
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Check if PWA installation is available
 */
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if already installed
  if (isPWA()) return false
  
  // Check if browser supports installation
  return 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Get PWA installation status
 */
export function getPWADisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (typeof window === 'undefined') return 'browser'
  
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen'
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone'
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui'
  }
  return 'browser'
}

/**
 * Check if the device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Check if the device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android/.test(navigator.userAgent)
}

/**
 * Get the appropriate install instruction for the current platform
 */
export function getInstallInstructions(): {
  platform: 'ios' | 'android' | 'desktop'
  instruction: string
} {
  if (isIOS()) {
    return {
      platform: 'ios',
      instruction: 'Tap the Share button and then "Add to Home Screen"'
    }
  }
  
  if (isAndroid()) {
    return {
      platform: 'android',
      instruction: 'Tap the menu button and select "Add to Home Screen" or "Install App"'
    }
  }
  
  return {
    platform: 'desktop',
    instruction: 'Click the install button in your browser\'s address bar'
  }
}

/**
 * Register service worker manually (if needed)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registered successfully:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const result = await registration.unregister()
      console.log('Service Worker unregistered:', result)
      return result
    }
    return false
  } catch (error) {
    console.error('Service Worker unregistration failed:', error)
    return false
  }
}

/**
 * Check if there's a service worker update available
 */
export function checkForSWUpdate(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      resolve(false)
      return
    }
    
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) {
        resolve(false)
        return
      }
      
      registration.addEventListener('updatefound', () => {
        resolve(true)
      })
      
      // Check for updates
      registration.update()
      
      // Resolve false after a timeout if no update is found
      setTimeout(() => resolve(false), 3000)
    })
  })
}

/**
 * Show a notification (if permission granted)
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      ...options
    })
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/favicon.svg',
        ...options
      })
    }
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  
  return await Notification.requestPermission()
}

/**
 * Clear all caches (useful for debugging)
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return
  }
  
  try {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    console.log('All caches cleared')
  } catch (error) {
    console.error('Failed to clear caches:', error)
  }
}