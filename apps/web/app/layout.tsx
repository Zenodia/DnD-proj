import './globals.css'

export const metadata = {
  title: 'Solo Leveling · Agent Quest',
  description:
    'A Solo Leveling-flavored learning game about agentic AI. Six chapters, one cold System Voice, zero required API keys.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
