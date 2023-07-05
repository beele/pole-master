import NavMenu from '@/components/NavMenu/NavMenu'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PoleMaster',
  description: 'PoleMaster web app - dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <NavMenu/>

                {children}
            </body>
        </html>
    )
}
