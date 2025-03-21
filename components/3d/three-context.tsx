"use client"

import React from "react"

// Simpler implementation that avoids TypeScript errors
export function ThreeProvider({ children }: any) {
  return <>{children}</>
}

export function useThree() {
  return {} as any
}

