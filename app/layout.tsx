import type { Metadata } from "next"
import { Sora, DM_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
})

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: {
    default: "AttendSync — Enterprise Attendance Management",
    template: "%s · AttendSync",
  },
  description: "GPS-verified attendance tracking, digital signatures, and instant audit-ready reports for enterprise meetings.",
  keywords: ["attendance management", "meeting attendance", "digital signatures", "QR sign-in"],
  openGraph: {
    title: "AttendSync — Enterprise Attendance Management",
    description: "GPS-verified attendance, digital signatures, and one-click PDF reports.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmMono.variable} h-full`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif", background: "var(--s-bg)", color: "var(--s-text)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
