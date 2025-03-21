"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FallbackScene } from "./fallback-scene"

interface SceneWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SceneWrapper({ children, fallback }: SceneWrapperProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if Three.js is available
    try {
      // Set a timeout to ensure the scene loads within a reasonable time
      const timeout = setTimeout(() => {
        if (!isLoaded) {
          console.warn("Three.js scene took too long to load, showing fallback")
          setHasError(true)
        }
      }, 5000)

      // Mark as loaded
      setIsLoaded(true)

      return () => clearTimeout(timeout)
    } catch (error) {
      console.error("Error loading Three.js scene:", error)
      setHasError(true)
    }
  }, [isLoaded])

  if (hasError) {
    return fallback ? <>{fallback}</> : <FallbackScene />
  }

  return <>{children}</>
}

