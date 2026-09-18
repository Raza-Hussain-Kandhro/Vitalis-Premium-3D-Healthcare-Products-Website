import Hero from '../components/ui/Hero'
import Showcase from '../components/ui/Showcase'
import Features from '../components/ui/Features'
import Stats from '../components/ui/Stats'
import CTA from '../components/ui/CTA'

/** Page 1 — Home: 3D hero + scroll-driven narrative + waitlist CTA. */
export default function Home({ ready, showcaseRef }) {
  return (
    <>
      <Hero ready={ready} />
      <Showcase ref={showcaseRef} />
      <Features />
      <Stats />
      <CTA />
    </>
  )
}
