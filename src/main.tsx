import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import '@github/spark/spark'
import { Toaster } from 'sonner'

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import './main.css'
import './styles/theme.css'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
    <Toaster position="bottom-right" theme="dark" />
  </ErrorBoundary>
)
