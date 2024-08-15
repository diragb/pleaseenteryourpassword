// Packages:
import { Inter } from 'next/font/google'

// Typescript:
import type { AppProps } from 'next/app'

// Context:
import { AuthContextProvider } from '@/context/AuthContext'

// Styles:
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/toaster'

// Constants:
const inter = Inter({ subsets: ['latin'] })

// Functions:
const App = ({ Component, pageProps }: AppProps) => (
  <main className={inter.className}>
    <AuthContextProvider>
      <Component {...pageProps} />
    </AuthContextProvider>
    <Toaster />
  </main>
)

// Exports:
export default App
