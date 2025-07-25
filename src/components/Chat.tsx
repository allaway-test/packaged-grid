import React, { useState, useEffect, useRef } from 'react'
import { 
  AgentChatRequest, 
  AgentChatResponse, 
  Interaction, 
  ExternalChatProvider 
} from '../types'

interface ChatProps {
  chatProvider?: ExternalChatProvider
  sessionId?: string
  onSessionCreate?: (sessionId: string) => void
  enableHistory?: boolean
  placeholder?: string
}

const Chat: React.FC<ChatProps> = ({
  chatProvider,
  sessionId: initialSessionId,
  onSessionCreate,
  enableHistory = true,
  placeholder = 'Type your message...',
}) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [messages, setMessages] = useState<Interaction[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize session and load history
  useEffect(() => {
    const initializeChat = async () => {
      if (chatProvider) {
        try {
          let currentSessionId = sessionId
          
          // Create session if none exists
          if (!currentSessionId) {
            currentSessionId = await chatProvider.createSession()
            setSessionId(currentSessionId)
            if (onSessionCreate) {
              onSessionCreate(currentSessionId)
            }
          }
          
          // Load history if enabled
          if (enableHistory && currentSessionId) {
            const history = await chatProvider.getHistory(currentSessionId)
            setMessages(history)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat')
        }
      }
    }

    initializeChat()
  }, [chatProvider, sessionId, enableHistory, onSessionCreate])

  // Send message
  const sendMessage = async () => {
    if (!currentMessage.trim() || !chatProvider || !sessionId) {
      return
    }

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setLoading(true)
    setError(null)

    // Add user message to chat immediately
    const timestamp = new Date().toISOString()
    const userInteraction: Interaction = {
      usersRequestText: userMessage,
      usersRequestTimestamp: timestamp,
      agentResponseText: '',
      agentResponseTimestamp: '',
    }

    setMessages(prev => [...prev, userInteraction])

    try {
      // Send message to chat provider
      const response = await chatProvider.sendMessage(userMessage, sessionId)
      
      // Update the interaction with the response
      const responseTimestamp = new Date().toISOString()
      const completeInteraction: Interaction = {
        ...userInteraction,
        agentResponseText: response,
        agentResponseTimestamp: responseTimestamp,
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = completeInteraction
        return updated
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      
      // Update the interaction with error
      const errorInteraction: Interaction = {
        ...userInteraction,
        agentResponseText: 'Error: Failed to get response',
        agentResponseTimestamp: new Date().toISOString(),
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = errorInteraction
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Clear chat history
  const clearHistory = () => {
    setMessages([])
    setError(null)
  }

  if (!chatProvider) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>Chat</h3>
        </div>
        <div className="chat-body">
          <p>No chat provider configured</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
        <div className="chat-actions">
          <button onClick={clearHistory} disabled={loading}>
            Clear
          </button>
          <span className="chat-session">
            Session: {sessionId || 'None'}
          </span>
        </div>
      </div>

      {error && (
        <div className="chat-error" style={{ color: 'red', padding: '10px' }}>
          Error: {error}
        </div>
      )}

      <div className="chat-messages">
        {messages.map((interaction, index) => (
          <div key={index} className="chat-interaction">
            <div className="chat-message user-message">
              <div className="message-header">
                <strong>You</strong>
                <span className="message-time">
                  {new Date(interaction.usersRequestTimestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">
                {interaction.usersRequestText}
              </div>
            </div>
            
            {interaction.agentResponseText && (
              <div className="chat-message agent-message">
                <div className="message-header">
                  <strong>Assistant</strong>
                  <span className="message-time">
                    {interaction.agentResponseTimestamp 
                      ? new Date(interaction.agentResponseTimestamp).toLocaleTimeString()
                      : 'Responding...'}
                  </span>
                </div>
                <div className="message-content">
                  {interaction.agentResponseText}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="chat-message agent-message">
            <div className="message-content">
              <em>Typing...</em>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={loading}
          rows={2}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !currentMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat