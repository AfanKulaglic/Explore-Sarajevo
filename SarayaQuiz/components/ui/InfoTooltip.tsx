'use client'

import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        className="ml-1 p-0.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        aria-label="More information"
      >
        <Info className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop for mobile - tap anywhere to close */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip - Fixed styling for visibility */}
          <div 
            ref={tooltipRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-lg shadow-2xl"
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: '#f9fafb' }}>
              {text}
            </p>
            {/* Arrow */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #1f2937',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
