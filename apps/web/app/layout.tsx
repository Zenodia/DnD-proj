import './globals.css'

export const metadata = {
  title: 'Anime Agentic AI Game',
  description: 'Learn agentic AI through anime-style missions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
