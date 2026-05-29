'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Monitor, User, UserX, Mail, Calendar, AlertTriangle } from 'lucide-react'

interface SignedInAccount {
  id: string
  name: string
  email: string
  attempts: number
  saved: number
}

interface SignedOutSubmission {
  name: string
  email: string
  attempts: number
  saved: number
}

interface DeviceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  device: {
    hash: string
    browser?: string
    platform?: string
    os?: string
    attempts: number
    saved: number
    best: number
    lastSeen: string
    firstSeen: string
    signedInAccounts: SignedInAccount[]
    signedOutSubmissions: SignedOutSubmission[]
  } | null
}

export function DeviceDetailsModal({ isOpen, onClose, device }: DeviceDetailsModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!device) return null

  const hasMultiAccounts = device.signedInAccounts.length > 1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden my-auto">
              {/* Header */}
              <div className={`px-6 py-4 border-b ${hasMultiAccounts ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasMultiAccounts ? 'bg-amber-100' : 'bg-purple-100'}`}>
                      <Monitor className={`w-5 h-5 ${hasMultiAccounts ? 'text-amber-600' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Device Details</h2>
                      <p className="text-sm font-mono text-gray-500">{device.hash}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {hasMultiAccounts && (
                  <div className="mt-3 flex items-center gap-2 text-amber-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Multiple accounts detected on this device</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 pb-8 overflow-y-auto max-h-[calc(85vh-80px)]">
                {/* Device Info */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Device Information</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Browser</div>
                      <div className="font-medium text-gray-900">{device.browser || '-'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Platform</div>
                      <div className="font-medium text-gray-900">{device.platform || '-'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">OS</div>
                      <div className="font-medium text-gray-900">{device.os || '-'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Best Score</div>
                      <div className="font-medium text-orange-600">{device.best}</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Activity</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{device.attempts}</div>
                      <div className="text-xs text-blue-700">Attempts</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{device.saved}</div>
                      <div className="text-xs text-green-700">Saved</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Last Seen
                      </div>
                      <div className="font-medium text-gray-900 text-sm">{device.lastSeen}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> First Seen
                      </div>
                      <div className="font-medium text-gray-900 text-sm">{device.firstSeen}</div>
                    </div>
                  </div>
                </div>

                {/* Signed In Accounts */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Signed In Accounts ({device.signedInAccounts.length})
                  </h3>
                  {device.signedInAccounts.length === 0 ? (
                    <p className="text-gray-400 text-sm">No signed-in accounts used on this device</p>
                  ) : (
                    <div className="space-y-2">
                      {device.signedInAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={`p-3 rounded-lg border ${
                            hasMultiAccounts ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{account.name}</div>
                              <div className="text-sm text-gray-600">{account.email || 'No email'}</div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-blue-600">{account.attempts} attempt{account.attempts !== 1 ? 's' : ''}</div>
                              <div className="text-green-600">{account.saved} saved</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Signed Out Submissions */}
                <div className="pb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <UserX className="w-4 h-4" />
                    Signed Out Submissions ({device.signedOutSubmissions.length})
                  </h3>
                  {device.signedOutSubmissions.length === 0 ? (
                    <p className="text-gray-400 text-sm">No signed-out submissions from this device</p>
                  ) : (
                    <div className="space-y-2">
                      {device.signedOutSubmissions.map((submission, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border bg-gray-50 border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{submission.name || 'Anonymous'}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {submission.email || 'No email'}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-blue-600">{submission.attempts} attempt{submission.attempts !== 1 ? 's' : ''}</div>
                              <div className="text-green-600">{submission.saved} saved</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Client component wrapper for expandable account list
interface ExpandableAccountsProps {
  signedInAccounts: SignedInAccount[]
  signedOutSubmissions: SignedOutSubmission[]
  device_hash: string
  browser?: string
  platform?: string
  os?: string
  attempts: number
  saved: number
  best: number
  lastSeen: string
  firstSeen: string
  hasWarning: boolean
}

export function ExpandableAccounts({
  signedInAccounts,
  signedOutSubmissions,
  device_hash,
  browser,
  platform,
  os,
  attempts,
  saved,
  best,
  lastSeen,
  firstSeen,
  hasWarning,
}: ExpandableAccountsProps) {
  const [showModal, setShowModal] = useState(false)
  const hasMultiAccounts = signedInAccounts.length > 1
  const totalItems = signedInAccounts.length + signedOutSubmissions.length

  // Show first 2 items (accounts first, then signed-out)
  const displayItems: { type: 'account' | 'signedOut'; name: string; email: string }[] = []
  signedInAccounts.forEach(acc => displayItems.push({ type: 'account', name: acc.name, email: acc.email }))
  signedOutSubmissions.forEach(sub => displayItems.push({ type: 'signedOut', name: sub.name, email: sub.email }))

  return (
    <>
      <div className="space-y-0.5">
        {hasMultiAccounts && (
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
            <AlertTriangle className="w-3 h-3" />
            {signedInAccounts.length} accounts
          </span>
        )}
        {displayItems.slice(0, 2).map((item, idx) => (
          <div key={idx} className="text-gray-600 truncate flex items-center gap-1" title={`${item.name} - ${item.email}`}>
            {item.type === 'signedOut' && <UserX className="w-3 h-3 text-gray-400 flex-shrink-0" />}
            {item.name || item.email || 'Unknown'}
          </div>
        ))}
        {totalItems > 2 && (
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            +{totalItems - 2} more
          </button>
        )}
        {totalItems <= 2 && totalItems > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="text-gray-400 hover:text-blue-600 text-xs hover:underline"
          >
            View details
          </button>
        )}
        {totalItems === 0 && (
          <span className="text-gray-400">-</span>
        )}
      </div>

      <DeviceDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        device={{
          hash: device_hash,
          browser,
          platform,
          os,
          attempts,
          saved,
          best,
          lastSeen,
          firstSeen,
          signedInAccounts,
          signedOutSubmissions,
        }}
      />
    </>
  )
}

// Dismissable warning component with localStorage persistence
interface DismissableWarningProps {
  count: number
  storageKey: string
  device_hashes?: string[] // Current devices that triggered warning
}

export function DismissableWarning({ count, storageKey, device_hashes = [] }: DismissableWarningProps) {
  const [dismissed, setDismissed] = useState(false)
  const [previouslyDismissed, setPreviouslyDismissed] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load previously dismissed device hashes from localStorage
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreviouslyDismissed(parsed.dismissedDevices || [])
      } catch {
        // Invalid stored data, ignore
      }
    }
  }, [storageKey])

  // Check if there are new devices that weren't previously dismissed
  const newDevices = device_hashes.filter(h => !previouslyDismissed.includes(h))
  const hasNewDevices = newDevices.length > 0

  const handleDismiss = () => {
    // Store current device hashes as dismissed
    const newDismissed = [...new Set([...previouslyDismissed, ...device_hashes])]
    localStorage.setItem(storageKey, JSON.stringify({
      dismissedDevices: newDismissed,
      lastDismissed: new Date().toISOString()
    }))
    setPreviouslyDismissed(newDismissed)
    setDismissed(true)
  }

  // Don't render on server, and don't show if: manually dismissed, no warnings, or all devices were previously dismissed
  if (!mounted || dismissed || count === 0 || !hasNewDevices) return null

  return (
    <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800 text-sm sm:text-base">Multi-Account Detection</h3>
            <p className="text-amber-700 text-xs sm:text-sm mt-1">
              {newDevices.length} new device{newDevices.length !== 1 ? 's' : ''} linked to multiple accounts.
              {previouslyDismissed.length > 0 && (
                <span className="text-amber-600"> ({previouslyDismissed.length} previously reviewed)</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-amber-100 text-amber-600 hover:text-amber-800 transition flex-shrink-0"
          title="Dismiss - will reappear if new devices are detected"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Row dismiss button with localStorage persistence
interface RowDismissButtonProps {
  device_hash: string
  storageKey: string
  onDismiss?: () => void
}

export function RowDismissButton({ device_hash, storageKey, onDismiss }: RowDismissButtonProps) {
  const handleDismiss = () => {
    const stored = localStorage.getItem(storageKey)
    let dismissedDevices: string[] = []
    if (stored) {
      try {
        dismissedDevices = JSON.parse(stored).dismissedDevices || []
      } catch {
        // ignore
      }
    }
    dismissedDevices.push(device_hash)
    localStorage.setItem(storageKey, JSON.stringify({
      dismissedDevices: [...new Set(dismissedDevices)],
      lastDismissed: new Date().toISOString()
    }))
    onDismiss?.()
  }

  return (
    <button
      onClick={handleDismiss}
      className="p-1 rounded hover:bg-amber-200 text-amber-600 hover:text-amber-800 transition"
      title="Mark as reviewed"
    >
      <X className="w-3 h-3" />
    </button>
  )
}
