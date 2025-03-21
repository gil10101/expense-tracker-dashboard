"use client"

import dynamic from "next/dynamic"
import { FallbackScene } from "./fallback-scene"

// Dynamically import the 3D scenes with no SSR
export const DynamicLandingScene = dynamic(() => import("./landing-scene").then((mod) => mod.LandingScene), {
  ssr: false,
  loading: () => <FallbackScene />,
})

export const DynamicAuthScene = dynamic(() => import("./auth-scene").then((mod) => mod.AuthScene), {
  ssr: false,
  loading: () => <FallbackScene />,
})

