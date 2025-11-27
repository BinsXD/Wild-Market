"use client"

import { useNavigationEvent } from "@/hooks/useNavigationEvent"

export default function LoadingScreen() {
  const isNavigating = useNavigationEvent()

  if (!isNavigating) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/Lion_rawr-removebg-preview%20bg%20removed.png"
          alt="Lion Rawr"
          className="w-40 h-40 object-contain drop-shadow-lg animate-bounce"
        />
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-6 w-6 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="text-sm text-foreground">Loading...</span>
        </div>
      </div>
    </div>
  )
}
