/**
 * Pure-CSS aurora shown when WebGL is unavailable (old devices,
 * blocked contexts, enterprise lockdowns). The page stays beautiful
 * and fully readable without the 3D scene.
 */
export default function FallbackBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-void" />
      <div className="absolute -left-1/4 top-[-20%] h-[70vmax] w-[70vmax] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_60%)] blur-3xl" />
      <div className="absolute -right-1/4 bottom-[-25%] h-[80vmax] w-[80vmax] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.14),transparent_60%)] blur-3xl [animation-delay:-7s]" />
      <div className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#05060F_92%)]" />
    </div>
  )
}
