import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './navbar/navbar'
import Footer from './footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: "YouTube Clone by Daniel White",
    description: 'Youtube Clone',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
    <html lang="en">
        <body className={inter.className}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '99.4vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </body>
    </html>
    )
}
