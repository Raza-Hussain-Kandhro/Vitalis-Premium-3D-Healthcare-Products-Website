import { useMemo } from 'react'

/**
 * Probes for a WebGL context before the canvas mounts.
 * When unsupported, App swaps in the CSS fallback background instead.
 */
export function useWebGLSupport() {
  return useMemo(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      return { supported: Boolean(gl), reason: gl ? null : 'WebGL context unavailable' }
    } catch (error) {
      return { supported: false, reason: error?.message ?? 'WebGL blocked by the browser' }
    }
  }, [])
}
