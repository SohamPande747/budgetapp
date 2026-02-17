import { clear } from 'console'
import './globals.css'
import Providers from './providers'
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Spendle',
  description: 'Track income and expenses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}