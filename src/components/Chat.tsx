import React, { useState, useEffect } from 'react'
// TODO: Fix import path for SynapseChat once the correct import structure is determined
// import { SynapseChat } from 'synapse-react-client'
import { ExternalChatProvider } from '../types'

interface ChatProps {
  chatProvider?: ExternalChatProvider
  sessionId?: string
  onSessionCreate?: (sessionId: string) => void
  enableHistory?: boolean
  placeholder?: string
  agentRegistrationId?: string
  chatbotName?: string
  hideTitle?: boolean
}

const Chat: React.FC<ChatProps> = ({
  chatProvider,
  sessionId: initialSessionId,
  onSessionCreate,
  enableHistory = true,
  placeholder = 'Type your message...',
  agentRegistrationId,
  chatbotName = 'Assistant',
  hideTitle = false,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [messages, setMessages] = useState<Array<{user: string, bot: string, timestamp: string}>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize session
  useEffect(() => {
    const initializeChat = async () => {
      if (chatProvider && !sessionId) {
        try {
          const newSessionId = await chatProvider.createSession()
          setSessionId(newSessionId)
          if (onSessionCreate) {
            onSessionCreate(newSessionId)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat')
        }
      }
    }

    initializeChat()
  }, [chatProvider, sessionId, onSessionCreate])

  const sendMessage = async () => {
    if (!currentMessage.trim() || !chatProvider || !sessionId) {
      return
    }

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setLoading(true)
    setError(null)

    try {
      const response = await chatProvider.sendMessage(userMessage, sessionId)
      setMessages(prev => [...prev, {
        user: userMessage,
        bot: response,
        timestamp: new Date().toISOString()
      }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!chatProvider) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          {!hideTitle && <h3>Chat</h3>}
        </div>
        <div className="chat-body">
          <p>No chat provider configured</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          {!hideTitle && <h3>Chat</h3>}
        </div>
        <div className="chat-error" style={{ color: 'red', padding: '10px' }}>
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!hideTitle && (
        <div className="chat-header" style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
          <h3>Chat (Synapse-powered)</h3>
          <small>Using Synapse types and {chatbotName || 'Assistant'}</small>
        </div>
      )}
      
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px',
              marginBottom: '4px',
              marginLeft: '20%'
            }}>
              <strong>You:</strong> {msg.user}
            </div>
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              marginRight: '20%'
            }}>
              <strong>{chatbotName || 'Assistant'}:</strong> {msg.bot}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            marginRight: '20%',
            fontStyle: 'italic'
          }}>
            Typing...
          </div>
        )}
      </div>

      <div className="chat-input" style={{ padding: '10px', borderTop: '1px solid #ddd', display: 'flex', gap: '8px' }}>
        <textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={loading}
          rows={2}
          style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !currentMessage.trim()}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading || !currentMessage.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat