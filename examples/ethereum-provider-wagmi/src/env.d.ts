/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_ID: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
