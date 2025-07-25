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
  const [chatOpen, setChatOpen] = useState<boolean>(false)

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
      </main>

      {/* Floating Chat */}
      {ui?.enableChat !== false && (
        <>
          {!chatOpen && (
            <button 
              className="floating-chat-toggle"
              onClick={() => setChatOpen(true)}
              aria-label="Open Chat"
            >
              💬
            </button>
          )}
          
          {chatOpen && (
            <div className="floating-chat-window">
              <div className="floating-chat-header">
                <h3>Chat</h3>
                <button 
                  className="floating-chat-close"
                  onClick={() => setChatOpen(false)}
                  aria-label="Close Chat"
                >
                  ×
                </button>
              </div>
              <div className="floating-chat-content">
                <Chat
                  chatProvider={chatProvider}
                  sessionId={chatSessionId || undefined}
                  onSessionCreate={setChatSessionId}
                  enableHistory={true}
                  placeholder="Ask me about the data or anything else..."
                />
              </div>
            </div>
          )}
        </>
      )}

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