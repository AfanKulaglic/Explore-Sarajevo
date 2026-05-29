'use client'

import { useEffect, useState } from 'react'

const DEVICE_ID_KEY = 'quiz_device_id'

export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    // Try to get existing device ID from localStorage
    let id = localStorage.getItem(DEVICE_ID_KEY)
    
    if (!id) {
      // Generate new UUID
      id = crypto.randomUUID()
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    
    setDeviceId(id)
  }, [])

  return deviceId
}

export function getDeviceIdSync(): string | null {
  if (typeof window === 'undefined') return null
  
  let id = localStorage.getItem(DEVICE_ID_KEY)
  
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  
  return id
}
