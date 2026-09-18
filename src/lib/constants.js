/**
 * Shared design + scene constants.
 * Keep colors in sync with tailwind.config.js (extend.colors).
 */

export const COLORS = {
  void: '#05060F',
  abyss: '#080A16',
  panel: '#0C0F1E',
  cyan: '#22D3EE',
  ice: '#67E8F9',
  violet: '#A855F7',
  magenta: '#C084FC',
}

/** Base world-space anchor points for the two hero models. */
export const SCENE = {
  core: {
    desktop: [-3.1, 0.55, -0.6],
    mobile: [0, -1.7, -1.8],
  },
  helix: {
    desktop: [3.0, 0.1, -0.8],
    mobile: [0, 0.9, -2.4],
  },
}

/** Primary site navigation — one entry per route (multi-page requirement). */
export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
]

/** Shared spring-like easing for framer-motion reveals. */
export const EASE = [0.22, 1, 0.36, 1]
