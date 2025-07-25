import { 
  ExternalDataProvider, 
  ExternalChatProvider, 
  DataGridRow, 
} from '../types'
import { 
  RowSet,
  Row,
  ColumnModel,
  ColumnType,
  SelectColumn,
  Interaction,
} from '@sage-bionetworks/synapse-types'

// Mock Data Provider for demonstration
export class MockDataProvider implements ExternalDataProvider {
  private data: Row[] = [
    { values: ['1', 'John Doe', '30', 'john@example.com'], versionNumber: 1, rowId: 1, etag: 'etag1' },
    { values: ['2', 'Jane Smith', '25', 'jane@example.com'], versionNumber: 1, rowId: 2, etag: 'etag2' },
    { values: ['3', 'Bob Johnson', '35', 'bob@example.com'], versionNumber: 1, rowId: 3, etag: 'etag3' },
  ]

  private columns: ColumnModel[] = [
    { name: 'id', columnType: 'STRING' as ColumnType, maximumSize: 50, id: '1' },
    { name: 'Name', columnType: 'STRING' as ColumnType, maximumSize: 100, id: '2' },
    { name: 'Age', columnType: 'INTEGER' as ColumnType, id: '3' },
    { name: 'Email', columnType: 'STRING' as ColumnType, maximumSize: 100, id: '4' },
  ]

  async fetchData(query?: string): Promise<RowSet> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredData = [...this.data]
    
    if (query) {
      // Simple filtering simulation
      filteredData = this.data.filter(row => 
        row.values.some(value => 
          value?.toString().toLowerCase().includes(query.toLowerCase())
        )
      )
    }
    
    const rowSet: RowSet = {
      concreteType: 'org.sagebionetworks.repo.model.table.RowSet',
      tableId: 'mock-table',
      etag: 'mock-etag',
      headers: this.columns.map((col, index) => ({
        name: col.name,
        columnType: col.columnType,
        id: col.id || index.toString(),
      }) as SelectColumn),
      rows: filteredData,
    }
    
    return rowSet
  }

  async updateData(data: RowSet): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In a real implementation, this would send data to your backend
    this.data = [...data.rows]
    console.log('Data updated:', data)
    
    return true
  }

  async getColumns(): Promise<ColumnModel[]> {
    return [...this.columns]
  }

  // Method to add more data (for demo purposes)
  addSampleData() {
    const newId = (this.data.length + 1).toString()
    this.data.push({
      values: [newId, `User ${newId}`, (Math.floor(Math.random() * 50) + 20).toString(), `user${newId}@example.com`],
      versionNumber: 1,
      rowId: parseInt(newId),
      etag: `etag${newId}`,
    })
  }
}

// Mock Chat Provider for demonstration
export class MockChatProvider implements ExternalChatProvider {
  private sessions: Map<string, Interaction[]> = new Map()

  async sendMessage(message: string, sessionId?: string): Promise<string> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple mock responses
    const responses = [
      "I understand your question. Let me help you with that.",
      "That's an interesting point. Here's what I think...",
      "Based on the data in the grid, I can see that...",
      "Let me analyze this for you. The results show...",
      "Good question! Here's my response...",
    ]

    // Simple keyword-based responses
    let response = responses[Math.floor(Math.random() * responses.length)]
    
    if (message.toLowerCase().includes('data') || message.toLowerCase().includes('grid')) {
      response = "I can help you analyze the data in the grid. What specific information are you looking for?"
    } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      response = "Hello! I'm here to help you with your data and answer any questions you might have."
    } else if (message.toLowerCase().includes('help')) {
      response = "I can help you with data analysis, answer questions about the information in the grid, or assist with other tasks. What do you need help with?"
    }

    return response
  }

  async createSession(): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.sessions.set(sessionId, [])
    return sessionId
  }

  async getHistory(sessionId: string): Promise<Interaction[]> {
    return this.sessions.get(sessionId) || []
  }

  // Internal method to store interactions (would be handled by the backend in real implementation)
  storeInteraction(sessionId: string, interaction: Interaction) {
    const history = this.sessions.get(sessionId) || []
    history.push(interaction)
    this.sessions.set(sessionId, history)
  }
}

// REST API Data Provider (example implementation)
export class RestApiDataProvider implements ExternalDataProvider {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string> = {}
  ) {}

  async fetchData(query?: string): Promise<RowSet> {
    const url = query ? `${this.baseUrl}/data?q=${encodeURIComponent(query)}` : `${this.baseUrl}/data`
    
    const response = await fetch(url, {
      headers: this.headers,
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async updateData(data: RowSet): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update data: ${response.statusText}`)
    }
    
    return true
  }

  async getColumns(): Promise<ColumnModel[]> {
    const response = await fetch(`${this.baseUrl}/columns`, {
      headers: this.headers,
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch columns: ${response.statusText}`)
    }
    
    return await response.json()
  }
}

// OpenAI Chat Provider (example implementation)
export class OpenAIChatProvider implements ExternalChatProvider {
  constructor(
    private apiKey: string,
    private model: string = 'gpt-3.5-turbo'
  ) {}

  async sendMessage(message: string, sessionId?: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for data analysis and grid operations.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response generated'
  }

  async createSession(): Promise<string> {
    // OpenAI doesn't have built-in sessions, so we generate one
    return `openai_session_${Date.now()}`
  }

  async getHistory(sessionId: string): Promise<Interaction[]> {
    // OpenAI doesn't store history, so this would need to be implemented
    // by your application (e.g., in a database)
    return []
  }
}