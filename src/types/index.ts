// Chat Types - Based on Synapse Chat.ts
export enum AgentAccessLevel {
  PUBLICLY_ACCESSIBLE = 'PUBLICLY_ACCESSIBLE',
  READ_YOUR_PRIVATE_DATA = 'READ_YOUR_PRIVATE_DATA',
  WRITE_YOUR_PRIVATE_DATA = 'WRITE_YOUR_PRIVATE_DATA',
}

export type CreateAgentSessionRequest = {
  agentAccessLevel: AgentAccessLevel
  agentRegistrationId?: string
}

export type UpdateAgentSessionRequest = {
  agentAccessLevel: AgentAccessLevel
  sessionId: string
}

export type AgentSession = {
  sessionId: string
  agentAccessLevel: AgentAccessLevel
  startedOn: string
  agentRegistrationId?: string
}

export type AgentChatRequest = {
  sessionId: string
  chatText: string
  enableTrace?: boolean
}

export type AgentChatResponse = {
  sessionId: string
  responseText: string
}

export type Interaction = {
  usersRequestText: string
  usersRequestTimestamp: string
  agentResponseText: string
  agentResponseTimestamp: string
}

export type SessionHistoryResponse = {
  sessionId: string
  page: Interaction[]
  nextPageToken?: string
}

export type TraceEvent = {
  timestamp: number
  message: string
}

// DataGrid Types - Simplified from Synapse DataGrid
export type GridConfig = {
  enableRealTimeCollaboration?: boolean
  enableWebSocket?: boolean
  dataSource?: 'api' | 'websocket' | 'static'
  apiEndpoint?: string
  websocketUrl?: string
}

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
  fetchData: (query?: string) => Promise<DataGridRow[]>
  updateData: (data: DataGridRow[]) => Promise<boolean>
  getColumns: () => Promise<GridColumn[]>
}

export type ExternalChatProvider = {
  sendMessage: (message: string, sessionId?: string) => Promise<string>
  createSession: () => Promise<string>
  getHistory: (sessionId: string) => Promise<Interaction[]>
}