import type { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ParticlesBackground from '@/components/ParticlesBackground'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <ParticlesBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <div className="pt-24">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}
