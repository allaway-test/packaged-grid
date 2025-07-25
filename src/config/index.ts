import { PlatformConfig } from '../types'

// Default configuration - can be overridden by external platforms
export const defaultConfig: PlatformConfig = {
  dataProvider: {
    type: 'rest',
    endpoint: '/api/data',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  aiProvider: {
    type: 'custom',
    endpoint: '/api/chat',
    model: 'gpt-3.5-turbo',
  },
  ui: {
    theme: 'light',
    primaryColor: '#1976d2',
    enableChat: true,
    enableGrid: true,
  },
}

// Configuration loader - checks for external config
export const loadConfig = (): PlatformConfig => {
  // Check for environment variables first (Vite exposes these as import.meta.env)
  const envConfig: Partial<PlatformConfig> = {}
  
  if (import.meta.env.VITE_DATA_ENDPOINT) {
    envConfig.dataProvider = {
      ...defaultConfig.dataProvider,
      endpoint: import.meta.env.VITE_DATA_ENDPOINT,
    }
  }
  
  if (import.meta.env.VITE_AI_ENDPOINT) {
    envConfig.aiProvider = {
      type: 'custom',
      endpoint: import.meta.env.VITE_AI_ENDPOINT,
      ...defaultConfig.aiProvider,
    }
  }
  
  if (import.meta.env.VITE_AI_API_KEY) {
    envConfig.aiProvider = {
      type: 'custom',
      endpoint: envConfig.aiProvider?.endpoint || defaultConfig.aiProvider!.endpoint,
      apiKey: import.meta.env.VITE_AI_API_KEY,
      ...defaultConfig.aiProvider,
    }
  }
  
  // Check for config.json file (would be loaded at build time)
  // This allows external platforms to provide their configuration
  try {
    const externalConfig = (window as any).__PACKAGED_GRID_CONFIG__
    if (externalConfig) {
      return { ...defaultConfig, ...externalConfig }
    }
  } catch (error) {
    console.warn('No external configuration found, using defaults')
  }
  
  return { ...defaultConfig, ...envConfig }
}

export type { PlatformConfig }