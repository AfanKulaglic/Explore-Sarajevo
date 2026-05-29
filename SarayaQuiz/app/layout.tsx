import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { SsoBootstrapper } from '@/components/providers/SsoBootstrapper'

export const metadata: Metadata = {
  title: 'Saraya Quiz',
  description: 'Create and share quizzes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <SsoBootstrapper>{children}</SsoBootstrapper>
        </Suspense>
      </body>
    </html>
  )
}
