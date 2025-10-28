interface ImportMetaEnv {
  VITE_API_URL: string;
  // add your other env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}