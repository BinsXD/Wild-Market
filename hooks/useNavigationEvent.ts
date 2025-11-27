"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function useNavigationEvent() {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    let navigationTimeout: NodeJS.Timeout

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest("a")

      if (anchor && anchor.href) {
        const href = anchor.getAttribute("href")
        // Only intercept internal navigation (exclude hash-only links and external links)
        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("//") &&
          !href.startsWith("http")
        ) {
          setIsNavigating(true)

          // Clear any existing timeout
          if (navigationTimeout) clearTimeout(navigationTimeout)

          // Show loading for minimum 2 seconds
          navigationTimeout = setTimeout(() => {
            setIsNavigating(false)
          }, 2000)
        }
      }
    }

    const handleMutation: MutationCallback = (mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.querySelectorAll("a").forEach((anchor) => {
              anchor.addEventListener("click", handleAnchorClick)
            })
          }
        })
      })
    }

    // Observe the entire document for new links
    const observer = new MutationObserver(handleMutation)
    observer.observe(document.body, { childList: true, subtree: true })

    // Add click listener to existing links
    document.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", handleAnchorClick)
    })

    return () => {
      observer.disconnect()
      if (navigationTimeout) clearTimeout(navigationTimeout)
      document.querySelectorAll("a").forEach((anchor) => {
        anchor.removeEventListener("click", handleAnchorClick)
      })
    }
  }, [])

  // Also trigger on route changes (back/forward browser buttons)
  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return isNavigating
}
