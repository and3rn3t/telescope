/// <reference types="vite/client" />
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

declare global {
  interface Window {
    spark?: SparkServices
  }
}
