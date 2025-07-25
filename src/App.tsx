import React, { useState, useEffect } from 'react'
import DataGrid from './components/DataGrid'
import Chat from './components/Chat'
import { MockDataProvider, MockChatProvider } from './components/providers'
import { loadConfig } from './config'
import { PlatformConfig } from './types'
import './App.css'

const App: React.FC = () => {
  const [config, setConfig] = useState<PlatformConfig | null>(null)
  const [dataProvider] = useState(() => new MockDataProvider())
  const [chatProvider] = useState(() => new MockChatProvider())
  const [chatSessionId, setChatSessionId] = useState<string | null>(null)

  useEffect(() => {
    const platformConfig = loadConfig()
    setConfig(platformConfig)
  }, [])

  if (!config) {
    return <div>Loading configuration...</div>
  }

  const { ui } = config

  return (
    <div className={`app ${ui?.theme || 'light'}`}>
      <header className="app-header">
        <h1>Packaged Grid</h1>
        <p>Synapse DataGrid & Chat Integration</p>
      </header>

      <main className="app-main">
        <div className="app-layout">
          {ui?.enableGrid !== false && (
            <section className="grid-section">
              <DataGrid
                dataProvider={dataProvider}
                enableAutoSave={true}
                autoSaveDelay={500}
                onDataChange={(data) => {
                  console.log('Data changed:', data.length, 'rows')
                }}
              />
            </section>
          )}

          {ui?.enableChat !== false && (
            <section className="chat-section">
              <Chat
                chatProvider={chatProvider}
                sessionId={chatSessionId || undefined}
                onSessionCreate={setChatSessionId}
                enableHistory={true}
                placeholder="Ask me about the data or anything else..."
              />
            </section>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="config-info">
          <h4>Current Configuration:</h4>
          <ul>
            <li>Data Provider: {config.dataProvider.type} ({config.dataProvider.endpoint})</li>
            {config.aiProvider && (
              <li>AI Provider: {config.aiProvider.type} ({config.aiProvider.endpoint})</li>
            )}
            <li>Theme: {ui?.theme}</li>
            <li>Grid Enabled: {ui?.enableGrid !== false ? 'Yes' : 'No'}</li>
            <li>Chat Enabled: {ui?.enableChat !== false ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default App