'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
        <Toaster closeButton position="top-right" richColors />
      </TooltipProvider>
    </ThemeProvider>
  )
}
