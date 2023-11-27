import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './navbar/navbar'

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
            <Navbar />
            {children}
        </body>
    </html>
    )
}
