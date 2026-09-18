import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, Link } from 'react-router-dom'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { bindPointerTracking, scrollStore } from './lib/scrollStore'
import { useWebGLSupport } from './hooks/useWebGLSupport'
import { useDeviceTier } from './hooks/useDeviceTier'
import FallbackBackground from './components/canvas/FallbackBackground'
import Loader from './components/ui/Loader'
import Navbar from './components/ui/Navbar'
import Footer from './components/ui/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminCatalog from './pages/AdminCatalog'
import NotFound from './pages/NotFound'

// Code-split: the entire WebGL stack ships as an async chunk (TRD: bundle optimization)
const Experience = lazy(() => import('./components/canvas/Experience'))

/** Reset scroll on every route change so each page starts at the top. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  const { supported } = useWebGLSupport()
  const device = useDeviceTier()
  const [ready, setReady] = useState(false)
  const [glLost, setGlLost] = useState(false)
  const showcaseRef = useRef(null)

  // Page scroll + showcase-section scroll feed the 3D scene via a mutable store
  const { scrollYProgress } = useScroll()
  const { scrollYProgress: showcaseProgress } = useScroll({
    target: showcaseRef,
    offset: ['start end', 'end start'],
  })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    scrollStore.progress = v
  })
  useMotionValueEvent(showcaseProgress, 'change', (v) => {
    scrollStore.showcase = v
  })

  // Pointer parallax + hover-energy tracking (passive, zero re-renders)
  useEffect(() => bindPointerTracking(), [])

  // WebGL context-loss safety net (TRD: error handling & fallbacks)
  useEffect(() => {
    const onLost = () => setGlLost(true)
    window.addEventListener('vitalis:gl-context-lost', onLost)
    return () => window.removeEventListener('vitalis:gl-context-lost', onLost)
  }, [])

  // The CSS fallback path has nothing to load
  useEffect(() => {
    if (!supported) setReady(true)
  }, [supported])

  const handleSceneReady = useCallback(() => setReady(true), [])

  return (
    <div className="relative min-h-screen bg-void font-sans text-white">
      {supported ? (
        <Suspense fallback={null}>
          <Experience device={device} onReady={handleSceneReady} />
        </Suspense>
      ) : (
        <FallbackBackground />
      )}

            <ScrollToTop />
      <Loader done={ready} />

      <Link
        to="/admin/login"
        className="fixed left-3 top-3 z-[100] hidden rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/50 backdrop-blur transition-colors hover:text-white md:block"
      >
        Admin login
      </Link>

      <Navbar ready={ready} />

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home ready={ready} showcaseRef={showcaseRef} />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/catalog" element={<AdminCatalog />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      {glLost && (
        <div className="glass-strong fixed bottom-4 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-full px-5 py-3 text-sm">
          <span className="text-white/80">The graphics context was lost.</span>
          <button
            onClick={() => window.location.reload()}
            className="font-semibold text-neon-cyan transition-colors hover:text-neon-ice"
          >
            Reload
          </button>
        </div>
      )}
    </div>
  )
}
