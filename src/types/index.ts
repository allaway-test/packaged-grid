// Re-export Synapse types for external platform integration
export type {
  AgentChatRequest,
  AgentChatResponse,
  AgentSession,
  CreateAgentSessionRequest,
  Interaction,
  SessionHistoryResponse,
  RowSet,
  Row,
  ColumnModel,
  ColumnType,
  SelectColumn,
} from '@sage-bionetworks/synapse-types'

// Additional types for external platform integration
export type DataGridRow = { [key: string]: string | number }

export type GridColumn = {
  key: string
  title: string
  datatype?: 'text' | 'number' | 'date'
  editable?: boolean
}

// External Platform Integration Types
export type PlatformConfig = {
  // Data integration
  dataProvider: {
    type: 'rest' | 'graphql' | 'websocket'
    endpoint: string
    headers?: Record<string, string>
    authentication?: {
      type: 'bearer' | 'api-key' | 'basic'
      token?: string
      username?: string
      password?: string
    }
  }
  
  // AI/Chat integration
  aiProvider?: {
    type: 'openai' | 'anthropic' | 'custom'
    endpoint: string
    apiKey?: string
    model?: string
  }
  
  // UI Configuration
  ui?: {
    theme?: 'light' | 'dark'
    primaryColor?: string
    enableChat?: boolean
    enableGrid?: boolean
  }
}

export type ExternalDataProvider = {
  fetchData: (query?: string) => Promise<import('@sage-bionetworks/synapse-types').RowSet>
  updateData: (data: import('@sage-bionetworks/synapse-types').RowSet) => Promise<boolean>
  getColumns: () => Promise<import('@sage-bionetworks/synapse-types').ColumnModel[]>
}

export type ExternalChatProvider = {
  sendMessage: (message: string, sessionId?: string) => Promise<string>
  createSession: () => Promise<string>
  getHistory: (sessionId: string) => Promise<import('@sage-bionetworks/synapse-types').Interaction[]>
}