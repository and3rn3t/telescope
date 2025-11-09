/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />

declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMetaEnv {
  readonly VITE_NASA_API_KEY: string
  readonly VITE_ENABLE_NASA_API_KEY: string
  readonly VITE_NASA_API_BASE: string
  readonly VITE_NASA_API_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Spark service types (optional)
interface SparkServices {
  llm?: (prompt: string, model: string, stream?: boolean) => Promise<string>
}

// Lucide React icon declarations
declare module 'lucide-react/dist/esm/icons/*' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react'
  interface LucideProps {
    size?: string | number
    absoluteStrokeWidth?: boolean
    className?: string
    color?: string
    strokeWidth?: string | number
  }
  const LucideIcon: ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>
  export default LucideIcon
}

declare global {
  interface Window {
    spark?: SparkServices
  }
}
